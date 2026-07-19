"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWallet } from "./wallet-provider";
import { Search, Rocket, Wallet, Bell, User } from "lucide-react";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { openSidebar, pubKey } = useWallet();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (pathname === "/") return null;

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 40, width: "100%", background: "rgba(9, 9, 11, 0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <nav style={{ 
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px",
      }}>
        {/* Left Side: Page Context (Optional for TopBar) */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
           <div style={{ fontSize: "16px", fontWeight: 600, color: "#fff" }}>
             {pathname.replace('/', '').charAt(0).toUpperCase() + pathname.replace('/', '').slice(1)}
           </div>
        </div>

        {/* Right Side Tools */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div ref={searchRef} style={{ position: "relative" }}>
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleSearch}
              placeholder="Search assets (Press Enter)" 
              style={{ 
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px",
                padding: "6px 16px 6px 36px", fontSize: "12px", color: "#F4F4F5", width: "220px", outline: "none", transition: "all 0.2s"
              }} 
            />
            <Search size={14} color="#71717A" style={{ position: "absolute", left: "12px", top: "12px" }} />
            
            {/* Autocomplete Dropdown */}
            {isSearchOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", left: 0, width: "100%",
                background: "rgba(9, 9, 11, 0.5)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.5)", overflow: "hidden", zIndex: 100
              }}>
                <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "11px", color: "#A1A1AA", fontWeight: 600, textTransform: "uppercase" }}>
                  {searchQuery ? "Search Results" : "Trending Assets"}
                </div>
                <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                  {isSearching ? (
                    <div style={{ padding: "12px", fontSize: "12px", color: "#71717A", textAlign: "center" }}>Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((item, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                          router.push(`/trade?asset=${item.symbol.toUpperCase()}`);
                          setSearchQuery("");
                          setIsSearchOpen(false);
                        }}
                        style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.02)" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
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

          {/* Network Selector Mock */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.03)", padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}>
            <Rocket size={14} color="#F59E0B" />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>Stellar</span>
          </div>

          {/* Wallet Button */}
          <button 
            onClick={openSidebar}
            style={{ 
              background: "#3B82F6", border: "none", borderRadius: "6px",
              padding: "6px 16px", fontSize: "12px", fontWeight: 700, color: "#fff",
              display: "flex", alignItems: "center", gap: "8px", cursor: "pointer",
              transition: "transform 0.2s"
            }}
          >
            <Wallet size={14} color="#fff" />
            {pubKey ? `${pubKey.substring(0, 4)}...${pubKey.substring(pubKey.length - 4)}` : "Wallet"}
          </button>

          {/* Notifications */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              style={{ background: "transparent", border: "none", color: isNotifOpen ? "#fff" : "#A1A1AA", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px", transition: "color 0.2s" }} 
            >
              <Bell size={18} />
            </button>

            {/* Dropdown Panel */}
            {isNotifOpen && (
              <div style={{ 
                position: "absolute", top: "calc(100% + 12px)", right: 0, width: "320px",
                background: "rgba(9, 9, 11, 0.5)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px",
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
                      <div style={{ color: "#fff", fontSize: "12px", fontWeight: 600, marginBottom: "2px" }}>Limit Order Filled</div>
                      <div style={{ color: "#A1A1AA", fontSize: "11px", lineHeight: 1.4 }}>Your order to sell 500 XLM for USDC was completely filled.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.1)" }} />

          {/* Profile / Settings */}
          <button style={{ padding: "4px", background: "transparent", border: "none", color: "#A1A1AA", cursor: "pointer", display: "flex", alignItems: "center", transition: "color 0.2s" }}>
            <User size={18} />
          </button>
        </div>
      </nav>
    </div>
  );
}
