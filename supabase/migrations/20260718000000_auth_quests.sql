-- Migration: auth_quests.sql

-- Add twitter_handle to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter_handle VARCHAR(255);

-- Create quests table to track user progress for Welcome Bonus
CREATE TABLE IF NOT EXISTS user_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    wallet_created BOOLEAN DEFAULT FALSE,
    twitter_linked BOOLEAN DEFAULT FALSE,
    first_trade_made BOOLEAN DEFAULT FALSE,
    bonus_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_quests_select_policy" ON user_quests FOR SELECT USING (true);
CREATE POLICY "user_quests_insert_policy" ON user_quests FOR INSERT WITH CHECK (true);
CREATE POLICY "user_quests_update_policy" ON user_quests FOR UPDATE USING (true);
