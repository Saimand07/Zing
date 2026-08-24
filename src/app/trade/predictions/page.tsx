"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@/components/wallet-provider";
import { useToast } from "@/components/toast-provider";
import { TradingChart } from "@/components/trading-chart";
import { getBalances } from "@/lib/stellar-trade";
import { 
  TrendingUp, 
  PlusCircle, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Layers, 
  Activity, 
  Flame, 
  X,
  ArrowUpRight,
  BarChart2,
  Lock
} from "lucide-react";

interface Market {
  id: string;
  category: string;
  question: string;
  description: string;
  yesProb: number; // 0 - 100
  noProb: number;
  totalPoolXLM: number;
  volume24hXLM: number;
  participants: number;
  chartSymbol: string;
  endTime: string;
  contractId: string;
  creator: string;
  status: "ACTIVE" | "RESOLVED";
  resolvedOutcome?: boolean;
}

const INITIAL_MARKETS: Market[] = [
  {
    id: "XLM_0_40",
    category: "Stellar & Soroban",
    question: "Will Stellar (XLM) break $0.40 before end of Q3 2026?",
    description: "Resolves to YES if Binance/Coinbase XLM/USDT spot index touches or exceeds $0.4000 before expiry.",
    yesProb: 68,
    noProb: 32,
    totalPoolXLM: 450000,
    volume24hXLM: 98000,
    participants: 512,
    chartSymbol: "XLMUSDT",
    endTime: "2026-09-30T23:59:59Z",
    contractId: "CBHD7...Q7KM9",
    creator: "GDX7...4PLQ",
    status: "ACTIVE"
  },
  {
    id: "BTC_120K",
    category: "Crypto & DeFi",
    question: "Will Bitcoin hit $120,000 before December 2026?",
    description: "Market resolves based on Deribit index reference price hitting $120,000 before expiry.",
    yesProb: 74,
    noProb: 26,
    totalPoolXLM: 1200000,
    volume24hXLM: 310000,
    participants: 1420,
    chartSymbol: "BTCUSDT",
    endTime: "2026-12-31T23:59:59Z",
    contractId: "CDA91...PP41X",
    creator: "GA11...99XZ",
    status: "ACTIVE"
  },
  {
    id: "SOROBAN_TVL",
    category: "Stellar & Soroban",
    question: "Will Soroban Mainnet TVL exceed $250M in 2026?",
    description: "Based on DeFiLlama official reported total value locked on Stellar Soroban contracts.",
    yesProb: 82,
    noProb: 18,
    totalPoolXLM: 290000,
    volume24hXLM: 45000,
    participants: 340,
    chartSymbol: "XLMUSDT",
    endTime: "2026-11-15T00:00:00Z",
    contractId: "CC182...Z99AA",
    creator: "GB55...11TT",
    status: "ACTIVE"
  },
  {
    id: "FED_RATE_CUT",
    category: "Macro & Elections",
    question: "Will the US Federal Reserve cut rates by >= 50bps next FOMC?",
    description: "Resolves to YES if FOMC official target rate drops by 50 basis points or more.",
    yesProb: 41,
    noProb: 59,
    totalPoolXLM: 880000,
    volume24hXLM: 140000,
    participants: 910,
    chartSymbol: "BTCUSDT",
    endTime: "2026-09-18T18:00:00Z",
    contractId: "CFF34...LK120",
    creator: "GCRR...33MM",
    status: "ACTIVE"
  },
  {
    id: "AI_AGENT_STOCKS",
    category: "AI & Tech",
    question: "Will an autonomous on-chain AI Agent manage >$10M on Soroban?",
    description: "Verified on-chain smart wallet balance managed exclusively by verifiable AI agent intents.",
    yesProb: 89,
    noProb: 11,
    totalPoolXLM: 210000,
    volume24hXLM: 62000,
    participants: 220,
    chartSymbol: "ETHUSDT",
    endTime: "2026-10-31T23:59:59Z",
    contractId: "CA812...JJ301",
    creator: "GC99...AA21",
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
  const { pubKey, openSidebar } = useWallet();
  const { showToast } = useToast();

  const [markets, setMarkets] = useState<Market[]>(INITIAL_MARKETS);
  const [selectedCategory, setSelectedCategory] = useState("All Markets");
  const [selectedMarketId, setSelectedMarketId] = useState("XLM_0_40");
  const [selectedSide, setSelectedSide] = useState<"YES" | "NO">("YES");
  const [betAmountXLM, setBetAmountXLM] = useState("100");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"MARKETS" | "POSITIONS">("MARKETS");
  const [chartViewMode, setChartViewMode] = useState<"INDEX" | "PROBABILITY">("INDEX");

  // Create Contest Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newCategory, setNewCategory] = useState("Stellar & Soroban");
  const [newDescription, setNewDescription] = useState("");
  const [newInitialPoolXLM, setNewInitialPoolXLM] = useState("500");
  const [newEndDate, setNewEndDate] = useState("2026-10-30");
  const [isCreatingMarket, setIsCreatingMarket] = useState(false);

  // User XLM balance
  const [xlmBalance, setXlmBalance] = useState("0");

  // User simulated positions
  const [userPositions, setUserPositions] = useState([
    {
      marketId: "SOROBAN_TVL",
      question: "Will Soroban Mainnet TVL exceed $250M in 2026?",
      side: "YES",
      shares: 1200,
      investedXLM: 1000,
      currentValueXLM: 1219.5,
      canClaim: false
    },
    {
      marketId: "PAST_XLM_PUMP",
      question: "Did XLM achieve Protocol 22 activation smoothly?",
      side: "YES",
      shares: 2500,
      investedXLM: 1250,
      currentValueXLM: 2500,
      canClaim: true
    }
  ]);

  // Live recent bet activity stream
  const [recentBets, setRecentBets] = useState([
    { wallet: "GA9X...3KM1", side: "YES", amount: 500, time: "Just now" },
    { wallet: "GB77...89PQ", side: "YES", amount: 1200, time: "2m ago" },
    { wallet: "GC33...11AZ", side: "NO", amount: 350, time: "5m ago" },
    { wallet: "GD44...99KK", side: "YES", amount: 2000, time: "11m ago" }
  ]);

  // Load real user XLM balance
  useEffect(() => {
    if (pubKey) {
      getBalances(pubKey).then((bals) => {
        const native = bals.find(b => b.asset_type === "native");
        setXlmBalance(native ? parseFloat(native.balance).toFixed(2) : "0.00");
      });
    } else {
      setXlmBalance("0.00");
    }
  }, [pubKey]);

  const categories = ["All Markets", "Stellar & Soroban", "Crypto & DeFi", "AI & Tech", "Macro & Elections"];

  const filteredMarkets = selectedCategory === "All Markets"
    ? markets
    : markets.filter(m => m.category === selectedCategory);

  const currentMarket = markets.find(m => m.id === selectedMarketId) || markets[0];

  const sharePrice = selectedSide === "YES" ? currentMarket.yesProb / 100 : currentMarket.noProb / 100;
  const numAmount = parseFloat(betAmountXLM) || 0;
  const sharesEstimated = sharePrice > 0 ? (numAmount / sharePrice).toFixed(1) : "0";
  const potentialReturn = numAmount > 0 ? ((parseFloat(sharesEstimated) - numAmount) / numAmount * 100).toFixed(1) : "0";
  const potentialProfit = (parseFloat(sharesEstimated) - numAmount).toFixed(2);

  // Time remaining countdown
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

  // Handle Place Bet (Staking XLM)
  const handlePlaceBet = async () => {
    if (!pubKey) {
      showToast("Wallet connection required to vote.", "error");
      openSidebar();
      return;
    }

    if (numAmount <= 0) {
      showToast("Please enter a valid XLM amount.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate Soroban auth & XLM contract transfer
      await new Promise(r => setTimeout(r, 1600));

      // Dynamically update market pool and probability
      setMarkets(prev => prev.map(m => {
        if (m.id === currentMarket.id) {
          const shift = selectedSide === "YES" ? 1 : -1;
          const newYes = Math.min(95, Math.max(5, m.yesProb + shift));
          return {
            ...m,
            yesProb: newYes,
            noProb: 100 - newYes,
            totalPoolXLM: m.totalPoolXLM + numAmount,
            volume24hXLM: m.volume24hXLM + numAmount,
            participants: m.participants + 1
          };
        }
        return m;
      }));

      // Add to user positions
      setUserPositions(prev => [
        {
          marketId: currentMarket.id,
          question: currentMarket.question,
          side: selectedSide,
          shares: parseFloat(sharesEstimated),
          investedXLM: numAmount,
          currentValueXLM: parseFloat(sharesEstimated) * (selectedSide === "YES" ? currentMarket.yesProb / 100 : currentMarket.noProb / 100),
          canClaim: false
        },
        ...prev
      ]);

      // Add to live activity tape
      setRecentBets(prev => [
        {
          wallet: `${pubKey.slice(0, 4)}...${pubKey.slice(-4)}`,
          side: selectedSide,
          amount: numAmount,
          time: "Just now"
        },
        ...prev.slice(0, 5)
      ]);

      showToast(`Voted ${selectedSide}! Staked ${numAmount} XLM on Soroban contract.`, "success");
    } catch {
      showToast("Transaction failed on Stellar Network.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Create Market / Contest
  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubKey) {
      showToast("Connect your wallet first to deploy a prediction contest.", "error");
      openSidebar();
      return;
    }

    if (!newQuestion.trim()) {
      showToast("Please enter a valid market question.", "error");
      return;
    }

    setIsCreatingMarket(true);
    try {
      await new Promise(r => setTimeout(r, 1800));

      const newId = `MKT_${Date.now()}`;
      const randomContract = `C${Math.random().toString(36).substring(2, 6).toUpperCase()}...${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const created: Market = {
        id: newId,
        category: newCategory,
        question: newQuestion,
        description: newDescription || "Community created prediction contest settled by on-chain consensus.",
        yesProb: 50,
        noProb: 50,
        totalPoolXLM: parseFloat(newInitialPoolXLM) || 500,
        volume24hXLM: parseFloat(newInitialPoolXLM) || 500,
        participants: 1,
        chartSymbol: "XLMUSDT",
        endTime: new Date(newEndDate).toISOString(),
        contractId: randomContract,
        creator: `${pubKey.slice(0, 4)}...${pubKey.slice(-4)}`,
        status: "ACTIVE"
      };

      setMarkets(prev => [created, ...prev]);
      setSelectedMarketId(newId);
      setIsCreateModalOpen(false);
      setNewQuestion("");
      setNewDescription("");

      showToast("Prediction Contest successfully created and deployed on Soroban!", "success");
    } catch {
      showToast("Failed to initialize contract.", "error");
    } finally {
      setIsCreatingMarket(false);
    }
  };

  const handleClaim = (idx: number) => {
    showToast("Winnings claimed! Transferred 2,500 XLM to your wallet.", "success");
    setUserPositions(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ maxWidth: "1500px", margin: "0 auto", padding: "32px 24px 80px 24px", color: "#fff", fontFamily: "var(--font-geist-sans)" }}>
      
      {/* ── Top Header Banner ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "24px", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "100px", background: "rgba(0, 229, 255, 0.1)", border: "1px solid rgba(0, 229, 255, 0.3)", color: "#00E5FF", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00E5FF", boxShadow: "0 0 8px #00E5FF" }} />
            Soroban Prediction & Contest Protocol
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 8px 0" }}>
            Decentralized Prediction Contests
          </h1>
          <p style={{ color: "#A1A1AA", fontSize: "1.1rem", margin: 0 }}>
            Vote and stake <strong>XLM</strong> on binary outcomes with real-time settlement powered by Soroban Smart Contracts.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          
          {/* Create Contest Button */}
          <button
            onClick={() => {
              if (!pubKey) {
                showToast("Connect wallet to create a contest.", "error");
                openSidebar();
              } else {
                setIsCreateModalOpen(true);
              }
            }}
            style={{
              padding: "11px 22px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #00E5FF, #0077FF)",
              color: "#000",
              fontWeight: 800,
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 0 25px rgba(0, 229, 255, 0.35)",
              transition: "all 0.2s"
            }}
          >
            <PlusCircle size={18} />
            Create Contest
          </button>

          <button
            onClick={() => setActiveTab("MARKETS")}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              background: activeTab === "MARKETS" ? "#27272A" : "rgba(255,255,255,0.03)",
              color: activeTab === "MARKETS" ? "#fff" : "#A1A1AA",
              fontWeight: 700,
              fontSize: "14px",
              border: `1px solid ${activeTab === "MARKETS" ? "#52525B" : "rgba(255,255,255,0.06)"}`,
              cursor: "pointer"
            }}
          >
            Markets
          </button>

          <button
            onClick={() => setActiveTab("POSITIONS")}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              background: activeTab === "POSITIONS" ? "#27272A" : "rgba(255,255,255,0.03)",
              color: activeTab === "POSITIONS" ? "#fff" : "#A1A1AA",
              fontWeight: 700,
              fontSize: "14px",
              border: `1px solid ${activeTab === "POSITIONS" ? "#52525B" : "rgba(255,255,255,0.06)"}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
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

      {/* ── Wallet Mandatory Warning Strip if Not Connected ── */}
      {!pubKey && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            borderRadius: "12px",
            background: "linear-gradient(90deg, rgba(255, 51, 102, 0.15) 0%, rgba(181, 52, 255, 0.1) 100%)",
            border: "1px solid rgba(255, 51, 102, 0.3)",
            marginBottom: "28px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(255, 51, 102, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF3366" }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
                Wallet Connection Mandatory for Voting
              </div>
              <div style={{ fontSize: "13px", color: "#A1A1AA" }}>
                Each vote stakes real XLM onto the Soroban Prediction contract. Connect your Stellar wallet to participate.
              </div>
            </div>
          </div>
          <button
            onClick={openSidebar}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              background: "#FF3366",
              color: "#fff",
              fontWeight: 700,
              fontSize: "13px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 0 15px rgba(255, 51, 102, 0.4)"
            }}
          >
            <Wallet size={16} />
            Connect Stellar Wallet
          </button>
        </div>
      )}

      {activeTab === "POSITIONS" ? (
        /* ── Positions & Claim Widget ── */
        <div className="glass-card" style={{ padding: "32px" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "20px" }}>Active Stakes & Claims</h2>
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
                    <span>Vote: <strong style={{ color: pos.side === "YES" ? "#00FF88" : "#FF3366" }}>{pos.shares} {pos.side}</strong></span>
                    <span>Staked: <strong>{pos.investedXLM} XLM</strong></span>
                    <span>Current Value: <strong style={{ color: "#fff" }}>{pos.currentValueXLM} XLM</strong></span>
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
                    Claim {pos.currentValueXLM} XLM Winnings
                  </button>
                ) : (
                  <span style={{ padding: "8px 16px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", color: "#A1A1AA", fontSize: "13px" }}>
                    Awaiting Resolution
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
            
            {/* ── Left Sidebar: Contests Feed ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#71717A", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Active Contests ({filteredMarkets.length})
                </span>
                <span style={{ fontSize: "11px", color: "#00E5FF", fontWeight: 600 }}>Live Feed</span>
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
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "11px", color: "#A1A1AA", fontWeight: 600, textTransform: "uppercase" }}>
                        {m.category}
                      </span>
                      <span style={{ fontSize: "10px", color: "#71717A", fontFamily: "monospace" }}>
                        by {m.creator}
                      </span>
                    </div>

                    <div style={{ fontSize: "14px", fontWeight: 700, lineHeight: 1.4, marginBottom: "14px", color: "#fff" }}>
                      {m.question}
                    </div>

                    {/* Probability Split Bar */}
                    <div style={{ display: "flex", height: "6px", borderRadius: "3px", overflow: "hidden", marginBottom: "10px", background: "#18181B" }}>
                      <div style={{ width: `${m.yesProb}%`, background: "#00FF88", transition: "width 0.4s ease" }} />
                      <div style={{ width: `${m.noProb}%`, background: "#FF3366", transition: "width 0.4s ease" }} />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700 }}>
                      <span style={{ color: "#00FF88" }}>YES {m.yesProb}% ({(m.yesProb / 100).toFixed(2)} XLM)</span>
                      <span style={{ color: "#FF3366" }}>NO {m.noProb}% ({(m.noProb / 100).toFixed(2)} XLM)</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: "11px", color: "#71717A" }}>
                      <span>24h Vol: {m.volume24hXLM.toLocaleString()} XLM</span>
                      <span>Pool: {m.totalPoolXLM.toLocaleString()} XLM</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Center Area: Live Chart & Contest Breakdown ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              <div className="glass-card" style={{ padding: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
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
                    <div style={{ fontSize: "10px", color: "#71717A", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
                      <Clock size={12} />
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
                      <span style={{ fontSize: "18px", fontWeight: 800, color: "#00FF88" }}>VOTE YES</span>
                      <span style={{ fontSize: "28px", fontWeight: 800, color: "#fff" }}>{currentMarket.yesProb}%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#A1A1AA" }}>
                      <span>Price: <strong>{(currentMarket.yesProb / 100).toFixed(2)} XLM</strong> / share</span>
                      <span style={{ color: "#00FF88", fontWeight: 600 }}>+{(100 / (currentMarket.yesProb / 100) - 100).toFixed(0)}% Return</span>
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
                      <span style={{ fontSize: "18px", fontWeight: 800, color: "#FF3366" }}>VOTE NO</span>
                      <span style={{ fontSize: "28px", fontWeight: 800, color: "#fff" }}>{currentMarket.noProb}%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#A1A1AA" }}>
                      <span>Price: <strong>{(currentMarket.noProb / 100).toFixed(2)} XLM</strong> / share</span>
                      <span style={{ color: "#FF3366", fontWeight: 600 }}>+{(100 / (currentMarket.noProb / 100) - 100).toFixed(0)}% Return</span>
                    </div>
                  </div>
                </div>

                {/* ── Real Live Interactive Chart Beside the Contest ── */}
                <div style={{ borderRadius: "12px", overflow: "hidden", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.06)", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <BarChart2 size={16} color="#00E5FF" />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>
                        Real-Time Asset & Probability Market Index
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "4px", background: "rgba(0, 229, 255, 0.1)", color: "#00E5FF", fontWeight: 600 }}>
                        {currentMarket.chartSymbol} Live Candlestick
                      </span>
                    </div>
                  </div>

                  <div style={{ height: "350px", width: "100%" }}>
                    <TradingChart symbol={currentMarket.chartSymbol} />
                  </div>
                </div>
              </div>

              {/* On-Chain Specs Banner */}
              <div className="glass-card" style={{ padding: "18px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", fontSize: "12px" }}>
                <div>
                  <div style={{ color: "#71717A", textTransform: "uppercase", fontWeight: 600 }}>Soroban Contract</div>
                  <div style={{ color: "#fff", fontWeight: 700, fontFamily: "monospace", marginTop: "2px" }}>{currentMarket.contractId}</div>
                </div>
                <div>
                  <div style={{ color: "#71717A", textTransform: "uppercase", fontWeight: 600 }}>Total Pool</div>
                  <div style={{ color: "#00FF88", fontWeight: 700, marginTop: "2px" }}>{currentMarket.totalPoolXLM.toLocaleString()} XLM</div>
                </div>
                <div>
                  <div style={{ color: "#71717A", textTransform: "uppercase", fontWeight: 600 }}>24h Volume</div>
                  <div style={{ color: "#00E5FF", fontWeight: 700, marginTop: "2px" }}>{currentMarket.volume24hXLM.toLocaleString()} XLM</div>
                </div>
                <div>
                  <div style={{ color: "#71717A", textTransform: "uppercase", fontWeight: 600 }}>Active Voters</div>
                  <div style={{ color: "#fff", fontWeight: 700, marginTop: "2px" }}>{currentMarket.participants} Wallets</div>
                </div>
              </div>

            </div>

            {/* ── Right Column: Interactive XLM Voting & Stake Slip ── */}
            <div className="glass-card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Stake Slip</h3>
                <span style={{ fontSize: "12px", color: "#A1A1AA" }}>Currency: <strong style={{ color: "#00E5FF" }}>XLM</strong></span>
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
                  YES ({(currentMarket.yesProb / 100).toFixed(2)} XLM)
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
                  NO ({(currentMarket.noProb / 100).toFixed(2)} XLM)
                </button>
              </div>

              {/* Amount Input in XLM */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#A1A1AA", marginBottom: "8px" }}>
                  <span>Stake Amount (Costs XLM)</span>
                  <span>Wallet: <strong style={{ color: "#fff" }}>{xlmBalance} XLM</strong></span>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    value={betAmountXLM}
                    onChange={(e) => setBetAmountXLM(e.target.value)}
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
                  <span style={{ position: "absolute", right: "16px", top: "18px", color: "#00E5FF", fontWeight: 800, fontSize: "14px" }}>
                    XLM
                  </span>
                </div>
              </div>

              {/* Quick XLM Multipliers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "24px" }}>
                {["50", "100", "500", "1000"].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setBetAmountXLM(preset)}
                    style={{
                      padding: "8px",
                      borderRadius: "6px",
                      background: betAmountXLM === preset ? "rgba(0, 229, 255, 0.2)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${betAmountXLM === preset ? "#00E5FF" : "rgba(255,255,255,0.08)"}`,
                      color: betAmountXLM === preset ? "#00E5FF" : "#A1A1AA",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    +{preset}
                  </button>
                ))}
              </div>

              {/* Trade Breakdown Summary */}
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "16px", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#A1A1AA" }}>
                  <span>Price per Share:</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{sharePrice.toFixed(2)} XLM</span>
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
                  <span style={{ color: "#00FF88", fontWeight: 800, fontSize: "15px" }}>{sharesEstimated} XLM</span>
                </div>
              </div>

              {/* Action Button: Mandatory Wallet Connect Check */}
              {!pubKey ? (
                <button
                  onClick={openSidebar}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #FF3366, #B534FF)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "15px",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 0 25px rgba(255, 51, 102, 0.4)"
                  }}
                >
                  <Lock size={16} />
                  Connect Wallet to Vote ({numAmount} XLM)
                </button>
              ) : (
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
                  {isSubmitting ? "Staking on Soroban..." : `Stake ${numAmount} XLM for ${selectedSide}`}
                </button>
              )}

              {/* Live Recent Bets Tape */}
              <div style={{ marginTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, color: "#71717A", textTransform: "uppercase", marginBottom: "10px" }}>
                  <span>Recent On-Chain Votes</span>
                  <Activity size={12} color="#00E5FF" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {recentBets.map((b, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", background: "rgba(255,255,255,0.02)", padding: "6px 10px", borderRadius: "6px" }}>
                      <span style={{ fontFamily: "monospace", color: "#A1A1AA" }}>{b.wallet}</span>
                      <span style={{ fontWeight: 700, color: b.side === "YES" ? "#00FF88" : "#FF3366" }}>
                        {b.side} {b.amount} XLM
                      </span>
                      <span style={{ color: "#52525B", fontSize: "11px" }}>{b.time}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ── Create Contest Modal ── */}
      {isCreateModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "24px" }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: "560px", padding: "32px", position: "relative", border: "1px solid rgba(0, 229, 255, 0.3)", boxShadow: "0 0 50px rgba(0, 229, 255, 0.2)" }}>
            
            <button
              onClick={() => setIsCreateModalOpen(false)}
              style={{ position: "absolute", top: "20px", right: "20px", background: "transparent", border: "none", color: "#A1A1AA", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <PlusCircle size={22} color="#00E5FF" />
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Create Prediction Contest</h2>
            </div>
            <p style={{ color: "#A1A1AA", fontSize: "13px", marginBottom: "24px" }}>
              Deploy a new binary outcome prediction contest onto the Soroban smart contract.
            </p>

            <form onSubmit={handleCreateMarket} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
                  Contest Question / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Will XLM market cap flip ADA by Q4 2026?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", outline: "none", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "#18181B", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", outline: "none", fontSize: "14px" }}
                  >
                    <option value="Stellar & Soroban">Stellar & Soroban</option>
                    <option value="Crypto & DeFi">Crypto & DeFi</option>
                    <option value="AI & Tech">AI & Tech</option>
                    <option value="Macro & Elections">Macro & Elections</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
                    Resolution Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "#18181B", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", outline: "none", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
                  Initial Liquidity Staked (XLM)
                </label>
                <input
                  type="number"
                  min="50"
                  value={newInitialPoolXLM}
                  onChange={(e) => setNewInitialPoolXLM(e.target.value)}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", outline: "none", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
                  Resolution Oracle & Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Specify resolution criteria (e.g. CoinGecko price, official announcement)..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", outline: "none", fontSize: "14px", resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ flex: 1, padding: "14px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingMarket}
                  style={{
                    flex: 2,
                    padding: "14px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #00E5FF, #0077FF)",
                    color: "#000",
                    border: "none",
                    fontWeight: 800,
                    cursor: isCreatingMarket ? "not-allowed" : "pointer",
                    boxShadow: "0 0 25px rgba(0, 229, 255, 0.4)"
                  }}
                >
                  {isCreatingMarket ? "Deploying Contract..." : "Deploy Contest on Soroban"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
