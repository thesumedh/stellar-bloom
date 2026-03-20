# ✨ StellarBloom: The Gasless Infrastructure Layer

<div align="left">
  <img src="https://img.shields.io/badge/Stellar-Green_Belt_Level_4-00FF00" alt="Green Belt" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />
</div>

## 🟢 Level 4 - Green Belt Submission Overview

**StellarBloom** is an enterprise-grade Relayer architecture designed to completely eliminate the Web3 UX friction of onboarding onto Stellar and Soroban. By utilizing invisible ephemeral session keys and a Developer Gas Pool, StellarBloom ensures end-users can seamlessly execute blockchain transactions with zero wallets, zero seed phrases, and zero transaction fees.

### ✅ Submission Checklist Satisfied
- [x] **Advanced Event & Intent Streaming:** The Node Relayer actively monitors incoming cryptographic intents, verifies payload signatures, applies rate limits, and dynamically submits them to Horizon in real-time.
- [x] **CI/CD Pipeline Setup:** Automated GitHub Actions pipeline (`.github/workflows/ci.yml`) configured to validate TypeScript builds and integration linting on every push.
- [x] **Mobile Responsive Design:** The frictionless Vanilla CSS UI is 100% accessible and responsive across mobile, tablet, and desktop devices.
- [x] **Meaningful Commits:** Built iteratively with structured Git commits encompassing frontend UX, relayer backend, routing, and intent cryptographic signing.

> **Note on Contracts:** This specific implementation relies entirely on native Stellar `CreateAccount` and `Payment` meta-transactions to securely issue ephemeral keys to users via the Relayer, proving traction instantly without requiring complex custom Soroban token pools.

---

## ☕ The Coffee Shop Demo (Magic UX)

StellarBloom solves the 90% Web3 Drop-off Trap:

1. **What Users Experience:** Click "Claim Free Coffee". The Bloom SDK silently generates an Ed25519 Session Key. The user instantly sees success confetti as they interact with the blockchain entirely invisibly.
2. **What Developers Do:** Developers deposit XLM into the Relayer "Gas Tank" and add our 5-line integration snippet.
3. **The Magic Reality:** The Node Relayer accepts the off-chain intent, covers the 100 stroop network gas fee, and deposits exactly **2.5 XLM** directly into the user's new session wallet via a `CreateAccount` blockchain execution!

---

## 🚀 Live Submission Links

* **Live Demo Deployment:** [Insert Vercel/Netlify Link Here]
* **Mobile Responsive Screenshot:** [Insert Screenshot Link Here]
* **CI/CD Pipeline Badge:** [![Build Status](https://github.com/USERNAME/REPO_NAME/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/REPO_NAME/actions)
* **Example Gasless TxHash:** [Insert TxHash from Stellar Expert Here]

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
Ensure you have your Developer Sponsor Account secret in the backend:
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
