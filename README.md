# Zing - Stellar-Native Trading & Launch Platform

Zing is a comprehensive, non-custodial decentralized exchange (DEX), token launchpad, prediction market, and social growth platform built natively for the Stellar and Soroban ecosystem.

Zing simplifies the Web3 experience by abstracting away the complexity of gas fees, slippage, and liquidity routing using declarative intents and a solver network, allowing users to focus on trading, launching, and growing their communities.

## Screenshots

Take a look at the Zing platform in action:

| Dashboard | Trade Terminal |
| :---: | :---: |
| ![Dashboard](/Screenshot/Dashboard.png)<br>*Ecosystem Analytics & Market Overview* | ![Trade Terminal](/Screenshot/Trade%20Terminal.png)<br>*Spot Trading & Intent Engine* |

| Prediction Market | Launch Board |
| :---: | :---: |
| ![Prediction Market](/Screenshot/Prediction%20Market.png)<br>*On-Chain Prediction Markets & Live Charts* | ![Launch Board](/Screenshot/Launch%20Board.png)<br>*No-code Token Factory & Launchpad* |

| Token Launch | Token Creation Transaction |
| :---: | :---: |
| ![Token Launch](/Screenshot/Token%20Launch.png)<br>*Issuing Custom Assets* | ![Token Creation Transaction](/Screenshot/Token%20Creation%20Transaction.png)<br>*Signing the Launch Transaction* |

| Token Bar | Swapped Transaction |
| :---: | :---: |
| ![Token Bar](/Screenshot/Token%20Bar.png)<br>*Live Asset Feed* | ![Swapped Transaction](/Screenshot/Swapped%20Transaction.png)<br>*Successful On-Chain Swap* |

| Wallet Connected | Landing Page |
| :---: | :---: |
| ![Wallet Connected](/Screenshot/Wallet%20COnected.png)<br>*Seamless Freighter Integration* | ![Landing Page](/Screenshot/Landing%20Page.png)<br>*Zing Entry Point* |

| CI/CD Pipeline | CI/CD |
| :---: | :---: |
| ![CI CD Pipeline](/Screenshot/CI%20CD%20Pipeline.png)<br>*Automated Deployments* | ![CICD](/Screenshot/CICD.png)<br>*3-Stage Validation* |


## Smart Contracts & Explorer Links

All contracts are written in Rust, compiled to `wasm32-unknown-unknown`, and deployed natively onto the **Stellar Soroban Testnet**:

| Contract Name | Contract ID | Explorer Link | Functionality |
| :--- | :--- | :--- | :--- |
| **Prediction Market** | `CCO6P3MRIXHFPSAQF5IQ7DENWJDJMAJXWFE3DTPHYIRMEMUT4KQKPMNR` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CCO6P3MRIXHFPSAQF5IQ7DENWJDJMAJXWFE3DTPHYIRMEMUT4KQKPMNR) | Binary outcome prediction markets, XLM voting stakes, oracle resolution, and instant payouts. |
| **Intent Swap Engine** | `CCSJQNIM7UWJLMRDD5VSPQDUNQKG5A7VZZVVGOOLMTLG3RIQY5NQIRH7` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CCSJQNIM7UWJLMRDD5VSPQDUNQKG5A7VZZVVGOOLMTLG3RIQY5NQIRH7) | Zero-gas intent-based atomic swaps with solver routing, slippage protection, and MEV resistance. |
| **Zing Launchpad** | `CCQKDOJRON3D4PZC4YNCTVMYR566VEPWYRFTF2JGFTO5EPZLJUBKKS46` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CCQKDOJRON3D4PZC4YNCTVMYR566VEPWYRFTF2JGFTO5EPZLJUBKKS46) | No-code token factory, initial supply minting, and automated liquidity bootstrapping. |
| **Smart Wallet & Routing** | `CDTQYDT2EJ7WAIMGY33546CKKS46MP2CBSL5QNCXFNQTHL5EL7GPYLAY` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CDTQYDT2EJ7WAIMGY33546CKKS46MP2CBSL5QNCXFNQTHL5EL7GPYLAY) | Non-custodial account abstraction, session keys, and multi-asset routing. |
| **Social Booster (MindShare)** | `CBDNXFONMLWTIQLSFONXDDTBIPWZ7LRV7BLAMYEA4K37IAETH424IOWC` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CBDNXFONMLWTIQLSFONXDDTBIPWZ7LRV7BLAMYEA4K37IAETH424IOWC) | Verifiable community reward pools, quest validation, and automated token distributions. |
| **Trading Competitions** | `CAHXXMYINOBWAAYBHETS6C5NKX4S4F4OHWV7EFLX6PY7QB3RCSQMQO2T` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CAHXXMYINOBWAAYBHETS6C5NKX4S4F4OHWV7EFLX6PY7QB3RCSQMQO2T) | On-chain trading tournaments tracking DEX volume and automatic rank-based prize distributions. |

