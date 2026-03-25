# 🧠 Architecture Documentation

## StellarBloom: Zero-Wallet Onboarding for Soroban

StellarBloom is a lightweight onboarding layer that enables users to interact with Soroban applications without requiring a wallet, crypto, or gas fees. Instead of complex setup, users simply click an action (e.g., “Claim Free Coffee”), and everything happens seamlessly in the background - a temporary wallet is created, the request is securely signed, and a relayer submits the transaction on their behalf. The user instantly sees the result (such as receiving XLM) without needing to understand blockchain mechanics.

By abstracting wallets and fees, StellarBloom transforms blockchain interactions into a familiar Web2-like experience, significantly lowering the barrier to entry and enabling mass adoption within the Stellar ecosystem.

---

## 🌸 Zero-Gas-Fee Transactions - Implementation Details

StellarBloom enables gasless transactions through a combination of ephemeral wallets, signed user intents, and a relayer-based fee sponsorship system.

### 1. Ephemeral Wallet Generation (Client-Side)
When a user initiates an action, StellarBloom generates a temporary keypair in the browser using the Stellar/Soroban SDK. The private key is stored only in memory and discarded after the session.
This provides a secure, temporary identity without requiring:
- Wallet installation
- Seed phrase management
- Prior blockchain experience

### 2. Intent-Based Transaction Model
Instead of signing full transactions, users sign a lightweight intent payload that includes:
- Contract function
- Parameters
- Ephemeral public key
- Nonce and timestamp

**Example Payload:**
```json
{
  "action": "claim_reward",
  "contract_id": "...",
  "args": ["coffee_reward"],
  "user_pubkey": "G...",
  "nonce": "123456",
  "timestamp": "..."
}
```
This payload is signed locally and sent to the relayer.

### 3. Relayer Service (Gas Sponsorship)
A backend relayer service:
- Verifies the signed intent (signature, nonce, validity)
- Applies rate limiting and abuse protection
- Constructs and submits a Soroban transaction
- Pays the transaction fees using its own funded account
This ensures the user never needs to hold XLM or pay gas fees.

### 4. Smart Contract Design (Meta-Transactions)
Soroban smart contracts are designed to support meta-transactions by:
- Accepting signed user payloads
- Verifying authenticity and nonce uniqueness
- Executing actions on behalf of the user
This enables secure, delegated execution without direct user-submitted transactions.

### 5. Fee Sponsorship Model
Gas fees are covered through a relayer pool funded with XLM. The system supports:
- Per-user usage limits
- Daily or campaign-based caps
- Sponsored onboarding campaigns (e.g., free transactions for new users)
This model is scalable and can be extended to allow dApps to sponsor their own users.

### 6. Security and Abuse Prevention
StellarBloom includes multiple safeguards:
- Nonce-based replay protection
- Rate limiting per session or device
- Optional CAPTCHA / human verification
- Ephemeral session expiration
- Pre-submission transaction simulation

### 7. End-to-End User Flow
1. User clicks an action (e.g., “Claim Free Coffee”)
2. Temporary wallet is generated instantly
3. Intent is created and signed
4. Relayer validates and submits the transaction
5. Smart contract executes the request
6. User receives the result immediately

---

## 🌟 Outcome
StellarBloom abstracts away wallets, gas fees, and blockchain complexity, delivering a seamless onboarding experience that feels like a traditional web application. By removing friction at the first interaction, it enables developers to reach mainstream users and accelerates adoption of the Soroban ecosystem.
