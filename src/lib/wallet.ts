import { Keypair } from '@stellar/stellar-sdk';
import { supabase } from './supabase';

/**
 * Generates a new Stellar Keypair and saves the public key to the user's profile.
 * Note: In a production environment, the secret key should be encrypted 
 * with a user-provided password before being stored anywhere, or simply
 * shown to the user once to store themselves (non-custodial).
 */
export async function createStellarWallet(userId: string) {
  try {
    // Generate new native Stellar keypair
    const pair = Keypair.random();
    const publicKey = pair.publicKey();
    const secretKey = pair.secret();

    // 1. Insert into stellar_accounts
    const { error: dbError } = await supabase.from('stellar_accounts').insert([
      {
        user_id: userId,
        public_key: publicKey,
        account_type: 'user'
      }
    ]);

    if (dbError) throw dbError;

    // 2. Update user_quests
    const { error: questError } = await supabase.from('user_quests')
      .update({ wallet_created: true })
      .eq('user_id', userId);
      
    // It's possible the user_quests row doesn't exist yet, so we should upsert
    if (questError) {
      await supabase.from('user_quests').insert([
        { user_id: userId, wallet_created: true }
      ]);
    }

    return { publicKey, secretKey };
  } catch (error) {
    console.error("Error creating Stellar wallet:", error);
    throw error;
  }
}

/**
 * Marks the Twitter linked quest as complete
 */
export async function linkTwitterQuest(userId: string) {
  try {
    const { data, error } = await supabase.from('user_quests')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!data) {
      await supabase.from('user_quests').insert([
        { user_id: userId, twitter_linked: true }
      ]);
    } else {
      await supabase.from('user_quests')
        .update({ twitter_linked: true })
        .eq('user_id', userId);
    }
  } catch (error) {
    console.error("Error linking Twitter:", error);
  }
}
