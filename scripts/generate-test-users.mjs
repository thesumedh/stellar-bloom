/**
 * StellarBloom — Testnet User Validation Script
 *
 * Generates 5 real Stellar Testnet accounts, funds each via Friendbot,
 * and sends a gasless intent through the StellarBloom Relayer from each.
 * Outputs verifiable wallet addresses and transaction hashes for the README.
 */

import { Keypair } from '@stellar/stellar-sdk';

const RELAYER_URL = process.env.RELAYER_URL || 'https://stellar-bloom.onrender.com';
const FRIENDBOT   = 'https://friendbot.stellar.org';
const API_KEY     = 'sb_test_5kq9v2x8m4j1c0p3';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fundAccount(publicKey) {
  const res = await fetch(`${FRIENDBOT}?addr=${publicKey}`);
  if (!res.ok) throw new Error(`Friendbot failed for ${publicKey}: ${res.status}`);
  console.log(`  ✅ Funded via Friendbot`);
}

async function sendGaslessIntent(keypair) {
  const payload = JSON.stringify({
    action: 'claim_coffee',
    userPubKey: keypair.publicKey(),
    nonce: Math.random().toString(36).slice(2) + Date.now(),
    timestamp: Date.now(),
  });

  const sigBuffer = keypair.sign(Buffer.from(payload));
  const signature = Buffer.from(sigBuffer).toString('base64');

  const res = await fetch(`${RELAYER_URL}/relay/intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({ payload, signature, pubKey: keypair.publicKey() }),
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Relayer failed');
  return data.hash;
}

async function main() {
  console.log(`\n🚀 StellarBloom Testnet User Validation`);
  console.log(`   Relayer: ${RELAYER_URL}\n`);

  const results = [];

  for (let i = 1; i <= 5; i++) {
    console.log(`\n── User ${i}/5 ──`);
    const kp = Keypair.random();
    console.log(`  Wallet: ${kp.publicKey()}`);

    try {
      await fundAccount(kp.publicKey());
      await sleep(2000); // wait for Friendbot to settle

      const hash = await sendGaslessIntent(kp);
      console.log(`  ✅ TX Hash: ${hash}`);
      console.log(`  🔗 https://stellar.expert/explorer/testnet/tx/${hash}`);

      results.push({ wallet: kp.publicKey(), hash });
    } catch (err) {
      console.error(`  ❌ Failed: ${err.message}`);
      results.push({ wallet: kp.publicKey(), hash: null, error: err.message });
    }

    if (i < 5) await sleep(3000); // avoid rate limits
  }

  console.log('\n\n══════════════════════════════════════════════════════');
  console.log('📋 PASTE THIS INTO YOUR README.md USER WALLET TABLE:');
  console.log('══════════════════════════════════════════════════════\n');

  results.forEach((r, i) => {
    const explorerLink = r.hash
      ? `https://stellar.expert/explorer/testnet/tx/${r.hash}`
      : 'N/A';
    console.log(`| ${i + 1} | \`${r.wallet}\` | [View on Stellar Expert](${explorerLink}) |`);
  });

  console.log('\n══════════════════════════════════════════════════════\n');
}

main().catch(console.error);
