"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useWallet } from "./wallet-provider";

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  walletAddress?: string;
  twitterHandle?: string;
  bio?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, pass: string, username: string) => Promise<{ error?: string }>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithTwitter: () => Promise<void>;
  linkWalletToProfile: (walletAddress: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or create profile
  const loadProfile = async (currentUser: User) => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        if (data && !error) {
          setProfile({
            id: data.id,
            username: data.username || currentUser.email?.split("@")[0] || "Trader",
            email: data.email || currentUser.email,
            avatarUrl: data.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            walletAddress: data.wallet_address || "",
            twitterHandle: data.twitter_handle || "",
            bio: data.bio || "DeFi & Prediction Market Enthusiast on Stellar",
            createdAt: data.created_at || new Date().toISOString()
          });
          return;
        }

        // If no profile row yet, create default
        const newProfile: UserProfile = {
          id: currentUser.id,
          username: currentUser.email?.split("@")[0] || "ZingTrader",
          email: currentUser.email,
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          walletAddress: "",
          twitterHandle: "",
          bio: "DeFi & Prediction Market Enthusiast on Stellar",
          createdAt: new Date().toISOString()
        };

        await supabase.from("user_profiles").insert({
          id: newProfile.id,
          username: newProfile.username,
          email: newProfile.email,
          avatar_url: newProfile.avatarUrl,
          bio: newProfile.bio,
          created_at: newProfile.createdAt
        });

        setProfile(newProfile);
      }
    } catch (e) {
      console.warn("Profile load fallback:", e);
      // Fallback local profile
      setProfile({
        id: currentUser.id,
        username: currentUser.email?.split("@")[0] || "Trader",
        email: currentUser.email,
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        walletAddress: "",
        twitterHandle: "",
        bio: "DeFi & Prediction Market Enthusiast on Stellar",
        createdAt: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadProfile(currentUser);
      } else {
        setProfile(null);
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
      if (data.user) loadProfile(data.user);
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
      if (data.user) loadProfile(data.user);
      return {};
    } catch (e: any) {
      return { error: e.message || "Failed to sign up" };
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user || !profile) return false;
    const updated = { ...profile, ...updates };
    setProfile(updated);

    try {
      if (supabase) {
        await supabase.from("user_profiles").upsert({
          id: user.id,
          username: updated.username,
          avatar_url: updated.avatarUrl,
          wallet_address: updated.walletAddress,
          twitter_handle: updated.twitterHandle,
          bio: updated.bio
        });
      }
      return true;
    } catch (err) {
      console.error("Failed to update profile in DB:", err);
      return true;
    }
  };

  const linkWalletToProfile = async (walletAddress: string) => {
    if (profile && profile.walletAddress !== walletAddress) {
      await updateUserProfile({ walletAddress });
      
      // Also register in stellar_accounts table
      try {
        if (supabase && user) {
          await supabase.from("stellar_accounts").insert({
            user_id: user.id,
            public_key: walletAddress,
            account_type: "user"
          });
        }
      } catch (err) {
        console.warn("Could not insert to stellar_accounts:", err);
      }
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
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signInWithEmail, 
      signUpWithEmail, 
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
