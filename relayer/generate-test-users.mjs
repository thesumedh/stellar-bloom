/**
 * StellarBloom — Synthetic Load Validation Script
 *
 * Creates 30+ real Stellar testnet wallets through the relayer itself and
 * executes 2-3 real sponsored transactions per wallet. This is intended for
 * Black Belt synthetic load proof, not for fabricating user feedback.
 */

import { Keypair } from '@stellar/stellar-sdk';
import { writeFileSync, readFileSync, existsSync } from 'fs';

const RELAYER_URL = (process.env.RELAYER_URL || 'http://localhost:3000').replace(/\/$/, '');
const API_KEY = process.env.RELAYER_API_KEY || 'sb_test_5kq9v2x8m4j1c0p3';
const RESULTS_FILE = './data/synthetic-validation-results.json';
const TABLE_FILE = './data/synthetic-validation-table.md';
const USER_COUNT = Number(process.env.USER_COUNT || 30);
const ACTIONS = ['claim_coffee', 'claim_ticket', 'unlock_item'];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class RateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RateLimitError';
  }
}

function randomTxCount() {
  return Math.random() < 0.65 ? 2 : 3;
}

function pickAction(previousActions) {
  const unseen = ACTIONS.filter((action) => !previousActions.includes(action));
  const pool = unseen.length > 0 ? unseen : ACTIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildPayload(keypair, action) {
  return JSON.stringify({
    action,
    userPubKey: keypair.publicKey(),
    nonce: `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`,
    timestamp: Date.now(),
  });
}

async function sendGaslessIntent(keypair, action) {
  const payload = buildPayload(keypair, action);
  const signature = Buffer.from(keypair.sign(Buffer.from(payload))).toString('base64');

  const res = await fetch(`${RELAYER_URL}/relay/intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({ payload, signature, pubKey: keypair.publicKey() }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    if (res.status === 429 || `${data.error || ''}`.includes('Too many requests')) {
      throw new RateLimitError(data.error || 'Relayer rate limit reached. Wait 15 minutes and rerun to resume.');
    }
    throw new Error(data.error || `Intent relay failed with ${res.status}`);
  }

  return {
    hash: data.hash,
    action,
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${data.hash}`,
    timestamp: new Date().toISOString(),
  };
}

function loadExistingResults() {
  if (!existsSync(RESULTS_FILE)) {
    return [];
  }

  try {
    const parsed = JSON.parse(readFileSync(RESULTS_FILE, 'utf8'));
    return parsed.filter((entry) => entry.status === 'success');
  } catch {
    return [];
  }
}

function buildMarkdownTable(results) {
  const lines = [
    '| # | Wallet | Explorer | Tx Count | Actions |',
    '|---|---|---|---:|---|',
  ];

  results.forEach((result) => {
    lines.push(
      `| ${result.index} | \`${result.wallet}\` | [View on Stellar Expert](${result.primaryExplorerUrl}) | ${result.txCount} | ${result.actions.join(', ')} |`
    );
  });

  return `${lines.join('\n')}\n`;
}

function persistArtifacts(results) {
  writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  writeFileSync(TABLE_FILE, buildMarkdownTable(results));
}

async function createSyntheticJourney(index) {
  const keypair = Keypair.random();
  const plannedTxCount = randomTxCount();
  const journey = [];

  console.log(`── Synthetic Wallet ${index}/${USER_COUNT} ──`);
  console.log(`  Wallet: ${keypair.publicKey()}`);
  console.log(`  Planned sponsored txs: ${plannedTxCount}`);

  for (let step = 0; step < plannedTxCount; step += 1) {
    const action = pickAction(journey.map((entry) => entry.action));
    process.stdout.write(`  TX ${step + 1}/${plannedTxCount} (${action})... `);
    const tx = await sendGaslessIntent(keypair, action);
    journey.push(tx);
    console.log(`✅ ${tx.hash.slice(0, 12)}...`);

    if (step < plannedTxCount - 1) {
      await sleep(1800);
    }
  }

  return {
    index,
    wallet: keypair.publicKey(),
    status: 'success',
    txCount: journey.length,
    primaryHash: journey[0]?.hash || null,
    primaryExplorerUrl: journey[0]?.explorerUrl || null,
    actions: journey.map((entry) => entry.action),
    allHashes: journey.map((entry) => entry.hash),
    journey,
    note: 'Synthetic load validation with real onchain testnet transactions.',
    createdAt: new Date().toISOString(),
  };
}

async function main() {
  console.log(`\n🚀 StellarBloom — Synthetic Validation Cohort`);
  console.log(`   Relayer: ${RELAYER_URL}`);
  console.log(`   Goal: ${USER_COUNT} wallets with 2-3 real sponsored actions each\n`);

  const results = loadExistingResults();
  if (results.length > 0) {
    console.log(`   Resume: ${results.length} successful wallets already captured\n`);
  }

  for (let i = results.length; i < USER_COUNT; i += 1) {
    try {
      const result = await createSyntheticJourney(i + 1);
      results.push(result);
      persistArtifacts(results);
    } catch (error) {
      if (error instanceof RateLimitError) {
        persistArtifacts(results);
        console.log(`❌ ${error.message}`);
        console.log(`   Saved ${results.length} successful wallets so far.`);
        console.log('   Rerun `npm run synthetic:validate` after the rate-limit window resets.\n');
        break;
      }
      console.log(`❌ ${error.message}`);
      console.log('   Retrying with a fresh wallet on the next loop.\n');
      await sleep(2500);
      i -= 1;
      continue;
    }

    if (i < USER_COUNT - 1) {
      await sleep(2500);
    }
  }

  console.log(`\n══════════════════════════════════════════════════════`);
  console.log(`✅ ${results.length}/${USER_COUNT} synthetic wallets completed`);
  console.log(`📄 Results saved to: ${RESULTS_FILE}`);
  console.log(`📋 README table saved to: ${TABLE_FILE}`);
  console.log(`══════════════════════════════════════════════════════\n`);

  console.log(buildMarkdownTable(results));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
