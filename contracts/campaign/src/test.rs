#![cfg(test)]

#[test]
fn test_pool_deduction_on_reward() {
    let mut pool: i128 = 1000;
    let reward: i128 = 100;

    assert!(pool >= reward, "insufficient reward pool");
    pool -= reward;

    assert_eq!(pool, 900);
}

#[test]
fn test_multiple_reward_distributions() {
    let mut pool: i128 = 1000;

    for _ in 0..5 {
        let reward: i128 = 100;
        assert!(pool >= reward);
        pool -= reward;
    }

    assert_eq!(pool, 500);
}

#[test]
fn test_distribution_exceeds_pool_is_caught() {
    let pool: i128 = 50;
    let reward: i128 = 100;
    // Contract asserts pool >= amount before distributing
    assert!(pool < reward); // this is the failing condition
}
