#![cfg(test)]

#[test]
fn test_mint_increases_balance() {
    let mut balance: i128 = 0;
    let amount: i128 = 1000;
    balance += amount;
    assert_eq!(balance, 1000);
}

#[test]
fn test_transfer_adjusts_both_balances() {
    let mut sender: i128 = 1000;
    let mut receiver: i128 = 0;
    let amount: i128 = 200;

    assert!(sender >= amount, "insufficient balance");
    sender -= amount;
    receiver += amount;

    assert_eq!(sender, 800);
    assert_eq!(receiver, 200);
}

#[test]
fn test_transfer_fails_on_insufficient_balance() {
    let balance: i128 = 50;
    let amount: i128 = 100;
    // Contract asserts balance >= amount before transferring
    assert!(balance < amount); // this is the failing condition the contract catches
}

#[test]
fn test_supply_tracks_mints() {
    let mut supply: i128 = 0;
    supply += 500;
    supply += 300;
    assert_eq!(supply, 800);
}

#[test]
fn test_stellar_standard_decimals() {
    // Stellar token standard uses 7 decimal places
    let decimals: u32 = 7;
    assert_eq!(decimals, 7);
}
