#![no_std]
use soroban_sdk::{Env, Address, BytesN};

pub fn test_deployer(env: Env, wasm_hash: BytesN<32>, salt: BytesN<32>) {
    // let token = env.deployer().with_current_contract(salt).deploy_sac_with_asset(...);
    // let token = env.deployer().with_current_contract(salt).deploy_token(...);
}
