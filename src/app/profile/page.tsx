"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useWallet } from "@/components/wallet-provider";
import { useToast } from "@/components/toast-provider";
import { getBalances } from "@/lib/stellar-trade";
import { fetchUserTransactions, UserTransaction } from "@/lib/transactions";
import { 
  User, 
  Wallet, 
  Copy, 
  Check, 
  ExternalLink, 
  LogOut, 
  Edit3, 
  Activity, 
  ArrowUpRight, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  TrendingUp,
  Rocket,
  ArrowRightLeft,
  X
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, updateUserProfile, logout, linkWalletToProfile } = useAuth();
  const { pubKey, openSidebar, disconnectWallet } = useWallet();
  const { showToast } = useToast();

  const [copied, setCopied] = useState(false);
  const [balances, setBalances] = useState<{ code: string; balance: string }[]>([]);
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editTwitter, setEditTwitter] = useState("");

  // Sync wallet address to Supabase user profile when wallet connects
  useEffect(() => {
    if (pubKey && user) {
      linkWalletToProfile(pubKey);
    }
  }, [pubKey, user]);

  // Load balances
  useEffect(() => {
    const address = pubKey || profile?.walletAddress;
    if (address) {
      getBalances(address).then((bals) => {
        setBalances(
          bals.map((b) => ({
            code: b.asset_type === "native" ? "XLM" : b.asset_code || "UNKNOWN",
            balance: parseFloat(b.balance).toFixed(2)
          }))
        );
      });
    }
  }, [pubKey, profile?.walletAddress]);

  // Load transaction history
  const loadTransactions = async () => {
    const address = pubKey || profile?.walletAddress;
    const txs = await fetchUserTransactions(address, user?.id);
    setTransactions(txs);
  };

  useEffect(() => {
    loadTransactions();
  }, [pubKey, user, profile?.walletAddress]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Address copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateUserProfile({
      username: editUsername,
      bio: editBio,
      twitterHandle: editTwitter
    });
    if (ok) {
      showToast("Profile saved to database!", "success");
      setIsEditing(false);
    } else {
      showToast("Failed to save profile.", "error");
    }
  };

  const activeWallet = pubKey || profile?.walletAddress || "";

  const filteredTransactions = selectedFilter === "ALL"
    ? transactions
    : transactions.filter(t => t.type === selectedFilter);

  const cardStyle = {
    background: "rgba(17, 17, 19, 0.5)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    padding: "24px"
  };

  return (
    <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "24px", color: "#fff", fontFamily: "var(--font-geist-sans)" }}>
      
      {/* ── Top Header Banner ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 12px", borderRadius: "100px", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#3B82F6", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
            <Sparkles size={12} />
            User Account & On-Chain Ledger
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.5px", margin: "0 0 6px 0" }}>
            {profile?.username || "Zing User"} Profile
          </h1>
          <p style={{ color: "#71717A", fontSize: "13px", margin: 0 }}>
            Manage your credentials, linked Stellar smart account, and on-chain transaction history.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {!user ? (
            <Link
              href="/auth"
              style={{
                padding: "9px 18px",
                borderRadius: "8px",
                background: "#3B82F6",
                color: "#fff",
                fontWeight: 600,
                fontSize: "13px",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <User size={16} />
              Sign In / Sign Up
            </Link>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditUsername(profile?.username || "");
                  setEditBio(profile?.bio || "");
                  setEditTwitter(profile?.twitterHandle || "");
                  setIsEditing(true);
                }}
                style={{
                  padding: "9px 16px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "13px",
                  border: "1px solid #27272A",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Edit3 size={14} />
                Edit Profile
              </button>

              <button
                onClick={() => {
                  logout();
                  showToast("Signed out successfully", "info");
                }}
                style={{
                  padding: "9px 16px",
                  borderRadius: "8px",
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#EF4444",
                  fontWeight: 600,
                  fontSize: "13px",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Main Layout: Profile Card + Assets Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "24px", alignItems: "start", marginBottom: "24px" }}>
        
        {/* Left: User Identity Card */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #3B82F6, #10B981)", padding: "2px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#18181B", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "20px" }}>
                {(profile?.username || "Z")[0].toUpperCase()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
                {profile?.username || (user ? user.email?.split("@")[0] : "Guest Trader")}
              </div>
              <div style={{ fontSize: "12px", color: "#71717A" }}>
                {user ? user.email : "Not signed in"}
              </div>
              {profile?.twitterHandle && (
                <div style={{ fontSize: "11px", color: "#3B82F6", marginTop: "2px" }}>
                  @{profile.twitterHandle}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div style={{ fontSize: "12px", color: "#A1A1AA", background: "rgba(9, 9, 11, 0.5)", border: "1px solid #27272A", borderRadius: "8px", padding: "12px", marginBottom: "20px", lineHeight: 1.5 }}>
            {profile?.bio || "Decentralized prediction market and DeFi participant on Stellar."}
          </div>

          {/* Stored Wallet Address */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 600, color: "#71717A", marginBottom: "6px" }}>
              <span>Stored Stellar Wallet</span>
              <span style={{ color: activeWallet ? "#10B981" : "#EF4444" }}>
                {activeWallet ? "Connected" : "Disconnected"}
              </span>
            </div>

            {activeWallet ? (
              <div style={{ background: "rgba(9, 9, 11, 0.5)", border: "1px solid #27272A", borderRadius: "8px", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontFamily: "var(--font-geist-mono)", color: "#fff" }}>
                  {activeWallet.slice(0, 8)}...{activeWallet.slice(-8)}
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleCopy(activeWallet)}
                    style={{ background: "transparent", border: "none", color: "#71717A", cursor: "pointer", padding: "2px" }}
                    title="Copy Address"
                  >
                    {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  </button>
                  <a
                    href={`https://stellar.expert/explorer/testnet/account/${activeWallet}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#3B82F6", display: "flex", alignItems: "center" }}
                    title="View on StellarExpert"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ) : (
              <button
                onClick={openSidebar}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#3B82F6",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "12px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                <Wallet size={14} />
                Connect & Bind Wallet
              </button>
            )}
          </div>

          {/* Account Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#52525B" }}>User ID</div>
              <div style={{ fontSize: "11px", fontFamily: "var(--font-geist-mono)", color: "#71717A", marginTop: "2px" }}>
                {user ? `${user.id.slice(0, 8)}...` : "Anonymous"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#52525B" }}>Total Transactions</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                {transactions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Stellar Assets & Metrics */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Wallet Balances Box */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>Live Wallet Holdings</div>
              <span style={{ fontSize: "11px", color: "#3B82F6", fontWeight: 600 }}>Stellar Testnet</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
              {balances.length > 0 ? (
                balances.map((b, i) => (
                  <div key={i} style={{ background: "rgba(9, 9, 11, 0.5)", border: "1px solid #27272A", borderRadius: "8px", padding: "14px" }}>
                    <div style={{ fontSize: "11px", color: "#71717A", fontWeight: 600 }}>{b.code}</div>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff", fontFamily: "var(--font-geist-mono)", marginTop: "4px" }}>
                      {b.balance}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "#71717A", fontSize: "13px", gridColumn: "1 / -1" }}>
                  {activeWallet ? "Loading live balances from Horizon..." : "Connect your Stellar wallet to view balances."}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            <Link
              href="/trade/predictions"
              style={{
                ...cardStyle,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px",
                transition: "all 0.2s"
              }}
            >
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981" }}>
                <TrendingUp size={18} />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>Prediction Markets</div>
                <div style={{ fontSize: "11px", color: "#71717A" }}>Vote on Soroban</div>
              </div>
            </Link>

            <Link
              href="/trade"
              style={{
                ...cardStyle,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px",
                transition: "all 0.2s"
              }}
            >
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3B82F6" }}>
                <ArrowRightLeft size={18} />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>Spot Swap</div>
                <div style={{ fontSize: "11px", color: "#71717A" }}>Zero-Gas Intent Trades</div>
              </div>
            </Link>

            <Link
              href="/launch"
              style={{
                ...cardStyle,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px",
                transition: "all 0.2s"
              }}
            >
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(168, 85, 247, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#A855F7" }}>
                <Rocket size={18} />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>LaunchZone</div>
                <div style={{ fontSize: "11px", color: "#71717A" }}>Deploy Stellar Tokens</div>
              </div>
            </Link>
          </div>

        </div>

      </div>

      {/* ── Transaction History Section (Stored in Database) ── */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#fff" }}>Stored On-Chain Transaction History</div>
            <div style={{ fontSize: "12px", color: "#71717A" }}>Synchronized with your user profile & Stellar wallet in Supabase.</div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: "flex", gap: "6px" }}>
            {["ALL", "PREDICTION_BET", "CONTEST_CREATE", "SWAP_INTENT", "TOKEN_LAUNCH", "CLAIM_PAYOUT"].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  background: selectedFilter === f ? "#27272A" : "transparent",
                  color: selectedFilter === f ? "#fff" : "#71717A",
                  fontSize: "11px",
                  fontWeight: 600,
                  border: `1px solid ${selectedFilter === f ? "#3F3F46" : "rgba(255,255,255,0.05)"}`,
                  cursor: "pointer"
                }}
              >
                {f.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        {filteredTransactions.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #27272A", color: "#71717A", fontSize: "11px", textTransform: "uppercase" }}>
                  <th style={{ padding: "10px 12px" }}>Type</th>
                  <th style={{ padding: "10px 12px" }}>Description</th>
                  <th style={{ padding: "10px 12px" }}>Amount</th>
                  <th style={{ padding: "10px 12px" }}>Status</th>
                  <th style={{ padding: "10px 12px" }}>Timestamp</th>
                  <th style={{ padding: "10px 12px", textAlign: "right" }}>Explorer</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "12px" }}>
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: 700,
                        background: tx.type === "PREDICTION_BET" ? "rgba(16, 185, 129, 0.1)" : tx.type === "CONTEST_CREATE" ? "rgba(59, 130, 246, 0.1)" : "rgba(168, 85, 247, 0.1)",
                        color: tx.type === "PREDICTION_BET" ? "#10B981" : tx.type === "CONTEST_CREATE" ? "#3B82F6" : "#A855F7"
                      }}>
                        {tx.type.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ padding: "12px", color: "#fff", fontWeight: 500 }}>
                      {tx.description}
                    </td>
                    <td style={{ padding: "12px", fontFamily: "var(--font-geist-mono)", fontWeight: 600, color: "#fff" }}>
                      {tx.amount} {tx.asset}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ fontSize: "11px", color: tx.status === "SUCCESS" ? "#10B981" : "#F59E0B" }}>
                        ● {tx.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px", color: "#71717A", fontSize: "12px" }}>
                      {new Date(tx.timestamp).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <a
                        href={tx.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#3B82F6", textDecoration: "none", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        {tx.txHash.slice(0, 6)}...
                        <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#71717A" }}>
            <Activity size={32} style={{ margin: "0 auto 12px auto", opacity: 0.4 }} />
            <div style={{ fontSize: "14px", fontWeight: 500, color: "#fff", marginBottom: "4px" }}>No Transactions Recorded Yet</div>
            <div style={{ fontSize: "12px" }}>Execute a swap, place an on-chain prediction bet, or launch a token to populate your ledger.</div>
          </div>
        )}
      </div>

      {/* ── Edit Profile Modal ── */}
      {isEditing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ ...cardStyle, width: "100%", maxWidth: "480px", position: "relative", border: "1px solid #3F3F46" }}>
            <button
              onClick={() => setIsEditing(false)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: "#71717A", cursor: "pointer" }}
            >
              <X size={18} />
            </button>

            <div style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "16px", color: "#fff" }}>
              Edit User Profile
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#71717A", marginBottom: "4px" }}>
                  Display Username
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "rgba(9, 9, 11, 0.5)", border: "1px solid #3F3F46", color: "#fff", outline: "none", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#71717A", marginBottom: "4px" }}>
                  Twitter / X Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. SatoshiStellar"
                  value={editTwitter}
                  onChange={(e) => setEditTwitter(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "rgba(9, 9, 11, 0.5)", border: "1px solid #3F3F46", color: "#fff", outline: "none", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#71717A", marginBottom: "4px" }}>
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "rgba(9, 9, 11, 0.5)", border: "1px solid #3F3F46", color: "#fff", outline: "none", fontSize: "13px", resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{ flex: 1, padding: "10px", borderRadius: "6px", background: "#27272A", color: "#A1A1AA", border: "none", fontWeight: 500, fontSize: "13px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: "10px", borderRadius: "6px", background: "#3B82F6", color: "#fff", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
                >
                  Save Profile to DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
