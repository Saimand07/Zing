"use client";

import { useAuth } from "./auth-provider";
import { useWallet } from "./wallet-provider";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function QuestsWidget() {
  const { user, loginWithTwitter } = useAuth();
  const { pubKey, openSidebar } = useWallet();
  const [quests, setQuests] = useState({
    wallet_created: false,
    twitter_linked: false,
    first_trade_made: false,
  });

  useEffect(() => {
    // If the user logs in with Twitter, that means they have linked it.
    // If they have a pubKey, wallet is created.
    if (user) {
      setQuests(q => ({ ...q, twitter_linked: true }));
      // Fetch quests from DB
      supabase.from('user_quests').select('*').eq('user_id', user.id).single()
        .then(({ data }) => {
          if (data) {
            setQuests({
              wallet_created: data.wallet_created,
              twitter_linked: data.twitter_linked,
              first_trade_made: data.first_trade_made
            });
          }
        });
    }
  }, [user, pubKey]);

  useEffect(() => {
    if (pubKey) {
      setQuests(q => ({ ...q, wallet_created: true }));
    }
  }, [pubKey]);

  const completedCount = [quests.wallet_created, quests.twitter_linked, quests.first_trade_made].filter(Boolean).length;
  const progress = (completedCount / 3) * 100;

  return (
    <div style={{ background: "rgba(17, 17, 19, 0.5)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "12px", color: "#F59E0B", fontWeight: 700, marginBottom: "4px" }}>$50 Welcome Bonus</div>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>Complete all steps to get $50 for trading fees.</div>
        </div>
        <div style={{ fontSize: "24px", fontWeight: 700, color: "#F59E0B" }}>{completedCount}/3</div>
      </div>

      <div style={{ width: "100%", height: "4px", background: "#27272A", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", background: "#F59E0B", width: `${progress}%`, transition: "width 0.3s ease" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
        {/* Step 1 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: quests.wallet_created ? "#10B981" : "#27272A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>
              {quests.wallet_created ? "✓" : "1"}
            </div>
            <span style={{ fontSize: "14px", color: quests.wallet_created ? "#71717A" : "#F4F4F5", textDecoration: quests.wallet_created ? "line-through" : "none" }}>Create a Wallet</span>
          </div>
          {!quests.wallet_created && (
             <button onClick={openSidebar} style={{ background: "transparent", color: "#3B82F6", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: "6px", padding: "4px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Start</button>
          )}
        </div>

        {/* Step 2 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
             <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: quests.twitter_linked ? "#10B981" : "#27272A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>
              {quests.twitter_linked ? "✓" : "2"}
            </div>
            <span style={{ fontSize: "14px", color: quests.twitter_linked ? "#71717A" : "#F4F4F5", textDecoration: quests.twitter_linked ? "line-through" : "none" }}>Join with X/Twitter</span>
          </div>
          {!quests.twitter_linked && (
             <button onClick={loginWithTwitter} style={{ background: "#1DA1F2", color: "#fff", border: "none", borderRadius: "6px", padding: "4px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
               Join 🚀
             </button>
          )}
        </div>

        {/* Step 3 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: quests.first_trade_made ? "#10B981" : "#27272A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>
              {quests.first_trade_made ? "✓" : "3"}
            </div>
            <span style={{ fontSize: "14px", color: quests.first_trade_made ? "#71717A" : "#F4F4F5", textDecoration: quests.first_trade_made ? "line-through" : "none" }}>Make 1 Trade</span>
          </div>
          {!quests.first_trade_made && (
             <button style={{ background: "transparent", color: "#71717A", border: "1px solid #3F3F46", borderRadius: "6px", padding: "4px 12px", fontSize: "12px", fontWeight: 600, cursor: "not-allowed" }}>Pending</button>
          )}
        </div>
      </div>
    </div>
  );
}
