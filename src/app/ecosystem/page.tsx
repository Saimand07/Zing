import Link from "next/link";
import { GLSLHills } from "@/components/ui/glsl-hills";

export default function EcosystemPage() {
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
            <Link href="/ecosystem" className="nav-link" style={{ color: "#fff" }}>Ecosystem</Link>
            <Link href="/stats" className="nav-link">Live Stats</Link>
            <Link href="/agents" className="nav-link">AI Agents</Link>
            <Link href="/about" className="nav-link">About</Link>
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

      {/* ── Ecosystem Content ── */}
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
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
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
            The Zing Ecosystem
          </h1>
          
          <div className="glass-card" style={{ padding: "48px", textAlign: "left", marginBottom: "40px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px", color: "#fff" }}>Everything you need.</h2>
            <p style={{ fontSize: "16px", color: "#A1A1AA", lineHeight: 1.8, marginBottom: "24px" }}>
              Trade, Launch, and Grow with enterprise-grade infrastructure built for the retail trader. Zing combines the speed of Stellar with the smart contract capabilities of Soroban to provide a seamless Web3 experience.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", textAlign: "left" }}>
            <div className="glass-card" style={{ padding: "32px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(0, 119, 255, 0.2))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", border: "1px solid rgba(0, 229, 255, 0.3)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon></svg>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", color: "#fff" }}>Spot & Derivatives</h3>
              <p style={{ fontSize: "15px", color: "#A1A1AA", lineHeight: 1.6 }}>
                Access deep liquidity via the Stellar DEX and our Soroban-powered Prediction Markets. Real-time TradingView charts and native wallet execution.
              </p>
            </div>
            
            <div className="glass-card" style={{ padding: "32px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255, 51, 102, 0.15)", border: "1px solid rgba(255, 51, 102, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF3366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path></svg>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", color: "#fff" }}>LaunchZone</h3>
              <p style={{ fontSize: "15px", color: "#A1A1AA", lineHeight: 1.6 }}>
                Deploy Stellar assets or Soroban smart tokens instantly with 1-click bonding curve liquidity.
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
