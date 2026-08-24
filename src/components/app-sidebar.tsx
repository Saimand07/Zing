"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  TrendingUp,
  Rocket, 
  Image as ImageIcon, 
  Users, 
  Wallet,
  Settings,
  Trophy,
  Code,
  User,
  X,
  BarChart2,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "./auth-provider";

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    const handleClose = () => setIsOpen(false);
    
    window.addEventListener("toggleMobileMenu", handleToggle);
    window.addEventListener("closeMobileMenu", handleClose);
    
    return () => {
      window.removeEventListener("toggleMobileMenu", handleToggle);
      window.removeEventListener("closeMobileMenu", handleClose);
    };
  }, []);

  // Close sidebar on mobile when path changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Do not render sidebar on landing page
  if (pathname === "/") return null;

  const NavItem = ({ href, icon: Icon, label, disabled = false, badge = "" }: any) => {
    const isActive = pathname.startsWith(href) && href !== "/" && !disabled;
    return (
      <Link 
        href={disabled ? "#" : href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
          isActive 
            ? "bg-white/5 text-white" 
            : disabled 
              ? "text-zinc-600 cursor-not-allowed" 
              : "text-zinc-400 hover:bg-white/5 hover:text-white"
        }`}
      >
        <Icon size={18} className={isActive ? "text-blue-500" : disabled ? "text-zinc-600" : "text-zinc-500"} />
        <span className="flex-1">{label}</span>
        {badge && (
          <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
            {badge}
          </span>
        )}
        {disabled && (
          <span className="bg-zinc-800 text-zinc-400 text-[10px] px-1.5 py-0.5 rounded">
            SOON
          </span>
        )}
      </Link>
    );
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between px-3 mb-8">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors hover:bg-white/5">
          <img src="/logo.jpg" alt="Zing Logo" className="w-7 h-7 rounded-md object-cover shadow-[0_4px_12px_rgba(59,130,246,0.4)]" />
          <span className="text-[22px] font-extrabold text-white tracking-tight">Zing</span>
        </Link>
        {/* Mobile close button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden p-2 text-zinc-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-1 flex-1 overflow-y-auto scrollbar-hide">
        <div className="text-[11px] font-bold text-zinc-500 uppercase px-3 pt-3 pb-1 tracking-wider">Menu</div>
        <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem href="/analytics" icon={BarChart2} label="Analytics" />
        <NavItem href="/trade" icon={ArrowRightLeft} label="Trade (Spot)" />
        <NavItem href="/trade/predictions" icon={TrendingUp} label="Prediction Markets" badge="HOT" />
        <NavItem href="/perps" icon={ArrowRightLeft} label="Perps & Futures" disabled />
        <NavItem href="/launch" icon={Rocket} label="LaunchZone" />
        {pathname.startsWith("/launch") && (
          <div className="flex flex-col gap-1 ml-7 -mt-0.5 mb-2">
            <Link href="/launch" className={`text-[13px] px-3 py-1.5 rounded-md transition-all ${pathname === "/launch" ? "text-white bg-white/5" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}>LaunchBoard</Link>
            <Link href="/launch/create" className={`text-[13px] px-3 py-1.5 rounded-md transition-all ${pathname === "/launch/create" ? "text-white bg-white/5" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}>Launch New Token</Link>
          </div>
        )}
        <NavItem href="/nft" icon={ImageIcon} label="NFT" disabled />
        
        <div className="text-[11px] font-bold text-zinc-500 uppercase px-3 pt-6 pb-1 tracking-wider">Community</div>
        <NavItem href="/social-booster" icon={Users} label="Social Booster" />
        <NavItem href="/competitions" icon={Trophy} label="Competitions" />

        <div className="text-[11px] font-bold text-zinc-500 uppercase px-3 pt-6 pb-1 tracking-wider">Developers</div>
        <NavItem href="/contracts" icon={Code} label="Smart Contracts" />
      </div>

      <div className="mt-auto border-t border-white/5 pt-4 flex flex-col gap-1">
        <NavItem href="/profile" icon={User} label="User Profile" />
        <NavItem href="/wallet" icon={Wallet} label="My Wallet" />
        <NavItem href="/settings" icon={Settings} label="Settings" />
        {user?.email === "rajdivyanshu86@gmail.com" && (
          <NavItem href="/admin" icon={ShieldAlert} label="Admin Console" />
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay Background */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50
        w-[260px] h-[100dvh]
        bg-zinc-950/80 backdrop-blur-xl border-r border-white/5
        flex flex-col py-6 px-4
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <SidebarContent />
      </aside>
    </>
  );
}
