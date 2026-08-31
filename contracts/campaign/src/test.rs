#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_initialize_and_distribute() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    let contract_id = env.register_contract(None, CampaignContract);
    let client = CampaignContractClient::new(&env, &contract_id);

    client.initialize(&admin, &1000_i128);
    client.distribute_reward(&user, &100_i128);
}

#[test]
#[should_panic(expected = "insufficient reward pool")]
fn test_distribute_exceeds_pool() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    let contract_id = env.register_contract(None, CampaignContract);
    let client = CampaignContractClient::new(&env, &contract_id);

    client.initialize(&admin, &50_i128);
    client.distribute_reward(&user, &100_i128); // should panic
}
