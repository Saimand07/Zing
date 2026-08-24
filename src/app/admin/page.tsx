"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { 
  Users, Activity, DollarSign, ShieldAlert, 
  RefreshCw, TrendingUp, Search
} from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalVolume: 0, totalTx: 0 });

  const ADMIN_EMAIL = "rajdivyanshu86@gmail.com";

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user?.email === ADMIN_EMAIL) {
        fetchAdminData();
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, user, authLoading]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (!supabase) throw new Error("Supabase not initialized");

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      // Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from("user_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (usersData) {
        setUsers(usersData);
        setStats(prev => ({ ...prev, totalUsers: usersData.length }));
      }
      
      if (txData) {
        setTransactions(txData);
        const volume = txData.reduce((acc, tx) => acc + Number(tx.amount || 0), 0);
        setStats(prev => ({ ...prev, totalTx: txData.length, totalVolume: volume }));
      }
    } catch (err) {
      console.error("Admin data fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.email !== ADMIN_EMAIL) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-zinc-400 max-w-md mb-8">
          You do not have the required permissions to view the admin dashboard.
        </p>
        <Link 
          href="/dashboard"
          className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors border border-white/5"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <ShieldAlert className="text-blue-500" size={24} />
            Zing Admin Console
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            System overview, user management, and global analytics.
          </p>
        </div>
        <button 
          onClick={fetchAdminData}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors text-white w-fit"
        >
          <RefreshCw size={14} />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <div className="text-zinc-400 text-sm font-medium flex items-center gap-2">
            <Users size={16} /> Total Registered Users
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
        </div>
        
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="text-zinc-400 text-sm font-medium flex items-center gap-2">
            <Activity size={16} /> Total Transactions
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalTx}</div>
        </div>

        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
          <div className="text-zinc-400 text-sm font-medium flex items-center gap-2">
            <DollarSign size={16} /> Total Volume (Units)
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalVolume.toLocaleString()}</div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="text-blue-500" size={18} />
            Recent Users
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                <th className="p-4 py-3">Username</th>
                <th className="p-4 py-3">Email</th>
                <th className="p-4 py-3">Wallet</th>
                <th className="p-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-zinc-500 text-sm">No users found</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-sm font-medium text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                        {u.username?.[0]?.toUpperCase() || "U"}
                      </div>
                      {u.username || "Anonymous"}
                    </td>
                    <td className="p-4 text-sm text-zinc-400">{u.email || "-"}</td>
                    <td className="p-4 text-sm font-mono text-zinc-500">{u.wallet_address ? `${u.wallet_address.slice(0,8)}...${u.wallet_address.slice(-4)}` : "-"}</td>
                    <td className="p-4 text-sm text-zinc-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-emerald-500" size={18} />
            Platform Activity
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                <th className="p-4 py-3">Type</th>
                <th className="p-4 py-3">Asset</th>
                <th className="p-4 py-3">Amount</th>
                <th className="p-4 py-3">Wallet</th>
                <th className="p-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500 text-sm">No transactions found</td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-sm font-medium text-white">
                      <span className="bg-white/10 px-2 py-1 rounded text-xs text-zinc-300 border border-white/5">
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-zinc-400">{tx.asset}</td>
                    <td className="p-4 text-sm font-medium text-emerald-400">{tx.amount}</td>
                    <td className="p-4 text-sm font-mono text-zinc-500">{`${tx.wallet_address.slice(0,6)}...${tx.wallet_address.slice(-4)}`}</td>
                    <td className="p-4 text-sm text-zinc-400">{new Date(tx.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
