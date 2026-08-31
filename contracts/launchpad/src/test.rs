#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    // Use a dummy wasm hash (32 zero bytes)
    let wasm_hash = soroban_sdk::BytesN::from_array(&env, &[0u8; 32]);

    let contract_id = env.register_contract(None, LaunchpadContract);
    let client = LaunchpadContractClient::new(&env, &contract_id);

    client.initialize(&admin, &wasm_hash);
}

#[test]
#[should_panic(expected = "already initialized")]
fn test_double_initialize_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let wasm_hash = soroban_sdk::BytesN::from_array(&env, &[0u8; 32]);

    let contract_id = env.register_contract(None, LaunchpadContract);
    let client = LaunchpadContractClient::new(&env, &contract_id);

    client.initialize(&admin, &wasm_hash);
    client.initialize(&admin, &wasm_hash); // should panic
}

#[test]
fn test_get_token_meta_returns_none_before_launch() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let wasm_hash = soroban_sdk::BytesN::from_array(&env, &[0u8; 32]);

    let contract_id = env.register_contract(None, LaunchpadContract);
    let client = LaunchpadContractClient::new(&env, &contract_id);

    client.initialize(&admin, &wasm_hash);

    let meta = client.get_token_meta(&String::from_str(&env, "ZING"));
    assert!(meta.is_none());
}
