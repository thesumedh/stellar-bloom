# 🎤 Demo Day Presentation Guide

This document is the prepared Demo Day script and slide plan for StellarBloom's Level 6 submission.

---

## Demo Goal

Show that StellarBloom removes onboarding friction by letting a user complete a real Stellar transaction without installing a wallet, buying XLM, or understanding gas.

---

## Suggested Slide Order

1. **Problem**  
   New users drop off before they ever reach a useful blockchain interaction.
2. **Product**  
   StellarBloom is gasless onboarding infrastructure for Soroban experiences.
3. **How It Works**  
   Ephemeral keypair, signed intent, relayer sponsorship, real transaction hash.
4. **Live Demo**  
   Show the walletless flow from button click to explorer proof.
5. **Metrics**  
   Show active wallets, total transactions, repeat wallets, and active days.
6. **Security And Monitoring**  
   Replay protection, rate limits, health endpoint, persistent logging.
7. **Why It Matters**  
   This can be reused as onboarding infrastructure for any Stellar app.

---

## Live Demo Flow

Recommended 3-5 minute live sequence:

1. Open the homepage
2. Explain that no wallet install is required
3. Click the walletless action
4. Narrate the progress tracker
5. Open the Stellar Expert transaction link
6. Open `/health`
7. Open `/api/metrics`
8. Show the README proof table

---

## Key Numbers To Mention

Use these repo-backed numbers in the current submission package:

- 38 unique wallets in the relayer log
- 46 real logged transactions
- 30 exported wallet proofs
- 4 repeat wallets
- 4 active days

If these numbers change before submission, rerun the proof export and refresh the README snapshot.

---

## Backup Plan

If the hosted relayer is rate-limited or temporarily unavailable:

- show the pre-generated wallet proof table
- open the explorer links directly
- open the metrics endpoint
- explain the relayer flow using the architecture diagram

This avoids losing the story even if a live transaction cannot be demonstrated at that exact moment.

---

## Expected Questions

**How is this different from just telling users to install Freighter?**  
It removes the highest-friction first step and allows apps to prove value before asking for wallet commitment.

**Are the transactions real?**  
Yes. Every proof link points to Stellar Expert on testnet.

**What is the advanced feature?**  
Fee sponsorship through the relayer and fee bump support for signed wallet flows.

**What is still missing for a mainnet version?**  
Persistent nonce storage, stronger API key management, and database-backed analytics.
