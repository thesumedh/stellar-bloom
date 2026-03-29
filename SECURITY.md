# 🔒 StellarBloom Security Checklist

This document outlines all security measures implemented in StellarBloom's gasless relayer infrastructure.

---

## ✅ Cryptographic Security

| # | Control | Status | Implementation |
|---|---|---|---|
| 1 | **Ed25519 Signature Verification** | ✅ Implemented | Every intent payload is verified against the sender's ephemeral public key before processing |
| 2 | **Non-Custodial Key Design** | ✅ Implemented | Ephemeral private keys are generated in the browser and never transmitted to any server |
| 3 | **Nonce-Based Replay Protection** | ✅ Implemented | `crypto.randomUUID()` nonce per intent; relayer rejects any duplicate nonce via `seenNonces` Set |
| 4 | **Sponsor Key Isolation** | ✅ Implemented | `SPONSOR_SECRET` stored as server-side environment variable only, never exposed in client bundle |

---

## ✅ Network & API Security

| # | Control | Status | Implementation |
|---|---|---|---|
| 5 | **Rate Limiting (IP-level)** | ✅ Implemented | `express-rate-limit`: 100 requests per 15 minutes per IP |
| 6 | **Rate Limiting (per session key)** | ✅ Implemented | Max 5 gasless transactions per hour per unique ephemeral public key |
| 7 | **CORS Policy** | ✅ Implemented | Express CORS middleware configured on all relayer endpoints |
| 8 | **HTTPS Enforced** | ✅ Implemented | Render enforces HTTPS on all inbound connections; HTTP redirected automatically |
| 9 | **API Key Authentication** | ✅ Implemented | `x-api-key` header required on `/relay` and `/relay/intent` endpoints |
| 10 | **Input Validation** | ✅ Implemented | Relayer validates presence of `payload`, `signature`, and `pubKey` before processing |

---

## ✅ Infrastructure Security

| # | Control | Status | Implementation |
|---|---|---|---|
| 11 | **`.env` in `.gitignore`** | ✅ Implemented | `SPONSOR_SECRET` never committed to version control |
| 12 | **`.env.example` provided** | ✅ Implemented | Developers know what vars to set without exposing real values |
| 13 | **Uncaught Exception Handlers** | ✅ Implemented | `process.on('uncaughtException')` prevents silent crashes |
| 14 | **Health Check Endpoint** | ✅ Implemented | `/health` exposes uptime and tx counts for monitoring without sensitive data |
| 15 | **Nonce Pruning** | ✅ Implemented | `seenNonces` Set pruned at 10,000 entries to prevent unbounded memory growth |

---

## ⚠️ Known Limitations (In-Scope for Next Phase)

| # | Limitation | Mitigation Plan |
|---|---|---|
| L1 | Nonce store is in-memory (lost on restart) | Migrate to Redis with TTL in Phase 2 |
| L2 | API key store is in-memory | Migrate to PostgreSQL in Phase 2 |
| L3 | No per-key spending cap enforcement | Add `xlm_limit` column in Phase 2 DB |
| L4 | No formal penetration test | Schedule after persistent DB migration |

---

## Verification

All cryptographic and operational controls can be independently verified in the repository:

- **Intent verification and replay protection:** [`relayer/index.js`](./relayer/index.js)
- **Persistent transaction logging and metrics indexing:** [`relayer/index.js`](./relayer/index.js)
- **Walletless key generation and local signing:** [`stellar-bloom/src/lib/bloom-sdk.ts`](./stellar-bloom/src/lib/bloom-sdk.ts)
- **Wallet-signed fee bump relay path:** [`stellar-bloom/src/stellar/stellar.ts`](./stellar-bloom/src/stellar/stellar.ts)
- **Level 6 proof export pipeline:** [`relayer/export-proof.mjs`](./relayer/export-proof.mjs)
