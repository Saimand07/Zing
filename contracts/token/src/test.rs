#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_mint_and_transfer() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let user_a = Address::generate(&env);
    let user_b = Address::generate(&env);

    let contract_id = env.register_contract(None, TokenContract);
    let client = TokenContractClient::new(&env, &contract_id);

    client.initialize(
        &admin,
        &String::from_str(&env, "Zing Token"),
        &String::from_str(&env, "ZING"),
    );

    // Mint 1000 tokens to user_a
    client.mint(&user_a, &1000_i128);
    assert_eq!(client.balance(&user_a), 1000);

    // Transfer 200 from user_a to user_b
    client.transfer(&user_a, &user_b, &200_i128);
    assert_eq!(client.balance(&user_a), 800);
    assert_eq!(client.balance(&user_b), 200);
}

#[test]
fn test_name_symbol_decimals() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let contract_id = env.register_contract(None, TokenContract);
    let client = TokenContractClient::new(&env, &contract_id);

    client.initialize(
        &admin,
        &String::from_str(&env, "Zing Token"),
        &String::from_str(&env, "ZING"),
    );

    assert_eq!(client.name(), String::from_str(&env, "Zing Token"));
    assert_eq!(client.symbol(), String::from_str(&env, "ZING"));
    assert_eq!(client.decimals(), 7_u32);
}

#[test]
#[should_panic(expected = "insufficient balance")]
fn test_transfer_insufficient_balance() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let user_a = Address::generate(&env);
    let user_b = Address::generate(&env);

    let contract_id = env.register_contract(None, TokenContract);
    let client = TokenContractClient::new(&env, &contract_id);

    client.initialize(
        &admin,
        &String::from_str(&env, "Zing Token"),
        &String::from_str(&env, "ZING"),
    );

    client.mint(&user_a, &50_i128);
    client.transfer(&user_a, &user_b, &100_i128); // should panic
}
