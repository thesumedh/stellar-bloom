# 📖 StellarBloom User Guide

**StellarBloom** enables anyone to interact with Stellar blockchain applications without installing a wallet, buying crypto, or paying gas fees.

---

## For End Users (No Crypto Experience Required)

### What is StellarBloom?

Think of it like this: normally to use a blockchain app you need to:
1. Install a browser extension (Freighter)
2. Write down 24 secret words
3. Buy XLM on an exchange
4. Pay a "gas fee" for every action

StellarBloom eliminates all of that. You just **click a button**.

---

### How to Use the Coffee Shop Demo

**Step 1:** Open [https://stellar-bloom.vercel.app](https://stellar-bloom.vercel.app)

**Step 2:** Click **"Claim Free Coffee ☕"**

**Step 3:** Watch the progress tracker:
- ⚙️ *Generating invisible wallet* — a temporary cryptographic key is created in your browser
- ✍️ *Signing locally* — your action is signed privately (nothing leaves your device)
- 🚀 *Sponsoring gas fee* — StellarBloom pays the transaction fee on your behalf

**Step 4:** See your receipt:
- Your session wallet address
- Fee paid by you: **$0.00**
- A link to verify your transaction on **Stellar Expert** (the block explorer)

That's it. A real Stellar Testnet transaction executed with zero setup.

---

### Optional: Connect Your Wallet for a Persistent Identity

If you have a **Freighter** wallet installed:

1. Click **"Connect Wallet"** in the top-right corner
2. Approve the connection in the Freighter popup
3. Your real `G...` address now shows in the nav bar
4. Future transactions link to your real identity instead of a temporary key

> **Note:** Connecting your wallet is for **identity only** — you still pay $0.00 in gas fees. StellarBloom's relayer covers the fee for the hosted testnet experience.

---

### Privacy & Safety

- ✅ **No private key ever leaves your device** — keys are generated and used locally only
- ✅ **No account creation required** — no passwords, no email required for the demo
- ✅ **Testnet only** — all transactions are on Stellar Testnet (no real money involved)
- ✅ **Fully verifiable** — every transaction hash links to Stellar Expert for independent verification

---

## For Developers

### Quick Integration

```bash
git clone https://github.com/thesumedh/stellar-bloom
cd stellar-bloom/relayer
cp .env.example .env    # Add your SPONSOR_SECRET
npm install && node index.js
```

Your relayer is now running at `http://localhost:3000`.

### Send a Gasless Intent

```javascript
import { executeGasless } from './bloom-sdk';

const result = await executeGasless('your_action');
// { success: true, hash: 'abc...xyz', userPubKey: 'G...' }
```

### Verify on Stellar Expert

```
https://stellar.expert/explorer/testnet/tx/${result.hash}
```

---

### Relayer API Reference

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/health` | GET | None | Relayer status, uptime, tx count |
| `/relay` | POST | `x-api-key` | Submit signed transaction XDR |
| `/relay/intent` | POST | `x-api-key` | Submit off-chain signed intent |
| `/api/stats/:key` | GET | None | Usage analytics for an API key |
| `/api/keys/generate` | POST | None | Generate a new API key |

### Hosted Demo Surfaces

| Surface | URL |
|---|---|
| Frontend | [https://stellar-bloom.vercel.app](https://stellar-bloom.vercel.app) |
| Relayer health | [https://stellar-bloom.onrender.com/health](https://stellar-bloom.onrender.com/health) |
| Metrics | [https://stellar-bloom.onrender.com/api/metrics](https://stellar-bloom.onrender.com/api/metrics) |

### Intent Payload Schema

```json
{
  "payload": "{\"action\":\"claim_coffee\",\"nonce\":\"uuid-v4\",\"timestamp\":1711234567890}",
  "signature": "base64-encoded-ed25519-signature",
  "pubKey": "GABCD...XYZ"
}
```

---

## FAQ

**Q: Is this real or simulated?**
Every transaction is a genuine Stellar Testnet transaction. The hash is verifiable on Stellar Expert.

**Q: Who pays the gas fee?**
StellarBloom's relayer pays the fee in the hosted testnet flow. In walletless mode it submits sponsored actions on the user's behalf, and in wallet-connected mode it can relay a signed XDR through a fee bump transaction.

**Q: What happens to my temporary wallet?**
The ephemeral keypair exists only in browser memory for the duration of the transaction. It is never stored anywhere.

**Q: Can I lose money?**
No. StellarBloom runs on Stellar Testnet where all XLM is free and has no real-world value.

**Q: Where can I see monitoring and proof data?**
Use the live health endpoint, the indexed metrics endpoint, and the exported wallet-proof files linked from the main [README](../README.md).
