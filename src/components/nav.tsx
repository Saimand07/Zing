"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useWallet } from "./wallet-provider";
import { useAuth } from "./auth-provider";
import { 
  Search, 
  Rocket, 
  Wallet, 
  Bell, 
  User, 
  LogOut, 
  CheckCircle2, 
  ExternalLink, 
  ChevronDown,
  ShieldCheck,
  Activity,
  Menu
} from "lucide-react";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { openSidebar, pubKey, disconnectWallet } = useWallet();
  const { user, profile, isAuthenticated, logout } = useAuth();
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/trade?asset=${searchQuery.trim().toUpperCase()}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  useEffect(() => {
    const fetchSearch = async () => {
      if (!searchQuery.trim()) {
        try {
          const res = await fetch("https://api.coingecko.com/api/v3/search/trending");
          const data = await res.json();
          setSearchResults(data.coins?.slice(0, 5).map((c: any) => c.item) || []);
        } catch (e) {}
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${searchQuery}`);
        const data = await res.json();
        setSearchResults(data.coins?.slice(0, 5) || []);
      } catch (e) {
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(fetchSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeAddress = pubKey || profile?.walletAddress;
  const displayName = profile?.username || (user ? user.email?.split("@")[0] : activeAddress ? `Stellar_${activeAddress.slice(-4)}` : "Trader") || "Trader";

  // Don't render nav on auth page — it has its own standalone layout
  if (pathname === "/auth") return null;

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 40 }}>
      <nav style={{
        height: "64px",
        background: "rgba(9, 9, 11, 0.6)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}>
        {/* Left Side: Mobile Menu & Search */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, maxWidth: "480px" }}>
          <button
            onClick={() => window.dispatchEvent(new Event("toggleMobileMenu"))}
            className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white flex-shrink-0"
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
          >
            <Menu size={20} />
          </button>
          <div ref={searchRef} style={{ position: "relative", width: "100%" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "8px",
              padding: "6px 12px",
              width: "100%",
            }}>
              <Search size={14} color="#71717A" />
              <input
                type="text"
                placeholder="Search assets, markets, or intents..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={handleSearch}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: "13px",
                  width: "100%",
                }}
              />
            </div>

            {/* Search Dropdown */}
            {isSearchOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                right: 0,
                background: "rgba(17, 17, 19, 0.95)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                overflow: "hidden",
                zIndex: 100,
              }}>
                <div style={{ padding: "8px 12px", fontSize: "11px", fontWeight: 600, color: "#71717A", textTransform: "uppercase" }}>
                  {searchQuery ? "Search Results" : "Trending Markets"}
                </div>
                <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                  {searchResults.length > 0 ? (
                    searchResults.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          router.push(`/trade?asset=${item.symbol.toUpperCase()}`);
                          setIsSearchOpen(false);
                        }}
                        style={{
                          padding: "10px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          cursor: "pointer",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.02)",
                          transition: "background 0.2s",
                        }}
                        className="hover-bg"
                      >
                        <img src={item.thumb || item.large} alt={item.symbol} style={{ width: "20px", height: "20px", borderRadius: "50%" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{item.symbol.toUpperCase()}</div>
                          <div style={{ fontSize: "11px", color: "#71717A" }}>{item.name}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "12px", fontSize: "12px", color: "#71717A", textAlign: "center" }}>No assets found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Navigation & Session Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          
          {/* Network Selector */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.03)", padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <Rocket size={14} color="#F59E0B" />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>Stellar Testnet</span>
          </div>

          {/* Wallet Button */}
          <button 
            onClick={openSidebar}
            style={{ 
              background: activeAddress ? "rgba(59, 130, 246, 0.15)" : "#3B82F6",
              border: `1px solid ${activeAddress ? "rgba(59, 130, 246, 0.4)" : "transparent"}`,
              borderRadius: "6px",
              padding: "6px 14px", fontSize: "12px", fontWeight: 600, 
              color: activeAddress ? "#60A5FA" : "#fff",
              display: "flex", alignItems: "center", gap: "8px", cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <Wallet size={14} color={activeAddress ? "#60A5FA" : "#fff"} />
            {activeAddress ? `${activeAddress.substring(0, 4)}...${activeAddress.substring(activeAddress.length - 4)}` : "Connect Wallet"}
          </button>

          {/* Notifications Dropdown */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              style={{ background: "transparent", border: "none", color: isNotifOpen ? "#fff" : "#A1A1AA", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px", transition: "color 0.2s" }} 
            >
              <Bell size={18} />
            </button>

            {isNotifOpen && (
              <div style={{ 
                position: "absolute", top: "calc(100% + 12px)", right: 0, width: "320px",
                background: "rgba(17, 17, 19, 0.95)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.5)", overflow: "hidden", zIndex: 100 
              }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#fff", fontSize: "13px", fontWeight: 600 }}>Notifications</span>
                  <button onClick={() => setIsNotifOpen(false)} style={{ background: "transparent", border: "none", color: "#A1A1AA", fontSize: "11px", cursor: "pointer" }}>Mark read</button>
                </div>
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.02)", display: "flex", gap: "12px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3B82F6", marginTop: "4px" }} />
                    <div>
                      <div style={{ color: "#fff", fontSize: "12px", fontWeight: 600, marginBottom: "2px" }}>Stellar Testnet Connected</div>
                      <div style={{ color: "#A1A1AA", fontSize: "11px", lineHeight: 1.4 }}>Prediction markets and Intent Swap contract active on Soroban.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }} />

          {/* User Session & Profile Menu */}
          <div ref={profileRef} style={{ position: "relative" }}>
            {isAuthenticated ? (
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "20px",
                  padding: "4px 10px 4px 4px",
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 600,
                  transition: "all 0.2s"
                }}
              >
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg, #3B82F6, #10B981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700 }}>
                  {(displayName || "Z")[0]?.toUpperCase() || "Z"}
                </div>
                <span style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {displayName}
                </span>
                <ChevronDown size={12} color="#71717A" />
              </button>
            ) : (
              <Link
                href="/auth"
                style={{
                  background: "#27272A",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "6px",
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#fff",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <User size={13} />
                Sign In
              </Link>
            )}

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && isAuthenticated && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                width: "260px",
                background: "rgba(17, 17, 19, 0.96)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "10px",
                boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
                padding: "12px",
                zIndex: 100
              }}>
                {/* Header info */}
                <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px", marginBottom: "8px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{displayName}</div>
                  <div style={{ fontSize: "11px", color: "#71717A", marginTop: "2px" }}>
                    {user?.email || (activeAddress ? `${activeAddress.slice(0, 10)}...${activeAddress.slice(-6)}` : "Web3 Session")}
                  </div>
                  {activeAddress && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "2px 6px", borderRadius: "4px", marginTop: "6px" }}>
                      <CheckCircle2 size={10} />
                      Stellar Wallet Linked
                    </div>
                  )}
                </div>

                {/* Menu items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <Link
                    href="/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      color: "#E4E4E7",
                      textDecoration: "none",
                      fontSize: "12px",
                      fontWeight: 500,
                      transition: "background 0.2s"
                    }}
                    className="hover-bg"
                  >
                    <User size={14} color="#3B82F6" />
                    User Profile & Ledger
                  </Link>

                  <Link
                    href="/trade/predictions"
                    onClick={() => setIsProfileMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      color: "#E4E4E7",
                      textDecoration: "none",
                      fontSize: "12px",
                      fontWeight: 500,
                      transition: "background 0.2s"
                    }}
                    className="hover-bg"
                  >
                    <Activity size={14} color="#10B981" />
                    My Prediction Stakes
                  </Link>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      openSidebar();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      color: "#E4E4E7",
                      background: "transparent",
                      border: "none",
                      width: "100%",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "background 0.2s"
                    }}
                    className="hover-bg"
                  >
                    <Wallet size={14} color="#A855F7" />
                    Wallet Settings
                  </button>

                  <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "6px 0" }} />

                  <button
                    onClick={async () => {
                      setIsProfileMenuOpen(false);
                      await logout();
                      disconnectWallet();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      color: "#EF4444",
                      background: "transparent",
                      border: "none",
                      width: "100%",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "background 0.2s"
                    }}
                    className="hover-bg"
                  >
                    <LogOut size={14} />
                    Sign Out & Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </nav>
    </div>
  );
}
