"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWallet } from "@/components/wallet-provider";
import { useToast } from "@/components/toast-provider";
import { TradingChart } from "@/components/trading-chart";

export default function PredictionsPage() {
  const { pubKey } = useWallet();
  const { showToast } = useToast();
  
  const [selectedMarket, setSelectedMarket] = useState("BTC_70K");
  const [betAmount, setBetAmount] = useState("");
  const [isBetting, setIsBetting] = useState(false);

  const markets = [
    { id: "BTC_70K", question: "Will BTC hit $70,000 by Aug 1st?", yesPrice: 0.65, noPrice: 0.35, pool: "$45,210", chartSymbol: "BTCUSDT" },
    { id: "XLM_0_5", question: "Will XLM break $0.50 this year?", yesPrice: 0.22, noPrice: 0.78, pool: "$12,400", chartSymbol: "XLMUSDT" },
    { id: "ETH_ETF", question: "Will ETH ETF launch by Sept?", yesPrice: 0.88, noPrice: 0.12, pool: "$112,000", chartSymbol: "ETHUSDT" }
  ];

  const currentMarket = markets.find(m => m.id === selectedMarket) || markets[0];

  const handleBet = async (outcome: 'YES' | 'NO') => {
    if (!pubKey) {
      showToast("Please connect your wallet first.", "error");
      return;
    }
    if (!betAmount || parseFloat(betAmount) <= 0) {
      showToast("Enter a valid bet amount", "error");
      return;
    }

    setIsBetting(true);
    try {
      // Simulate interaction with Soroban Contract
      // In a real scenario, this builds and submits a Soroban contract call to `prediction_market` `bet` function.
      await new Promise(res => setTimeout(res, 2000));
      showToast(`Successfully bet ${betAmount} USDC on ${outcome}!`, "success");
      setBetAmount("");
    } catch (e) {
      showToast("Transaction failed.", "error");
    } finally {
      setIsBetting(false);
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "48px 24px", fontFamily: "var(--font-geist-sans)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: 600, color: "#fff", marginBottom: "8px", letterSpacing: "-0.5px" }}>
            Prediction Markets
          </h1>
          <p style={{ color: "#A1A1AA", fontSize: "16px" }}>Bet on binary outcomes, settled on-chain via Soroban Smart Contracts.</p>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <Link href="/trade" style={{ background: "#27272A", padding: "10px 20px", borderRadius: "6px", color: "#F4F4F5", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
            Spot Trade
          </Link>
          <Link href="/dashboard" style={{ background: "#27272A", padding: "10px 20px", borderRadius: "6px", color: "#F4F4F5", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
            Dashboard
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 380px", gap: "24px", alignItems: "start" }}>
        
        {/* Left Column: Markets List */}
        <div style={{ background: "rgba(17, 17, 19, 0.5)", backdropFilter: "blur(12px)", borderRadius: "12px", border: "1px solid #27272A", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>Active Markets</h2>
          {markets.map(m => (
            <div 
              key={m.id} 
              onClick={() => setSelectedMarket(m.id)}
              style={{ 
                padding: "16px", 
                background: selectedMarket === m.id ? "#27272A" : "transparent", 
                border: `1px solid ${selectedMarket === m.id ? "#52525B" : "#27272A"}`,
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 500, color: "#F4F4F5", marginBottom: "12px", lineHeight: 1.4 }}>{m.question}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ color: "#10B981", fontWeight: 600 }}>YES {(m.yesPrice * 100).toFixed(0)}¢</span>
                <span style={{ color: "#EF4444", fontWeight: 600 }}>NO {(m.noPrice * 100).toFixed(0)}¢</span>
              </div>
            </div>
          ))}
        </div>

        {/* Center Column: Chart & Market Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ background: "rgba(17, 17, 19, 0.5)", backdropFilter: "blur(12px)", borderRadius: "12px", border: "1px solid #27272A", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#fff", maxWidth: "400px", lineHeight: 1.3 }}>
                {currentMarket.question}
              </h2>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#A1A1AA", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Total Pool</div>
                <div style={{ color: "#F4F4F5", fontSize: "20px", fontWeight: 600 }}>{currentMarket.pool}</div>
              </div>
            </div>
            
            {/* Chart Area */}
            <div style={{ height: "400px", background: "rgba(9, 9, 11, 0.5)", backdropFilter: "blur(12px)", borderRadius: "8px", overflow: "hidden" }}>
              <TradingChart symbol={currentMarket.chartSymbol} />
            </div>
          </div>
        </div>

        {/* Right Column: Betting Interface */}
        <div style={{ background: "rgba(17, 17, 19, 0.5)", backdropFilter: "blur(12px)", borderRadius: "12px", border: "1px solid #27272A", padding: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "24px" }}>Place Bet</h2>
          
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", color: "#A1A1AA", marginBottom: "8px", fontWeight: 500 }}>Amount (USDC)</label>
            <div style={{ position: "relative" }}>
              <input 
                type="number" 
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="0.00" 
                style={{ width: "100%", background: "rgba(9, 9, 11, 0.5)", backdropFilter: "blur(12px)", border: "1px solid #3F3F46", padding: "16px", borderRadius: "8px", color: "#fff", fontSize: "24px", fontWeight: 500, outline: "none" }} 
              />
              <span style={{ position: "absolute", right: "16px", top: "20px", color: "#A1A1AA", fontSize: "16px", fontWeight: 500 }}>USDC</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
            <button 
              onClick={() => handleBet('YES')}
              disabled={isBetting || !pubKey}
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid #10B981",
                color: "#10B981",
                padding: "16px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: isBetting || !pubKey ? "not-allowed" : "pointer",
                opacity: isBetting || !pubKey ? 0.5 : 1,
                transition: "all 0.2s"
              }}
            >
              Bet YES
            </button>
            <button 
              onClick={() => handleBet('NO')}
              disabled={isBetting || !pubKey}
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid #EF4444",
                color: "#EF4444",
                padding: "16px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: isBetting || !pubKey ? "not-allowed" : "pointer",
                opacity: isBetting || !pubKey ? 0.5 : 1,
                transition: "all 0.2s"
              }}
            >
              Bet NO
            </button>
          </div>

          {pubKey && betAmount && parseFloat(betAmount) > 0 && (
            <div style={{ padding: "16px", background: "rgba(9, 9, 11, 0.5)", backdropFilter: "blur(12px)", borderRadius: "8px", border: "1px solid #27272A" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ color: "#A1A1AA", fontSize: "13px" }}>Est. Payout (YES)</span>
                <span style={{ color: "#10B981", fontSize: "13px", fontWeight: 600 }}>{(parseFloat(betAmount) / currentMarket.yesPrice).toFixed(2)} USDC</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#A1A1AA", fontSize: "13px" }}>Est. Payout (NO)</span>
                <span style={{ color: "#EF4444", fontSize: "13px", fontWeight: 600 }}>{(parseFloat(betAmount) / currentMarket.noPrice).toFixed(2)} USDC</span>
              </div>
            </div>
          )}

          {!pubKey && (
            <div style={{ marginTop: "16px", textAlign: "center", color: "#EF4444", fontSize: "14px", fontWeight: 500 }}>
              Wallet not connected
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
