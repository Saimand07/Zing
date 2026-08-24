"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient, type SupabaseClient, User } from "@supabase/supabase-js";

// ── Supabase client (safe, nullable) ──────────────────────────────────────────
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const isConfigured = SUPA_URL.startsWith("http://") || SUPA_URL.startsWith("https://");

let _supabase: SupabaseClient | null = null;
if (isConfigured) {
  _supabase = createClient(SUPA_URL, SUPA_KEY);
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  walletAddress?: string;
  twitterHandle?: string;
  bio?: string;
  sessionType: "EMAIL" | "WALLET" | "GUEST";
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, pass: string, username: string) => Promise<{ error?: string }>;
  loginWithWalletAddress: (walletAddress: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithTwitter: () => Promise<void>;
  linkWalletToProfile: (walletAddress: string) => Promise<void>;
}

const AUTH_STORAGE_KEY = "zing_user_session";
const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // Start as true so we never flash "Sign In" on a returning user
  const [loading, setLoading] = useState(true);

  // ── Persist / clear localStorage ─────────────────────────────────────────
  const persistSession = useCallback((prof: UserProfile | null) => {
    setProfile(prof);
    try {
      if (typeof window === "undefined") return;
      if (prof) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(prof));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Storage write error:", e);
    }
  }, []);

  // ── Fetch or create a Supabase-backed profile row ─────────────────────────
  const loadProfileForUser = useCallback(async (currentUser: User) => {
    if (!_supabase) {
      // No Supabase: create an in-memory profile from the auth session
      persistSession({
        id: currentUser.id,
        username: currentUser.email?.split("@")[0] || "ZingTrader",
        email: currentUser.email,
        avatarUrl: "",
        walletAddress: "",
        twitterHandle: "",
        bio: "DeFi & Prediction Market Enthusiast on Stellar",
        sessionType: "EMAIL",
        createdAt: new Date().toISOString(),
      });
      return;
    }

    try {
      const { data, error } = await _supabase
        .from("user_profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (data && !error) {
        persistSession({
          id: data.id,
          username: data.username,
          email: data.email,
          avatarUrl: data.avatar_url || "",
          walletAddress: data.wallet_address || "",
          twitterHandle: data.twitter_handle || "",
          bio: data.bio || "DeFi & Prediction Market Enthusiast on Stellar",
          sessionType: "EMAIL",
          createdAt: data.created_at || new Date().toISOString(),
        });
        return;
      }

      // Row doesn't exist yet — create it
      const newProf: UserProfile = {
        id: currentUser.id,
        username: currentUser.email?.split("@")[0] || "ZingTrader",
        email: currentUser.email,
        avatarUrl: "",
        walletAddress: "",
        twitterHandle: "",
        bio: "DeFi & Prediction Market Enthusiast on Stellar",
        sessionType: "EMAIL",
        createdAt: new Date().toISOString(),
      };

      await _supabase.from("user_profiles").upsert({
        id: newProf.id,
        username: newProf.username,
        email: newProf.email,
        avatar_url: newProf.avatarUrl,
        bio: newProf.bio,
        created_at: newProf.createdAt,
      });

      persistSession(newProf);
    } catch (e) {
      console.warn("Profile load error:", e);
    }
  }, [persistSession]);

  // ── Wallet-only login ─────────────────────────────────────────────────────
  const loginWithWalletAddress = useCallback(async (walletAddress: string) => {
    if (!walletAddress) return;

    if (_supabase) {
      try {
        const { data } = await _supabase
          .from("user_profiles")
          .select("*")
          .eq("wallet_address", walletAddress)
          .single();

        if (data) {
          persistSession({
            id: data.id,
            username: data.username || `Stellar_${walletAddress.slice(-4)}`,
            email: data.email || undefined,
            avatarUrl: data.avatar_url || "",
            walletAddress: data.wallet_address,
            twitterHandle: data.twitter_handle || "",
            bio: data.bio || "Stellar Web3 Trader",
            sessionType: "WALLET",
            createdAt: data.created_at || new Date().toISOString(),
          });
          return;
        }

        // New wallet user — create row
        const walletUserId = `wallet_${walletAddress.slice(0, 10)}_${walletAddress.slice(-6)}`;
        const newProf: UserProfile = {
          id: walletUserId,
          username: `Stellar_${walletAddress.slice(-4)}`,
          avatarUrl: "",
          walletAddress,
          twitterHandle: "",
          bio: "Stellar Web3 Trader",
          sessionType: "WALLET",
          createdAt: new Date().toISOString(),
        };

        await _supabase.from("user_profiles").upsert({
          id: newProf.id,
          username: newProf.username,
          wallet_address: walletAddress,
          avatar_url: newProf.avatarUrl,
          bio: newProf.bio,
          created_at: newProf.createdAt,
        });

        persistSession(newProf);
        return;
      } catch (err) {
        console.warn("Wallet session persistence error:", err);
      }
    }

    // Local-only fallback
    persistSession({
      id: `wallet_${walletAddress.slice(0, 8)}`,
      username: `Stellar_${walletAddress.slice(-4)}`,
      avatarUrl: "",
      walletAddress,
      twitterHandle: "",
      bio: "Stellar Web3 Trader",
      sessionType: "WALLET",
      createdAt: new Date().toISOString(),
    });
  }, [persistSession]);

  // ── Bootstrap: restore session from localStorage + check Supabase auth ────
  useEffect(() => {
    // 1. Instant hydration (zero-flicker)
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed: UserProfile = JSON.parse(stored);
          setProfile(parsed);
        }
      }
    } catch (e) {}

    // 2. Verify with Supabase (if configured)
    if (!_supabase) {
      setLoading(false);
      return;
    }

    _supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadProfileForUser(currentUser).finally(() => setLoading(false));
      } else {
        // No email session — keep any wallet session that was hydrated from localStorage
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = _supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadProfileForUser(currentUser);
      } else if (_event === "SIGNED_OUT") {
        // On explicit sign-out, also clear the profile
        persistSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfileForUser, persistSession]);

  // ── Sign in / sign up ─────────────────────────────────────────────────────
  const signInWithEmail = async (email: string, pass: string) => {
    if (!_supabase) return { error: "Supabase is not configured. Check your .env.local file." };
    try {
      const { data, error } = await _supabase.auth.signInWithPassword({ email, password: pass });
      if (error) return { error: error.message };
      if (data.user) {
        setUser(data.user);
        await loadProfileForUser(data.user);
      }
      return {};
    } catch (e: any) {
      return { error: e.message || "Failed to sign in" };
    }
  };

  const signUpWithEmail = async (email: string, pass: string, username: string) => {
    if (!_supabase) return { error: "Supabase is not configured. Check your .env.local file." };
    try {
      const { data, error } = await _supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { username } },
      });
      if (error) return { error: error.message };
      if (data.user) {
        setUser(data.user);
        await loadProfileForUser(data.user);
      }
      return {};
    } catch (e: any) {
      return { error: e.message || "Failed to sign up" };
    }
  };

  // ── Update profile ────────────────────────────────────────────────────────
  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!profile) return false;
    const updated = { ...profile, ...updates };
    persistSession(updated);

    if (_supabase && profile.id) {
      try {
        await _supabase.from("user_profiles").upsert({
          id: profile.id,
          username: updated.username,
          avatar_url: updated.avatarUrl,
          wallet_address: updated.walletAddress,
          twitter_handle: updated.twitterHandle,
          bio: updated.bio,
        });
      } catch (err) {
        console.warn("Failed to update profile in DB:", err);
      }
    }
    return true;
  };

  // ── Link wallet to an existing profile ───────────────────────────────────
  const linkWalletToProfile = useCallback(async (walletAddress: string) => {
    if (!walletAddress) return;
    if (profile) {
      if (profile.walletAddress !== walletAddress) {
        await updateUserProfile({ walletAddress });
      }
    } else {
      await loginWithWalletAddress(walletAddress);
    }
  }, [profile, loginWithWalletAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Twitter OAuth ─────────────────────────────────────────────────────────
  const loginWithTwitter = async () => {
    if (!_supabase) return;
    await _supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin + "/profile" : "/profile",
      },
    });
  };

  // ── Logout: clears BOTH email session and wallet profile ──────────────────
  const logout = async () => {
    if (_supabase) {
      try { await _supabase.auth.signOut(); } catch (e) {}
    }
    setUser(null);
    persistSession(null);
    // Also clear the saved wallet key so wallet session doesn't ghost
    if (typeof window !== "undefined") {
      localStorage.removeItem("zing_wallet_pubkey");
      localStorage.removeItem("zing_wallet_id");
    }
  };

  // ── isAuthenticated: only true when we have a real profile AND loading is done
  const isAuthenticated = !loading && Boolean(profile);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated,
      loading,
      signInWithEmail,
      signUpWithEmail,
      loginWithWalletAddress,
      updateUserProfile,
      logout,
      loginWithTwitter,
      linkWalletToProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
