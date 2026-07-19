"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const MOCK_PROJECTS = [
  { id: '1', name: 'Zing Dex', symbol: 'ZING', metadata: { category: 'DeFi', logo: '' } },
  { id: '2', name: 'Pepe', symbol: 'PEPE', metadata: { category: 'Meme', logo: '' } },
  { id: '3', name: 'Arbitrum AI', symbol: 'ARBAI', metadata: { category: 'AI Agent', logo: '' } },
  { id: '4', name: 'RWA Estate', symbol: 'RWAE', metadata: { category: 'RWA', logo: '' } }
];

export default function LaunchBoardPage() {
  const [projects, setProjects] = useState<any[]>(MOCK_PROJECTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      // 1. Fetch from Supabase (if configured)
      let dbProjects = [];
      try {
        if (supabase) {
          const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(20);
          if (data && data.length > 0) dbProjects = data;
        }
      } catch(e) {}

      // 2. Fetch from localStorage
      let localProjects = [];
      try {
        const stored = localStorage.getItem('zing_local_projects');
        if (stored) localProjects = JSON.parse(stored);
      } catch(e) {}

      // 3. Merge and deduplicate by symbol, or just prepend local ones
      let all = [...localProjects, ...dbProjects];
      if (all.length === 0) all = MOCK_PROJECTS;
      
      setProjects(all);
      setIsLoading(false);
    }
    loadProjects();
  }, []);

  return (
    <div style={{ padding: "0", fontFamily: "var(--font-geist-sans)", background: "rgba(9, 9, 11, 0.5)", backdropFilter: "blur(12px)", minHeight: "100%", display: "flex", flexDirection: "column" }}>
      
      {/* Top Banners */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", padding: "24px" }}>
        <div style={{ background: "linear-gradient(135deg, #0A1128, #0B1930)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "12px", padding: "16px", position: "relative", overflow: "hidden" }}>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Zing</div>
          <div style={{ fontSize: "13px", color: "#A1A1AA" }}>Season 2 is Live</div>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginTop: "16px", background: "rgba(59,130,246,0.1)", display: "inline-block", padding: "6px 12px", borderRadius: "16px" }}>
            $1,000,000 Share Awaits!
          </div>
        </div>
        <div style={{ background: "linear-gradient(135deg, #111827, #030712)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "16px" }}>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Zing</div>
          <div style={{ fontSize: "13px", color: "#A1A1AA", marginBottom: "16px" }}>Explore Zing and Get</div>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#F59E0B" }}>Your $50 💸 Bonus Now!</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, #451A03, #27272A)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "12px", padding: "16px" }}>
           <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Core</div>
          <div style={{ fontSize: "13px", color: "#A1A1AA", lineHeight: "1.4" }}>Explore Core Blockchain Is Available</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, #1E1B4B, #0F172A)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "12px", padding: "16px" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Scroll</div>
          <div style={{ fontSize: "13px", color: "#A1A1AA", lineHeight: "1.4" }}>Network Now Live!</div>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{ textAlign: "center", padding: "60px 24px", position: "relative", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <h1 style={{ fontSize: "40px", fontWeight: 700, color: "#fff", marginBottom: "24px", letterSpacing: "-1px" }}>Launch Everything & Everywhere</h1>
        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
          <Link href="/launch/create" style={{ background: "#fff", color: "#000", padding: "12px 24px", borderRadius: "8px", fontWeight: 700, fontSize: "15px", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
            🚀 Launch Now
          </Link>
          <button style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "12px 24px", borderRadius: "8px", fontWeight: 600, fontSize: "15px", cursor: "pointer" }}>
            How it Works?
          </button>
        </div>
      </div>

      {/* Token List */}
      <div style={{ padding: "24px" }}>
        
        {/* Filters bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", padding: "12px 20px", background: "rgba(17, 17, 19, 0.5)", backdropFilter: "blur(12px)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
           <input type="text" placeholder="Search tokens by name or contract" style={{ background: "transparent", border: "none", color: "#fff", fontSize: "14px", width: "300px", outline: "none" }} />
           <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.1)", margin: "0 8px" }} />
           <div style={{ display: "flex", gap: "12px" }}>
             {["Meme", "AI Agent", "DeFi", "Gaming"].map(c => (
               <div key={c} style={{ fontSize: "13px", color: "#A1A1AA", fontWeight: 500, cursor: "pointer", padding: "4px 12px", borderRadius: "16px", background: "rgba(255,255,255,0.03)" }}>{c}</div>
             ))}
           </div>
        </div>

        {/* Table */}
        <div style={{ background: "rgba(17, 17, 19, 0.5)", backdropFilter: "blur(12px)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#71717A", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "11px" }}>
                <th style={{ padding: "16px", fontWeight: 600 }}>Token</th>
                <th style={{ padding: "16px", fontWeight: 600, textAlign: "center" }}>Updated</th>
                <th style={{ padding: "16px", fontWeight: 600, textAlign: "right" }}>MarketCap</th>
                <th style={{ padding: "16px", fontWeight: 600, textAlign: "right" }}>Price</th>
                <th style={{ padding: "16px", fontWeight: 600, textAlign: "right" }}>24h %</th>
                <th style={{ padding: "16px", fontWeight: 600, textAlign: "center" }}>Chart</th>
                <th style={{ padding: "16px", fontWeight: 600, textAlign: "right" }}>Swaps</th>
                <th style={{ padding: "16px", fontWeight: 600, textAlign: "right" }}>Holders</th>
                <th style={{ padding: "16px", fontWeight: 600, textAlign: "right" }}>Liquidity</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)", transition: "background 0.2s" }} className="row-hover">
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {p.metadata?.logo ? (
                         <img src={p.metadata.logo} alt={p.symbol} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                         <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "11px" }}>{p.symbol?.substring(0,3)}</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: "#fff", fontSize: "14px" }}>{p.name} <span style={{ color: "#71717A", fontWeight: 400 }}>/{p.symbol}</span></div>
                        <div style={{ fontSize: "11px", color: "#A1A1AA", display: "flex", alignItems: "center", gap: "4px" }}>
                           <span style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px" }}>{p.metadata?.category || "Token"}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px", color: "#A1A1AA", textAlign: "center" }}>Just now</td>
                  <td style={{ padding: "16px", color: "#fff", fontWeight: 500, fontFamily: "var(--font-geist-mono)", textAlign: "right" }}>$10.00K</td>
                  <td style={{ padding: "16px", color: "#fff", fontWeight: 500, fontFamily: "var(--font-geist-mono)", textAlign: "right" }}>$0.0100</td>
                  <td style={{ padding: "16px", fontWeight: 600, color: "#10B981", fontFamily: "var(--font-geist-mono)", textAlign: "right" }}>+5.0%</td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                     <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
                       <path d="M0,15 Q10,20 20,10 T40,5 T60,0" stroke="#10B981" strokeWidth="1.5" />
                     </svg>
                  </td>
                  <td style={{ padding: "16px", color: "#E4E4E7", fontWeight: 500, fontFamily: "var(--font-geist-mono)", textAlign: "right" }}>12</td>
                  <td style={{ padding: "16px", color: "#E4E4E7", fontWeight: 500, fontFamily: "var(--font-geist-mono)", textAlign: "right" }}>3</td>
                  <td style={{ padding: "16px", color: "#E4E4E7", fontWeight: 500, fontFamily: "var(--font-geist-mono)", textAlign: "right" }}>$5.00K</td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "32px", color: "#A1A1AA" }}>No tokens launched yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .row-hover:hover { background-color: rgba(255,255,255,0.03) !important; cursor: pointer; }
      `}} />
    </div>
  );
}
