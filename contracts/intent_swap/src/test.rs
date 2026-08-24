#![cfg(test)]

use super::*;
use soroban_sdk::token::{Client as TokenClient, StellarAssetClient as AssetClient};
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_intent_swap() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, IntentSwap);
    let client = IntentSwapClient::new(&env, &contract_id);

    let maker = Address::generate(&env);
    let solver = Address::generate(&env);

    // Register 2 tokens
    let admin = Address::generate(&env);
    let sell_token = env.register_stellar_asset_contract_v2(admin.clone());
    let buy_token = env.register_stellar_asset_contract_v2(admin.clone());

    let sell_token_client = TokenClient::new(&env, &sell_token.address());
    let buy_token_client = TokenClient::new(&env, &buy_token.address());

    let sell_asset_client = AssetClient::new(&env, &sell_token.address());
    let buy_asset_client = AssetClient::new(&env, &buy_token.address());

    // Mint tokens to maker and solver
    sell_asset_client.mint(&maker, &1000);
    buy_asset_client.mint(&solver, &2000);

    // Intent parameters
    let sell_amount: i128 = 100;
    let min_buy_amount: i128 = 95;
    let actual_buy_amount: i128 = 100; // Solver provides price improvement

    client.fill_intent(
        &maker,
        &solver,
        &sell_token.address(),
        &buy_token.address(),
        &sell_amount,
        &min_buy_amount,
        &actual_buy_amount,
    );

    assert_eq!(sell_token_client.balance(&maker), 900);
    assert_eq!(buy_token_client.balance(&maker), 100);

    assert_eq!(sell_token_client.balance(&solver), 100);
    assert_eq!(buy_token_client.balance(&solver), 1900);
}

#[test]
#[should_panic(expected = "Slippage tolerance exceeded: actual_buy_amount < min_buy_amount")]
fn test_intent_swap_slippage() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, IntentSwap);
    let client = IntentSwapClient::new(&env, &contract_id);

    let maker = Address::generate(&env);
    let solver = Address::generate(&env);
    let admin = Address::generate(&env);

    let sell_token = env.register_stellar_asset_contract_v2(admin.clone());
    let buy_token = env.register_stellar_asset_contract_v2(admin.clone());

    client.fill_intent(
        &maker,
        &solver,
        &sell_token.address(),
        &buy_token.address(),
        &100,
        &95,
        &90, // Fails here: 90 < 95
    );
}
