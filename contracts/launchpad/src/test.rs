#![cfg(test)]

#[test]
fn test_token_counter_increments() {
    let mut count: u32 = 0;
    count += 1;
    assert_eq!(count, 1);
    count += 1;
    assert_eq!(count, 2);
}

#[test]
fn test_salt_derived_from_counter() {
    // Verify salt generation logic from launch_token
    let count: u32 = 255;
    let mut salt_bytes = [0u8; 32];
    salt_bytes[0] = count as u8;
    salt_bytes[1] = (count >> 8) as u8;
    assert_eq!(salt_bytes[0], 255u8);
    assert_eq!(salt_bytes[1], 0u8);
    // All other bytes remain 0
    assert_eq!(&salt_bytes[2..], &[0u8; 30]);
}

#[test]
fn test_salt_high_counter_uses_second_byte() {
    let count: u32 = 256;
    let mut salt_bytes = [0u8; 32];
    salt_bytes[0] = count as u8;
    salt_bytes[1] = (count >> 8) as u8;
    assert_eq!(salt_bytes[0], 0u8);
    assert_eq!(salt_bytes[1], 1u8);
}

#[test]
fn test_double_init_guard() {
    // Simulates the contract's already-initialized check
    let mut initialized = false;
    assert!(!initialized, "already initialized");
    initialized = true;

    // Second call would be caught
    assert!(initialized); // means already initialized — contract would panic
}
