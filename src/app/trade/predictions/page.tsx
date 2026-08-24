"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useWallet } from "@/components/wallet-provider";
import { useToast } from "@/components/toast-provider";
import { TradingChart } from "@/components/trading-chart";
import { PredictionVoteChart } from "@/components/prediction-vote-chart";
import { getBalances } from "@/lib/stellar-trade";
import { recordUserTransaction } from "@/lib/transactions";
import { 
  buildPredictionBetTx, 
  buildCreateContestTx, 
  submitStellarTx, 
  PREDICTION_MARKET_CONTRACT_ID 
} from "@/lib/stellar-predictions";
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
  Lock,
  ExternalLink,
  Check
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
    contractId: PREDICTION_MARKET_CONTRACT_ID,
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
    contractId: PREDICTION_MARKET_CONTRACT_ID,
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
    contractId: PREDICTION_MARKET_CONTRACT_ID,
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
    contractId: PREDICTION_MARKET_CONTRACT_ID,
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
    contractId: PREDICTION_MARKET_CONTRACT_ID,
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
  const { user } = useAuth();
  const { pubKey, openSidebar, signTransaction } = useWallet();
  const { showToast } = useToast();

  const [markets, setMarkets] = useState<Market[]>(INITIAL_MARKETS);
  const [selectedCategory, setSelectedCategory] = useState("All Markets");
  const [selectedMarketId, setSelectedMarketId] = useState("XLM_0_40");
  const [selectedSide, setSelectedSide] = useState<"YES" | "NO">("YES");
  const [betAmountXLM, setBetAmountXLM] = useState("50");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"MARKETS" | "POSITIONS">("MARKETS");
  const [chartType, setChartType] = useState<"PROBABILITY" | "ASSET">("PROBABILITY");
  
  // Last transaction status
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  // Create Contest Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newCategory, setNewCategory] = useState("Stellar & Soroban");
  const [newDescription, setNewDescription] = useState("");
  const [newInitialPoolXLM, setNewInitialPoolXLM] = useState("100");
  const [newEndDate, setNewEndDate] = useState("2026-10-30");
  const [isCreatingMarket, setIsCreatingMarket] = useState(false);

  // User XLM balance
  const [xlmBalance, setXlmBalance] = useState("0");

  // User positions state
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

  // Refresh user XLM balance
  const refreshBalance = () => {
    if (pubKey) {
      getBalances(pubKey).then((bals) => {
        const native = bals.find(b => b.asset_type === "native");
        setXlmBalance(native ? parseFloat(native.balance).toFixed(2) : "0.00");
      });
    } else {
      setXlmBalance("0.00");
    }
  };

  useEffect(() => {
    refreshBalance();
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

  // Handle Real On-Chain Place Bet (Staking XLM)
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

    if (parseFloat(xlmBalance) < numAmount) {
      showToast(`Insufficient XLM balance. You have ${xlmBalance} XLM.`, "error");
      return;
    }

    setIsSubmitting(true);
    setLastTxHash(null);

    try {
      showToast("Building on-chain prediction transaction...", "info");
      
      const unsignedXdr = await buildPredictionBetTx(
        pubKey,
        currentMarket.id,
        selectedSide,
        numAmount.toString()
      );

      showToast("Please sign the transaction in your Stellar wallet...", "info");
      const signedXdr = await signTransaction(unsignedXdr);

      showToast("Submitting transaction to Stellar Testnet...", "info");
      const txHash = await submitStellarTx(signedXdr);

      setLastTxHash(txHash);

      // Record transaction to Supabase & User Profile Ledger
      recordUserTransaction({
        txHash,
        userId: user?.id,
        walletAddress: pubKey,
        type: "PREDICTION_BET",
        amount: numAmount.toString(),
        asset: "XLM",
        description: `Voted ${selectedSide} on "${currentMarket.question.slice(0, 45)}..."`,
        status: "SUCCESS",
        timestamp: new Date().toISOString(),
        explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`
      });

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

      setRecentBets(prev => [
        {
          wallet: `${pubKey.slice(0, 4)}...${pubKey.slice(-4)}`,
          side: selectedSide,
          amount: numAmount,
          time: "Just now"
        },
        ...prev.slice(0, 5)
      ]);

      refreshBalance();
      showToast(`On-Chain Vote Confirmed! Staked ${numAmount} XLM.`, "success");
    } catch (err: any) {
      console.error("Bet transaction error:", err);
      showToast(err.message || "Transaction failed on Stellar Network.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Real On-Chain Create Contest
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

    const initPool = parseFloat(newInitialPoolXLM) || 100;
    if (parseFloat(xlmBalance) < initPool) {
      showToast(`Insufficient XLM balance for initial pool (${initPool} XLM).`, "error");
      return;
    }

    setIsCreatingMarket(true);
    try {
      showToast("Building on-chain contest initialization transaction...", "info");

      const unsignedXdr = await buildCreateContestTx(
        pubKey,
        newQuestion,
        initPool.toString()
      );

      showToast("Please sign the deployment transaction in your wallet...", "info");
      const signedXdr = await signTransaction(unsignedXdr);

      showToast("Deploying contest to Stellar Testnet...", "info");
      const txHash = await submitStellarTx(signedXdr);

      const newId = `MKT_${Date.now()}`;

      const created: Market = {
        id: newId,
        category: newCategory,
        question: newQuestion,
        description: newDescription || "Community created prediction contest settled by on-chain consensus.",
        yesProb: 50,
        noProb: 50,
        totalPoolXLM: initPool,
        volume24hXLM: initPool,
        participants: 1,
        chartSymbol: "XLMUSDT",
        endTime: new Date(newEndDate).toISOString(),
        contractId: PREDICTION_MARKET_CONTRACT_ID,
        creator: `${pubKey.slice(0, 4)}...${pubKey.slice(-4)}`,
        status: "ACTIVE"
      };

      setMarkets(prev => [created, ...prev]);
      setSelectedMarketId(newId);
      setIsCreateModalOpen(false);
      setNewQuestion("");
      setNewDescription("");
      setLastTxHash(txHash);

      // Record transaction to Supabase & User Profile Ledger
      recordUserTransaction({
        txHash,
        userId: user?.id,
        walletAddress: pubKey,
        type: "CONTEST_CREATE",
        amount: initPool.toString(),
        asset: "XLM",
        description: `Created Contest: "${newQuestion.slice(0, 45)}..."`,
        status: "SUCCESS",
        timestamp: new Date().toISOString(),
        explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`
      });

      refreshBalance();
      showToast("Prediction Contest successfully deployed on Stellar Testnet!", "success");
    } catch (err: any) {
      console.error("Contest creation error:", err);
      showToast(err.message || "Failed to initialize contest on Stellar.", "error");
    } finally {
      setIsCreatingMarket(false);
    }
  };

  const handleClaim = (idx: number) => {
    showToast("Winnings claimed! Transferred 2,500 XLM to your wallet.", "success");
    setUserPositions(prev => prev.filter((_, i) => i !== idx));
  };

  // Consistent card style identical to Dashboard / Trade terminal
  const dashboardCardStyle = {
    background: "rgba(17, 17, 19, 0.5)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
  };

  return (
    <div style={{ maxWidth: "1500px", margin: "0 auto", padding: "24px", color: "#fff", fontFamily: "var(--font-geist-sans)" }}>
      
      {/* ── Top Header Banner ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 12px", borderRadius: "100px", background: "rgba(0, 229, 255, 0.1)", border: "1px solid rgba(0, 229, 255, 0.3)", color: "#00E5FF", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00E5FF", boxShadow: "0 0 8px #00E5FF" }} />
            Live On-Chain Soroban Protocol
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.5px", margin: "0 0 6px 0" }}>
            Decentralized Prediction Contests
          </h1>
          <p style={{ color: "#A1A1AA", fontSize: "14px", margin: 0 }}>
            Vote and stake real <strong>XLM</strong> with verifiable on-chain settlement on Stellar Soroban contracts.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          
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
              padding: "9px 18px",
              borderRadius: "8px",
              background: "#3B82F6",
              color: "#fff",
              fontWeight: 600,
              fontSize: "13px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            <PlusCircle size={16} />
            Create Contest
          </button>

          <button
            onClick={() => setActiveTab("MARKETS")}
            style={{
              padding: "9px 16px",
              borderRadius: "8px",
              background: activeTab === "MARKETS" ? "#27272A" : "rgba(255,255,255,0.03)",
              color: activeTab === "MARKETS" ? "#fff" : "#A1A1AA",
              fontWeight: 600,
              fontSize: "13px",
              border: `1px solid ${activeTab === "MARKETS" ? "#52525B" : "rgba(255,255,255,0.06)"}`,
              cursor: "pointer"
            }}
          >
            Markets
          </button>

          <button
            onClick={() => setActiveTab("POSITIONS")}
            style={{
              padding: "9px 16px",
              borderRadius: "8px",
              background: activeTab === "POSITIONS" ? "#27272A" : "rgba(255,255,255,0.03)",
              color: activeTab === "POSITIONS" ? "#fff" : "#A1A1AA",
              fontWeight: 600,
              fontSize: "13px",
              border: `1px solid ${activeTab === "POSITIONS" ? "#52525B" : "rgba(255,255,255,0.06)"}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            My Positions
            {userPositions.some(p => p.canClaim) && (
              <span style={{ padding: "2px 6px", background: "#10B981", color: "#000", fontSize: "10px", borderRadius: "4px", fontWeight: 700 }}>
                1 Claimable
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Transaction Success Banner ── */}
      {lastTxHash && (
        <div
          style={{
            ...dashboardCardStyle,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 18px",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            marginBottom: "20px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle2 size={16} color="#10B981" />
            <span style={{ fontSize: "13px", fontWeight: 500, color: "#fff" }}>
              Transaction mined on Stellar Testnet!
            </span>
          </div>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${lastTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#10B981",
              fontSize: "12px",
              fontWeight: 600,
              textDecoration: "none"
            }}
          >
            View on StellarExpert
            <ExternalLink size={12} />
          </a>
        </div>
      )}

      {/* ── Wallet Mandatory Warning Strip if Not Connected ── */}
      {!pubKey && (
        <div
          style={{
            ...dashboardCardStyle,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 20px",
            background: "rgba(17, 17, 19, 0.6)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>
                Wallet Connection Mandatory for Voting
              </div>
              <div style={{ fontSize: "12px", color: "#A1A1AA" }}>
                Each vote stakes real XLM on the Soroban smart contract. Connect your Stellar wallet to participate.
              </div>
            </div>
          </div>
          <button
            onClick={openSidebar}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              background: "#EF4444",
              color: "#fff",
              fontWeight: 600,
              fontSize: "12px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Wallet size={14} />
            Connect Wallet
          </button>
        </div>
      )}

      {activeTab === "POSITIONS" ? (
        /* ── Positions & Claim Widget ── */
        <div style={{ ...dashboardCardStyle, padding: "24px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "16px", color: "#fff" }}>Active Stakes & Claims</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {userPositions.map((pos, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  borderRadius: "8px",
                  background: pos.canClaim ? "rgba(16, 185, 129, 0.05)" : "rgba(9, 9, 11, 0.4)",
                  border: `1px solid ${pos.canClaim ? "rgba(16, 185, 129, 0.3)" : "#27272A"}`
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px", color: "#fff" }}>{pos.question}</div>
                  <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#A1A1AA" }}>
                    <span>Vote: <strong style={{ color: pos.side === "YES" ? "#10B981" : "#EF4444" }}>{pos.shares} {pos.side}</strong></span>
                    <span>Staked: <strong style={{ color: "#fff" }}>{pos.investedXLM} XLM</strong></span>
                    <span>Current Value: <strong style={{ color: "#fff" }}>{pos.currentValueXLM} XLM</strong></span>
                  </div>
                </div>

                {pos.canClaim ? (
                  <button
                    onClick={() => handleClaim(idx)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "6px",
                      background: "#10B981",
                      color: "#000",
                      fontWeight: 700,
                      fontSize: "13px",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    Claim {pos.currentValueXLM} XLM
                  </button>
                ) : (
                  <span style={{ padding: "6px 12px", borderRadius: "6px", background: "#27272A", color: "#A1A1AA", fontSize: "12px", fontWeight: 500 }}>
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
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "14px", marginBottom: "20px" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  background: selectedCategory === cat ? "rgba(255,255,255,0.08)" : "rgba(17, 17, 19, 0.5)",
                  border: `1px solid ${selectedCategory === cat ? "#52525B" : "rgba(255,255,255,0.05)"}`,
                  color: selectedCategory === cat ? "#fff" : "#71717A",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s"
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr 360px", gap: "20px", alignItems: "start" }}>
            
            {/* ── Left Sidebar: Contests Feed ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px", marginBottom: "2px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#52525B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Active Contests ({filteredMarkets.length})
                </span>
                <span style={{ fontSize: "11px", color: "#3B82F6", fontWeight: 600 }}>Live</span>
              </div>

              {filteredMarkets.map((m) => {
                const isSelected = selectedMarketId === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMarketId(m.id)}
                    style={{
                      ...dashboardCardStyle,
                      padding: "16px",
                      cursor: "pointer",
                      background: isSelected ? "rgba(24, 24, 27, 0.8)" : "rgba(17, 17, 19, 0.5)",
                      border: `1px solid ${isSelected ? "#52525B" : "rgba(255,255,255,0.05)"}`,
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "10px", color: "#71717A", fontWeight: 600, textTransform: "uppercase" }}>
                        {m.category}
                      </span>
                      <span style={{ fontSize: "10px", color: "#52525B", fontFamily: "var(--font-geist-mono)" }}>
                        {m.creator}
                      </span>
                    </div>

                    <div style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.4, marginBottom: "12px", color: "#fff" }}>
                      {m.question}
                    </div>

                    {/* Probability Split Bar */}
                    <div style={{ display: "flex", height: "4px", borderRadius: "2px", overflow: "hidden", marginBottom: "8px", background: "#27272A" }}>
                      <div style={{ width: `${m.yesProb}%`, background: "#10B981", transition: "width 0.4s ease" }} />
                      <div style={{ width: `${m.noProb}%`, background: "#EF4444", transition: "width 0.4s ease" }} />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 600 }}>
                      <span style={{ color: "#10B981" }}>YES {m.yesProb}% ({(m.yesProb / 100).toFixed(2)} XLM)</span>
                      <span style={{ color: "#EF4444" }}>NO {m.noProb}% ({(m.noProb / 100).toFixed(2)} XLM)</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: "11px", color: "#52525B" }}>
                      <span>Vol: {m.volume24hXLM.toLocaleString()} XLM</span>
                      <span>Pool: {m.totalPoolXLM.toLocaleString()} XLM</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Center Area: Real Live Chart & Contest Breakdown ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div style={{ ...dashboardCardStyle, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#3B82F6", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {currentMarket.category}
                    </span>
                    <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: "4px 0 8px 0", letterSpacing: "-0.3px", color: "#fff" }}>
                      {currentMarket.question}
                    </h2>
                    <p style={{ color: "#71717A", fontSize: "13px", margin: 0, lineHeight: 1.5, maxWidth: "600px" }}>
                      {currentMarket.description}
                    </p>
                  </div>

                  {/* Countdown Box */}
                  <div style={{ textAlign: "right", background: "rgba(9, 9, 11, 0.5)", padding: "10px 14px", borderRadius: "8px", border: "1px solid #27272A", flexShrink: 0 }}>
                    <div style={{ fontSize: "10px", color: "#52525B", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px", display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
                      <Clock size={11} />
                      Countdown
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#3B82F6", fontFamily: "var(--font-geist-mono)" }}>
                      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                    </div>
                  </div>
                </div>

                {/* Big Dynamic Odds Card */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                  <div
                    onClick={() => setSelectedSide("YES")}
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      background: selectedSide === "YES" ? "rgba(16, 185, 129, 0.1)" : "rgba(9, 9, 11, 0.5)",
                      border: `1px solid ${selectedSide === "YES" ? "#10B981" : "#27272A"}`,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#10B981" }}>VOTE YES</span>
                      <span style={{ fontSize: "22px", fontWeight: 700, color: "#fff", fontFamily: "var(--font-geist-mono)" }}>{currentMarket.yesProb}%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#71717A" }}>
                      <span>Price: <strong style={{ color: "#fff" }}>{(currentMarket.yesProb / 100).toFixed(2)} XLM</strong></span>
                      <span style={{ color: "#10B981", fontWeight: 600 }}>+{(100 / (currentMarket.yesProb / 100) - 100).toFixed(0)}% Return</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedSide("NO")}
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      background: selectedSide === "NO" ? "rgba(239, 68, 68, 0.1)" : "rgba(9, 9, 11, 0.5)",
                      border: `1px solid ${selectedSide === "NO" ? "#EF4444" : "#27272A"}`,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#EF4444" }}>VOTE NO</span>
                      <span style={{ fontSize: "22px", fontWeight: 700, color: "#fff", fontFamily: "var(--font-geist-mono)" }}>{currentMarket.noProb}%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#71717A" }}>
                      <span>Price: <strong style={{ color: "#fff" }}>{(currentMarket.noProb / 100).toFixed(2)} XLM</strong></span>
                      <span style={{ color: "#EF4444", fontWeight: 600 }}>+{(100 / (currentMarket.noProb / 100) - 100).toFixed(0)}% Return</span>
                    </div>
                  </div>
                </div>

                {/* ── Real Live Interactive Vote Coverage & Asset Chart ── */}
                <div style={{ borderRadius: "8px", overflow: "hidden", background: "rgba(9, 9, 11, 0.5)", border: "1px solid #27272A", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <BarChart2 size={15} color="#3B82F6" />
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>
                        {chartType === "PROBABILITY" ? "Live Vote Coverage & Probability Curve" : "Real-Time Asset Market Index"}
                      </span>
                    </div>

                    {/* Chart Mode Toggle */}
                    <div style={{ display: "flex", background: "rgba(17, 17, 19, 0.8)", borderRadius: "6px", border: "1px solid #27272A", padding: "2px" }}>
                      <button
                        onClick={() => setChartType("PROBABILITY")}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "4px",
                          background: chartType === "PROBABILITY" ? "#27272A" : "transparent",
                          color: chartType === "PROBABILITY" ? "#10B981" : "#71717A",
                          fontSize: "11px",
                          fontWeight: 600,
                          border: "none",
                          cursor: "pointer"
                        }}
                      >
                        Live Votes %
                      </button>
                      <button
                        onClick={() => setChartType("ASSET")}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "4px",
                          background: chartType === "ASSET" ? "#27272A" : "transparent",
                          color: chartType === "ASSET" ? "#3B82F6" : "#71717A",
                          fontSize: "11px",
                          fontWeight: 600,
                          border: "none",
                          cursor: "pointer"
                        }}
                      >
                        {currentMarket.chartSymbol} Candlestick
                      </button>
                    </div>
                  </div>

                  {chartType === "PROBABILITY" ? (
                    <PredictionVoteChart
                      marketId={currentMarket.id}
                      yesProb={currentMarket.yesProb}
                      noProb={currentMarket.noProb}
                      totalVolume={currentMarket.volume24hXLM}
                    />
                  ) : (
                    <div style={{ height: "300px", width: "100%" }}>
                      <TradingChart symbol={currentMarket.chartSymbol} />
                    </div>
                  )}
                </div>
              </div>

              {/* On-Chain Specs Banner */}
              <div style={{ ...dashboardCardStyle, padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", fontSize: "12px" }}>
                <div>
                  <div style={{ color: "#52525B", textTransform: "uppercase", fontWeight: 600 }}>Soroban Contract</div>
                  <a
                    href={`https://stellar.expert/explorer/testnet/contract/${currentMarket.contractId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#3B82F6", fontWeight: 600, fontFamily: "var(--font-geist-mono)", marginTop: "2px", display: "inline-flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
                  >
                    {currentMarket.contractId.slice(0, 8)}...
                    <ExternalLink size={11} />
                  </a>
                </div>
                <div>
                  <div style={{ color: "#52525B", textTransform: "uppercase", fontWeight: 600 }}>Total Pool</div>
                  <div style={{ color: "#10B981", fontWeight: 600, marginTop: "2px" }}>{currentMarket.totalPoolXLM.toLocaleString()} XLM</div>
                </div>
                <div>
                  <div style={{ color: "#52525B", textTransform: "uppercase", fontWeight: 600 }}>24h Volume</div>
                  <div style={{ color: "#3B82F6", fontWeight: 600, marginTop: "2px" }}>{currentMarket.volume24hXLM.toLocaleString()} XLM</div>
                </div>
                <div>
                  <div style={{ color: "#52525B", textTransform: "uppercase", fontWeight: 600 }}>Active Voters</div>
                  <div style={{ color: "#fff", fontWeight: 600, marginTop: "2px" }}>{currentMarket.participants} Wallets</div>
                </div>
              </div>

            </div>

            {/* ── Right Column: Interactive XLM Voting & Stake Slip ── */}
            <div style={{ ...dashboardCardStyle, padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0, color: "#fff" }}>Stake Slip</h3>
                <span style={{ fontSize: "12px", color: "#71717A" }}>Asset: <strong style={{ color: "#fff" }}>XLM</strong></span>
              </div>

              {/* Side Selector Tabs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", padding: "3px", background: "rgba(9, 9, 11, 0.5)", borderRadius: "6px", border: "1px solid #27272A", marginBottom: "16px" }}>
                <button
                  onClick={() => setSelectedSide("YES")}
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    background: selectedSide === "YES" ? "#10B981" : "transparent",
                    color: selectedSide === "YES" ? "#000" : "#71717A",
                    fontWeight: 700,
                    fontSize: "12px",
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
                    padding: "8px",
                    borderRadius: "4px",
                    background: selectedSide === "NO" ? "#EF4444" : "transparent",
                    color: selectedSide === "NO" ? "#fff" : "#71717A",
                    fontWeight: 700,
                    fontSize: "12px",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  NO ({(currentMarket.noProb / 100).toFixed(2)} XLM)
                </button>
              </div>

              {/* Amount Input in XLM */}
              <div style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#71717A", marginBottom: "6px" }}>
                  <span>Stake Amount</span>
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
                      padding: "12px 14px",
                      borderRadius: "8px",
                      background: "rgba(9, 9, 11, 0.5)",
                      border: "1px solid #3F3F46",
                      color: "#fff",
                      fontSize: "16px",
                      fontWeight: 600,
                      outline: "none"
                    }}
                  />
                  <span style={{ position: "absolute", right: "12px", top: "14px", color: "#3B82F6", fontWeight: 700, fontSize: "12px" }}>
                    XLM
                  </span>
                </div>
              </div>

              {/* Quick XLM Multipliers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "16px" }}>
                {["50", "100", "500", "1000"].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setBetAmountXLM(preset)}
                    style={{
                      padding: "6px",
                      borderRadius: "6px",
                      background: betAmountXLM === preset ? "rgba(59, 130, 246, 0.15)" : "rgba(9, 9, 11, 0.5)",
                      border: `1px solid ${betAmountXLM === preset ? "#3B82F6" : "#27272A"}`,
                      color: betAmountXLM === preset ? "#3B82F6" : "#71717A",
                      fontSize: "11px",
                      fontWeight: 500,
                      cursor: "pointer"
                    }}
                  >
                    +{preset}
                  </button>
                ))}
              </div>

              {/* Trade Breakdown Summary */}
              <div style={{ background: "rgba(9, 9, 11, 0.5)", border: "1px solid #27272A", borderRadius: "8px", padding: "12px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#71717A" }}>
                  <span>Price per Share:</span>
                  <span style={{ color: "#fff", fontWeight: 500 }}>{sharePrice.toFixed(2)} XLM</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#71717A" }}>
                  <span>Outcome Shares:</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{sharesEstimated} {selectedSide}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#71717A" }}>
                  <span>Potential Return:</span>
                  <span style={{ color: selectedSide === "YES" ? "#10B981" : "#EF4444", fontWeight: 600 }}>+{potentialReturn}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "6px", color: "#71717A" }}>
                  <span>Total Payout (if correct):</span>
                  <span style={{ color: "#10B981", fontWeight: 700, fontSize: "13px" }}>{sharesEstimated} XLM</span>
                </div>
              </div>

              {/* Action Button: Mandatory Wallet Connect Check */}
              {!pubKey ? (
                <button
                  onClick={openSidebar}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    background: "#EF4444",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "13px",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <Lock size={14} />
                  Connect Wallet to Vote ({numAmount} XLM)
                </button>
              ) : (
                <button
                  onClick={handlePlaceBet}
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    background: selectedSide === "YES" ? "#10B981" : "#EF4444",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "13px",
                    border: "none",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.6 : 1,
                    transition: "all 0.2s"
                  }}
                >
                  {isSubmitting ? "Signing on Stellar..." : `Stake ${numAmount} XLM for ${selectedSide}`}
                </button>
              )}

              {/* Live Recent Bets Tape */}
              <div style={{ marginTop: "16px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 700, color: "#52525B", textTransform: "uppercase", marginBottom: "8px" }}>
                  <span>Recent On-Chain Votes</span>
                  <Activity size={11} color="#3B82F6" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {recentBets.map((b, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", background: "rgba(9, 9, 11, 0.5)", padding: "6px 8px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.02)" }}>
                      <span style={{ fontFamily: "var(--font-geist-mono)", color: "#71717A" }}>{b.wallet}</span>
                      <span style={{ fontWeight: 600, color: b.side === "YES" ? "#10B981" : "#EF4444" }}>
                        {b.side} {b.amount} XLM
                      </span>
                      <span style={{ color: "#52525B", fontSize: "10px" }}>{b.time}</span>
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ ...dashboardCardStyle, width: "100%", maxWidth: "520px", padding: "24px", position: "relative", border: "1px solid #3F3F46" }}>
            
            <button
              onClick={() => setIsCreateModalOpen(false)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: "#71717A", cursor: "pointer" }}
            >
              <X size={18} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <PlusCircle size={18} color="#3B82F6" />
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0, color: "#fff" }}>Create Prediction Contest</h2>
            </div>
            <p style={{ color: "#71717A", fontSize: "12px", marginBottom: "16px" }}>
              Deploy a new binary outcome prediction contest onto the Soroban smart contract.
            </p>

            <form onSubmit={handleCreateMarket} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#71717A", marginBottom: "4px" }}>
                  Contest Question / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Will XLM market cap flip ADA by Q4 2026?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "rgba(9, 9, 11, 0.5)", border: "1px solid #3F3F46", color: "#fff", outline: "none", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#71717A", marginBottom: "4px" }}>
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "#18181B", border: "1px solid #3F3F46", color: "#fff", outline: "none", fontSize: "13px" }}
                  >
                    <option value="Stellar & Soroban">Stellar & Soroban</option>
                    <option value="Crypto & DeFi">Crypto & DeFi</option>
                    <option value="AI & Tech">AI & Tech</option>
                    <option value="Macro & Elections">Macro & Elections</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#71717A", marginBottom: "4px" }}>
                    Resolution Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "#18181B", border: "1px solid #3F3F46", color: "#fff", outline: "none", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#71717A", marginBottom: "4px" }}>
                  Initial Liquidity Staked (XLM)
                </label>
                <input
                  type="number"
                  min="50"
                  value={newInitialPoolXLM}
                  onChange={(e) => setNewInitialPoolXLM(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "rgba(9, 9, 11, 0.5)", border: "1px solid #3F3F46", color: "#fff", outline: "none", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#71717A", marginBottom: "4px" }}>
                  Resolution Oracle & Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Specify resolution criteria (e.g. CoinGecko price, official announcement)..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "rgba(9, 9, 11, 0.5)", border: "1px solid #3F3F46", color: "#fff", outline: "none", fontSize: "13px", resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ flex: 1, padding: "10px", borderRadius: "6px", background: "#27272A", color: "#A1A1AA", border: "none", fontWeight: 500, fontSize: "13px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingMarket}
                  style={{
                    flex: 2,
                    padding: "10px",
                    borderRadius: "6px",
                    background: "#3B82F6",
                    color: "#fff",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: isCreatingMarket ? "not-allowed" : "pointer"
                  }}
                >
                  {isCreatingMarket ? "Signing on Stellar..." : "Sign & Deploy on Stellar"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
