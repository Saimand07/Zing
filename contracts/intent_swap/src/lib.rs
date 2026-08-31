#![no_std]
use soroban_sdk::{contract, contractimpl, token, Address, Env, IntoVal};

#[contract]
pub struct IntentSwap;

#[contractimpl]
impl IntentSwap {
    /// Executes an intent-based swap.
    ///
    /// The `maker` must have pre-signed an authorization for `fill_intent`
    /// containing only the first 4 arguments (`sell_token`, `buy_token`, `sell_amount`, `min_buy_amount`).
    /// This makes the intent solver-agnostic. Any solver can fill it and provide price improvement.
    #[allow(clippy::too_many_arguments)]
    pub fn fill_intent(
        env: Env,
        maker: Address,
        solver: Address,
        sell_token: Address,
        buy_token: Address,
        sell_amount: i128,
        min_buy_amount: i128,
        actual_buy_amount: i128,
    ) {
        // 1. Verify slippage tolerance
        if actual_buy_amount < min_buy_amount {
            panic!("Slippage tolerance exceeded: actual_buy_amount < min_buy_amount");
        }

        // 2. The Maker authorizes the core terms of the trade.
        // We use require_auth_for_args to verify they signed exactly these parameters.
        maker.require_auth_for_args(
            (
                sell_token.clone(),
                buy_token.clone(),
                sell_amount,
                min_buy_amount,
            )
                .into_val(&env),
        );

        // 3. The Solver must authorize the transaction since they are providing the liquidity and paying gas.
        solver.require_auth();

        // 4. Perform the atomic swap.

        // Solver sends the buy_token to the maker (including any price improvement)
        let buy_token_client = token::Client::new(&env, &buy_token);
        buy_token_client.transfer(&solver, &maker, &actual_buy_amount);

        // Maker sends the sell_token to the solver
        let sell_token_client = token::Client::new(&env, &sell_token);
        sell_token_client.transfer(&maker, &solver, &sell_amount);

        // 5. Emit an event for off-chain indexing (solver network)
        env.events().publish(
            (maker, solver, sell_token, buy_token),
            (sell_amount, actual_buy_amount),
        );
    }
}

mod test;
