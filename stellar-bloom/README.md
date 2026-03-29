# StellarBloom Frontend

This package contains the React frontend for StellarBloom's hosted walletless onboarding demo and developer dashboard.

---

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Copy the frontend environment template

```bash
cp .env.example .env.local
```

3. Start the dev server

```bash
npm run dev
```

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_RELAYER_URL` | Base URL for the hosted or local relayer |
| `VITE_RELAYER_API_KEY` | Public demo API key used by the hosted onboarding flow |

Default hosted values are provided in `.env.example`.

For local relayer development, set:

```env
VITE_RELAYER_URL=http://localhost:3000
VITE_RELAYER_API_KEY=sb_test_5kq9v2x8m4j1c0p3
```

---

## What This App Includes

- walletless onboarding demo
- developer metrics dashboard
- relayer health visibility
- wallet-connected fee bump flow

The main project documentation lives in the repo root:

- `../README.md`
- `../ARCHITECTURE.md`
- `../docs/USER_GUIDE.md`
