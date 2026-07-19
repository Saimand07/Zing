#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, vec, Address, BytesN, Env, IntoVal, String,
    Symbol,
};

#[contracttype]
pub enum DataKey {
    Admin,
    TokensCreated,
    TokenWasmHash,
}

#[contracttype]
pub struct TokenMeta {
    pub creator: Address,
    pub name: String,
    pub symbol: String,
    pub total_supply: i128,
}

#[contract]
pub struct LaunchpadContract;

#[contractimpl]
impl LaunchpadContract {
    pub fn initialize(env: Env, admin: Address, wasm_hash: BytesN<32>) {
        assert!(
            !env.storage().instance().has(&DataKey::Admin),
            "already initialized"
        );
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::TokenWasmHash, &wasm_hash);
        env.storage().instance().set(&DataKey::TokensCreated, &0u32);
    }

    pub fn launch_token(
        env: Env,
        creator: Address,
        name: String,
        symbol: String,
        total_supply: i128,
    ) -> u32 {
        creator.require_auth();

        let mut count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::TokensCreated)
            .unwrap_or(0);
        count += 1;

        let meta = TokenMeta {
            creator: creator.clone(),
            name: name.clone(),
            symbol: symbol.clone(),
            total_supply,
        };

        // Deploy the custom token contract
        let wasm_hash: BytesN<32> = env
            .storage()
            .instance()
            .get(&DataKey::TokenWasmHash)
            .unwrap();

        // Use a unique salt derived from the count
        let mut salt_bytes = [0u8; 32];
        salt_bytes[0] = count as u8;
        salt_bytes[1] = (count >> 8) as u8;
        let salt = BytesN::from_array(&env, &salt_bytes);

        let token_addr = env.deployer().with_current_contract(salt).deploy(wasm_hash);

        // Initialize the token contract
        env.invoke_contract::<()>(
            &token_addr,
            &Symbol::new(&env, "initialize"),
            vec![
                &env,
                env.current_contract_address().into_val(&env),
                name.into_val(&env),
                symbol.clone().into_val(&env),
            ],
        );

        // Mint total_supply to the creator
        env.invoke_contract::<()>(
            &token_addr,
            &Symbol::new(&env, "mint"),
            vec![
                &env,
                creator.clone().into_val(&env),
                total_supply.into_val(&env),
            ],
        );

        env.storage().persistent().set(&symbol, &meta);
        env.storage()
            .instance()
            .set(&DataKey::TokensCreated, &count);

        count
    }

    pub fn get_token_meta(env: Env, symbol: String) -> Option<TokenMeta> {
        env.storage().persistent().get(&symbol)
    }
}
