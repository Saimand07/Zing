import Link from "next/link";
import { GLSLHills } from "@/components/ui/glsl-hills";

export default function AgentsPage() {
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
            <Link href="/ecosystem" className="nav-link">Ecosystem</Link>
            <Link href="/stats" className="nav-link">Live Stats</Link>
            <Link href="/agents" className="nav-link" style={{ color: "#fff" }}>AI Agents</Link>
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

      {/* ── Agents Content ── */}
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
          <div className="animate-float" style={{ display: "inline-flex", alignItems: "center", gap: "12px", padding: "8px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "100px", fontSize: "12px", fontWeight: 600, color: "#fff", marginBottom: "24px", boxShadow: "0 0 30px rgba(0,0,0,0.5)", backdropFilter: "blur(10px)" }}>
            <span style={{ width: "8px", height: "8px", background: "#00E5FF", borderRadius: "50%", boxShadow: "0 0 10px #00E5FF" }} className="animate-glow" />
            DeFi 2.0 Engine
          </div>

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
            AI Agent Network
          </h1>
          
          <div className="glass-card" style={{ padding: "64px", background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)", overflow: "hidden", position: "relative", textAlign: "left", marginBottom: "40px" }}>
            <div style={{ position: "absolute", right: "-10%", bottom: "-20%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(181, 52, 255, 0.15) 0%, rgba(0,0,0,0) 70%)", filter: "blur(40px)" }} />
            <h3 style={{ fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "16px", color: "#fff" }}>Intent-Based Trading</h3>
            <p style={{ color: "#A1A1AA", fontSize: "1.2rem", lineHeight: 1.6, maxWidth: "600px", marginBottom: "32px" }}>
              Execute complex cross-chain intents automatically. Stop worrying about slippage, MEV attacks, and gas fees. Zing's Soroban architecture lets you simply declare what you want, and an off-chain network of AI solvers competes to give you the best price.
            </p>
            <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "24px", fontFamily: "var(--font-geist-mono)", fontSize: "14px", color: "#A1A1AA", maxWidth: "600px" }}>
              <span style={{ color: "#B534FF" }}>const</span> intent = <span style={{ color: "#B534FF" }}>await</span> nearIntents.submit({`{`}<br/>
              &nbsp;&nbsp;type: <span style={{ color: "#00E5FF" }}>'cross-chain-swap'</span>,<br/>
              &nbsp;&nbsp;amount: <span style={{ color: "#00FF88" }}>1000</span><br/>
              {"});"}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", textAlign: "left" }}>
            {[
              {
                title: "1. Sign Intent",
                desc: "User cryptographically signs their desired outcome (e.g. 'I want 100 USDC for my 500 XLM'). No gas required.",
              },
              {
                title: "2. Solvers Compete",
                desc: "Institutional AI market makers compete in a decentralized Dutch Auction to fill your intent at the best price.",
              },
              {
                title: "3. Atomic Settlement",
                desc: "The winning solver submits the transaction to the Stellar network, paying all gas fees on your behalf.",
              }
            ].map((step, i) => (
              <div key={i} className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", color: "#fff" }}>{step.title}</h3>
                <p style={{ color: "#A1A1AA", lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
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
