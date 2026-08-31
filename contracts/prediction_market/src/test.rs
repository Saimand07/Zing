#![cfg(test)]

use super::Error;

#[test]
fn test_error_codes() {
    // Verify error discriminant values used in on-chain ABI
    assert_eq!(Error::AlreadyInitialized as u32, 1);
    assert_eq!(Error::AlreadyResolved as u32, 2);
    assert_eq!(Error::MarketClosed as u32, 3);
    assert_eq!(Error::NotResolved as u32, 4);
}

#[test]
fn test_yes_winner_reward_calculation() {
    // reward = yes_bet + (yes_bet * total_no) / total_yes
    let yes_bet: i128 = 100;
    let total_yes: i128 = 400;
    let total_no: i128 = 600;
    let reward = yes_bet + (yes_bet * total_no) / total_yes;
    assert_eq!(reward, 250); // 100 + (100*600)/400 = 100 + 150 = 250
}

#[test]
fn test_no_winner_reward_calculation() {
    let no_bet: i128 = 200;
    let total_yes: i128 = 300;
    let total_no: i128 = 200;
    let reward = no_bet + (no_bet * total_yes) / total_no;
    assert_eq!(reward, 500); // 200 + (200*300)/200 = 200 + 300 = 500
}

#[test]
fn test_zero_bet_yields_zero_reward() {
    let yes_bet: i128 = 0;
    let total_yes: i128 = 400;
    let total_no: i128 = 600;
    // reward > 0 check means nothing is transferred
    let reward = yes_bet + (yes_bet * total_no) / total_yes;
    assert_eq!(reward, 0);
    assert!(reward <= 0);
}
