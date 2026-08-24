import Link from "next/link";
import { GLSLHills } from "@/components/ui/glsl-hills";

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: "#050505", minHeight: "100vh", color: "#fff", overflowX: "hidden", position: "relative" }}>
      
      {/* 3D GLSL Hills Background */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none", opacity: 1.0 }}>
        <GLSLHills width="100vw" height="100vh" />
      </div>

      {/* ── Top Navigation ── */}
      <nav
        className="glass"
        style={{
          position: "fixed",
          top: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "90%",
          maxWidth: "1200px",
          borderRadius: "70px",
          padding: "12px 24px",
          zIndex: 1000,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <img src="/logo.jpg" alt="ZING Logo" style={{ width: "32px", height: "32px", borderRadius: "10px", objectFit: "cover", boxShadow: "0 0 20px rgba(0, 229, 255, 0.4)" }} />
            <span style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff" }}>ZING</span>
          </Link>
          <div style={{ gap: "32px" }} className="hidden md:flex items-center">
            <Link href="/#ecosystem" className="nav-link">Ecosystem</Link>
            <Link href="/#stats" className="nav-link">Live Stats</Link>
            <Link href="/#agents" className="nav-link">AI Agents</Link>
            <Link href="/about" className="nav-link" style={{ color: "#fff" }}>About</Link>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="btn-primary"
          style={{ padding: "12px 28px", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}
        >
          Launch App
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </Link>
      </nav>

      {/* ── About Content ── */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
          padding: "160px 24px 80px 24px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1
            className="text-gradient"
            style={{
              fontSize: "clamp(3rem, 6vw, 5rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
              margin: "0 0 40px 0"
            }}
          >
            Empowering the Next Generation of DeFi
          </h1>
          
          <div className="glass-card" style={{ padding: "48px", textAlign: "left", marginBottom: "40px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px", color: "#fff" }}>Our Mission</h2>
            <p style={{ fontSize: "16px", color: "#A1A1AA", lineHeight: 1.8, marginBottom: "24px" }}>
              ZING was built on the fundamental belief that decentralized finance should be accessible, lightning-fast, and natively secure. By leveraging the Stellar network and Soroban smart contracts, we are eliminating the barriers to entry for both developers creating new assets and traders seeking deep liquidity.
            </p>
            <p style={{ fontSize: "16px", color: "#A1A1AA", lineHeight: 1.8 }}>
              We're not just another DEX. We're a comprehensive Web3 terminal providing one-click token launches, intelligent AI trading agents, cross-chain swaps, and engaging social quests. 
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", textAlign: "left" }}>
            <div className="glass-card" style={{ padding: "32px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", color: "#00E5FF" }}>Speed & Scale</h3>
              <p style={{ fontSize: "15px", color: "#A1A1AA", lineHeight: 1.6 }}>
                Settlement in 3-5 seconds with near-zero fees. ZING ensures you never miss a market move due to network congestion.
              </p>
            </div>
            <div className="glass-card" style={{ padding: "32px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", color: "#B534FF" }}>Fully Non-Custodial</h3>
              <p style={{ fontSize: "15px", color: "#A1A1AA", lineHeight: 1.6 }}>
                You hold your keys, always. Trade directly from your Stellar wallet via Freighter, seamlessly integrated into our terminal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="glass" style={{ padding: "48px 24px", position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.05)", borderRadius: "0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff" }}>
            ZING
          </div>
          <div style={{ display: "flex", gap: "32px" }}>
            <Link href="/dashboard" className="nav-link">Launch App</Link>
            <Link href="#" className="nav-link">Documentation</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
