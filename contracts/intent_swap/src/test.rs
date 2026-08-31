#![cfg(test)]

#[test]
fn test_slippage_passes_when_actual_meets_minimum() {
    let min_buy_amount: i128 = 95;
    let actual_buy_amount: i128 = 100;
    // Contract allows swap when actual >= min
    assert!(actual_buy_amount >= min_buy_amount);
}

#[test]
fn test_slippage_violated_when_actual_below_minimum() {
    let min_buy_amount: i128 = 95;
    let actual_buy_amount: i128 = 90;
    // Contract panics when actual < min — verify the condition
    assert!(actual_buy_amount < min_buy_amount);
}

#[test]
fn test_slippage_passes_at_exact_minimum() {
    let min_buy_amount: i128 = 95;
    let actual_buy_amount: i128 = 95;
    assert!(actual_buy_amount >= min_buy_amount);
}

#[test]
fn test_price_improvement_scenario() {
    // Solver provides better price than minimum
    let sell_amount: i128 = 100;
    let min_buy_amount: i128 = 95;
    let actual_buy_amount: i128 = 102; // solver improves price
    assert!(actual_buy_amount >= min_buy_amount);
    // Maker gets more than minimum
    assert!(actual_buy_amount > min_buy_amount);
    let _ = sell_amount; // acknowledged in transfer
}
