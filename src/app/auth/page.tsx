"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useWallet } from "@/components/wallet-provider";
import { useToast } from "@/components/toast-provider";
import { 
  Lock, 
  Mail, 
  User, 
  Wallet, 
  ArrowRight, 
  CheckCircle2, 
  Shield, 
  Sparkles,
  Zap
} from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const { user, profile, isAuthenticated, loading: authLoading, signInWithEmail, signUpWithEmail, loginWithWalletAddress } = useAuth();
  const { pubKey, openSidebar } = useWallet();
  const { showToast } = useToast();

  const [mode, setMode] = useState<"LOGIN" | "SIGNUP">("LOGIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  // Wait for auth hydration before rendering anything
  if (authLoading) {
    return (
      <div style={{ maxWidth: "480px", margin: "80px auto", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
        <div style={{ width: "32px", height: "32px", border: "2px solid rgba(59,130,246,0.3)", borderTop: "2px solid #3B82F6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style dangerouslySetInnerHTML={{__html: `@keyframes spin { to { transform: rotate(360deg); } }`}} />
      </div>
    );
  }

  // Already authenticated — redirect prompt
  if (isAuthenticated && profile) {
    return (
      <div style={{ maxWidth: "540px", margin: "80px auto", padding: "32px", background: "rgba(17, 17, 19, 0.5)", backdropFilter: "blur(12px)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center", color: "#fff" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", color: "#10B981" }}>
          <CheckCircle2 size={24} />
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px 0" }}>You are Signed In</h2>
        <p style={{ color: "#A1A1AA", fontSize: "14px", marginBottom: "24px" }}>
          Authenticated as <strong>{profile.username}</strong> ({profile.email || (profile.walletAddress ? `${profile.walletAddress.slice(0, 8)}...` : "Web3 User")})
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Link
            href="/profile"
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              background: "#3B82F6",
              color: "#fff",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: "13px"
            }}
          >
            Go to User Profile
          </Link>
          <Link
            href="/dashboard"
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: "13px",
              border: "1px solid #27272A"
            }}
          >
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please provide both email and password.", "error");
      return;
    }

    setLoading(true);
    if (mode === "LOGIN") {
      const res = await signInWithEmail(email, password);
      if (res.error) {
        showToast(res.error, "error");
      } else {
        showToast("Signed in successfully!", "success");
        router.push("/profile");
      }
    } else {
      if (!username) {
        showToast("Please enter a username.", "error");
        setLoading(false);
        return;
      }
      const res = await signUpWithEmail(email, password, username);
      if (res.error) {
        showToast(res.error, "error");
      } else {
        showToast("Account created! Session initialized.", "success");
        router.push("/profile");
      }
    }
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const demoAddress = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQ6K4L7UDSOEB2ECTBCP4F";
    await loginWithWalletAddress(demoAddress);
    showToast("Demo Testnet Session Activated!", "success");
    router.push("/profile");
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "480px", margin: "40px auto 80px auto", padding: "20px", color: "#fff", fontFamily: "var(--font-geist-sans)" }}>
      
      {/* Brand Header */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 12px", borderRadius: "100px", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#3B82F6", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
          <Sparkles size={12} />
          Zing Identity & Access
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 6px 0", letterSpacing: "-0.5px" }}>
          {mode === "LOGIN" ? "Welcome Back" : "Create Account"}
        </h1>
        <p style={{ color: "#71717A", fontSize: "13px", margin: 0 }}>
          {mode === "LOGIN" 
            ? "Sign in to access your profile, linked Stellar wallet, and transaction ledger."
            : "Sign up to track your on-chain trades, prediction bets, and campaign rewards."
          }
        </p>
      </div>

      {/* Main Card */}
      <div style={{ background: "rgba(17, 17, 19, 0.5)", backdropFilter: "blur(12px)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", padding: "24px" }}>
        
        {/* Mode Switch */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", padding: "3px", background: "rgba(9, 9, 11, 0.6)", borderRadius: "6px", border: "1px solid #27272A", marginBottom: "20px" }}>
          <button
            onClick={() => setMode("LOGIN")}
            style={{
              padding: "8px",
              borderRadius: "4px",
              background: mode === "LOGIN" ? "#27272A" : "transparent",
              color: mode === "LOGIN" ? "#fff" : "#71717A",
              fontWeight: 600,
              fontSize: "12px",
              border: "none",
              cursor: "pointer"
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("SIGNUP")}
            style={{
              padding: "8px",
              borderRadius: "4px",
              background: mode === "SIGNUP" ? "#27272A" : "transparent",
              color: mode === "SIGNUP" ? "#fff" : "#71717A",
              fontWeight: 600,
              fontSize: "12px",
              border: "none",
              cursor: "pointer"
            }}
          >
            Create Account
          </button>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          
          {mode === "SIGNUP" && (
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#71717A", marginBottom: "6px" }}>
                Username
              </label>
              <div style={{ position: "relative" }}>
                <User size={15} color="#52525B" style={{ position: "absolute", left: "12px", top: "12px" }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. SatoshiStellar"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 36px",
                    borderRadius: "8px",
                    background: "rgba(9, 9, 11, 0.5)",
                    border: "1px solid #3F3F46",
                    color: "#fff",
                    outline: "none",
                    fontSize: "13px"
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#71717A", marginBottom: "6px" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={15} color="#52525B" style={{ position: "absolute", left: "12px", top: "12px" }} />
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  borderRadius: "8px",
                  background: "rgba(9, 9, 11, 0.5)",
                  border: "1px solid #3F3F46",
                  color: "#fff",
                  outline: "none",
                  fontSize: "13px"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#71717A", marginBottom: "6px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={15} color="#52525B" style={{ position: "absolute", left: "12px", top: "12px" }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  borderRadius: "8px",
                  background: "rgba(9, 9, 11, 0.5)",
                  border: "1px solid #3F3F46",
                  color: "#fff",
                  outline: "none",
                  fontSize: "13px"
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              background: "#3B82F6",
              color: "#fff",
              fontWeight: 600,
              fontSize: "13px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              marginTop: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            {loading ? "Processing..." : mode === "LOGIN" ? "Sign In with Email" : "Create My Account"}
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
          <span style={{ fontSize: "11px", color: "#52525B", textTransform: "uppercase", fontWeight: 600 }}>Or 1-Click Web3</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
        </div>

        {/* Web3 Wallet Quick Connect */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={() => {
              openSidebar();
              showToast("Opening Stellar wallet connector...", "info");
            }}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: "8px",
              background: "rgba(9, 9, 11, 0.5)",
              border: "1px solid #27272A",
              color: "#fff",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            <Wallet size={15} color="#3B82F6" />
            {pubKey ? `Connected: ${pubKey.slice(0, 6)}...${pubKey.slice(-4)}` : "Connect Stellar Wallet (Freighter/Albedo)"}
          </button>

          {/* Quick Demo Mode */}
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "9px",
              borderRadius: "8px",
              background: "transparent",
              border: "1px dashed rgba(255,255,255,0.1)",
              color: "#71717A",
              fontWeight: 500,
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <Zap size={13} color="#F59E0B" />
            Explore in Quick Demo Session Mode
          </button>
        </div>

        {/* Security Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center", marginTop: "20px", color: "#52525B", fontSize: "11px" }}>
          <Shield size={12} />
          <span>Secured by Supabase & Stellar Soroban Auth</span>
        </div>

      </div>

    </div>
  );
}
