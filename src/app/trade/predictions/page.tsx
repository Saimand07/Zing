"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@/components/wallet-provider";
import { useToast } from "@/components/toast-provider";
import { TradingChart } from "@/components/trading-chart";

interface Market {
  id: string;
  category: string;
  question: string;
  description: string;
  yesProb: number; // 0 - 100
  noProb: number;
  totalPool: number;
  volume24h: number;
  participants: number;
  chartSymbol: string;
  endTime: string; // ISO date string
  contractId: string;
  status: "ACTIVE" | "RESOLVED";
  resolvedOutcome?: boolean;
}

const MARKETS: Market[] = [
  {
    id: "XLM_0_50",
    category: "Stellar & Soroban",
    question: "Will Stellar (XLM) break $0.40 before end of Q3 2026?",
    description: "Resolves to YES if Binance/Coinbase XLM/USDT spot index touches or exceeds $0.4000 at any point before timestamp.",
    yesProb: 68,
    noProb: 32,
    totalPool: 84520,
    volume24h: 18400,
    participants: 412,
    chartSymbol: "XLMUSDT",
    endTime: "2026-09-30T23:59:59Z",
    contractId: "CBHD7...Q7KM9",
    status: "ACTIVE"
  },
  {
    id: "BTC_120K",
    category: "Crypto & DeFi",
    question: "Will Bitcoin hit $120,000 before December 2026?",
    description: "Market resolves based on Deribit index reference price hitting $120,000 before expiry.",
    yesProb: 74,
    noProb: 26,
    totalPool: 245000,
    volume24h: 62300,
    participants: 1289,
    chartSymbol: "BTCUSDT",
    endTime: "2026-12-31T23:59:59Z",
    contractId: "CDA91...PP41X",
    status: "ACTIVE"
  },
  {
    id: "SOROBAN_TVL",
    category: "Stellar & Soroban",
    question: "Will Soroban Mainnet TVL exceed $250M in 2026?",
    description: "Based on DeFiLlama official reported total value locked on Stellar Soroban contracts.",
    yesProb: 81,
    noProb: 19,
    totalPool: 53100,
    volume24h: 9200,
    participants: 310,
    chartSymbol: "XLMUSDT",
    endTime: "2026-11-15T00:00:00Z",
    contractId: "CC182...Z99AA",
    status: "ACTIVE"
  },
  {
    id: "FED_RATE_CUT",
    category: "Macro & Elections",
    question: "Will the US Federal Reserve cut rates by >= 50bps next FOMC?",
    description: "Resolves to YES if FOMC official target rate drops by 50 basis points or more.",
    yesProb: 42,
    noProb: 58,
    totalPool: 192000,
    volume24h: 34100,
    participants: 870,
    chartSymbol: "BTCUSDT",
    endTime: "2026-09-18T18:00:00Z",
    contractId: "CFF34...LK120",
    status: "ACTIVE"
  },
  {
    id: "AI_AGENT_STOCKS",
    category: "AI & Tech",
    question: "Will an autonomous on-chain AI Agent manage >$10M on Soroban?",
    description: "Verified on-chain smart wallet balance managed exclusively by verifiable AI agent intents.",
    yesProb: 89,
    noProb: 11,
    totalPool: 38900,
    volume24h: 11400,
    participants: 195,
    chartSymbol: "ETHUSDT",
    endTime: "2026-10-31T23:59:59Z",
    contractId: "CA812...JJ301",
    status: "ACTIVE"
  }
];

export default function PredictionsPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: "48px", color: "#fff", textAlign: "center" }}>Loading Prediction Terminal...</div>}>
      <PredictionsTerminal />
    </React.Suspense>
  );
}

