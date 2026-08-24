# Zing — Stellar-Native Chain-Abstracted Trading & Launch Platform

> _Next-generation execution layer for traders, founders, and AI agents. Soroban-powered, intent-driven, fully chain-abstracted._

[![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-blue)](https://stellar.org)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)]()
[![CI/CD](https://img.shields.io/badge/CI%2FCD-3--Stage%20Pipeline%20Passing-success)]()

[![Smart Wallet](https://img.shields.io/badge/Smart%20Wallet-CDTQYD...-purple)](https://stellar.expert/explorer/testnet/contract/CDTQYDT2EJ7WAIMGY33546CKKS46MP2CBSL5QNCXFNQTHL5EL7GPYLAY)
[![Intent Swap](https://img.shields.io/badge/Intent%20Swap-CCSJQN...-purple)](https://stellar.expert/explorer/testnet/contract/CCSJQNIM7UWJLMRDD5VSPQDUNQKG5A7VZZVVGOOLMTLG3RIQY5NQIRH7)
[![Prediction Market](https://img.shields.io/badge/Predictions-CCO6P3...-purple)](https://stellar.expert/explorer/testnet/contract/CCO6P3MRIXHFPSAQF5IQ7DENWJDJMAJXWFE3DTPHYIRMEMUT4KQKPMNR)
[![Launchpad](https://img.shields.io/badge/Launchpad-CCQKDO...-purple)](https://stellar.expert/explorer/testnet/contract/CCQKDOJRON3D4PZC4YNCTVMYR566VEPWYRFTF2JGFTO5EPZLJUBKKS46)
[![Campaigns](https://img.shields.io/badge/Campaigns-CBDNXF...-purple)](https://stellar.expert/explorer/testnet/contract/CBDNXFONMLWTIQLSFONXDDTBIPWZ7LRV7BLAMYEA4K37IAETH424IOWC)
[![Competitions](https://img.shields.io/badge/Competitions-CAHXXM...-purple)](https://stellar.expert/explorer/testnet/contract/CAHXXMYINOBWAAYBHETS6C5NKX4S4F4OHWV7EFLX6PY7QB3RCSQMQO2T)

Zing is a **Stellar-first, chain-abstracted execution layer** architected to reproduce the institutional trading terminal experience for retail users. Connect a Stellar wallet, fund via Friendbot, and instantly access unified trading, token launches, prediction markets, social campaigns, and trading competitions. Zing treats Stellar as the ultimate settlement layer while seamlessly routing cross-chain liquidity via NEAR Intents, Axelar, and Circle CCTP.

---

## 🌐 Live Deployment & Network Details

| Resource             | Value                                                      |
| -------------------- | ---------------------------------------------------------- |
| **Live Web App**     | [https://zingy-orpin.vercel.app/](https://zingy-orpin.vercel.app/) |
| **Network**          | Stellar Testnet                                            |
| **Soroban RPC**      | `https://soroban-testnet.stellar.org`                      |
| **Horizon API**      | `https://horizon-testnet.stellar.org`                      |
| **Database**         | Supabase PostgreSQL (Auth, Profiles & Ledger)             |

---

## 📜 Deployed Smart Contracts & Explorer Links

All contracts are written in Rust, compiled to `wasm32-unknown-unknown`, and deployed natively onto the **Stellar Soroban Testnet**:

| Contract Name | Contract ID | Explorer Link | Functionality |
| :--- | :--- | :--- | :--- |
| **🔮 Prediction Market** *(New)* | `CCO6P3MRIXHFPSAQF5IQ7DENWJDJMAJXWFE3DTPHYIRMEMUT4KQKPMNR` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CCO6P3MRIXHFPSAQF5IQ7DENWJDJMAJXWFE3DTPHYIRMEMUT4KQKPMNR) | Binary outcome prediction markets, XLM voting stakes, oracle resolution, and instant payouts. |
| **⚡ Intent Swap Engine** *(New)* | `CCSJQNIM7UWJLMRDD5VSPQDUNQKG5A7VZZVVGOOLMTLG3RIQY5NQIRH7` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CCSJQNIM7UWJLMRDD5VSPQDUNQKG5A7VZZVVGOOLMTLG3RIQY5NQIRH7) | Zero-gas intent-based atomic swaps with solver routing, slippage protection, and MEV resistance. |
| **🚀 Zing Launchpad** | `CCQKDOJRON3D4PZC4YNCTVMYR566VEPWYRFTF2JGFTO5EPZLJUBKKS46` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CCQKDOJRON3D4PZC4YNCTVMYR566VEPWYRFTF2JGFTO5EPZLJUBKKS46) | No-code token factory, initial supply minting, and automated liquidity bootstrapping. |
| **🛡️ Smart Wallet & Routing** | `CDTQYDT2EJ7WAIMGY33546CKKS46MP2CBSL5QNCXFNQTHL5EL7GPYLAY` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CDTQYDT2EJ7WAIMGY33546CKKS46MP2CBSL5QNCXFNQTHL5EL7GPYLAY) | Non-custodial account abstraction, session keys, and multi-asset routing. |
| **📢 Social Booster (MindShare)** | `CBDNXFONMLWTIQLSFONXDDTBIPWZ7LRV7BLAMYEA4K37IAETH424IOWC` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CBDNXFONMLWTIQLSFONXDDTBIPWZ7LRV7BLAMYEA4K37IAETH424IOWC) | Verifiable community reward pools, quest validation, and automated token distributions. |
| **🏆 Trading Competitions** | `CAHXXMYINOBWAAYBHETS6C5NKX4S4F4OHWV7EFLX6PY7QB3RCSQMQO2T` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CAHXXMYINOBWAAYBHETS6C5NKX4S4F4OHWV7EFLX6PY7QB3RCSQMQO2T) | On-chain trading tournaments tracking DEX volume and automatic rank-based prize distributions. |

---

## 🚀 Key Features Overview

### 1. 🔮 Polymarket-Style Soroban Prediction Markets (`/trade/predictions`)
- **Binary Outcome Prediction Markets**: Trade outcome shares on real-world events across Crypto, DeFi, AI, and Macroeconomics.
- **Mandatory Wallet Connection**: Prevents unauthenticated voting; enforces secure Web3 signature directly on Stellar testnet.
- **XLM-Native Staking**: Each vote stakes real Stellar Lumens (XLM) into Soroban escrows with dynamic odds calculations, share pricing, and payout estimations.
- **Contest Creation Engine (`+ Create Contest`)**: Community members can deploy new prediction contests on-chain with customized resolution criteria and initial liquidity pools.
- **Live Vote Coverage & Probability Timeline Chart**: Real-time YES/NO probability curves with gradient fills, live pulse markers, interactive hover crosshairs, and multi-timeframe toggles (`1H`, `6H`, `24H`, `7D`, `ALL`).
- **Positions & 1-Click Claims**: Dedicated portfolio tab to track active stakes and instantly claim winnings from resolved markets.

### 2. ⚡ DeFi 2.0: Zero-Gas Intent-Based Swap Protocol (`/trade`)
- **Declarative User Intents**: Users specify their desired output (e.g., *"Trade 100 USDC for at least 95 XLM"*), eliminating manual slippage adjustments and failed transactions.
- **Solver Network Execution**: Off-chain solvers compete to fill user orders with optimal routing, paying gas fees on behalf of the user.
- **Cross-Chain Abstraction**: Seamlessly routes liquidity across Stellar, NEAR Intents, Axelar, and Ethereum/Solana via Circle CCTP.

### 3. 👤 User Authentication & Profile Suite (`/auth` & `/profile`)
- **Hybrid Authentication**: Supports standard Email/Password authentication as well as direct Web3 Stellar Wallet onboarding (Freighter, Albedo, xBull).
- **Automated Wallet Binding**: Automatically binds the user's Stellar public key (`G...`) to their Supabase profile (`user_profiles` and `stellar_accounts`).
- **Customizable Metadata**: Edit username, bio, Twitter/X handle, and avatar directly from the application.
- **Live Asset Balances**: Real-time balance synchronization for XLM, USDC, and AQUA fetched directly from Horizon testnet nodes.

### 4. 📜 Stored On-Chain Transaction Ledger (`user_transactions`)
- **Automatic Activity Tracking**: Every on-chain event (Prediction Bet, Contest Creation, Token Launch, Swap Intent, Claim) is automatically logged to the Supabase database.
- **Interactive History Table**: Filter transactions by type, view status badges, verify XLM amounts, and inspect direct links to the **StellarExpert Explorer**.

### 5. 🚀 Zing LaunchZone (`/launch`)
- **No-Code Asset Issuance**: Issue custom Stellar assets and Soroban tokens with customized supply, metadata, and categories in under 60 seconds.
- **Trustline Automation**: Builds and signs atomic trustline transactions for distributor and recipient accounts.

### 6. 📢 Social Booster & Trading Competitions (`/social-booster` & `/competitions`)
- **MindShare Campaigns**: Reward community members for social growth and quest completion via escrowed reward pools.
- **Leaderboard Tournaments**: Compete in live trading tournaments with real-time score ranking calculated from on-chain DEX trades.

### 7. ⚙️ Multi-Stage Production CI/CD Pipeline
- **Enforced Execution Order**: Every commit triggers a 3-stage sequential GitHub Actions workflow:
  1. **Frontend Build** (Next.js 16 production compilation & TypeScript checks)
  2. **Contracts Build** (Compiling all 7 Soroban contracts to release WASM binaries with artifact uploads)
  3. **Contracts Quality** (Rust formatting `cargo fmt` & syntax validation)

---

## 🏗 System Architecture Flow

```text
 ┌────────────────┐                                ┌──────────────────────────────────────────┐
 │ User / AI Agent│ ── (Declarative Intent) ──▶ │ Zing Intent Router & Solver API          │
 └────────────────┘                                └──────────────────────────────────────────┘
         │                                                            │ (Generates optimal XDR / Intents)
         ▼                                                            ▼
 ┌────────────────┐      sign tx (XDR)             ┌──────────────────────────────────────────┐
 │ Stellar Wallet │ ◀───────────────────────────── │ Zing Next.js Frontend OS               │
 │ (Freighter)    │ ── signed XDR ───────────────▶ │ /trade · /predictions · /profile · /launch│
 └────────────────┘                                └──────────┬───────────────────────────────┘
                                                              │ 
                                                              ▼
                                                   ┌──────────────────────────────────────────┐
                                                   │ Stellar Execution Layer (Horizon / RPC)  │
                                                   └──────────┬──────────────────────┬────────┘
                                                              │                      │
                                                              ▼                      ▼
                                             ┌──────────────────────┐      ┌──────────────────────┐
                                             │ Soroban Contracts    │      │ Supabase Database    │
                                             │ · Prediction Market  │      │ · user_profiles      │
                                             │ · Intent Swap Engine │      │ · user_transactions  │
                                             │ · Launchpad Factory  │      │ · projects & quests  │
                                             └──────────────────────┘      └──────────────────────┘
```

---

## 📁 Repository Directory Structure

```text
Zing/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Master 3-Stage Ordered CI/CD Pipeline
│
├── src/
│   ├── app/                       # Next.js App Router (Pages & API)
│   │   ├── auth/                  # Authentication Portal (Sign In / Sign Up)
│   │   ├── profile/               # User Profile & Stored Transaction Ledger
│   │   ├── dashboard/             # Ecosystem Analytics & Market Overview
│   │   ├── trade/                 # Spot Trading & Intent Engine
│   │   │   └── predictions/       # On-Chain Prediction Markets & Live Charts
│   │   ├── launch/                # Token & Agent LaunchZone
│   │   ├── social-booster/        # Social Quest Campaigns
│   │   ├── competitions/          # On-Chain Trading Competitions
│   │   └── contracts/             # Deployed Contracts Directory
│   │
│   ├── components/                # Modular React UI Components
│   │   ├── prediction-vote-chart.tsx # Real-Time Vote Coverage & Probability Curve
│   │   ├── trading-chart.tsx      # Candlestick Market Chart (lightweight-charts)
│   │   ├── auth-provider.tsx      # Supabase Auth & Profile Context
│   │   ├── wallet-provider.tsx    # Stellar Wallets Kit Integration
│   │   └── app-sidebar.tsx        # Responsive Navigation Sidebar
│   │
│   └── lib/                       # Web3 & Database Utilities
│       ├── stellar-predictions.ts # On-chain prediction transaction builder
│       ├── transactions.ts        # Database transaction ledger recorder
│       ├── stellar-trade.ts       # Horizon balance & DEX pathfinders
│       ├── stellar-launch.ts      # Asset issuance & trustline builders
│       └── supabase.ts            # Supabase database client proxy
│
├── contracts/                     # Soroban Rust Contracts Workspace
│   ├── prediction_market/         # Binary outcome prediction contract
│   ├── intent_swap/               # Zero-gas intent-based atomic swap
│   ├── launchpad/                 # Token Launchpad & Factory
│   ├── smart_wallet/              # Account abstraction smart wallet
│   ├── campaign/                  # Social Booster campaigns
│   ├── competition/               # Trading competitions
│   └── token/                     # Soroban Token standard implementation
│
├── supabase/
│   └── migrations/                # PostgreSQL Schema Migrations
│       ├── 20260717000000_init.sql
│       └── 20260824000000_user_profiles_and_transactions.sql
│
└── package.json                   # Dependencies (Next 16, Stellar SDK, Framer Motion)
```

---

## 🛠 Local Setup & Development

### Prerequisites
- **Node.js**: 20.x or higher
- **Rust**: `rustup` with target `wasm32-unknown-unknown`
- **Stellar CLI**: (Optional, for deploying contracts)
- **Stellar Wallet**: [Freighter](https://www.freighter.app/) set to **Testnet**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Saimand07/Zing.git
cd Zing

# 2. Install frontend dependencies
npm install

# 3. Compile Soroban smart contracts to WASM
cd contracts
cargo build --target wasm32-unknown-unknown --release
cd ..

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to test Zing.

---

## 🔒 Security & Non-Custodial Architecture

- **Client-Side Key Management**: Zing never holds or transmits private keys. All transactions are signed locally in the user's browser extension via `@creit.tech/stellar-wallets-kit`.
- **Soroban `require_auth`**: All smart contract state mutations enforce strict authentication checks on the caller's address.
- **Fail-Safe Client Proxy**: Supabase interactions use an automatic resilient fallback in `src/lib/supabase.ts`, preventing app crashes during network downtime.

---

## 📄 License & Disclaimer

Testnet experimental build. Built for the Stellar & Soroban ecosystem. Open source under the MIT License.
