import Link from "next/link";
import { fetchOrderBook, getMidPrice } from "@/lib/stellar";
import { supabase } from "@/lib/supabase";
import { GLSLHills } from "@/components/ui/glsl-hills";

async function getLiveData() {
  let midPrice: string | null = null;
  try {
    const ob = await fetchOrderBook(5);
    midPrice = getMidPrice(ob);
  } catch { /* ignore */ }

  const [projectsRes, campaignsRes, competitionsRes] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("campaigns").select("id", { count: "exact", head: true }),
    supabase.from("competitions").select("id", { count: "exact", head: true }),
  ]);

  return {
    midPrice,
    projectCount: projectsRes.count ?? 0,
    campaignCount: campaignsRes.count ?? 0,
    competitionCount: competitionsRes.count ?? 0,
  };
}

export default async function HomePage() {
  const { midPrice, projectCount, campaignCount, competitionCount } = await getLiveData();

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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="/logo.jpg" alt="ZING Logo" style={{ width: "32px", height: "32px", borderRadius: "10px", objectFit: "cover", boxShadow: "0 0 20px rgba(0, 229, 255, 0.4)" }} />
            <span style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff" }}>ZING</span>
          </div>
          <div style={{ gap: "32px" }} className="hidden md:flex items-center">
            <Link href="#ecosystem" className="nav-link">Ecosystem</Link>
            <Link href="#stats" className="nav-link">Live Stats</Link>
            <Link href="#agents" className="nav-link">AI Agents</Link>
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

      {/* ── Hero Section ── */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "160px 24px 80px 24px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="animate-float" style={{ display: "inline-flex", alignItems: "center", gap: "12px", padding: "8px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "100px", fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "32px", boxShadow: "0 0 30px rgba(0,0,0,0.5)", backdropFilter: "blur(10px)" }}>
          <span style={{ width: "8px", height: "8px", background: "#00E5FF", borderRadius: "50%", boxShadow: "0 0 10px #00E5FF" }} className="animate-glow" />
          Powered by Stellar & Soroban
        </div>
        
        <h1
          className="text-gradient"
          style={{
            fontSize: "clamp(3.5rem, 8vw, 7.5rem)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            margin: "0 0 32px 0",
            maxWidth: "1000px"
          }}
        >
          The Ultimate Web3<br />Trading Terminal
        </h1>
        
        <p
          style={{
            fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
            color: "#A1A1AA",
            lineHeight: 1.6,
            maxWidth: "700px",
            margin: "0 auto 48px auto",
            fontWeight: 400,
          }}
        >
          Chain-abstracted infrastructure for launching tokens, trading deep liquidity, and executing intents across Stellar and beyond.
        </p>

        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <Link
            href="/dashboard"
            className="btn-primary"
            style={{ padding: "18px 42px", textDecoration: "none", fontSize: "18px", display: "flex", alignItems: "center", gap: "12px" }}
          >
            Start Trading
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </Link>
        </div>
      </section>

      {/* ── Live Stats Section ── */}
      <section id="stats" style={{ padding: "80px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {[
              { label: "Live XLM/USDC Price", value: midPrice ? `$${parseFloat(midPrice).toFixed(4)}` : "—", highlight: "#00E5FF" },
              { label: "Active Projects", value: projectCount.toString(), highlight: "#B534FF" },
              { label: "Live Campaigns", value: campaignCount.toString(), highlight: "#FF3366" },
              { label: "Competitions", value: competitionCount.toString(), highlight: "#00FF88" },
            ].map((stat, i) => (
              <div key={i} className="glass-card" style={{ padding: "40px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: "150px", height: "150px", background: `radial-gradient(circle, ${stat.highlight}30 0%, rgba(0,0,0,0) 70%)`, filter: "blur(20px)" }} />
                <div style={{ fontSize: "3.5rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", marginBottom: "8px", textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>{stat.value}</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="ecosystem" style={{ padding: "120px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <h2 className="text-gradient" style={{ fontSize: "4rem", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: "24px" }}>Everything you need.</h2>
            <p style={{ color: "#A1A1AA", fontSize: "1.3rem", maxWidth: "600px", margin: "0 auto" }}>Trade, Launch, and Grow with enterprise-grade infrastructure built for the retail trader.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px", marginBottom: "24px" }}>
            <div className="glass-card" style={{ padding: "64px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(0, 119, 255, 0.2))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "32px", border: "1px solid rgba(0, 229, 255, 0.3)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon><line x1="12" y1="22" x2="12" y2="15.5"></line><polyline points="22 8.5 12 15.5 2 8.5"></polyline><polyline points="2 15.5 12 8.5 22 15.5"></polyline><line x1="12" y1="2" x2="12" y2="8.5"></line></svg>
              </div>
              <h3 style={{ fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "16px" }}>Spot & Derivatives</h3>
              <p style={{ color: "#A1A1AA", fontSize: "1.2rem", lineHeight: 1.6, maxWidth: "500px" }}>Access deep liquidity via the Stellar DEX and our Soroban-powered Prediction Markets. Real-time TradingView charts and native wallet execution.</p>
            </div>
            
            <div className="glass-card" style={{ padding: "64px", background: "url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop') center/cover", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #050505, rgba(5,5,5,0.4))", borderRadius: "24px" }} />
              <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <h3 style={{ fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "16px" }}>LaunchZone</h3>
                <p style={{ color: "#ccc", fontSize: "1.1rem", lineHeight: 1.6 }}>Deploy Stellar assets or Soroban smart tokens instantly with 1-click.</p>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px" }}>
            <div className="glass-card" style={{ padding: "64px" }}>
               <h3 style={{ fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "16px" }}>Social Booster</h3>
               <p style={{ color: "#A1A1AA", fontSize: "1.1rem", lineHeight: 1.6 }}>Grow your community through gamified, AI-scored mindshare quests on X.</p>
            </div>
            
            <div className="glass-card" style={{ padding: "64px", background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", right: "-10%", bottom: "-20%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(181, 52, 255, 0.15) 0%, rgba(0,0,0,0) 70%)", filter: "blur(40px)" }} />
              <h3 style={{ fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "16px" }}>AI Agent Network</h3>
              <p style={{ color: "#A1A1AA", fontSize: "1.2rem", lineHeight: 1.6, maxWidth: "500px", marginBottom: "32px" }}>Execute complex cross-chain intents automatically. Our solver network integrates NEAR, Axelar, and Circle CCTP seamlessly.</p>
              <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "24px", fontFamily: "var(--font-geist-mono)", fontSize: "14px", color: "#A1A1AA" }}>
                <span style={{ color: "#B534FF" }}>const</span> intent = <span style={{ color: "#B534FF" }}>await</span> nearIntents.submit({`{`}<br/>
                &nbsp;&nbsp;type: <span style={{ color: "#00E5FF" }}>'cross-chain-swap'</span>,<br/>
                &nbsp;&nbsp;amount: <span style={{ color: "#00FF88" }}>1000</span><br/>
                {"});"}
              </div>
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
