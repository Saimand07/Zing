import React from "react";

export default function NftPage() {
  return (
    <div style={{ padding: "24px", fontFamily: "var(--font-geist-sans)", minHeight: "100%", display: "flex", flexDirection: "column", gap: "24px", color: "#fff" }}>
      <div style={{ background: "rgba(17, 17, 19, 0.5)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>NFT Marketplace</h1>
        <p style={{ color: "#A1A1AA" }}>Discover, collect, and trade extraordinary NFTs.</p>
        
        <div style={{ marginTop: "32px", padding: "32px", textAlign: "center", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "8px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎨</div>
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>Coming Soon</h2>
          <p style={{ color: "#71717A", fontSize: "14px" }}>Our NFT marketplace is currently under development.</p>
        </div>
      </div>
    </div>
  );
}
