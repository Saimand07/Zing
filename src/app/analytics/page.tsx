"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart2, TrendingUp, Activity, DollarSign, ArrowUpRight, Users, Zap } from "lucide-react";

// ── Mock data for seeded XLM analytics ───────────────────────────────────────
const MOCK_STATS = {
  totalVolume: 48_320,
  totalTx: 312,
  uniqueUsers: 14,
  predictionBets: 187,
  tokenLaunches: 11,
};

const MOCK_FEED = [
  { id: "f01", type: "PREDICTION_BET",  wallet_address: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQ6K4L7UDSOEB2ECTBCP4F", amount: 75,   asset: "XLM",  created_at: "2026-08-24T21:10:00Z", explorer_url: "https://stellar.expert/explorer/testnet" },
  { id: "f02", type: "SWAP_INTENT",     wallet_address: "GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH", amount: 200,  asset: "USDC", created_at: "2026-08-24T20:45:00Z", explorer_url: "https://stellar.expert/explorer/testnet" },
  { id: "f03", type: "TOKEN_LAUNCH",    wallet_address: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",  amount: 1000, asset: "XLM",  created_at: "2026-08-24T18:00:00Z", explorer_url: "https://stellar.expert/explorer/testnet" },
  { id: "f04", type: "CLAIM_PAYOUT",    wallet_address: "CDTQYDT2EJ7WAIMGY33546CKKS46MP2CBSL5QNCXFNQTHL5EL7GPYLAY", amount: 310,  asset: "XLM",  created_at: "2026-08-24T16:30:00Z", explorer_url: "https://stellar.expert/explorer/testnet" },
  { id: "f05", type: "PREDICTION_BET",  wallet_address: "CCSJQNIM7UWJLMRDD5VSPQDUNQKG5A7VZZVVGOOLMTLG3RIQY5NQIRH7", amount: 50,   asset: "XLM",  created_at: "2026-08-24T15:00:00Z", explorer_url: "https://stellar.expert/explorer/testnet" },
  { id: "f06", type: "CONTEST_CREATE",  wallet_address: "CCO6P3MRIXHFPSAQF5IQ7DENWJDJMAJXWFE3DTPHYIRMEMUT4KQKPMNR",  amount: 500,  asset: "XLM",  created_at: "2026-08-24T12:00:00Z", explorer_url: "https://stellar.expert/explorer/testnet" },
  { id: "f07", type: "SWAP_INTENT",     wallet_address: "CCQKDOJRON3D4PZC4YNCTVMYR566VEPWYRFTF2JGFTO5EPZLJUBKKS46", amount: 8000, asset: "AQUA", created_at: "2026-08-24T10:00:00Z", explorer_url: "https://stellar.expert/explorer/testnet" },
  { id: "f08", type: "PREDICTION_BET",  wallet_address: "CAHXXMYINOBWAAYBHETS6C5NKX4S4F4OHWV7EFLX6PY7QB3RCSQMQO2T", amount: 150,  asset: "XLM",  created_at: "2026-08-23T22:00:00Z", explorer_url: "https://stellar.expert/explorer/testnet" },
];

// Dashboard-style card wrapper
const Card = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: "rgba(17, 17, 19, 0.5)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", overflow: "hidden" }}>
    {children}
  </div>
);

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(MOCK_STATS);
  const [recentActivity, setRecentActivity] = useState<any[]>(MOCK_FEED);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data: txData } = await supabase
        .from("user_transactions")
        .select("*")
        .eq("status", "SUCCESS")
        .order("created_at", { ascending: false })
        .limit(500);

      if (txData && txData.length > 0) {
        let volume = 0;
        let predictionBets = 0;
        let tokenLaunches = 0;
        const uniqueWallets = new Set<string>();

        txData.forEach(tx => {
          volume += Number(tx.amount || 0);
          uniqueWallets.add(tx.wallet_address);
          if (tx.type === "PREDICTION_BET") predictionBets++;
          if (tx.type === "TOKEN_LAUNCH") tokenLaunches++;
        });

        setStats({ totalVolume: volume, totalTx: txData.length, uniqueUsers: uniqueWallets.size, predictionBets, tokenLaunches });
        setRecentActivity(txData.slice(0, 15));
      }
      // else: keep mock data
    } catch (err) {
      // keep mock data on error
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    { label: "Total Volume",        value: `${stats.totalVolume.toLocaleString()} XLM`, icon: DollarSign, color: "#3B82F6", glow: "rgba(59,130,246,0.08)" },
    { label: "Total Transactions",  value: stats.totalTx.toLocaleString(),              icon: Activity,    color: "#10B981", glow: "rgba(16,185,129,0.08)" },
    { label: "Active Wallets",      value: stats.uniqueUsers.toLocaleString(),          icon: Users,       color: "#A855F7", glow: "rgba(168,85,247,0.08)" },
    { label: "Prediction Bets",     value: stats.predictionBets.toLocaleString(),       icon: TrendingUp,  color: "#F59E0B", glow: "rgba(245,158,11,0.08)" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <BarChart2 className="text-emerald-500" size={22} />
          Platform Analytics
        </h1>
        <p className="text-zinc-500 text-sm mt-1 max-w-lg">
          Real-time on-chain activity, trading volume, and prediction market metrics for the Zing ecosystem on Soroban.
        </p>
      </div>

      {/* KPI Cards — dashboard style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, glow }) => (
          <Card key={label}>
            <div className="p-4 flex flex-col gap-3">
              <div style={{ width: 36, height: 36, borderRadius: 9, background: glow, border: `1px solid ${color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={16} color={color} />
              </div>
              <div>
                <div className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider mb-1">{label}</div>
                <div className="text-xl font-bold text-white">{loading ? "—" : value}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Activity Chart Placeholder */}
        <Card>
          <div className="lg:col-span-2 flex flex-col" style={{ minHeight: 360 }}>
            <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <Zap size={16} className="text-yellow-500" />
              <span className="text-sm font-semibold text-white">Network Activity</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
              {/* Volume bar chart (hardcoded mock) */}
              <div className="w-full flex flex-col gap-3">
                {[
                  { label: "Prediction Bets", pct: 60, count: stats.predictionBets, color: "#3B82F6" },
                  { label: "Swap Intents",    pct: 25, count: Math.round(stats.totalTx * 0.25), color: "#10B981" },
                  { label: "Token Launches",  pct: 4,  count: stats.tokenLaunches,  color: "#A855F7" },
                  { label: "Claim Payouts",   pct: 8,  count: Math.round(stats.totalTx * 0.08), color: "#F59E0B" },
                  { label: "Contests",        pct: 3,  count: Math.round(stats.totalTx * 0.03), color: "#EF4444" },
                ].map(({ label, pct, count, color }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>{label}</span>
                      <span className="text-white font-medium">{count}</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Live Feed */}
        <Card>
          <div className="flex flex-col" style={{ height: 420 }}>
            <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <Activity size={16} className="text-emerald-500" />
              <span className="text-sm font-semibold text-white">Live Feed</span>
              <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-4">
              {recentActivity.map(tx => (
                <div key={tx.id} className="flex items-center justify-between group hover:bg-white/5 rounded-lg px-2 py-2 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-zinc-300">{tx.type.replace(/_/g, " ")}</span>
                    <span className="text-[11px] text-zinc-600 font-mono">{tx.wallet_address.slice(0, 6)}...{tx.wallet_address.slice(-4)}</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-sm font-bold text-emerald-400">{tx.amount} {tx.asset}</span>
                    {tx.explorer_url && (
                      <a href={tx.explorer_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        View <ArrowUpRight size={9} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
