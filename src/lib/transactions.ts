import { supabase } from "@/lib/supabase";

export interface UserTransaction {
  id: string;
  txHash: string;
  userId?: string;
  walletAddress: string;
  type: "PREDICTION_BET" | "CONTEST_CREATE" | "SWAP_INTENT" | "TOKEN_LAUNCH" | "CLAIM_PAYOUT";
  amount: string;
  asset: string;
  description: string;
  status: "SUCCESS" | "PENDING" | "FAILED";
  timestamp: string;
  explorerUrl: string;
}

const LOCAL_TX_KEY = "zing_user_transactions";

/**
 * Records a transaction to Supabase database, and falls back to local persistence.
 */
export async function recordUserTransaction(tx: Omit<UserTransaction, "id">): Promise<UserTransaction> {
  const newTx: UserTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...tx
  };

  // 1. Save to Supabase
  try {
    if (supabase) {
      await supabase.from("user_transactions").insert({
        tx_hash: newTx.txHash,
        user_id: newTx.userId || null,
        wallet_address: newTx.walletAddress,
        type: newTx.type,
        amount: parseFloat(newTx.amount) || 0,
        asset: newTx.asset,
        description: newTx.description,
        status: newTx.status,
        explorer_url: newTx.explorerUrl,
        created_at: newTx.timestamp
      });
    }
  } catch (err) {
    console.warn("Could not save transaction to Supabase:", err);
  }

  // 2. Save to local storage cache
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_TX_KEY);
      const existing: UserTransaction[] = stored ? JSON.parse(stored) : [];
      const updated = [newTx, ...existing.filter(item => item.txHash !== newTx.txHash)].slice(0, 50);
      localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.error("Local storage error:", err);
  }

  return newTx;
}

/**
 * Fetches transaction history for a given wallet address or user ID.
 */
export async function fetchUserTransactions(walletAddress?: string, userId?: string): Promise<UserTransaction[]> {
  const transactions: UserTransaction[] = [];

  // 1. Try fetching from Supabase
  try {
    if (supabase && (walletAddress || userId)) {
      let query = supabase.from("user_transactions").select("*").order("created_at", { ascending: false }).limit(50);
      
      if (walletAddress) {
        query = query.eq("wallet_address", walletAddress);
      } else if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id || item.tx_hash,
          txHash: item.tx_hash,
          userId: item.user_id,
          walletAddress: item.wallet_address,
          type: item.type,
          amount: item.amount?.toString() || "0",
          asset: item.asset || "XLM",
          description: item.description || "On-Chain Stellar Transaction",
          status: item.status || "SUCCESS",
          timestamp: item.created_at,
          explorerUrl: item.explorer_url || `https://stellar.expert/explorer/testnet/tx/${item.tx_hash}`
        }));
      }
    }
  } catch (err) {
    console.warn("Supabase fetch failed, checking local cache:", err);
  }

  // 2. Fallback to LocalStorage cache
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_TX_KEY);
      if (stored) {
        const localList: UserTransaction[] = JSON.parse(stored);
        if (walletAddress) {
          return localList.filter(t => t.walletAddress.toLowerCase() === walletAddress.toLowerCase());
        }
        return localList;
      }
    }
  } catch (err) {
    console.error("Local transaction fetch error:", err);
  }

  return transactions;
}
