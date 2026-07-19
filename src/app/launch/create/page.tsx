"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useWallet } from "@/components/wallet-provider";
import { useToast } from "@/components/toast-provider";
import { createAndFundIssuer, buildTrustlineTx, submitTx, buildAndSignMintTx } from "@/lib/stellar-launch";
import { Networks } from "@stellar/stellar-sdk";
import { supabase } from "@/lib/supabase";

export default function LaunchNewTokenPage() {
  const { pubKey, signTransaction } = useWallet();
  const { showToast } = useToast();
  
  const [category, setCategory] = useState("Meme");
  const [tokenType, setTokenType] = useState<"sac" | "classic">("sac");
  const [network, setNetwork] = useState("Stellar");
  
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [supply, setSupply] = useState("");
  const [description, setDescription] = useState("");
  
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [bannerBase64, setBannerBase64] = useState<string | null>(null);
  
  const [website, setWebsite] = useState("");
  const [telegram, setTelegram] = useState("");
  const [twitter, setTwitter] = useState("");
  
  const [isLaunching, setIsLaunching] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [launchResult, setLaunchResult] = useState<{ issuer: string; asset: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 1024 * 1024) {
      showToast("File size must be less than 1MB", "error");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (type === 'logo') setLogoBase64(event.target?.result as string);
      else setBannerBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLaunch = async () => {
    if (!pubKey) {
      showToast("Please connect your wallet first.", "error");
      return;
    }
    if (!name || !symbol || !supply) {
      showToast("Please fill in all required token details.", "error");
      return;
    }
    
    if (symbol.length > 12) {
      showToast("Symbol must be 12 characters or less.", "error");
      return;
    }
    if (Number(supply) <= 0) {
      showToast("Supply must be greater than 0.", "error");
      return;
    }

    setIsLaunching(true);
    setLaunchResult(null);
    try {
      setStatusText("Generating and funding Issuer account...");
      const issuerKp = await createAndFundIssuer();
      
      setStatusText("Waiting for wallet signature (Trustline)...");
      const trustlineXdr = await buildTrustlineTx(pubKey, symbol, issuerKp.publicKey());
      const signedTrustlineXdr = await signTransaction(trustlineXdr, Networks.TESTNET);
      
      setStatusText("Submitting Trustline to Stellar...");
      await submitTx(signedTrustlineXdr);
      
      setStatusText("Minting supply and locking Issuer...");
      const mintXdr = await buildAndSignMintTx(issuerKp, pubKey, symbol, supply);
      await submitTx(mintXdr);

      setStatusText("Saving token details...");
      
      const newProject = {
        id: issuerKp.publicKey(),
        name: name || symbol,
        symbol: symbol,
        supply: parseFloat(supply),
        category: category,
        deployment_type: network === "Stellar" ? "stellar" : "mock",
        created_at: new Date().toISOString(),
        metadata: { 
          issuer: issuerKp.publicKey(), 
          type: tokenType,
          description,
          logo: logoBase64,
          banner: bannerBase64,
          website,
          telegram,
          twitter
        }
      };

      if (supabase) {
        await supabase.from("projects").insert(newProject);
      }
      
      // Save locally to persist even without a DB configured
      const existing = JSON.parse(localStorage.getItem('zing_local_projects') || '[]');
      localStorage.setItem('zing_local_projects', JSON.stringify([newProject, ...existing]));
      
      setStatusText("Launch Complete!");
      showToast(`Successfully launched ${supply} ${symbol}!`, "success");
      setLaunchResult({ issuer: issuerKp.publicKey(), asset: symbol });
    } catch (e: any) {
      console.error(e);
      showToast(`Launch failed: ${e.message || "Unknown error"}`, "error");
    } finally {
      setIsLaunching(false);
      if (statusText !== "Launch Complete!") {
        setStatusText("");
      }
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px", fontFamily: "var(--font-geist-sans)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: 600, color: "#fff", marginBottom: "8px", letterSpacing: "-0.5px" }}>
            Launch Your Token with Zing
          </h1>
          <p style={{ color: "#A1A1AA", fontSize: "16px" }}>Instantly create and deploy your token with just a few clicks.</p>
        </div>
        <Link href="/launch" style={{ background: "#27272A", padding: "10px 20px", borderRadius: "6px", color: "#F4F4F5", textDecoration: "none", fontSize: "14px", fontWeight: 500, transition: "background 0.2s" }}>
          View LaunchBoard
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "40px" }}>
        {/* Launch Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Choose to Build */}
          <div style={{ background: "rgba(17, 17, 19, 0.5)", backdropFilter: "blur(12px)", borderRadius: "12px", border: "1px solid #27272A", padding: "32px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "24px" }}>Choose to Build <span style={{ color: "#71717A", fontSize: "14px", fontWeight: 400 }}>Select what you prefer</span></h2>
            
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "#A1A1AA", marginBottom: "12px", fontWeight: 500 }}>Category <span style={{color:"#EF4444"}}>*</span></label>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {["Meme", "AI Agent", "DeFi", "AI", "RWA", "DeSci", "DePIN", "Gaming"].map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)} style={{ background: category === cat ? "rgba(255,255,255,0.1)" : "transparent", border: `1px solid ${category === cat ? "#fff" : "rgba(255,255,255,0.1)"}`, padding: "8px 16px", borderRadius: "20px", color: category === cat ? "#fff" : "#A1A1AA", cursor: "pointer", fontSize: "13px", fontWeight: 500, transition: "all 0.2s" }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "#A1A1AA", marginBottom: "12px", fontWeight: 500 }}>Choose Platform <span style={{color:"#EF4444"}}>*</span></label>
              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={() => setTokenType("sac")} style={{ background: tokenType === "sac" ? "rgba(59, 130, 246, 0.1)" : "transparent", border: `1px solid ${tokenType === "sac" ? "#3B82F6" : "rgba(255,255,255,0.1)"}`, padding: "8px 16px", borderRadius: "20px", color: tokenType === "sac" ? "#3B82F6" : "#A1A1AA", cursor: "pointer", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3B82F6" }} /> Soroban Token
                </button>
                <button onClick={() => setTokenType("classic")} style={{ background: tokenType === "classic" ? "rgba(16, 185, 129, 0.1)" : "transparent", border: `1px solid ${tokenType === "classic" ? "#10B981" : "rgba(255,255,255,0.1)"}`, padding: "8px 16px", borderRadius: "20px", color: tokenType === "classic" ? "#10B981" : "#A1A1AA", cursor: "pointer", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} /> Classic Asset
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", color: "#A1A1AA", marginBottom: "12px", fontWeight: 500 }}>Choose Network <span style={{color:"#EF4444"}}>*</span></label>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {["Stellar", "Core", "Arbitrum", "Solana", "Base", "Polygon"].map(net => (
                  <button key={net} onClick={() => setNetwork(net)} style={{ background: network === net ? "rgba(255,255,255,0.05)" : "transparent", border: `1px solid ${network === net ? "#fff" : "rgba(255,255,255,0.05)"}`, padding: "8px 16px", borderRadius: "8px", color: network === net ? "#fff" : "#71717A", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>
                    {net}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* General */}
          <div style={{ background: "rgba(17, 17, 19, 0.5)", backdropFilter: "blur(12px)", borderRadius: "12px", border: "1px solid #27272A", padding: "32px" }}>
             <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               General
             </h2>
             
             <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
               {/* Logo Upload */}
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 style={{ width: "120px", height: "120px", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", position: "relative" }}
               >
                 <input type="file" accept="image/png, image/jpeg, image/webp" ref={fileInputRef} onChange={(e) => handleFileChange(e, 'logo')} style={{ display: "none" }} />
                 {logoBase64 ? (
                   <img src={logoBase64} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                 ) : (
                   <>
                     <div style={{ fontSize: "24px", marginBottom: "8px", color: "#71717A" }}>📷</div>
                     <div style={{ fontSize: "10px", color: "#71717A", textAlign: "center", padding: "0 8px" }}>JPG/PNG/WEBP<br/>Less than 1MB</div>
                   </>
                 )}
               </div>

               {/* Banner Upload */}
               <div 
                 onClick={() => bannerInputRef.current?.click()}
                 style={{ flex: 1, height: "120px", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.02)", cursor: "pointer", overflow: "hidden", position: "relative" }}
               >
                 <input type="file" accept="image/png, image/jpeg, image/webp" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} style={{ display: "none" }} />
                 {bannerBase64 ? (
                   <img src={bannerBase64} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                 ) : (
                   <div style={{ fontSize: "12px", color: "#71717A", display: "flex", alignItems: "center", gap: "8px" }}>
                     👁️ Click to upload banner image
                   </div>
                 )}
               </div>
             </div>

             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
               <div>
                 <label style={{ display: "block", fontSize: "13px", color: "#A1A1AA", marginBottom: "8px", fontWeight: 500 }}>Token Name <span style={{color:"#EF4444"}}>*</span></label>
                 <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Type text" style={{ width: "100%", background: "rgba(9, 9, 11, 0.5)", backdropFilter: "blur(12px)", border: "1px solid #3F3F46", padding: "12px 16px", borderRadius: "8px", color: "#fff", fontSize: "14px", outline: "none" }} />
               </div>
               <div>
                 <label style={{ display: "block", fontSize: "13px", color: "#A1A1AA", marginBottom: "8px", fontWeight: 500 }}>Token Symbol <span style={{color:"#EF4444"}}>*</span></label>
                 <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="Type text" maxLength={12} style={{ width: "100%", background: "rgba(9, 9, 11, 0.5)", backdropFilter: "blur(12px)", border: "1px solid #3F3F46", padding: "12px 16px", borderRadius: "8px", color: "#fff", fontSize: "14px", outline: "none" }} />
               </div>
             </div>

             <div style={{ marginBottom: "20px" }}>
               <label style={{ display: "block", fontSize: "13px", color: "#A1A1AA", marginBottom: "8px", fontWeight: 500 }}>Total Supply <span style={{color:"#EF4444"}}>*</span></label>
               <input type="number" value={supply} onChange={(e) => setSupply(e.target.value)} placeholder="1000000000" style={{ width: "100%", background: "rgba(9, 9, 11, 0.5)", backdropFilter: "blur(12px)", border: "1px solid #3F3F46", padding: "12px 16px", borderRadius: "8px", color: "#fff", fontSize: "14px", outline: "none" }} />
             </div>

             <div>
               <label style={{ display: "block", fontSize: "13px", color: "#A1A1AA", marginBottom: "8px", fontWeight: 500 }}>Token Description <span style={{color:"#EF4444"}}>*</span></label>
               <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Type text" rows={4} maxLength={256} style={{ width: "100%", background: "rgba(9, 9, 11, 0.5)", backdropFilter: "blur(12px)", border: "1px solid #3F3F46", padding: "12px 16px", borderRadius: "8px", color: "#fff", fontSize: "14px", outline: "none", resize: "none" }} />
               <div style={{ textAlign: "right", fontSize: "11px", color: "#71717A", marginTop: "4px" }}>{description.length}/256</div>
             </div>
          </div>

          {/* Additional (Socials) */}
          <div style={{ background: "rgba(17, 17, 19, 0.5)", backdropFilter: "blur(12px)", borderRadius: "12px", border: "1px solid #27272A", padding: "32px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "24px" }}>Additional</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
               <div>
                 <label style={{ display: "block", fontSize: "13px", color: "#A1A1AA", marginBottom: "8px", fontWeight: 500 }}>Website</label>
                 <div style={{ position: "relative" }}>
                   <div style={{ position: "absolute", left: "12px", top: "12px", color: "#71717A" }}>🌐</div>
                   <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." style={{ width: "100%", background: "rgba(9, 9, 11, 0.5)", backdropFilter: "blur(12px)", border: "1px solid #3F3F46", padding: "12px 16px 12px 40px", borderRadius: "8px", color: "#fff", fontSize: "13px", outline: "none" }} />
                 </div>
               </div>
               <div>
                 <label style={{ display: "block", fontSize: "13px", color: "#A1A1AA", marginBottom: "8px", fontWeight: 500 }}>Telegram</label>
                 <div style={{ position: "relative" }}>
                   <div style={{ position: "absolute", left: "12px", top: "12px", color: "#3B82F6" }}>✈️</div>
                   <input type="text" value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="https://t.me/..." style={{ width: "100%", background: "rgba(9, 9, 11, 0.5)", backdropFilter: "blur(12px)", border: "1px solid #3F3F46", padding: "12px 16px 12px 40px", borderRadius: "8px", color: "#fff", fontSize: "13px", outline: "none" }} />
                 </div>
               </div>
               <div>
                 <label style={{ display: "block", fontSize: "13px", color: "#A1A1AA", marginBottom: "8px", fontWeight: 500 }}>Twitter (X)</label>
                 <div style={{ position: "relative" }}>
                   <div style={{ position: "absolute", left: "12px", top: "12px", color: "#fff" }}>𝕏</div>
                   <input type="text" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://x.com/..." style={{ width: "100%", background: "rgba(9, 9, 11, 0.5)", backdropFilter: "blur(12px)", border: "1px solid #3F3F46", padding: "12px 16px 12px 40px", borderRadius: "8px", color: "#fff", fontSize: "13px", outline: "none" }} />
                 </div>
               </div>
            </div>
          </div>

        </div>

        {/* Sidebar Status / Deployment */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ background: "rgba(17, 17, 19, 0.5)", backdropFilter: "blur(12px)", borderRadius: "12px", border: "1px solid #27272A", padding: "32px", position: "sticky", top: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: "24px" }}>Create Wallet</h3>
            <p style={{ fontSize: "13px", color: "#A1A1AA", marginBottom: "24px" }}>Create a Zing wallet or connect an external wallet to start interacting.</p>
            
            <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "8px", marginBottom: "24px", border: "1px solid rgba(255,255,255,0.05)" }}>
               <div style={{ fontSize: "13px", color: "#F4F4F5", fontWeight: 500, marginBottom: "12px" }}>External Wallet</div>
               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                 <div style={{ fontSize: "12px", color: "#A1A1AA" }}>
                   {pubKey ? "Wallet Connected!" : "Use an external wallet to fund your balance and trade"}
                 </div>
                 {pubKey && <div style={{ fontSize: "20px" }}>✅</div>}
               </div>
            </div>

            <button 
              onClick={handleLaunch} 
              disabled={isLaunching || !pubKey} 
              style={{ 
                background: isLaunching ? "#3F3F46" : !pubKey ? "#27272A" : "#F4F4F5", 
                color: isLaunching || !pubKey ? "#A1A1AA" : "#000", 
                padding: "16px", 
                borderRadius: "8px", 
                fontSize: "15px", 
                fontWeight: 700, 
                border: "none", 
                cursor: isLaunching || !pubKey ? "not-allowed" : "pointer", 
                transition: "all 0.2s",
                width: "100%"
              }}
            >
              {!pubKey ? "Connect Wallet to Launch" : isLaunching ? "Deploying..." : "Confirm Deployment"}
            </button>
            
            {statusText && (
              <div style={{ fontSize: "13px", color: "#10B981", textAlign: "center", fontWeight: 500, marginTop: "16px" }}>
                {statusText}
              </div>
            )}
            
            {launchResult && (
              <div style={{ padding: "16px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px", marginTop: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "#10B981", marginBottom: "8px" }}>Deployment Successful</div>
                <div style={{ fontSize: "13px", color: "#A1A1AA", marginBottom: "4px" }}>Asset: {launchResult.asset}</div>
                <div style={{ fontSize: "13px", color: "#A1A1AA", fontFamily: "var(--font-geist-mono)", wordBreak: "break-all" }}>Issuer: {launchResult.issuer}</div>
                <a href={`https://stellar.expert/explorer/testnet/account/${launchResult.issuer}`} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: "12px", color: "#3B82F6", fontSize: "13px", textDecoration: "none", fontWeight: 500 }}>
                  View on Stellar Expert ↗
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
