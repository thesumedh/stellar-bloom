import { existsSync, readFileSync, writeFileSync } from 'fs';

const TX_LOG_FILE = './data/transactions.json';
const USER_RESULTS_FILE = './data/user-validation-results.json';
const USER_TABLE_FILE = './data/user-validation-table.md';
const SUMMARY_FILE = './data/level6-proof-summary.json';
const TARGET_WALLETS = 30;

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function toIsoString(value) {
  return new Date(value).toISOString();
}

function buildWalletProof(log) {
  const grouped = new Map();

  for (const entry of log) {
    if (!entry?.pubKey || !entry?.hash) continue;
    if (!grouped.has(entry.pubKey)) {
      grouped.set(entry.pubKey, []);
    }
    grouped.get(entry.pubKey).push(entry);
  }

  return Array.from(grouped.entries())
    .map(([wallet, entries]) => {
      const ordered = [...entries].sort(
        (a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
      );
      const first = ordered[0];
      const activeDays = new Set(
        ordered.map((entry) => toIsoString(entry.timestamp).slice(0, 10))
      );

      return {
        wallet,
        txCount: ordered.length,
        hash: first.hash,
        allHashes: ordered.map((entry) => entry.hash),
        actions: ordered.map((entry) => entry.action || 'unknown'),
        timestamp: toIsoString(first.timestamp),
        lastSeenAt: toIsoString(ordered[ordered.length - 1].timestamp),
        explorerUrl: `https://stellar.expert/explorer/testnet/tx/${first.hash}`,
        activeDays: activeDays.size,
      };
    })
    .sort((a, b) => {
      if (b.txCount !== a.txCount) return b.txCount - a.txCount;
      return new Date(a.timestamp) - new Date(b.timestamp);
    });
}

function buildMarkdownTable(results) {
  const lines = [
    '| # | Wallet | Explorer | Tx Count | First Seen |',
    '|---|---|---|---:|---|',
  ];

  for (const result of results) {
    lines.push(
      `| ${result.index} | \`${result.wallet}\` | [View on Stellar Expert](${result.explorerUrl}) | ${result.txCount} | ${result.timestamp.slice(0, 10)} |`
    );
  }

  return `${lines.join('\n')}\n`;
}

function buildSummary(log, proof) {
  const dates = new Set();
  let repeatWallets = 0;

  for (const entry of log) {
    if (entry?.timestamp) {
      dates.add(toIsoString(entry.timestamp).slice(0, 10));
    }
  }

  for (const wallet of proof) {
    if (wallet.txCount >= 2) {
      repeatWallets += 1;
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    source: TX_LOG_FILE,
    totalTransactions: log.length,
    uniqueWallets: proof.length,
    exportedWallets: Math.min(TARGET_WALLETS, proof.length),
    repeatWallets,
    activeDays: dates.size,
  };
}

function main() {
  if (!existsSync(TX_LOG_FILE)) {
    throw new Error(`Missing transaction log: ${TX_LOG_FILE}`);
  }

  const log = readJson(TX_LOG_FILE);
  const proof = buildWalletProof(log);
  const exported = proof.slice(0, TARGET_WALLETS).map((wallet, index) => ({
    index: index + 1,
    ...wallet,
    note: 'Derived from the persistent relayer transaction log.',
  }));
  const summary = buildSummary(log, proof);

  writeFileSync(USER_RESULTS_FILE, JSON.stringify(exported, null, 2));
  writeFileSync(USER_TABLE_FILE, buildMarkdownTable(exported));
  writeFileSync(SUMMARY_FILE, JSON.stringify(summary, null, 2));

  console.log(`Exported ${exported.length} wallet proofs from ${log.length} transactions.`);
  console.log(`Results: ${USER_RESULTS_FILE}`);
  console.log(`Table:   ${USER_TABLE_FILE}`);
  console.log(`Summary: ${SUMMARY_FILE}`);
}

main();
