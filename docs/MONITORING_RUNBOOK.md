# 🛠️ Monitoring And Operations Runbook

This document explains how StellarBloom is monitored in its current Level 6 deployment and how to verify that the relayer is healthy before a demo or review.

---

## Live Endpoints

| Surface | URL | Purpose |
|---|---|---|
| Relayer health | [https://stellar-bloom.onrender.com/health](https://stellar-bloom.onrender.com/health) | Uptime, total transactions, and sponsor spend summary |
| Metrics dashboard | [https://stellar-bloom.onrender.com/api/metrics](https://stellar-bloom.onrender.com/api/metrics) | Indexed usage analytics |
| Frontend demo | [https://stellar-bloom.vercel.app](https://stellar-bloom.vercel.app) | Live user-facing product |

---

## What Is Monitored

### Health

The relayer exposes:

- uptime
- total transaction count
- total XLM sponsored

### Usage Analytics

The metrics endpoint exposes:

- total transactions
- unique wallets
- repeat wallets
- active today / active last 7 days
- action mix
- top wallets
- recent transactions
- indexed sponsor spend

### Persistent Proof

The relayer writes to:

- `relayer/data/transactions.json`

This file is the source of truth for exported Black Belt evidence.

---

## Pre-Demo Checklist

Run this checklist before showing StellarBloom live:

1. Open the health endpoint and confirm status is `ok`
2. Open the metrics endpoint and confirm counts are non-zero
3. Trigger one walletless demo transaction from the frontend
4. Confirm the returned transaction opens on Stellar Expert
5. Confirm the new transaction appears in `/api/metrics`

---

## Recovery Steps

### If The Frontend Loads But Claims Fail

- Verify the relayer health endpoint is reachable
- Check that the sponsor account still has testnet funds
- Check whether rate limiting was triggered
- Retry after the 15-minute IP window if needed

### If Metrics Look Stale

- Confirm the relayer can still append to `transactions.json`
- Trigger one new transaction
- Refresh `/api/metrics`
- Regenerate proof exports with `npm run proof:export`

### If Wallet-Signed Relay Fails

- Confirm `VITE_RELAYER_URL` is set correctly
- Confirm the relayer `/relay` endpoint is reachable
- Confirm the wallet-signed transaction XDR is valid for testnet

---

## Current Operational Limits

The project is ready for Level 6 testnet operations, with a few known boundaries:

- IP-based rate limit: 100 requests per 15 minutes
- per-wallet limit: 5 intent transactions per hour
- nonce and API key state are still in memory
- logs are JSON-backed, not database-backed

These constraints are acceptable for the current hosted testnet phase and are documented in [SECURITY.md](../SECURITY.md).

---

## Evidence Links

- [README.md](../README.md)
- [ARCHITECTURE.md](../ARCHITECTURE.md)
- [SECURITY.md](../SECURITY.md)
- [relayer/data/level6-proof-summary.json](../relayer/data/level6-proof-summary.json)
