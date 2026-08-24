"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Rocket, 
  Image as ImageIcon, 
  Users, 
  Wallet,
  Settings,
  Trophy,
  Code
} from "lucide-react";

export default function AppSidebar() {
  const pathname = usePathname();

  // Do not render sidebar on landing page
  if (pathname === "/") return null;

  const NavItem = ({ href, icon: Icon, label, disabled = false, badge = "" }: any) => {
    const isActive = pathname.startsWith(href) && href !== "/" && !disabled;
    return (
      <Link 
        href={disabled ? "#" : href}
        style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "10px 12px", borderRadius: "8px",
          color: isActive ? "#fff" : (disabled ? "#52525B" : "#A1A1AA"),
          background: isActive ? "rgba(255,255,255,0.05)" : "transparent",
          textDecoration: "none", fontSize: "14px", fontWeight: 500,
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.2s"
        }}
        className={!disabled ? "sidebar-hover" : ""}
      >
        <Icon size={18} color={isActive ? "#3B82F6" : (disabled ? "#52525B" : "#71717A")} />
        <span style={{ flex: 1 }}>{label}</span>
        {badge && (
          <span style={{ background: "#3B82F6", color: "#fff", fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
            {badge}
          </span>
        )}
        {disabled && (
          <span style={{ background: "#27272A", color: "#A1A1AA", fontSize: "10px", padding: "2px 6px", borderRadius: "4px" }}>
            SOON
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside style={{
      width: "260px",
      height: "100vh",
      position: "sticky",
      top: 0,
      background: "rgba(9, 9, 11, 0.5)", backdropFilter: "blur(12px)",
      borderRight: "1px solid rgba(255,255,255,0.05)",
      display: "flex",
      flexDirection: "column",
      padding: "24px 16px"
    }}>
      <div style={{ padding: "0 12px", marginBottom: "32px" }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", padding: "8px 12px", borderRadius: "12px", transition: "background 0.2s" }} className="hover-bg">
          <img src="/logo.jpg" alt="Zing Logo" style={{ width: "28px", height: "28px", borderRadius: "6px", objectFit: "cover", boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)" }} />
          <span style={{ fontSize: "22px", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Zing</span>
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#52525B", textTransform: "uppercase", padding: "12px 12px 4px 12px", letterSpacing: "0.05em" }}>Menu</div>
        <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem href="/trade" icon={ArrowRightLeft} label="Trade (Spot)" />
        <NavItem href="/perps" icon={ArrowRightLeft} label="Perps & Futures" disabled />
        <NavItem href="/launch" icon={Rocket} label="LaunchZone" />
        {pathname.startsWith("/launch") && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginLeft: "28px", marginTop: "-2px", marginBottom: "8px" }}>
            <Link href="/launch" style={{ color: pathname === "/launch" ? "#fff" : "#71717A", fontSize: "13px", textDecoration: "none", padding: "6px 12px", borderRadius: "6px", background: pathname === "/launch" ? "rgba(255,255,255,0.05)" : "transparent", transition: "all 0.2s" }} className="sidebar-hover-text">LaunchBoard</Link>
            <Link href="/launch/create" style={{ color: pathname === "/launch/create" ? "#fff" : "#71717A", fontSize: "13px", textDecoration: "none", padding: "6px 12px", borderRadius: "6px", background: pathname === "/launch/create" ? "rgba(255,255,255,0.05)" : "transparent", transition: "all 0.2s" }} className="sidebar-hover-text">Launch New Token</Link>
          </div>
        )}
        <NavItem href="/nft" icon={ImageIcon} label="NFT" disabled />
        
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#52525B", textTransform: "uppercase", padding: "24px 12px 4px 12px", letterSpacing: "0.05em" }}>Community</div>
        <NavItem href="/social-booster" icon={Users} label="Social Booster" />
        <NavItem href="/competitions" icon={Trophy} label="Competitions" />

        <div style={{ fontSize: "11px", fontWeight: 700, color: "#52525B", textTransform: "uppercase", padding: "24px 12px 4px 12px", letterSpacing: "0.05em" }}>Developers</div>
        <NavItem href="/contracts" icon={Code} label="Smart Contracts" />
      </div>

      <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
        <NavItem href="/wallet" icon={Wallet} label="My Wallet" />
        <NavItem href="/settings" icon={Settings} label="Settings" />
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .sidebar-hover:hover { background: rgba(255,255,255,0.03) !important; color: #fff !important; }
        .sidebar-hover:hover svg { color: #fff !important; }
        .sidebar-hover-text:hover { color: #fff !important; }
      `}} />
    </aside>
  );
}
