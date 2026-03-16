# StellarBloom - Zero-Wallet Onboarding Infrastructure

StellarBloom is the missing middleware that allows anyone to use Soroban smart contracts without knowing blockchain exists. It solves the biggest friction point in Stellar's ecosystem growth: onboarding non-crypto users into Soroban dApps.

> **Note:** This repository represents the **Level 2 - Yellow Belt** implementation for the Stellar Journey to Mastery program.

## The StellarBloom Vision 🚀

*"Gasless Account Abstraction with Fiat On-Ramp Native to Soroban"*

**What It Will Do (The Magic):**
1. **Social Login → Smart Contract Wallet:** User logs in with Google/Email → StellarBloom creates a Soroban smart contract wallet behind the scenes (no seed phrase, no XLM needed).
2. **Credit Card → Smart Contract Calls:** User pays $5 with credit card → StellarBloom atomically swaps fiat to XLM → executes Soroban contract.
3. **Invisible Blockchain:** User interacts with dApp via familiar web2 UI. StellarBloom handles all blockchain complexity (gas, sequencing, signatures) via meta-transactions.
4. **Sponsored Gas:** dApp developers stake XLM in StellarBloom's gas pool to subsidize user transactions.

---

## 🟠 Level 3 - Orange Belt Features

For our Orange Belt submission, we have implemented a fully functioning Mini-dApp representing the Zero-Wallet onboarding flow!

- **Gas Sponsor Relayer:** A Node.js/Express backend that receives signed transactions from users and covers their gas fees using a Soroban `FeeBumpTransaction`.
- **Zero-Wallet Frontend Integration:** The React frontend now bypasses normal fee requirements, passing signed payloads to the Relayer API.
- **Smart Contract Test Suite:** Comprehensive Rust tests verifying contract initialization, execution flows, and failure states.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- A Stellar wallet (Freighter, Albedo, or xBull)
- Rust and Soroban CLI (for running tests)

### 1. Running the Relayer Backend

1. **Navigate to the relayer folder**
   ```bash
   cd relayer
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Relayer**
   ```bash
   npm start
   ```

### 2. Running the Frontend Locally

1. **Navigate to the frontend folder**
   ```bash
   cd stellar-bloom
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

4. **Connect your Wallet!**
   - Click "Connect Wallet" from the dApp.
   - Send testnet transactions for free!

## Project Submission Requirements & Links

✅ **Public GitHub repository**
- [Repository link](https://github.com/thesumedh/stellar-bloom)

✅ **Live Web Demo**
- **Live Demo Link:** *(Insert Vercel/Netlify Link Here)*

✅ **Required Deployed Artifacts (Level 2 & 3)**
- **Deployed Contract Address:** `CBRCZHNXOYXLIWWNWAEUMLXWKP6HH534RWISAA7DOTEVEDBR3HEVSJCF`
- **Example Transaction Hash:** [View on Stellar Expert](https://stellar.expert/explorer/testnet/op/5628898238803969)
- **Demo Video (1-minute):** *(Insert YouTube/Loom Link Here)*

## Screenshots & Test Outputs

**3+ Passing Rust Tests:**

```bash
> cargo test

running 3 tests
test test::test_insufficient_balance_fails - should panic ... ok
test test::test_successful_execution ... ok
test test::test_unauthorized_execution_fails - should panic ... ok

test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s
```
*(Optional: If the submission form requests a raw image instead of the text above, simply run `cargo test` in your `contracts` folder, press `Win + Shift + S` on your Windows keyboard, draw a box around the output, and paste the image here or directly in your submission form!)*

**Multi-Wallet Connection Screen Available:**

*(Insert screenshot of the popup wallet options here)*

<img width="1901" height="842" alt="Screenshot 2026-02-23 234156" src="https://github.com/user-attachments/assets/e6d5ce6e-5900-41ac-8f6e-d487f4a04517" />
<img width="1223" height="847" alt="Screenshot 2026-02-23 234311" src="https://github.com/user-attachments/assets/5410df05-b361-48c5-9343-5018ee4c47e5" />
<img width="514" height="732" alt="Screenshot 2026-02-23 234330" src="https://github.com/user-attachments/assets/21646789-853c-425d-8ed1-6ba799b82131" />

