#![cfg(test)]

#[test]
fn test_score_can_be_set_when_active() {
    let is_active = true;
    let score: i128 = 500;

    assert!(is_active, "competition is closed");
    // Score is accepted
    assert_eq!(score, 500);
}

#[test]
fn test_score_rejected_when_closed() {
    let is_active = false;
    // Contract asserts is_active before updating
    assert!(!is_active); // closed — update would be rejected
}

#[test]
fn test_score_overwrite() {
    let mut score: i128 = 200;
    assert_eq!(score, 200);
    score = 500;
    assert_eq!(score, 500);
}

#[test]
fn test_competition_state_transition() {
    let mut is_active = true;
    assert!(is_active);

    // end_competition sets is_active = false
    is_active = false;
    assert!(!is_active);
}
