#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_initialize_and_score() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let trader = Address::generate(&env);

    let contract_id = env.register_contract(None, CompetitionContract);
    let client = CompetitionContractClient::new(&env, &contract_id);

    client.initialize(&admin);
    client.update_score(&trader, &500_i128);

    let score = client.get_score(&trader);
    assert_eq!(score, Some(500_i128));
}

#[test]
#[should_panic(expected = "competition is closed")]
fn test_score_after_end_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let trader = Address::generate(&env);

    let contract_id = env.register_contract(None, CompetitionContract);
    let client = CompetitionContractClient::new(&env, &contract_id);

    client.initialize(&admin);
    client.end_competition();
    client.update_score(&trader, &100_i128); // should panic
}