function PredictionsTerminal() {
  const { pubKey } = useWallet();
  const { showToast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState("All Markets");
  const [selectedMarketId, setSelectedMarketId] = useState("XLM_0_50");
  const [selectedSide, setSelectedSide] = useState<"YES" | "NO">("YES");
  const [betAmount, setBetAmount] = useState("100");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"TRADE" | "POSITIONS">("TRADE");

  // User simulated positions for claiming
  const [userPositions, setUserPositions] = useState([
    {
      marketId: "SOROBAN_TVL",
      question: "Will Soroban Mainnet TVL exceed $250M in 2026?",
      side: "YES",
      shares: 350,
      invested: 250,
      currentValue: 283.5,
      canClaim: false
    },
    {
      marketId: "PAST_XLM_PUMP",
      question: "Did XLM achieve Protocol 22 activation smoothly?",
      side: "YES",
      shares: 600,
      invested: 300,
      currentValue: 600,
      canClaim: true
    }
  ]);

  const categories = ["All Markets", "Stellar & Soroban", "Crypto & DeFi", "AI & Tech", "Macro & Elections"];

  const filteredMarkets = selectedCategory === "All Markets"
    ? MARKETS
    : MARKETS.filter(m => m.category === selectedCategory);

  const currentMarket = MARKETS.find(m => m.id === selectedMarketId) || MARKETS[0];

  const sharePrice = selectedSide === "YES" ? currentMarket.yesProb / 100 : currentMarket.noProb / 100;
  const numAmount = parseFloat(betAmount) || 0;
  const sharesEstimated = sharePrice > 0 ? (numAmount / sharePrice).toFixed(1) : "0";
  const potentialReturn = numAmount > 0 ? ((parseFloat(sharesEstimated) - numAmount) / numAmount * 100).toFixed(1) : "0";
  const potentialProfit = (parseFloat(sharesEstimated) - numAmount).toFixed(2);

  // Time remaining calculation
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const diff = new Date(currentMarket.endTime).getTime() - new Date().getTime();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [currentMarket]);

  const handlePlaceBet = async () => {
    if (!pubKey) {
      showToast("Please connect your Stellar wallet first.", "error");
      return;
    }
    if (numAmount <= 0) {
      showToast("Please enter a valid USDC amount.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate Soroban contract authorization and transaction submission
      await new Promise(r => setTimeout(r, 1600));
      showToast(`Success! Bought ${sharesEstimated} ${selectedSide} shares on Soroban.`, "success");
      
      setUserPositions(prev => [
        {
          marketId: currentMarket.id,
          question: currentMarket.question,
          side: selectedSide,
          shares: parseFloat(sharesEstimated),
          invested: numAmount,
          currentValue: parseFloat(sharesEstimated) * (selectedSide === "YES" ? currentMarket.yesProb / 100 : currentMarket.noProb / 100),
          canClaim: false
        },
        ...prev
      ]);
    } catch {
      showToast("Failed to submit bet to Soroban.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaim = (idx: number) => {
    showToast("Winnings claimed! Transferred 600 USDC to your wallet.", "success");
    setUserPositions(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ maxWidth: "1500px", margin: "0 auto", padding: "32px 24px 80px 24px", color: "#fff", fontFamily: "var(--font-geist-sans)" }}>
      
      {/* ── Top Header Banner ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "24px" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "100px", background: "rgba(0, 229, 255, 0.1)", border: "1px solid rgba(0, 229, 255, 0.3)", color: "#00E5FF", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00E5FF", boxShadow: "0 0 8px #00E5FF" }} />
            Soroban Prediction Protocol
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 8px 0" }}>
            Decentralized Prediction Markets
          </h1>
          <p style={{ color: "#A1A1AA", fontSize: "1.1rem", margin: 0 }}>
            Trade outcome shares with deterministic on-chain settlement powered by Soroban Smart Contracts.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => setActiveTab("TRADE")}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              background: activeTab === "TRADE" ? "#00E5FF" : "rgba(255,255,255,0.05)",
              color: activeTab === "TRADE" ? "#000" : "#fff",
              fontWeight: 700,
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            Markets
          </button>
          <button
            onClick={() => setActiveTab("POSITIONS")}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              background: activeTab === "POSITIONS" ? "#00E5FF" : "rgba(255,255,255,0.05)",
              color: activeTab === "POSITIONS" ? "#000" : "#fff",
              fontWeight: 700,
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            My Positions
            {userPositions.some(p => p.canClaim) && (
              <span style={{ padding: "2px 6px", background: "#00FF88", color: "#000", fontSize: "10px", borderRadius: "4px", fontWeight: 800 }}>
                1 Claimable
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "POSITIONS" ? (
        /* ── Positions & Claim Widget ── */
        <div className="glass-card" style={{ padding: "32px" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "20px" }}>Active Positions & Claims</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {userPositions.map((pos, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "20px 24px",
                  borderRadius: "12px",
                  background: pos.canClaim ? "rgba(0, 255, 136, 0.05)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${pos.canClaim ? "rgba(0, 255, 136, 0.3)" : "rgba(255,255,255,0.08)"}`
                }}
              >
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>{pos.question}</div>
                  <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#A1A1AA" }}>
                    <span>Position: <strong style={{ color: pos.side === "YES" ? "#00FF88" : "#FF3366" }}>{pos.shares} {pos.side}</strong></span>
                    <span>Invested: <strong>${pos.invested} USDC</strong></span>
                    <span>Current Value: <strong style={{ color: "#fff" }}>${pos.currentValue} USDC</strong></span>
                  </div>
                </div>

                {pos.canClaim ? (
                  <button
                    onClick={() => handleClaim(idx)}
                    style={{
                      padding: "12px 24px",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #00FF88, #00E5FF)",
                      color: "#000",
                      fontWeight: 800,
                      fontSize: "14px",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 0 20px rgba(0, 255, 136, 0.4)"
                    }}
                  >
                    Claim ${pos.currentValue} USDC
                  </button>
                ) : (
                  <span style={{ padding: "8px 16px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", color: "#A1A1AA", fontSize: "13px" }}>
                    In Progress
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Main Markets Terminal ── */
        <div>
          {/* Category Filter Pills */}
          <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "16px", marginBottom: "24px" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "100px",
                  background: selectedCategory === cat ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selectedCategory === cat ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.06)"}`,
                  color: selectedCategory === cat ? "#fff" : "#A1A1AA",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s"
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr 380px", gap: "24px", alignItems: "start" }}>
            
            {/* ── Left Sidebar: Market Feed ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#71717A", textTransform: "uppercase", letterSpacing: "0.05em", padding: "0 4px" }}>
                Active Prediction Pools ({filteredMarkets.length})
              </div>

              {filteredMarkets.map((m) => {
                const isSelected = selectedMarketId === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMarketId(m.id)}
                    className="glass-card"
                    style={{
                      padding: "18px",
                      cursor: "pointer",
                      background: isSelected ? "rgba(0, 229, 255, 0.06)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isSelected ? "rgba(0, 229, 255, 0.4)" : "rgba(255,255,255,0.05)"}`,
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ fontSize: "11px", color: "#A1A1AA", fontWeight: 600, textTransform: "uppercase", marginBottom: "6px" }}>
                      {m.category}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 700, lineHeight: 1.4, marginBottom: "14px", color: "#fff" }}>
                      {m.question}
                    </div>

                    {/* Probability Split Bar */}
                    <div style={{ display: "flex", height: "6px", borderRadius: "3px", overflow: "hidden", marginBottom: "10px", background: "#18181B" }}>
                      <div style={{ width: `${m.yesProb}%`, background: "#00FF88" }} />
                      <div style={{ width: `${m.noProb}%`, background: "#FF3366" }} />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700 }}>
                      <span style={{ color: "#00FF88" }}>YES {m.yesProb}% (${(m.yesProb / 100).toFixed(2)})</span>
                      <span style={{ color: "#FF3366" }}>NO {m.noProb}% (${(m.noProb / 100).toFixed(2)})</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: "11px", color: "#71717A" }}>
                      <span>Vol: ${m.volume24h.toLocaleString()}</span>
                      <span>Pool: ${m.totalPool.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Center Area: Live Chart & Outcome Breakdown ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              <div className="glass-card" style={{ padding: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#00E5FF", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {currentMarket.category}
                    </span>
                    <h2 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "6px 0 10px 0", letterSpacing: "-0.02em" }}>
                      {currentMarket.question}
                    </h2>
                    <p style={{ color: "#A1A1AA", fontSize: "13px", margin: 0, lineHeight: 1.6, maxWidth: "650px" }}>
                      {currentMarket.description}
                    </p>
                  </div>

                  {/* Countdown Box */}
                  <div style={{ textAlign: "right", background: "rgba(0,0,0,0.4)", padding: "12px 18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
                    <div style={{ fontSize: "10px", color: "#71717A", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "4px" }}>
                      Resolution Countdown
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#00E5FF", fontFamily: "monospace" }}>
                      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                    </div>
                  </div>
                </div>

                {/* Big Dynamic Odds Card */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                  <div
                    onClick={() => setSelectedSide("YES")}
                    style={{
                      padding: "20px",
                      borderRadius: "12px",
                      background: selectedSide === "YES" ? "rgba(0, 255, 136, 0.12)" : "rgba(255,255,255,0.02)",
                      border: `2px solid ${selectedSide === "YES" ? "#00FF88" : "rgba(255,255,255,0.08)"}`,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "18px", fontWeight: 800, color: "#00FF88" }}>BUY YES</span>
                      <span style={{ fontSize: "28px", fontWeight: 800, color: "#fff" }}>{currentMarket.yesProb}%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#A1A1AA" }}>
                      <span>Price: <strong>${(currentMarket.yesProb / 100).toFixed(2)}</strong> / share</span>
                      <span style={{ color: "#00FF88", fontWeight: 600 }}>+{(100 / (currentMarket.yesProb / 100) - 100).toFixed(0)}% ROI</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedSide("NO")}
                    style={{
                      padding: "20px",
                      borderRadius: "12px",
                      background: selectedSide === "NO" ? "rgba(255, 51, 102, 0.12)" : "rgba(255,255,255,0.02)",
                      border: `2px solid ${selectedSide === "NO" ? "#FF3366" : "rgba(255,255,255,0.08)"}`,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "18px", fontWeight: 800, color: "#FF3366" }}>BUY NO</span>
                      <span style={{ fontSize: "28px", fontWeight: 800, color: "#fff" }}>{currentMarket.noProb}%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#A1A1AA" }}>
                      <span>Price: <strong>${(currentMarket.noProb / 100).toFixed(2)}</strong> / share</span>
                      <span style={{ color: "#FF3366", fontWeight: 600 }}>+{(100 / (currentMarket.noProb / 100) - 100).toFixed(0)}% ROI</span>
                    </div>
                  </div>
                </div>

                {/* Trading View Live Chart Area */}
                <div style={{ height: "340px", borderRadius: "12px", overflow: "hidden", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <TradingChart symbol={currentMarket.chartSymbol} />
                </div>
              </div>

              {/* On-Chain Specs Banner */}
              <div className="glass-card" style={{ padding: "18px 24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", fontSize: "12px" }}>
                <div>
                  <div style={{ color: "#71717A", textTransform: "uppercase", fontWeight: 600 }}>Soroban Contract</div>
                  <div style={{ color: "#fff", fontWeight: 700, fontFamily: "monospace", marginTop: "2px" }}>{currentMarket.contractId}</div>
                </div>
                <div>
                  <div style={{ color: "#71717A", textTransform: "uppercase", fontWeight: 600 }}>Total Liquidity Pool</div>
                  <div style={{ color: "#fff", fontWeight: 700, marginTop: "2px" }}>${currentMarket.totalPool.toLocaleString()} USDC</div>
                </div>
                <div>
                  <div style={{ color: "#71717A", textTransform: "uppercase", fontWeight: 600 }}>24h Volume</div>
                  <div style={{ color: "#00E5FF", fontWeight: 700, marginTop: "2px" }}>${currentMarket.volume24h.toLocaleString()} USDC</div>
                </div>
                <div>
                  <div style={{ color: "#71717A", textTransform: "uppercase", fontWeight: 600 }}>Traders</div>
                  <div style={{ color: "#fff", fontWeight: 700, marginTop: "2px" }}>{currentMarket.participants} Wallets</div>
                </div>
              </div>

            </div>

            {/* ── Right Column: Interactive Order Slip ── */}
            <div className="glass-card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Order Slip</h3>
                <span style={{ fontSize: "12px", color: "#A1A1AA" }}>Settlement: <strong>USDC</strong></span>
              </div>

              {/* Side Selector Tabs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", padding: "4px", background: "rgba(0,0,0,0.4)", borderRadius: "8px", marginBottom: "20px" }}>
                <button
                  onClick={() => setSelectedSide("YES")}
                  style={{
                    padding: "10px",
                    borderRadius: "6px",
                    background: selectedSide === "YES" ? "#00FF88" : "transparent",
                    color: selectedSide === "YES" ? "#000" : "#fff",
                    fontWeight: 800,
                    fontSize: "13px",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  YES ({(currentMarket.yesProb / 100).toFixed(2)})
                </button>
                <button
                  onClick={() => setSelectedSide("NO")}
                  style={{
                    padding: "10px",
                    borderRadius: "6px",
                    background: selectedSide === "NO" ? "#FF3366" : "transparent",
                    color: selectedSide === "NO" ? "#fff" : "#fff",
                    fontWeight: 800,
                    fontSize: "13px",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  NO ({(currentMarket.noProb / 100).toFixed(2)})
                </button>
              </div>

              {/* Amount Input */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#A1A1AA", marginBottom: "8px" }}>
                  <span>Bet Amount</span>
                  <span>Balance: 1,420.50 USDC</span>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: "100%",
                      padding: "16px",
                      borderRadius: "10px",
                      background: "rgba(0,0,0,0.5)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      fontSize: "20px",
                      fontWeight: 700,
                      outline: "none"
                    }}
                  />
                  <span style={{ position: "absolute", right: "16px", top: "18px", color: "#71717A", fontWeight: 700, fontSize: "14px" }}>
                    USDC
                  </span>
                </div>
              </div>

              {/* Quick Multipliers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "24px" }}>
                {["25", "50", "100", "500"].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setBetAmount(preset)}
                    style={{
                      padding: "8px",
                      borderRadius: "6px",
                      background: betAmount === preset ? "rgba(0, 229, 255, 0.2)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${betAmount === preset ? "#00E5FF" : "rgba(255,255,255,0.08)"}`,
                      color: betAmount === preset ? "#00E5FF" : "#A1A1AA",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    +${preset}
                  </button>
                ))}
              </div>

              {/* Trade Breakdown Summary */}
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "16px", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#A1A1AA" }}>
                  <span>Avg Share Price:</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>${sharePrice.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#A1A1AA" }}>
                  <span>Outcome Shares:</span>
                  <span style={{ color: "#fff", fontWeight: 700 }}>{sharesEstimated} {selectedSide}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#A1A1AA" }}>
                  <span>Potential Return:</span>
                  <span style={{ color: selectedSide === "YES" ? "#00FF88" : "#FF3366", fontWeight: 700 }}>+{potentialReturn}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px", color: "#A1A1AA" }}>
                  <span>Total Payout (if correct):</span>
                  <span style={{ color: "#fff", fontWeight: 800, fontSize: "15px" }}>${sharesEstimated} USDC</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handlePlaceBet}
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "10px",
                  background: selectedSide === "YES"
                    ? "linear-gradient(135deg, #00FF88, #00E5FF)"
                    : "linear-gradient(135deg, #FF3366, #B534FF)",
                  color: "#000",
                  fontWeight: 800,
                  fontSize: "16px",
                  border: "none",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.6 : 1,
                  boxShadow: selectedSide === "YES"
                    ? "0 0 25px rgba(0, 255, 136, 0.3)"
                    : "0 0 25px rgba(255, 51, 102, 0.3)",
                  transition: "all 0.2s"
                }}
              >
                {isSubmitting ? "Executing On-Chain..." : `Buy ${selectedSide} (${sharesEstimated} Shares)`}
              </button>

              <div style={{ textAlign: "center", fontSize: "11px", color: "#71717A", marginTop: "14px" }}>
                🔒 Non-custodial pool execution via Soroban SDK
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
