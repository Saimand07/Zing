#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_init_and_set_limit() {
    let env = Env::default();
    env.mock_all_auths();

    let owner = Address::generate(&env);
    let contract_id = env.register_contract(None, SmartWallet);
    let client = SmartWalletClient::new(&env, &contract_id);

    client.init(&owner);
    client.set_limit(&1000_u64);
}

#[test]
fn test_recovery_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let owner = Address::generate(&env);
    let recovery = Address::generate(&env);
    let new_owner = Address::generate(&env);

    let contract_id = env.register_contract(None, SmartWallet);
    let client = SmartWalletClient::new(&env, &contract_id);

    client.init(&owner);
    client.add_recovery(&recovery);
    client.recover(&new_owner);
}

#[test]
#[should_panic(expected = "Already initialized")]
fn test_double_init_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let owner = Address::generate(&env);
    let contract_id = env.register_contract(None, SmartWallet);
    let client = SmartWalletClient::new(&env, &contract_id);

    client.init(&owner);
    client.init(&owner); // should panic
}
