"use client";
import React, { useState } from "react";
import { useToast } from "@/components/toast-provider";

export function SentimentPoll() {
  const [voted, setVoted] = useState<"Bearish" | "Bullish" | null>(null);
  const { showToast } = useToast();

  const handleVote = (vote: "Bearish" | "Bullish") => {
    setVoted(vote);
    showToast(`You voted ${vote}. Global sentiment updated!`, "success");
  };

  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px" }}>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>Community Sentiment</div>
      <div style={{ fontSize: "11px", color: "#71717A", marginBottom: "12px" }}>How do you feel about the market today?</div>
      
      {voted ? (
        <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "8px", textAlign: "center", fontSize: "13px", color: "#A1A1AA" }}>
          You and 78% of users are feeling <strong style={{ color: voted === "Bullish" ? "#10B981" : "#EF4444" }}>{voted}</strong> today.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <button onClick={() => handleVote("Bearish")} style={{ background: "transparent", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", padding: "8px", color: "#EF4444", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} className="sentiment-btn">Bearish</button>
          <button onClick={() => handleVote("Bullish")} style={{ background: "transparent", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px", padding: "8px", color: "#10B981", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} className="sentiment-btn">Bullish</button>
        </div>
      )}
    </div>
  );
}
