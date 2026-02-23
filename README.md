# StellarBloom - Zero-Wallet Onboarding Infrastructure

StellarBloom is the missing middleware that allows anyone to use Soroban smart contracts without knowing blockchain exists. It solves the biggest friction point in Stellar's ecosystem growth: onboarding non-crypto users into Soroban dApps.

> **Note:** This current repository represents the **Level 1 - White Belt** implementation for the Stellar Journey to Mastery program. Future levels will expand this into the full Smart Contract Wallet middleware.

## The StellarBloom Vision 🚀

*"Gasless Account Abstraction with Fiat On-Ramp Native to Soroban"*

**What It Will Do (The Magic):**
1. **Social Login → Smart Contract Wallet:** User logs in with Google/Email → StellarBloom creates a Soroban smart contract wallet behind the scenes (no seed phrase, no XLM needed).
2. **Credit Card → Smart Contract Calls:** User pays $5 with credit card → StellarBloom atomically swaps fiat to XLM → executes Soroban contract.
3. **Invisible Blockchain:** User interacts with dApp via familiar web2 UI. StellarBloom handles all blockchain complexity (gas, sequencing, signatures) via meta-transactions.
4. **Sponsored Gas:** dApp developers stake XLM in StellarBloom's gas pool to subsidize user transactions.

---

## 🥋 Level 1 - White Belt Features

For our White Belt submission, we have implemented the foundational layers required to interact with the Stellar Testnet:

- **Wallet Setup & Connection:** Connect and disconnect your Freighter wallet in a single click using the Freighter v6 API.
- **Balance Handling:** Fetches and displays the connected wallet's native testnet XLM balance directly from the Horizon Horizon.
- **Transaction Flow:** Simple form to send XLM to any existing address on the Stellar Testnet.
- **Feedback Alerts:** Real-time feedback for transaction success or failure, including a link to the Stellar Expert explorer.
- **Gorgeous UI:** A visually stunning, responsive user interface using pure Vanilla CSS, featuring glassmorphism elements, CSS animations, and a rich dark mode color palette.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- [Freighter Wallet Browser Extension](https://www.freighter.app/)

### Running Locally

1. **Clone the repository** (or navigate into the folder)
   ```bash
   cd stellar-payment-dapp
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

4. **Prepare the Wallet**
   - Open your Freighter wallet extension.
   - Switch your network to **Stellar Testnet** using the gear icon settings.
   - Hit "Connect Wallet" on the StellarBloom screen!

## Project Requirements Checklist

- [x] Wallet Connection (Implement connect/disconnect)
- [x] Fetch connected wallet's XLM balance and display it clearly
- [x] Send an XLM transaction on Testnet
- [x] Show transaction success/failure states and explorer link
- [x] Simple, modern UI

## Screenshots Placeholder

<img width="1901" height="842" alt="Screenshot 2026-02-23 234156" src="https://github.com/user-attachments/assets/e6d5ce6e-5900-41ac-8f6e-d487f4a04517" />

<img width="1223" height="847" alt="Screenshot 2026-02-23 234311" src="https://github.com/user-attachments/assets/5410df05-b361-48c5-9343-5018ee4c47e5" />

<img width="514" height="732" alt="Screenshot 2026-02-23 234330" src="https://github.com/user-attachments/assets/21646789-853c-425d-8ed1-6ba799b82131" />



