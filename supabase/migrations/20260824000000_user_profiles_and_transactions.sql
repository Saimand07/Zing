-- Migration: user_profiles_and_transactions.sql
-- Supports User Profile persistence, linked Stellar smart wallets, and on-chain transaction history.

-- 1. user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    avatar_url TEXT,
    wallet_address VARCHAR(56),
    twitter_handle VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. user_transactions
CREATE TABLE IF NOT EXISTS user_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tx_hash VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID,
    wallet_address VARCHAR(56) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'PREDICTION_BET', 'CONTEST_CREATE', 'SWAP_INTENT', 'TOKEN_LAUNCH', 'CLAIM_PAYOUT'
    amount NUMERIC NOT NULL,
    asset VARCHAR(20) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    explorer_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_profiles_policy" ON user_profiles FOR ALL USING (true);

ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_transactions_policy" ON user_transactions FOR ALL USING (true);
