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

## 🥋 Level 2 - Yellow Belt Features

For our Yellow Belt submission, we have implemented multi-wallet support and deployed our first Soroban Smart Contract to the testnet!

- **Multi-Wallet Support:** Users can now seamlessly connect using Freighter, Albedo, or xBull wallets via the `@creit.tech/stellar-wallets-kit` integration.
- **User Wallet Smart Contract (Rust):** A Soroban smart contract was written in Rust with initialization and meta-transaction execution capabilities.
- **Smart Contract Event Mapping:** The `execute_transfer` function in the contract emits a `gasless transaction executed` event upon success.
- **Testnet Deployment:** The optimized `.wasm` has been successfully deployed and verified on the Stellar Testnet.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- A Stellar wallet (Freighter, Albedo, or xBull)

### Running Locally

1. **Clone the repository** (or navigate into the folder)
   ```bash
   git clone https://github.com/thesumedh/stellar-bloom.git
   cd stellar-bloom/stellar-bloom
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
   - Select either Freighter, Albedo, or xBull from the popup modal.
   - Send and verify transactions on the Testnet!

## Project Submission Requirements & Links

✅ **Public GitHub repository**
- [Repository link](https://github.com/thesumedh/stellar-bloom)

✅ **Required Deployed Artifacts**
- **Deployed Contract Address:** `CAZMBK5MIVR2P2DMDJ7L7S2EHV6YNT5CQ5JC775W2OEGVGA5X3EHZLEI`
- **Example Transaction Hash:** [View on Stellar Expert](https://stellar.expert/explorer/testnet/op/5628898238803969)

## Screenshots

**Multi-Wallet Connection Screen Available in Level 2:**

*(Insert screenshot of the popup wallet options here)*

<img width="1901" height="842" alt="Screenshot 2026-02-23 234156" src="https://github.com/user-attachments/assets/e6d5ce6e-5900-41ac-8f6e-d487f4a04517" />
<img width="1223" height="847" alt="Screenshot 2026-02-23 234311" src="https://github.com/user-attachments/assets/5410df05-b361-48c5-9343-5018ee4c47e5" />
<img width="514" height="732" alt="Screenshot 2026-02-23 234330" src="https://github.com/user-attachments/assets/21646789-853c-425d-8ed1-6ba799b82131" />
