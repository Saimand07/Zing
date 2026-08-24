"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to persist profile locally for zero-latency session hydration
  const persistSession = (prof: UserProfile | null) => {
    setProfile(prof);
    try {
      if (typeof window !== "undefined") {
        if (prof) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(prof));
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (e) {
      console.warn("Storage write error:", e);
    }
  };

  // Fetch or create profile for Supabase User
  const loadProfileForUser = async (currentUser: User) => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        if (data && !error) {
          const loaded: UserProfile = {
            id: data.id,
            username: data.username || currentUser.email?.split("@")[0] || "Trader",
            email: data.email || currentUser.email,
            avatarUrl: data.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            walletAddress: data.wallet_address || "",
            twitterHandle: data.twitter_handle || "",
            bio: data.bio || "DeFi & Prediction Market Enthusiast on Stellar",
            sessionType: "EMAIL",
            createdAt: data.created_at || new Date().toISOString()
          };
          persistSession(loaded);
          return;
        }

        // Create default row in Supabase
        const newProf: UserProfile = {
          id: currentUser.id,
          username: currentUser.email?.split("@")[0] || "ZingTrader",
          email: currentUser.email,
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          walletAddress: "",
          twitterHandle: "",
          bio: "DeFi & Prediction Market Enthusiast on Stellar",
          sessionType: "EMAIL",
          createdAt: new Date().toISOString()
        };

        await supabase.from("user_profiles").upsert({
          id: newProf.id,
          username: newProf.username,
          email: newProf.email,
          avatar_url: newProf.avatarUrl,
          bio: newProf.bio,
          created_at: newProf.createdAt
        });

        persistSession(newProf);
      }
    } catch (e) {
      console.warn("Supabase user profile fallback:", e);
    }
  };

  // Instant Web3 Wallet Session Generator
  const loginWithWalletAddress = useCallback(async (walletAddress: string) => {
    if (!walletAddress) return;

    // Check if we already have this wallet profile
    try {
      if (supabase) {
        const { data } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("wallet_address", walletAddress)
          .single();

        if (data) {
          persistSession({
            id: data.id,
            username: data.username || `Stellar_${walletAddress.slice(-4)}`,
            email: data.email || undefined,
            avatarUrl: data.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            walletAddress: data.wallet_address,
            twitterHandle: data.twitter_handle || "",
            bio: data.bio || "Stellar Web3 Trader",
            sessionType: "WALLET",
            createdAt: data.created_at || new Date().toISOString()
          });
          return;
        }

        // Create new wallet profile
        const walletUserId = `wallet_${walletAddress.slice(0, 10)}_${walletAddress.slice(-6)}`;
        const newProf: UserProfile = {
          id: walletUserId,
          username: `Stellar_${walletAddress.slice(-4)}`,
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          walletAddress: walletAddress,
          twitterHandle: "",
          bio: "Stellar Web3 Trader",
          sessionType: "WALLET",
          createdAt: new Date().toISOString()
        };

        await supabase.from("user_profiles").upsert({
          id: newProf.id,
          username: newProf.username,
          wallet_address: walletAddress,
          avatar_url: newProf.avatarUrl,
          bio: newProf.bio,
          created_at: newProf.createdAt
        });

        persistSession(newProf);
        return;
      }
    } catch (err) {
      console.warn("Wallet session persistence fallback:", err);
    }

    // Local fallback for offline/instant mode
    persistSession({
      id: `wallet_${walletAddress.slice(0, 8)}`,
      username: `Stellar_${walletAddress.slice(-4)}`,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      walletAddress: walletAddress,
      twitterHandle: "",
      bio: "Stellar Web3 Trader",
      sessionType: "WALLET",
      createdAt: new Date().toISOString()
    });
  }, []);

  // Hydrate session on initial client mount
  useEffect(() => {
    // 1. Instant hydration from localStorage
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setProfile(parsed);
        }
      }
    } catch (e) {}

    // 2. Supabase auth session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadProfileForUser(currentUser);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadProfileForUser(currentUser);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });
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
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { username }
        }
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

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!profile) return false;
    const updated = { ...profile, ...updates };
    persistSession(updated);

    try {
      if (supabase && profile.id) {
        await supabase.from("user_profiles").upsert({
          id: profile.id,
          username: updated.username,
          avatar_url: updated.avatarUrl,
          wallet_address: updated.walletAddress,
          twitter_handle: updated.twitterHandle,
          bio: updated.bio
        });
      }
      return true;
    } catch (err) {
      console.warn("Failed to update profile in DB:", err);
      return true;
    }
  };

  const linkWalletToProfile = async (walletAddress: string) => {
    if (!walletAddress) return;
    if (profile) {
      if (profile.walletAddress !== walletAddress) {
        await updateUserProfile({ walletAddress });
      }
    } else {
      await loginWithWalletAddress(walletAddress);
    }
  };

  const loginWithTwitter = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin + "/profile" : "/profile"
      }
    });
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setUser(null);
    persistSession(null);
  };

  const isAuthenticated = Boolean(user || profile);

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
      linkWalletToProfile
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
