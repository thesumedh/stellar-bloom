# ✨ StellarBloom - Zero-Wallet Onboarding Infrastructure

<div align="left">
  <img src="https://img.shields.io/badge/Stellar-Green_Belt_Level_4-00FF00" alt="Green Belt" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />
  <a href="https://github.com/thesumedh/stellar-bloom/actions/workflows/ci.yml">
    <img src="https://github.com/thesumedh/stellar-bloom/actions/workflows/ci.yml/badge.svg" alt="CI/CD Pipeline" />
  </a>
</div>

**StellarBloom is the missing middleware that allows anyone to use Soroban smart contracts without knowing blockchain exists.** It solves the biggest friction point in Stellar's ecosystem growth: onboarding non-crypto users into Soroban dApps.

## 🟢 Level 4 - Green Belt Submission Overview

### ✅ Submission Checklist Satisfied
- [x] **Advanced Event & Intent Streaming:** The Node Relayer actively monitors incoming cryptographic intents, verifies payload signatures, applies rate limits, and dynamically submits them to Horizon in real-time.
- [x] **CI/CD Pipeline Setup:** Automated GitHub Actions pipeline (`.github/workflows/ci.yml`) is actively running with Vercel deployment automation.
- [x] **Mobile Responsive Design:** The frictionless Vanilla CSS UI is seamlessly responsive across mobile, tablet, and desktop formats.
- [x] **Meaningful Commits:** Built iteratively with structured Git commits encompassing frontend UX, relayer backend, routing, and intent cryptographic signing.

> **Note on Contracts (Level 2 Integration):** StellarBloom executes via a Soroban Smart Contract Wallet written in Rust capable of meta-transaction executions (Level 2 features merged below). The backend Relayer utilizes `CreateAccount` and `Payment` meta-transactions to invisibly sponsor execution gas.

---

## The StellarBloom Vision 🚀

*"Gasless Account Abstraction with Fiat On-Ramp Native to Soroban"*

**What It Will Do (The Magic):**
1. **The Coffee Shop Demo:** Click "Claim Free Coffee". The Bloom SDK silently generates an Ed25519 Session Key. The user instantly sees success confetti.
2. **Invisible Blockchain:** The backend Node Relayer accepts the off-chain intent, covers the 100 stroop network gas fee, and deposits exactly **2.5 XLM** directly into the user's new session wallet! 
3. **Credit Card → Smart Contract Calls:** (Future) User pays $5 with credit card → StellarBloom atomically swaps fiat to XLM → executes Soroban contract.

---

## 🥋 Historical Level 2 - Yellow Belt Features

For our Yellow Belt submission, we implemented multi-wallet support and deployed our first Soroban Smart Contract to the testnet!

- **Multi-Wallet Support:** Users seamlessly connect using Freighter, Albedo, or xBull wallets via the `@creit.tech/stellar-wallets-kit` integration.
- **User Wallet Smart Contract (Rust):** A Soroban smart contract written in Rust with initialization and meta-transaction capabilities.
- **Smart Contract Event Mapping:** The `execute_transfer` function emits a `gasless transaction executed` event upon success.
- **Testnet Deployment:** The optimized `.wasm` has been successfully deployed and verified on the Stellar Testnet.

---

## 🚀 Project Submission Links & Artifacts

✅ **Public GitHub repository**
- [Repository link](https://github.com/thesumedh/stellar-bloom)

✅ **Required Deployed Artifacts**
- **Live Demo Deployment:** [Insert Vercel/Netlify Link Here]
- **Deployed Contract Address:** `CAZMBK5MIVR2P2DMDJ7L7S2EHV6YNT5CQ5JC775W2OEGVGA5X3EHZLEI`
- **Example Transaction Hash:** [View on Stellar Expert](https://stellar.expert/explorer/testnet/op/5628898238803969)

---

## 📸 Screenshots & Responsive Implementation

**Multi-Wallet Connection & Interface:**

<img width="1901" height="842" alt="Screenshot 2026-02-23 234156" src="https://github.com/user-attachments/assets/e6d5ce6e-5900-41ac-8f6e-d487f4a04517" />
<img width="1223" height="847" alt="Screenshot 2026-02-23 234311" src="https://github.com/user-attachments/assets/5410df05-b361-48c5-9343-5018ee4c47e5" />

**Mobile Responsive Views:**

<img width="514" height="732" alt="Screenshot Responsive" src="https://github.com/user-attachments/assets/21646789-853c-425d-8ed1-6ba799b82131" />

---

## ⚙️ Local Development Instructions

### 1. Install Dependencies
\`\`\`bash
# Frontend
cd stellar-bloom
npm install

# Backend Relayer
cd ../relayer
npm install
\`\`\`

### 2. Configure Environment (`relayer/.env`)
Ensure you have your Developer Sponsor Account secret:
\`\`\`env
SPONSOR_SECRET=S_YOUR_FUNDED_TESTNET_DEVELOPER_SECRET_HERE
\`\`\`

### 3. Run the Infrastructure
Start the frontend and backend concurrently:
\`\`\`bash
# Start frontend on port 5173
cd stellar-bloom
npm run dev

# Start Relayer Node on port 3000
cd ../relayer
node index.js
\`\`\`
