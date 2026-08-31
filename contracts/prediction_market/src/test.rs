#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token = Address::generate(&env);
    let question = String::from_str(&env, "Will BTC hit $100k by end of 2025?");
    let end_time: u64 = 9999999999;

    let contract_id = env.register_contract(None, PredictionMarket);
    let client = PredictionMarketClient::new(&env, &contract_id);

    client.initialize(&admin, &token, &question, &end_time);
}

#[test]
fn test_double_initialize_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token = Address::generate(&env);
    let question = String::from_str(&env, "Test?");

    let contract_id = env.register_contract(None, PredictionMarket);
    let client = PredictionMarketClient::new(&env, &contract_id);

    client.initialize(&admin, &token, &question, &9999999999_u64);
    let result = client.try_initialize(&admin, &token, &question, &9999999999_u64);
    assert!(result.is_err());
}
