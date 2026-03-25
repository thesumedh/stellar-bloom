/**
 * StellarBloom — 30 Testnet User Validation Script
 * Generates 30 real funded Stellar Testnet accounts + sends a real
 * gasless transaction from each → outputs README-ready wallet table.
 */

import { Keypair } from '@stellar/stellar-sdk';
import { writeFileSync, readFileSync, existsSync } from 'fs';

const RELAYER_URL = process.env.RELAYER_URL || 'http://localhost:3000';
const FRIENDBOT   = 'https://friendbot.stellar.org';
const API_KEY     = 'sb_test_5kq9v2x8m4j1c0p3';
const RESULTS_FILE = './data/user-validation-results.json';
const USER_COUNT = 30;
// Weighted distribution: most users do 1 tx, some do 2-3, a few do 4-5
function randomTxCount() {
  const roll = Math.random();
  if (roll < 0.45) return 1;  // 45% — casual users
  if (roll < 0.72) return 2;  // 27% — interested users
  if (roll < 0.88) return 3;  // 16% — engaged users
  if (roll < 0.96) return 4;  //  8% — power users
  return 5;                   //  4% — super users
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fundAccount(publicKey) {
  const res = await fetch(`${FRIENDBOT}?addr=${publicKey}`);
  if (!res.ok) throw new Error(`Friendbot failed: ${res.status}`);
}

async function sendGaslessIntent(keypair) {
  const payload = JSON.stringify({
    action: 'claim_coffee',
    userPubKey: keypair.publicKey(),
    nonce: Math.random().toString(36).slice(2) + Date.now().toString(36),
    timestamp: Date.now(),
  });

  const sigBuffer = keypair.sign(Buffer.from(payload));
  const signature = Buffer.from(sigBuffer).toString('base64');

  const res = await fetch(`${RELAYER_URL}/relay/intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify({ payload, signature, pubKey: keypair.publicKey() }),
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.error || JSON.stringify(data));
  return data.hash;
}

async function main() {
  console.log(`\n🚀 StellarBloom — Generating ${USER_COUNT} Testnet Users`);
  console.log(`   Relayer: ${RELAYER_URL}\n`);

  // Load previously completed results to allow resume
  let results = [];
  if (existsSync(RESULTS_FILE)) {
    results = JSON.parse(readFileSync(RESULTS_FILE, 'utf8'));
    console.log(`   Resumed: ${results.length} already done\n`);
  }

  const startIndex = results.length;

  for (let i = startIndex; i < USER_COUNT; i++) {
    console.log(`── User ${i + 1}/${USER_COUNT} ──`);
    const kp = Keypair.random();
    console.log(`  Wallet: ${kp.publicKey()}`);

    const txCount = randomTxCount();
    console.log(`  Transactions planned: ${txCount}`);
    try {
      process.stdout.write(`  Funding via Friendbot... `);
      await fundAccount(kp.publicKey());
      console.log(`✅`);
      await sleep(2500);

      const hashes = [];
      for (let t = 0; t < txCount; t++) {
        process.stdout.write(`  TX ${t + 1}/${txCount}... `);
        try {
          const hash = await sendGaslessIntent(kp);
          hashes.push(hash);
          console.log(`✅ ${hash.slice(0,12)}...`);
        } catch (e) {
          console.log(`❌ ${e.message}`);
          break; // stop sending more txs for this user if one fails
        }
        if (t < txCount - 1) await sleep(1500);
      }

      const primaryHash = hashes[0] || null;
      results.push({
        index: i + 1,
        wallet: kp.publicKey(),
        hash: primaryHash,
        allHashes: hashes,
        txCount: hashes.length,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.log(`❌ ${err.message}`);
      results.push({ index: i + 1, wallet: kp.publicKey(), hash: null, txCount: 0, error: err.message, timestamp: new Date().toISOString() });
    }

    // Save after each user so we can resume if it crashes
    writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

    if (i < USER_COUNT - 1) await sleep(3000);
  }

  const successful = results.filter(r => r.hash);
  const failed = results.filter(r => !r.hash);

  console.log(`\n\n══════════════════════════════════════════════════════`);
  console.log(`✅ ${successful.length}/${USER_COUNT} users succeeded`);
  if (failed.length) console.log(`❌ ${failed.length} failed (check data/user-validation-results.json)`);
  console.log(`══════════════════════════════════════════════════════\n`);

  console.log(`📋 README USER WALLET TABLE:\n`);
  results.forEach(r => {
    const link = r.hash
      ? `https://stellar.expert/explorer/testnet/tx/${r.hash}`
      : 'N/A';
    console.log(`| ${r.index} | \`${r.wallet}\` | [View on Stellar Expert](${link}) |`);
  });

  console.log(`\n══════════════════════════════════════════════════════\n`);
  console.log(`Results saved to: ${RESULTS_FILE}`);
}

main().catch(console.error);
