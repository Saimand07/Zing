"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  BarChart2, TrendingUp, Activity, DollarSign,
  ArrowUpRight, Users, Zap
} from "lucide-react";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVolume: 0,
    totalTx: 0,
    uniqueUsers: 0,
    predictionBets: 0,
    tokenLaunches: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      if (!supabase) throw new Error("Supabase not initialized");

      // Fetch recent successful transactions
      const { data: txData, error: txError } = await supabase
        .from("user_transactions")
        .select("*")
        .eq("status", "SUCCESS")
        .order("created_at", { ascending: false })
        .limit(500); // Fetch up to 500 for aggregate stats

      if (txData) {
        let volume = 0;
        let predictionBets = 0;
        let tokenLaunches = 0;
        const uniqueWallets = new Set();

        txData.forEach(tx => {
          volume += Number(tx.amount || 0);
          uniqueWallets.add(tx.wallet_address);
          if (tx.type === 'PREDICTION_BET') predictionBets++;
          if (tx.type === 'TOKEN_LAUNCH') tokenLaunches++;
        });

        setStats({
          totalVolume: volume,
          totalTx: txData.length,
          uniqueUsers: uniqueWallets.size,
          predictionBets,
          tokenLaunches
        });

        setRecentActivity(txData.slice(0, 15)); // Show latest 15
      }
    } catch (err) {
      console.error("Analytics fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <BarChart2 className="text-emerald-500" size={32} />
            Platform Analytics
          </h1>
          <p className="text-zinc-400 text-sm mt-2 max-w-lg">
            Real-time on-chain activity, trading volume, and prediction market metrics for the Zing ecosystem on Soroban.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-1 relative overflow-hidden">
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-blue-500" /> 
            Total Volume
          </div>
          <div className="text-2xl md:text-3xl font-black text-white">
            {loading ? "..." : stats.totalVolume.toLocaleString()} <span className="text-sm font-medium text-zinc-500">Units</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-1 relative overflow-hidden">
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-1">
            <Activity size={14} className="text-emerald-500" /> 
            Total Transactions
          </div>
          <div className="text-2xl md:text-3xl font-black text-white">
            {loading ? "..." : stats.totalTx.toLocaleString()}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-1 relative overflow-hidden">
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-1">
            <Users size={14} className="text-purple-500" /> 
            Active Wallets
          </div>
          <div className="text-2xl md:text-3xl font-black text-white">
            {loading ? "..." : stats.uniqueUsers.toLocaleString()}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-1 relative overflow-hidden">
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-orange-500" /> 
            Prediction Bets
          </div>
          <div className="text-2xl md:text-3xl font-black text-white">
            {loading ? "..." : stats.predictionBets.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Chart Placeholder */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col min-h-[400px]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <Zap className="text-yellow-500" size={18} />
            Network Activity
          </h2>
          <div className="flex-1 flex flex-col items-center justify-center border border-white/5 rounded-xl bg-black/20 border-dashed">
            <BarChart2 className="w-12 h-12 text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-medium">Historical Charting Data</p>
            <p className="text-zinc-600 text-sm max-w-xs text-center mt-2">
              Granular time-series data visualization is currently being aggregated from the Soroban RPC.
            </p>
          </div>
        </div>

        {/* Right Column: Live Feed */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col h-[400px]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Activity className="text-emerald-500" size={18} />
            Live Feed
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 custom-scrollbar">
            {loading ? (
              <div className="text-zinc-500 text-sm text-center py-8 animate-pulse">Loading live feed...</div>
            ) : recentActivity.length === 0 ? (
              <div className="text-zinc-500 text-sm text-center py-8">No recent activity</div>
            ) : (
              recentActivity.map(tx => (
                <div key={tx.id} className="p-3 bg-black/20 border border-white/5 rounded-lg flex items-center justify-between group hover:bg-white/5 transition-colors">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{tx.type.replace('_', ' ')}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      {tx.wallet_address.slice(0,6)}...{tx.wallet_address.slice(-4)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold text-emerald-400">
                      {tx.amount} {tx.asset}
                    </span>
                    {tx.explorer_url && (
                      <a href={tx.explorer_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Tx <ArrowUpRight size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
