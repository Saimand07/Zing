"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Networks } from "@creit.tech/stellar-wallets-kit";
import { FreighterModule } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { AlbedoModule } from "@creit.tech/stellar-wallets-kit/modules/albedo";
import { xBullModule } from "@creit.tech/stellar-wallets-kit/modules/xbull";

import { fundWithFriendbot } from "../lib/stellar";
import { createStellarWallet } from "@/lib/wallet";
import { useAuth } from "./auth-provider";

import { useToast } from "@/components/toast-provider";

// Instantiate modules directly to bypass the singleton dual-package hazard in Next.js
const WALLET_MODULES: Record<string, any> = {
  freighter: typeof window !== "undefined" ? new FreighterModule() : null,
  albedo: typeof window !== "undefined" ? new AlbedoModule() : null,
  xbull: typeof window !== "undefined" ? new xBullModule() : null,
};

interface WalletContextType {
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  pubKey: string | null;
  setPubKey: (key: string | null) => void;
  connectWallet: (walletId: string) => Promise<void>;
  createNativeWallet: () => Promise<void>;
  getSupportedWallets: () => Promise<any[]>;
  disconnectWallet: () => void;
  activeWalletId: string | null;
  signTransaction: (xdr: string, network?: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pubKey, setPubKey] = useState<string | null>(null);
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  const { showToast } = useToast();
  const { user } = useAuth();

  // Restore session
  useEffect(() => {
    const saved = localStorage.getItem("zing_wallet_pubkey");
    const savedId = localStorage.getItem("zing_wallet_id");
    if (saved && savedId) {
      setPubKey(saved);
      setActiveWalletId(savedId);
    }
  }, []);

  const getSupportedWallets = async () => {
    // We already hardcoded the list in the sidebar, so this is just a fallback
    return [
      { id: "freighter", name: "Freighter", icon: "🦊" },
      { id: "albedo", name: "Albedo", icon: "🌒" },
      { id: "xbull", name: "xBull", icon: "🐂" }
    ];
  };

  const connectWallet = async (walletId: string) => {
    try {
      const module = WALLET_MODULES[walletId];
      if (!module) {
        throw new Error(`Wallet module for "${walletId}" is not initialized.`);
      }

      console.log(`Checking availability for ${walletId}...`);
      const available = await module.isAvailable();
      if (!available) {
        if (walletId === "freighter") {
          throw new Error("Freighter wallet extension is not installed. Please install it from the Chrome Web Store.");
        }
        throw new Error(`The ${walletId} wallet extension is not installed or not available.`);
      }

      console.log(`Connecting to ${walletId}...`);
      const result = module.getPublicKey ? await module.getPublicKey() : await module.getAddress();
      const address = typeof result === "string" ? result : (result?.address || result?.publicKey);

      if (!address) {
        throw new Error("Failed to retrieve address from wallet.");
      }
      
      setPubKey(address);
      setActiveWalletId(walletId);
      localStorage.setItem("zing_wallet_pubkey", address);
      localStorage.setItem("zing_wallet_id", walletId);
      setIsSidebarOpen(false);
      
      // Auto-fund on testnet
      fundWithFriendbot(address).catch(console.error);
    } catch (e: any) {
      console.error("Wallet connection error:", e);
      let errMsg = "Unknown error";
      if (typeof e === "string") errMsg = e;
      else if (e instanceof Error) errMsg = e.message;
      else if (e && e.error) errMsg = e.error;
      else if (e && e.message) errMsg = e.message;
      else if (e && typeof e === 'object' && Object.keys(e).length === 0) {
        errMsg = "User rejected the connection request.";
      } else {
        errMsg = "User declined connection or wallet not available";
      }

      showToast(`Wallet Connection Failed: ${errMsg}\n\nPlease ensure your wallet extension is installed and unlocked.`, "error");
    }
  };

  const createNativeWallet = async () => {
    if (!user) {
      showToast("Please log in with Twitter first to generate a native wallet.", "error");
      return;
    }
    try {
      const { publicKey } = await createStellarWallet(user.id);
      setPubKey(publicKey);
      setActiveWalletId("native");
      localStorage.setItem("zing_wallet_pubkey", publicKey);
      localStorage.setItem("zing_wallet_id", "native");
      setIsSidebarOpen(false);
      showToast("Native wallet generated successfully!", "success");
      
      // Auto-fund on testnet
      fundWithFriendbot(publicKey).catch(console.error);
    } catch (e: any) {
      console.error("Native wallet creation error:", e);
      showToast("Failed to create native wallet.", "error");
    }
  };

  const signTransaction = async (xdr: string, network: string = Networks.TESTNET) => {
    if (!activeWalletId) throw new Error("No wallet connected");
    const module = WALLET_MODULES[activeWalletId];
    if (!module) throw new Error("Wallet module not found");
    const result = await module.signTransaction(xdr, { networkPassphrase: network });
    return result.signedTxXdr || (typeof result === "string" ? result : result.signedXDR) || "";
  };

  const disconnectWallet = () => {
    setPubKey(null);
    setActiveWalletId(null);
    localStorage.removeItem("zing_wallet_pubkey");
    localStorage.removeItem("zing_wallet_id");
    setIsSidebarOpen(false);
  };

  return (
    <WalletContext.Provider
      value={{
        isSidebarOpen,
        openSidebar: () => setIsSidebarOpen(true),
        closeSidebar: () => setIsSidebarOpen(false),
        pubKey,
        setPubKey,
        connectWallet,
        createNativeWallet,
        getSupportedWallets,
        disconnectWallet,
        activeWalletId,
        signTransaction
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
