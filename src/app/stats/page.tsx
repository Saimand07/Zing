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

export default async function StatsPage() {
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
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <img src="/logo.jpg" alt="ZING Logo" style={{ width: "32px", height: "32px", borderRadius: "10px", objectFit: "cover", boxShadow: "0 0 20px rgba(0, 229, 255, 0.4)" }} />
            <span style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff" }}>ZING</span>
          </Link>
          <div style={{ gap: "32px" }} className="hidden md:flex items-center">
            <Link href="/ecosystem" className="nav-link">Ecosystem</Link>
            <Link href="/stats" className="nav-link" style={{ color: "#fff" }}>Live Stats</Link>
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

      {/* ── Stats Content ── */}
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
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
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
            Live Zing Stats
          </h1>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", textAlign: "left", marginTop: "60px" }}>
            {[
              { label: "Live XLM/USDC Price", value: midPrice ? `$${parseFloat(midPrice).toFixed(4)}` : "—", highlight: "#00E5FF", desc: "Current midpoint price on Stellar DEX" },
              { label: "Active Projects", value: projectCount.toString(), highlight: "#B534FF", desc: "Total token launches on LaunchZone" },
              { label: "Live Campaigns", value: campaignCount.toString(), highlight: "#FF3366", desc: "Active community boost campaigns" },
              { label: "Competitions", value: competitionCount.toString(), highlight: "#00FF88", desc: "Ongoing trading and social competitions" },
            ].map((stat, i) => (
              <div key={i} className="glass-card" style={{ padding: "40px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: "150px", height: "150px", background: `radial-gradient(circle, ${stat.highlight}30 0%, rgba(0,0,0,0) 70%)`, filter: "blur(20px)" }} />
                <div style={{ fontSize: "3.5rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", marginBottom: "8px", textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>{stat.value}</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>{stat.label}</div>
                <div style={{ fontSize: "13px", color: "#71717A", lineHeight: 1.5 }}>{stat.desc}</div>
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
