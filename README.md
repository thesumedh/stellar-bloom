# ✨ StellarBloom — Gasless Onboarding Infrastructure for Soroban

<div align="left">
  <img src="https://img.shields.io/badge/Stellar-Blue_Belt_Level_5-0070FF" alt="Blue Belt Level 5" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />
  <a href="https://github.com/thesumedh/stellar-bloom/actions/workflows/ci.yml">
    <img src="https://github.com/thesumedh/stellar-bloom/actions/workflows/ci.yml/badge.svg" alt="CI/CD Pipeline" />
  </a>
  <img src="https://img.shields.io/badge/Relayer-Live_on_Render-brightgreen" alt="Relayer Live" />
</div>

<br/>

**StellarBloom** is a lightweight onboarding layer that enables users to interact with Soroban applications without requiring a wallet, crypto, or gas fees. Users simply click an action (e.g., "Claim Free Coffee"), and everything happens invisibly — a temporary wallet is created, the request is signed, and a Relayer submits a real FeeBump transaction on their behalf. The user instantly sees a verified result without understanding anything about blockchain.

---

## 🔵 Level 5 — Blue Belt Submission

### ✅ Submission Checklist

- [x] **Public GitHub Repository** — [github.com/thesumedh/stellar-bloom](https://github.com/thesumedh/stellar-bloom)
- [x] **Live Demo** — [https://stellar-bloom.vercel.app](https://stellar-bloom.vercel.app)
- [x] **Demo Video** — [Watch Full MVP Walkthrough](https://drive.google.com/file/d/1EOyDeWbsTgUD3Ht0s3330sVuICcn-iFH/view?usp=sharing) 
- [x] **Architecture Document** — [📄 ARCHITECTURE.md](./ARCHITECTURE.md)
- [x] **10+ Meaningful Commits** — [View commit history](https://github.com/thesumedh/stellar-bloom/commits/main)
- [x] **5+ User Wallet Addresses** — [See below](#-real-user-testnet-validation)
- [x] **User Feedback Form** — [https://forms.gle/Y3TjqYbCK1m6Ch629](https://forms.gle/Y3TjqYbCK1m6Ch629)
- [x] **Deployed Relayer** — [https://stellar-bloom.onrender.com/health](https://stellar-bloom.onrender.com/health)

---

## 🚀 What StellarBloom Does

| Without StellarBloom | With StellarBloom |
|---|---|
| Install Freighter wallet extension | Nothing — just open the app |
| Write down 24-word seed phrase | Nothing |
| Buy XLM for gas on an exchange | Nothing |
| Sign incomprehensible transaction | Click one button |
| **90% user drop-off** | **Transaction done in ~18 seconds** |

---

## 👥 Real-User Testnet Validation

The following independent users successfully executed gasless transactions on Stellar Testnet via StellarBloom. Each transaction is verifiable on Stellar Expert:

| # | Session Key / Wallet | Transaction |
|---|---|---|
| 1 | `GBYKQS5FVB4ICO7F7RONL4X4ZWM7PS5JK76MTTOQLO4XISEB3FLH2G5A` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/0f1a18c9f40ac940b0fb44c81f1a29aac9c764a46c31034416860695c192d13a) |
| 2 | `GD3JOETXFUJDSE6CWSISSGMZSYKDKA6PJFW7JRL2N5GW2GKXY7ZYRXIY` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/f797e00236765c4f4f342341039c8ba06a00b36fac71b4dd94bbe3c1209e026d) |
| 3 | `GAW4B7OMNSMVNXKMYNBZAOJMSSO65GHYUK4BVRMDUTSV2AVCRAG2R6YB` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/b61b150e921f272884090958a1599ee9e5958db38493a0b85c57137dad5fb305) |
| 4 | `GAEHMU6AJ7IQZO45TMAI6RCNODKJFTNN5R2KX2SNBRK4VQXPY7SRXDR6` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/663e9f141c47daefb1271fb1796f5a7de538991b47f90d4a028d2a0c6675c335) |
| 5 | `GAVVWQD2F3663RR2J27XODWCZOJSCVKTY6GAGBRVZGTZ56U4ZMN2CWKN` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/ab9bb52f62f9bfb9f89cb1951c12ff6a307f1131a80f833c8a234465ec235f89) |

> **Example verified transaction:** [View on Stellar Expert](https://stellar.expert/explorer/testnet/op/5628898238803969)

---

## 📋 User Feedback

User feedback was collected via Google Forms from all testnet participants.

- **Feedback Form:** [https://forms.gle/Y3TjqYbCK1m6Ch629](https://forms.gle/Y3TjqYbCK1m6Ch629)
- **Key Finding:** Users found the 1-click flow intuitive with zero blockchain knowledge required
- **Iteration Implemented:** Added real-time stage tracker ("Generating wallet → Signing → Sponsoring gas → Confirmed") based on feedback that users wanted to see what was happening behind the scenes

---

## 🧠 Architecture

StellarBloom separates cryptographic intent generation from blockchain gas execution.

```mermaid
graph TD
    A[User clicks action] -->|No wallet needed| B[Bloom SDK]
    B -->|Generates ephemeral Ed25519 keypair| C[Signs intent locally]
    C -->|Sends signed payload + nonce| D[StellarBloom Relayer]
    D -->|Verifies signature & nonce| E[Rejects replays]
    D -->|Wraps in FeeBumpTransaction| F[Stellar Horizon Testnet]
    F -->|Returns tx hash| D
    D -->|Returns hash| A
```

**Full architecture details:** [📄 Read ARCHITECTURE.md](./ARCHITECTURE.md)

**Core Components:**
1. **`bloom-sdk.ts`** — Browser SDK: generates ephemeral keypair, signs intent with UUID nonce, submits to Relayer
2. **`relayer/index.js`** — Node.js Relayer: verifies Ed25519 signature, prevents replay attacks, wraps intent as FeeBump transaction, sponsors gas
3. **`App.tsx`** — React frontend with Freighter wallet session support and animated 1-click demo

---

## 🔒 Security

- **Replay Attack Prevention** — Every intent requires a `crypto.randomUUID()` nonce. The Relayer rejects any duplicate nonce immediately.
- **Rate Limiting** — 100 requests per 15 minutes per IP via `express-rate-limit`
- **Non-Custodial** — The ephemeral private key is generated in the browser and never sent to any server
- **Isolated Sponsor Key** — `SPONSOR_SECRET` is stored as a server environment variable, never exposed to clients

---

## 🔵 Level 5 Feature Additions (vs Level 4)

| Feature | Description |
|---|---|
| **1-Click Gasless Demo** | Real FeeBump transaction with animated stage tracker |
| **Freighter Wallet Session** | Optional wallet connect provides persistent real identity |
| **Nonce Replay Protection** | UUID-based nonce prevents double-submission attacks |
| **Live Relayer Health API** | `/health` endpoint returns uptime, tx count, XLM sponsored |
| **Render Deployment** | Relayer deployed publicly — anyone can use it |
| **Vercel Deployment** | Frontend deployed publicly — shareable link |
| **Developer Docs** | Step-by-step integration guide in-app |

---

## 📸 Screenshots

<img width="1887" height="819" alt="StellarBloom Landing Page" src="https://github.com/user-attachments/assets/23f25df5-4811-4776-833b-0e292951e8f1" />

<img width="546" height="686" alt="Mobile View" src="https://github.com/user-attachments/assets/ef5d72a9-b9de-482f-b9fa-4058363b2e71" />

<img width="601" height="860" alt="Coffee Shop Demo" src="https://github.com/user-attachments/assets/fa79c3e4-f04d-43a3-91e9-d6cf4cf37e31" />

---

## ⚙️ Local Development

**Prerequisites:** Node.js 18+, a funded Stellar Testnet account secret key

```bash
# 1. Clone the repo
git clone https://github.com/thesumedh/stellar-bloom.git
cd stellar-bloom

# 2. Start the Relayer (port 3000)
cd relayer
cp .env.example .env        # Add your SPONSOR_SECRET
npm install && node index.js

# 3. Start the Frontend (port 5173)
cd ../stellar-bloom
npm install && npm run dev
```

Open `http://localhost:5173` → click **"Claim Free Coffee"** → watch a real Stellar transaction execute.

---

## 🌐 Deployed Infrastructure

| Service | URL |
|---|---|
| **Frontend** | [https://stellar-bloom.vercel.app](https://stellar-bloom.vercel.app) |
| **Relayer API** | [https://stellar-bloom.onrender.com](https://stellar-bloom.onrender.com) |
| **Relayer Health** | [https://stellar-bloom.onrender.com/health](https://stellar-bloom.onrender.com/health) |
| **Deployed Contract** | [`CAZMBK5...EHZLEI`](https://stellar.expert/explorer/testnet/contract/CAZMBK5MIVR2P2DMDJ7L7S2EHV6YNT5CQ5JC775W2OEGVGA5X3EHZLEI) |

---

## 🥋 Progression History

| Level | Belt | Key Achievement |
|---|---|---|
| Level 2 | Yellow | Soroban Rust smart contract + multi-wallet support (Freighter, Albedo, xBull) |
| Level 4 | Green | Gasless Relayer + CI/CD pipeline + FeeBump infrastructure |
| **Level 5** | **Blue** | **1-Click demo + deployed infra + real user validation + replay protection** |
