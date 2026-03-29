# StellarBloom Relayer

This package contains the hosted relayer used by StellarBloom's walletless onboarding flow and fee bump relay flow.

---

## What It Does

- accepts signed walletless intents at `/relay/intent`
- accepts signed XDR relay requests at `/relay`
- exposes relayer health at `/health`
- exposes indexed analytics at `/api/metrics`
- writes persistent transaction logs to `data/transactions.json`
- exports Level 6 proof artifacts from the transaction log

---

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Copy the env template

```bash
cp .env.example .env
```

3. Set your sponsor secret in `.env`

```env
SPONSOR_SECRET=SB...
```

4. Start the relayer

```bash
npm start
```

---

## Available Scripts

| Script | Purpose |
|---|---|
| `npm start` | Run the relayer locally |
| `npm run proof:export` | Generate wallet validation and summary artifacts from the transaction log |
| `npm run synthetic:validate` | Run the multi-wallet validation journey against the relayer |

---

## Key Files

| File | Purpose |
|---|---|
| `index.js` | Relayer endpoints, rate limits, logging, metrics |
| `generate-test-users.mjs` | Multi-wallet transaction runner |
| `export-proof.mjs` | Proof export pipeline for Level 6 |
| `data/transactions.json` | Persistent transaction log |

---

## Hosted Endpoints

- [https://stellar-bloom.onrender.com/health](https://stellar-bloom.onrender.com/health)
- [https://stellar-bloom.onrender.com/api/metrics](https://stellar-bloom.onrender.com/api/metrics)

For the full project submission context, see the root [README](../README.md).
