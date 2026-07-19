"use client";

import { useState, useEffect } from "react";
import { useWallet } from "./wallet-provider";
import { useAuth } from "./auth-provider";
import { getBalances, TokenBalance } from "@/lib/stellar-trade";

export default function WalletSidebar() {
  const { isSidebarOpen, closeSidebar, pubKey, connectWallet, createNativeWallet, getSupportedWallets, disconnectWallet } = useWallet();
  const { user, loginWithTwitter } = useAuth();
  const [wallets, setWallets] = useState<any[]>([]);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  useEffect(() => {
    if (isSidebarOpen && !pubKey) {
      getSupportedWallets().then(setWallets).catch(console.error);
    }
    if (isSidebarOpen && pubKey) {
      setIsLoadingBalances(true);
      getBalances(pubKey)
        .then(setBalances)
        .catch(console.error)
        .finally(() => setIsLoadingBalances(false));
    }
  }, [isSidebarOpen, pubKey, getSupportedWallets]);

  if (!isSidebarOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.6)",
          zIndex: 100,
          backdropFilter: "blur(4px)",
        }}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "420px",
          background: "rgba(9, 9, 11, 0.5)", backdropFilter: "blur(12px)",
          borderLeft: "1px solid #27272A",
          zIndex: 101,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
          animation: "slideIn 0.2s ease-out forwards",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#F4F4F5", display: "flex", alignItems: "center", gap: "8px" }}>
            Wallet
          </h2>
          <button
            onClick={closeSidebar}
            style={{ background: "transparent", border: "none", color: "#71717A", fontSize: "20px", cursor: "pointer" }}
          >
            ×
          </button>
        </div>

        {pubKey ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto", paddingRight: "8px" }}>
            
            {/* Network Badge */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "-12px" }}>
              <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "16px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
                <span style={{ color: "#10B981", fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Stellar Testnet</span>
              </div>
            </div>

            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#F4F4F5", marginBottom: "8px" }}>Welcome Back!</h3>
              <p style={{ fontSize: "14px", color: "#A1A1AA" }}>Manage your connected assets seamlessly.</p>
            </div>

            <div style={{ background: "rgba(17, 17, 19, 0.5)", backdropFilter: "blur(12px)", padding: "20px", borderRadius: "12px", border: "1px solid #27272A" }}>
              <p style={{ fontSize: "12px", color: "#71717A", marginBottom: "8px" }}>Connected Account</p>
              <p style={{ fontSize: "13px", color: "#F4F4F5", fontFamily: "var(--font-geist-mono)", wordBreak: "break-all", background: "#18181B", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                {pubKey}
              </p>

              <div style={{ borderTop: "1px solid #27272A", margin: "24px -20px 20px -20px" }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                 <p style={{ fontSize: "12px", color: "#A1A1AA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Available Assets</p>
                 <button onClick={() => { setIsLoadingBalances(true); getBalances(pubKey).then(setBalances).finally(() => setIsLoadingBalances(false)); }} style={{ background: "rgba(59, 130, 246, 0.1)", border: "none", color: "#3B82F6", cursor: "pointer", fontSize: "11px", fontWeight: 600, padding: "4px 8px", borderRadius: "4px" }}>Refresh</button>
              </div>
              
              {isLoadingBalances ? (
                <div style={{ textAlign: "center", color: "#A1A1AA", fontSize: "13px", padding: "24px 0" }}>Loading balances...</div>
              ) : balances.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {balances.map((b, i) => {
                    const isNative = b.asset_type === "native";
                    const symbol = isNative ? "XLM" : b.asset_code;
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#18181B", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.02)" }}>
                         <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                           <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: isNative ? "#000" : "#2775CA", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "11px" }}>
                             {symbol?.substring(0, 3)}
                           </div>
                           <div>
                             <div style={{ fontWeight: 600, color: "#fff", fontSize: "14px" }}>{symbol}</div>
                             {!isNative && <div style={{ fontSize: "10px", color: "#71717A" }}>{b.asset_issuer?.substring(0,6)}...{b.asset_issuer?.slice(-4)}</div>}
                             {isNative && <div style={{ fontSize: "10px", color: "#71717A" }}>Native Token</div>}
                           </div>
                         </div>
                         <div style={{ fontFamily: "var(--font-geist-mono)", color: "#F4F4F5", fontSize: "14px", fontWeight: 500 }}>
                           {parseFloat(b.balance).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                         </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                 <div style={{ textAlign: "center", color: "#A1A1AA", fontSize: "13px", padding: "24px 0" }}>No assets found. Ensure your account is funded.</div>
              )}
            </div>

            <button
              onClick={disconnectWallet}
              style={{
                marginTop: "auto",
                padding: "12px",
                background: "transparent",
                border: "1px solid #3F3F46",
                color: "#F4F4F5",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", textAlign: "center" }}>
            <h3 style={{ fontSize: "24px", fontWeight: 700, color: "#F4F4F5", marginBottom: "12px", marginTop: "24px" }}>
              Welcome to Zing wallet
            </h3>
            <p style={{ fontSize: "14px", color: "#71717A", marginBottom: "48px" }}>
              Create or import a existing wallet to begin your full experience with Zing.
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", flex: 1 }}>
              {/* Native Auth Section */}
              {!user ? (
                 <button
                 onClick={loginWithTwitter}
                 style={{
                   padding: "16px",
                   background: "#1DA1F2",
                   color: "#fff",
                   border: "none",
                   borderRadius: "8px",
                   fontSize: "15px",
                   fontWeight: 700,
                   cursor: "pointer",
                   display: "flex",
                   alignItems: "center",
                   justifyContent: "center",
                   gap: "8px",
                   transition: "opacity 0.2s"
                 }}
                 onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                 onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
               >
                 Join with X/Twitter 🚀
               </button>
              ) : (
                <button
                  onClick={createNativeWallet}
                  style={{
                    padding: "16px",
                    background: "#3B82F6",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "opacity 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                >
                  Create wallet
                </button>
              )}

              <div style={{ margin: "16px 0", borderBottom: "1px solid #27272A", position: "relative" }}>
                 <span style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "rgba(9, 9, 11, 0.5)", backdropFilter: "blur(12px)", padding: "0 8px", fontSize: "12px", color: "#71717A" }}>
                   OR IMPORT
                 </span>
              </div>

              {/* Extension Wallets Fallback */}
              {[
                { id: "freighter", name: "Freighter", icon: "🦊" },
                { id: "albedo", name: "Albedo", icon: "🌒" },
                { id: "xbull", name: "xBull", icon: "🐂" }
              ].map((w) => (
                <button
                  key={w.id}
                  onClick={() => connectWallet(w.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px",
                    background: "#18181B",
                    border: "1px solid #27272A",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#27272A"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#18181B"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "24px" }}>{w.icon}</span>
                    <span style={{ color: "#F4F4F5", fontWeight: 600, fontSize: "16px" }}>{w.name}</span>
                  </div>
                  <span style={{ fontSize: "12px", color: "#3B82F6", background: "rgba(59, 130, 246, 0.1)", padding: "4px 8px", borderRadius: "4px" }}>Connect</span>
                </button>
              ))}
            </div>

            <div style={{ marginTop: "auto", paddingTop: "24px", fontSize: "12px", color: "#71717A", borderTop: "1px solid #27272A" }}>
              AI-powered decentralized ecosystem for DeFi & AI technologies<br/>
              © 2024-2026 Zing. All rights reserved
            </div>
          </div>
        )}
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>
      </div>
    </>
  );
}
