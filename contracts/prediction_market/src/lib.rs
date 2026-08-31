#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Env, String,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    AlreadyResolved = 2,
    MarketClosed = 3,
    NotResolved = 4,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    Token,
    Question,
    EndTime,
    Resolved,
    Outcome, // true for YES, false for NO
    TotalYes,
    TotalNo,
    YesBet(Address),
    NoBet(Address),
}

#[contract]
pub struct PredictionMarket;

#[contractimpl]
impl PredictionMarket {
    pub fn initialize(
        env: Env,
        admin: Address,
        token: Address,
        question: String,
        end_time: u64,
    ) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::Question, &question);
        env.storage().instance().set(&DataKey::EndTime, &end_time);
        env.storage().instance().set(&DataKey::Resolved, &false);
        env.storage().instance().set(&DataKey::TotalYes, &0_i128);
        env.storage().instance().set(&DataKey::TotalNo, &0_i128);
        Ok(())
    }

    pub fn bet(env: Env, user: Address, is_yes: bool, amount: i128) -> Result<(), Error> {
        user.require_auth();

        let resolved: bool = env.storage().instance().get(&DataKey::Resolved).unwrap();
        if resolved {
            return Err(Error::AlreadyResolved);
        }

        let end_time: u64 = env.storage().instance().get(&DataKey::EndTime).unwrap();
        if env.ledger().timestamp() >= end_time {
            return Err(Error::MarketClosed);
        }

        let token_addr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&user, &env.current_contract_address(), &amount);

        if is_yes {
            let mut total_yes: i128 = env.storage().instance().get(&DataKey::TotalYes).unwrap();
            total_yes += amount;
            env.storage().instance().set(&DataKey::TotalYes, &total_yes);

            let key = DataKey::YesBet(user.clone());
            let mut bet: i128 = env.storage().persistent().get(&key).unwrap_or(0);
            bet += amount;
            env.storage().persistent().set(&key, &bet);
        } else {
            let mut total_no: i128 = env.storage().instance().get(&DataKey::TotalNo).unwrap();
            total_no += amount;
            env.storage().instance().set(&DataKey::TotalNo, &total_no);

            let key = DataKey::NoBet(user.clone());
            let mut bet: i128 = env.storage().persistent().get(&key).unwrap_or(0);
            bet += amount;
            env.storage().persistent().set(&key, &bet);
        }

        Ok(())
    }

    pub fn resolve(env: Env, outcome: bool) -> Result<(), Error> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let resolved: bool = env.storage().instance().get(&DataKey::Resolved).unwrap();
        if resolved {
            return Err(Error::AlreadyResolved);
        }

        env.storage().instance().set(&DataKey::Resolved, &true);
        env.storage().instance().set(&DataKey::Outcome, &outcome);
        Ok(())
    }

    pub fn claim(env: Env, user: Address) -> Result<(), Error> {
        let resolved: bool = env.storage().instance().get(&DataKey::Resolved).unwrap();
        if !resolved {
            return Err(Error::NotResolved);
        }

        let outcome: bool = env.storage().instance().get(&DataKey::Outcome).unwrap();
        let total_yes: i128 = env.storage().instance().get(&DataKey::TotalYes).unwrap();
        let total_no: i128 = env.storage().instance().get(&DataKey::TotalNo).unwrap();

        let yes_key = DataKey::YesBet(user.clone());
        let no_key = DataKey::NoBet(user.clone());

        let yes_bet: i128 = env.storage().persistent().get(&yes_key).unwrap_or(0);
        let no_bet: i128 = env.storage().persistent().get(&no_key).unwrap_or(0);

        let mut reward: i128 = 0;

        if outcome {
            if yes_bet > 0 {
                // User won on YES
                // reward = yes_bet + (yes_bet / total_yes) * total_no
                reward = yes_bet + (yes_bet * total_no) / total_yes;
                env.storage().persistent().set(&yes_key, &0_i128); // prevent double claim
            }
        } else {
            if no_bet > 0 {
                // User won on NO
                reward = no_bet + (no_bet * total_yes) / total_no;
                env.storage().persistent().set(&no_key, &0_i128);
            }
        }

        if reward > 0 {
            let token_addr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
            let token_client = token::Client::new(&env, &token_addr);
            token_client.transfer(&env.current_contract_address(), &user, &reward);
        }

        Ok(())
    }
}
