# 📦 Level 6 Evidence Pack

This document is the fastest way for a reviewer to verify StellarBloom's Black Belt evidence without reading the entire repository.

---

## Snapshot

Current relayer-derived proof snapshot:

- **38** unique wallets in the persistent log
- **46** real logged transactions
- **30** exported wallet proofs for README and review
- **4** repeat wallets
- **4** active days

Primary proof files:

- [README.md](../README.md)
- [relayer/data/user-validation-results.json](../relayer/data/user-validation-results.json)
- [relayer/data/user-validation-table.md](../relayer/data/user-validation-table.md)
- [relayer/data/level6-proof-summary.json](../relayer/data/level6-proof-summary.json)

---

## Requirement Matrix

| Requirement | Status | Evidence |
|---|---|---|
| Public GitHub repository | Ready | [README.md](../README.md) |
| Live demo | Ready | [https://stellar-bloom.vercel.app](https://stellar-bloom.vercel.app) |
| 30+ verified active wallets | Ready | [README.md](../README.md), [user-validation-results.json](../relayer/data/user-validation-results.json) |
| Metrics dashboard live | Ready | [https://stellar-bloom.onrender.com/api/metrics](https://stellar-bloom.onrender.com/api/metrics) |
| Monitoring active | Ready | [https://stellar-bloom.onrender.com/health](https://stellar-bloom.onrender.com/health), [MONITORING_RUNBOOK.md](./MONITORING_RUNBOOK.md) |
| Security checklist completed | Ready | [SECURITY.md](../SECURITY.md) |
| Data indexing implemented | Ready | [ARCHITECTURE.md](../ARCHITECTURE.md), [export-proof.mjs](../relayer/export-proof.mjs) |
| Full documentation | Ready | [README.md](../README.md), [USER_GUIDE.md](./USER_GUIDE.md), [ARCHITECTURE.md](../ARCHITECTURE.md), [MONITORING_RUNBOOK.md](./MONITORING_RUNBOOK.md) |
| Community contribution | Ready | [Tweet link in README](../README.md) |
| Advanced feature implemented | Ready | Fee sponsorship via `/relay` and `/relay/intent` |
| Demo Day presentation prepared | Ready | [DEMO_DAY.md](./DEMO_DAY.md) |
| 30 meaningful commits | Pending on local `main` | Complete before final submission if current branch history is still below threshold |

---

## Review Path

If a reviewer only has a few minutes, this is the recommended order:

1. Open [README.md](../README.md)
2. Verify one wallet from the wallet table on Stellar Expert
3. Open [https://stellar-bloom.onrender.com/health](https://stellar-bloom.onrender.com/health)
4. Open [https://stellar-bloom.onrender.com/api/metrics](https://stellar-bloom.onrender.com/api/metrics)
5. Open [SECURITY.md](../SECURITY.md)
6. Open [MONITORING_RUNBOOK.md](./MONITORING_RUNBOOK.md)

---

## What Makes The Submission Strong

- The relayer is publicly reachable
- Transactions are real and externally verifiable
- Proof artifacts are generated from the persistent log instead of being manually assembled
- Metrics, monitoring, and documentation all point to the same operational story

---

## Final Pre-Submit Check

Before final submission:

- ensure `main` clears the 30-commit threshold
- rerun `npm run proof:export` in [relayer/package.json](../relayer/package.json) after any new transactions
- refresh the README wallet table and metrics snapshot if the proof set changes