## Key Features Overview

### 1. Polymarket-Style Soroban Prediction Markets
Trade outcome shares on real-world events across Crypto, DeFi, AI, and Macroeconomics.
* **Mandatory Wallet Connection**: Prevents unauthenticated voting; enforces secure Web3 signature directly on Stellar testnet.
* **XLM-Native Staking**: Each vote stakes real Stellar Lumens (XLM) into Soroban escrows with dynamic odds calculations, share pricing, and payout estimations.
* **Contest Creation Engine**: Community members can deploy new prediction contests on-chain with customized resolution criteria and initial liquidity pools.
* **Live Vote Coverage & Probability Timeline Chart**: Real-time YES/NO probability curves with gradient fills, live pulse markers, interactive hover crosshairs, and multi-timeframe toggles.
* **Positions & 1-Click Claims**: Dedicated portfolio tab to track active stakes and instantly claim winnings from resolved markets.

### 2. DeFi 2.0: Zero-Gas Intent-Based Swap Protocol
* **Declarative User Intents**: Users specify their desired output (e.g., "Trade 100 USDC for at least 95 XLM"), eliminating manual slippage adjustments and failed transactions.
* **Solver Network Execution**: Off-chain solvers compete to fill user orders with optimal routing, paying gas fees on behalf of the user.
* **Cross-Chain Abstraction**: Seamlessly routes liquidity across Stellar, NEAR Intents, Axelar, and Ethereum/Solana via Circle CCTP.

### 3. User Authentication & Profile Suite
* **Hybrid Authentication**: Supports standard Email/Password authentication as well as direct Web3 Stellar Wallet onboarding (Freighter, Albedo, xBull).
* **Automated Wallet Binding**: Automatically binds the user's Stellar public key to their Supabase profile.
* **Customizable Metadata**: Edit username, bio, Twitter/X handle, and avatar directly from the application.
* **Live Asset Balances**: Real-time balance synchronization for XLM, USDC, and AQUA fetched directly from Horizon testnet nodes.

### 4. Stored On-Chain Transaction Ledger
* **Automatic Activity Tracking**: Every on-chain event (Prediction Bet, Contest Creation, Token Launch, Swap Intent, Claim) is automatically logged to the Supabase database.
* **Interactive History Table**: Filter transactions by type, view status badges, verify XLM amounts, and inspect direct links to the StellarExpert Explorer.

### 5. Zing LaunchZone
* **No-Code Asset Issuance**: Issue custom Stellar assets and Soroban tokens with customized supply, metadata, and categories in under 60 seconds.
* **Trustline Automation**: Builds and signs atomic trustline transactions for distributor and recipient accounts.

### 6. Social Booster & Trading Competitions
* **MindShare Campaigns**: Reward community members for social growth and quest completion via escrowed reward pools.
* **Leaderboard Tournaments**: Compete in live trading tournaments with real-time score ranking calculated from on-chain DEX trades.

### 7. Multi-Stage Production CI/CD Pipeline
* **Enforced Execution Order**: Every commit triggers a 3-stage sequential GitHub Actions workflow:
  1. **Frontend Build**: Next.js 16 production compilation & TypeScript checks.
  2. **Contracts Build**: Compiling all 7 Soroban contracts to release WASM binaries with artifact uploads.
  3. **Contracts Quality**: Rust formatting `cargo fmt` & syntax validation.
* **Guaranteed Uptime**: Zero CI failures permitted; strict verification on every PR and main merge.

## Local Setup & Development

### Prerequisites
* **Node.js**: 20.x or higher
* **Rust**: `rustup` with target `wasm32-unknown-unknown`
* **Stellar CLI**: Optional, for deploying contracts
* **Stellar Wallet**: Freighter set to Testnet

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

Open http://localhost:3000 in your browser to test Zing.

## Security & Non-Custodial Architecture
* **Client-Side Key Management**: Zing never holds or transmits private keys. All transactions are signed locally in the user's browser extension via `@creit.tech/stellar-wallets-kit`.
* **Soroban require_auth**: All smart contract state mutations enforce strict authentication checks on the caller's address.
* **Fail-Safe Client Proxy**: Supabase interactions use an automatic resilient fallback in `src/lib/supabase.ts`, preventing app crashes during network downtime.

## License & Disclaimer
Testnet experimental build. Built for the Stellar & Soroban ecosystem. Open source under the MIT License.
