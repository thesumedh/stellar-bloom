import express from 'express';
import cors from 'cors';
import { Horizon, TransactionBuilder, Networks, Keypair, Operation, Asset } from '@stellar/stellar-sdk';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';

const app = express();

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
app.use(cors());
app.use(express.json());

// --- Abuse Protection & Rate Limiting ---
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'test' ? 5000 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use(limiter);

const STROOPS_PER_XLM = 10000000;
const DEFAULT_INTENT_FEE_STROOPS = 100;
const FEE_BUMP_MAX_FEE_STROOPS = 10000;
const DEFAULT_INTENT_FEE_XLM = DEFAULT_INTENT_FEE_STROOPS / STROOPS_PER_XLM;
const FEE_BUMP_MAX_FEE_XLM = FEE_BUMP_MAX_FEE_STROOPS / STROOPS_PER_XLM;
const DEFAULT_INTENT_PAYMENT_XLM = 0.01;
const DEFAULT_CREATE_ACCOUNT_XLM = 2.5;
const DEFAULT_API_KEY = 'sb_test_5kq9v2x8m4j1c0p3';

// --- In-Memory API Key & Gas Budget Database ---
// In a real startup, this connects to PostgreSQL or Redis
const apiKeysDb = {
    [DEFAULT_API_KEY]: { transactions: 0, gasSponsored: 0, appName: 'Demo App' }
};

// --- Rate Limiting State for Intents ---
const userRateLimits = new Map(); // pubKey -> { count, resetTime }

// --- Nonce tracking to prevent replay attacks ---
const seenNonces = new Set(); // store used nonces (in prod, use Redis with TTL)

// --- Stellar Configuration ---
const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const SPONSOR_SECRET = process.env.SPONSOR_SECRET;

// --- Persistent Transaction Log ---
const DATA_DIR = './data';
const TX_LOG_FILE = `${DATA_DIR}/transactions.json`;

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

function loadTxLog() {
    try {
        return existsSync(TX_LOG_FILE) ? JSON.parse(readFileSync(TX_LOG_FILE, 'utf8')) : [];
    } catch { return []; }
}

function appendTx(entry) {
    const log = loadTxLog();
    log.push(entry);
    writeFileSync(TX_LOG_FILE, JSON.stringify(log, null, 2));
}

function roundXlm(value) {
    return Number((Number(value) || 0).toFixed(7));
}

function toDayKey(timestamp) {
    return timestamp?.slice(0, 10) || 'unknown';
}

function resolveAccountId(source) {
    if (!source) return null;
    if (typeof source === 'string') return source;
    if (typeof source.accountId === 'function') return source.accountId();
    return null;
}

function normalizeTxLog(log) {
    const chronological = [...log].sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));

    return chronological.map((entry) => {
        const route = entry.route || '/relay/intent';
        let transactionType = entry.transactionType || (route === '/relay' ? 'fee_bump' : 'sponsored_intent');
        let sponsoredFeeXlm = Number.isFinite(entry.sponsoredFeeXlm)
            ? Number(entry.sponsoredFeeXlm)
            : Number(entry.xlmFee ?? 0);
        let sponsoredAmountXlm = Number.isFinite(entry.sponsoredAmountXlm)
            ? Number(entry.sponsoredAmountXlm)
            : null;
        let sponsoredTotalXlm = Number.isFinite(entry.sponsoredTotalXlm)
            ? Number(entry.sponsoredTotalXlm)
            : null;
        let indexingConfidence = sponsoredTotalXlm !== null ? 'exact' : 'legacy';

        if (!Number.isFinite(sponsoredFeeXlm)) {
            sponsoredFeeXlm = 0;
        }

        if (sponsoredTotalXlm === null) {
            sponsoredAmountXlm = sponsoredAmountXlm ?? 0;
            indexingConfidence = 'legacy_fee_only';
            sponsoredTotalXlm = roundXlm((sponsoredAmountXlm ?? 0) + sponsoredFeeXlm);
        }

        return {
            ...entry,
            route,
            transactionType,
            sponsoredFeeXlm: roundXlm(sponsoredFeeXlm),
            sponsoredAmountXlm: roundXlm(sponsoredAmountXlm ?? 0),
            sponsoredTotalXlm: roundXlm(sponsoredTotalXlm),
            explorerUrl: entry.hash ? `https://stellar.expert/explorer/testnet/tx/${entry.hash}` : null,
            indexingConfidence,
            timestamp: entry.timestamp || new Date(0).toISOString(),
        };
    });
}

function buildMetrics(log) {
    const normalized = normalizeTxLog(log);
    const transactionsByDay = {};
    const dailyActiveUserSets = {};
    const transactionsByAction = {};
    const transactionsByType = {};
    const walletStats = new Map();

    for (const tx of normalized) {
        const day = toDayKey(tx.timestamp);
        transactionsByDay[day] = (transactionsByDay[day] || 0) + 1;
        transactionsByAction[tx.action || 'unknown'] = (transactionsByAction[tx.action || 'unknown'] || 0) + 1;
        transactionsByType[tx.transactionType || 'unknown'] = (transactionsByType[tx.transactionType || 'unknown'] || 0) + 1;

        if (!dailyActiveUserSets[day]) {
            dailyActiveUserSets[day] = new Set();
        }
        if (tx.pubKey) {
            dailyActiveUserSets[day].add(tx.pubKey);
        }

        if (!tx.pubKey) continue;

        const existing = walletStats.get(tx.pubKey) || {
            pubKey: tx.pubKey,
            txCount: 0,
            firstSeen: tx.timestamp,
            lastSeen: tx.timestamp,
            actions: new Set(),
            days: new Set(),
            totalSponsoredXlm: 0,
            firstHash: tx.hash || null,
        };

        existing.txCount += 1;
        existing.totalSponsoredXlm += tx.sponsoredTotalXlm || 0;
        existing.actions.add(tx.action || 'unknown');
        existing.days.add(day);
        existing.firstSeen = new Date(tx.timestamp) < new Date(existing.firstSeen) ? tx.timestamp : existing.firstSeen;
        existing.lastSeen = new Date(tx.timestamp) > new Date(existing.lastSeen) ? tx.timestamp : existing.lastSeen;
        if (!existing.firstHash && tx.hash) {
            existing.firstHash = tx.hash;
        }

        walletStats.set(tx.pubKey, existing);
    }

    const walletSummaries = Array.from(walletStats.values()).map((wallet) => ({
        pubKey: wallet.pubKey,
        txCount: wallet.txCount,
        firstSeen: wallet.firstSeen,
        lastSeen: wallet.lastSeen,
        dayCount: wallet.days.size,
        actions: Array.from(wallet.actions),
        totalSponsoredXlm: roundXlm(wallet.totalSponsoredXlm),
        explorerUrl: wallet.firstHash ? `https://stellar.expert/explorer/testnet/tx/${wallet.firstHash}` : null,
    }));

    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const sevenDayCutoff = new Date(now);
    sevenDayCutoff.setUTCDate(sevenDayCutoff.getUTCDate() - 6);

    const totalTransactions = normalized.length;
    const uniqueUsers = walletSummaries.length;
    const repeatUsers = walletSummaries.filter((wallet) => wallet.txCount >= 2).length;
    const powerUsers = walletSummaries.filter((wallet) => wallet.txCount >= 3).length;
    const multiDayUsers = walletSummaries.filter((wallet) => wallet.dayCount >= 2).length;
    const activeToday = walletSummaries.filter((wallet) => wallet.lastSeen?.startsWith(todayKey)).length;
    const activeLast7Days = walletSummaries.filter((wallet) => new Date(wallet.lastSeen) >= sevenDayCutoff).length;
    const sponsoredFeeXlm = roundXlm(normalized.reduce((sum, tx) => sum + (tx.sponsoredFeeXlm || 0), 0));
    const sponsoredValueXlm = roundXlm(normalized.reduce((sum, tx) => sum + (tx.sponsoredAmountXlm || 0), 0));
    const sponsorSpendTotalXlm = roundXlm(normalized.reduce((sum, tx) => sum + (tx.sponsoredTotalXlm || 0), 0));
    const repeatUserRatePct = uniqueUsers ? Number((((repeatUsers / uniqueUsers) || 0) * 100).toFixed(1)) : 0;
    const avgTransactionsPerUser = uniqueUsers ? Number((totalTransactions / uniqueUsers).toFixed(2)) : 0;

    return {
        totalTransactions,
        uniqueUsers,
        repeatUsers,
        powerUsers,
        multiDayUsers,
        activeToday,
        activeLast7Days,
        avgTransactionsPerUser,
        repeatUserRatePct,
        xlmSponsored: sponsorSpendTotalXlm.toFixed(7),
        sponsoredFeeXlm: sponsoredFeeXlm.toFixed(7),
        sponsoredValueXlm: sponsoredValueXlm.toFixed(7),
        sponsorSpendTotalXlm: sponsorSpendTotalXlm.toFixed(7),
        transactionsByDay,
        dailyActiveUsers: Object.fromEntries(
            Object.entries(dailyActiveUserSets).map(([day, set]) => [day, set.size])
        ),
        transactionsByAction,
        transactionsByType,
        topWallets: walletSummaries
            .sort((a, b) => b.txCount - a.txCount || new Date(b.lastSeen) - new Date(a.lastSeen))
            .slice(0, 5),
        recentTransactions: [...normalized]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10),
        goalProgress: {
            targetWallets: 30,
            currentWallets: uniqueUsers,
            currentTransactions: totalTransactions,
            walletGoalMet: uniqueUsers >= 30,
        },
        indexing: {
            source: 'relayer/data/transactions.json',
            endpoint: '/api/metrics',
            strategy: 'Persistent JSON log aggregated into wallet, action, and day-level analytics.',
            indexedAt: new Date().toISOString(),
            latestTxAt: normalized.length ? normalized[normalized.length - 1].timestamp : null,
        },
    };
}

// --- Endpoints ---
const startTime = Date.now();

// Restore totals from persisted log on startup
const _log = loadTxLog();
const _metrics = buildMetrics(_log);
let totalTransactions = _metrics.totalTransactions;
let totalXlmSponsored = Number(_metrics.sponsorSpendTotalXlm);

console.log(`📊 Restored ${totalTransactions} transactions from persistent log`);


// Health check — polled by the developer dashboard every 5s
app.get('/health', (req, res) => {
    const uptimeSec = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(uptimeSec / 3600);
    const mins  = Math.floor((uptimeSec % 3600) / 60);
    res.json({
        status: 'ok',
        totalTransactions,
        xlmSponsored: totalXlmSponsored.toFixed(7),
        uptime: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
    });
});



// 1. Core Gasless Relayer Endpoint (Now Multi-Tenant)
app.post('/relay', async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'];

        // Ensure developer is authenticated
        if (!apiKey || !apiKeysDb[apiKey]) {
            return res.status(401).json({ error: "Unauthorized: Invalid or missing x-api-key header" });
        }

        const { xdr } = req.body;

        if (!xdr) {
            return res.status(400).json({ error: "Missing transaction XDR" });
        }

        if (!SPONSOR_SECRET) {
            return res.status(500).json({ error: "Relayer not configured with SPONSOR_SECRET" });
        }

        // 1. Rebuild the user's transaction from the XDR
        const userTx = TransactionBuilder.fromXDR(xdr, Networks.TESTNET);
        const sponsorKeypair = Keypair.fromSecret(SPONSOR_SECRET);
        const sourcePubKey = resolveAccountId(userTx.source);

        // 2. Wrap it in a FeeBumpTransaction
        // Max fee is 10000 stroops (0.001 XLM) to cover inner tx + bump fee.
        const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
            sponsorKeypair.publicKey(),
            '10000',
            userTx,
            Networks.TESTNET
        );

        // 3. The Sponsor signs the FeeBumpTransaction
        feeBumpTx.sign(sponsorKeypair);

        // 4. Submit to the network
        const response = await server.submitTransaction(feeBumpTx);

        // 5. Update Developer Analytics
        apiKeysDb[apiKey].transactions += 1;
        apiKeysDb[apiKey].gasSponsored += FEE_BUMP_MAX_FEE_STROOPS;
        totalTransactions += 1;
        totalXlmSponsored = roundXlm(totalXlmSponsored + FEE_BUMP_MAX_FEE_XLM);
        appendTx({
            hash: response.hash,
            pubKey: sourcePubKey,
            action: 'signed_fee_bump',
            route: '/relay',
            transactionType: 'fee_bump',
            sponsoredFeeXlm: FEE_BUMP_MAX_FEE_XLM,
            sponsoredAmountXlm: 0,
            sponsoredTotalXlm: FEE_BUMP_MAX_FEE_XLM,
            xlmFee: FEE_BUMP_MAX_FEE_XLM,
            apiKey,
            timestamp: new Date().toISOString(),
        });

        console.log(`[API Key: ${apiKey}] Successfully relayed transaction! Hash: ${response.hash}`);
        res.json({ success: true, hash: response.hash });

    } catch (error) {
        console.error("Relay failed:", error);
        res.status(500).json({
            error: "Transaction submission failed",
            details: error.response?.data || error.message
        });
    }
});

app.get('/api/stats/:apiKey', (req, res) => {
    const { apiKey } = req.params;
    const stats = apiKeysDb[apiKey];
    if (!stats) {
        return res.status(404).json({ error: "API Key not found" });
    }

    const sponsoredXlm = (stats.gasSponsored / 10000000);
    res.json({
        success: true,
        stats: {
            appName: stats.appName,
            totalTransactions: stats.transactions,
            xlmSponsored: sponsoredXlm.toFixed(5),
            activeUsers: userRateLimits.size,
            gasRemaining: Math.max(0, 100 - sponsoredXlm).toFixed(2)
        }
    });
});

// 2.5 Relayer Off-Chain Intent Endpoint (MVP Feature)
app.post('/relay/intent', async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'] || DEFAULT_API_KEY;
        const { payload, signature, pubKey } = req.body;

        if (!payload || !signature || !pubKey) {
            return res.status(400).json({ error: "Missing payload, signature, or pubKey" });
        }

        // 1. Rate Limiting per PubKey (5 per hour)
        const now = Date.now();
        const userLimit = userRateLimits.get(pubKey) || { count: 0, resetTime: now + 3600000 };
        if (now > userLimit.resetTime) {
            userLimit.count = 0;
            userLimit.resetTime = now + 3600000;
        }
        if (userLimit.count >= 5) {
            return res.status(429).json({ error: "Rate limit exceeded (5 tx/hr per session key)" });
        }

        // 2. Check Signature
        const keypair = Keypair.fromPublicKey(pubKey);
        const isValid = keypair.verify(Buffer.from(payload), Buffer.from(signature, 'base64'));
        if (!isValid) {
            return res.status(401).json({ error: "Invalid intent signature" });
        }

        const intentData = JSON.parse(payload);

        // 2.5 Replay attack protection — reject duplicate nonces
        const nonce = intentData.nonce;
        if (!nonce) {
            return res.status(400).json({ error: "Missing nonce in payload" });
        }
        if (seenNonces.has(nonce)) {
            return res.status(400).json({ error: "Replay attack detected: nonce already used" });
        }
        seenNonces.add(nonce);
        // Prune old nonces to avoid memory growth (keep last 10000)
        if (seenNonces.size > 10000) {
            const first = seenNonces.values().next().value;
            seenNonces.delete(first);
        }

        if (!SPONSOR_SECRET) {
            return res.status(500).json({ error: "Relayer missing SPONSOR_SECRET" });
        }
        const sponsorKeypair = Keypair.fromSecret(SPONSOR_SECRET);
        const sponsorAccount = await server.loadAccount(sponsorKeypair.publicKey());

        // We execute a real transaction to prove traction. 
        // We will either Create the session account (funding it) or send a tiny Payment.
        let smartWalletOperation;
        let transactionType = 'payment';
        let sponsoredAmountXlm = DEFAULT_INTENT_PAYMENT_XLM;
        try {
            await server.loadAccount(pubKey);
            // Account already exists on ledger, send an interactive payment
            smartWalletOperation = Operation.payment({
                destination: pubKey,
                asset: Asset.native(),
                amount: DEFAULT_INTENT_PAYMENT_XLM.toFixed(7)
            });
        } catch (e) {
            // Account doesn't exist, create it and give it 2.5 XLM!
            transactionType = 'create_account';
            sponsoredAmountXlm = DEFAULT_CREATE_ACCOUNT_XLM;
            smartWalletOperation = Operation.createAccount({
                destination: pubKey,
                startingBalance: DEFAULT_CREATE_ACCOUNT_XLM.toFixed(7)
            });
        }

        const tx = new TransactionBuilder(sponsorAccount, { 
            fee: "100", 
            networkPassphrase: Networks.TESTNET 
        })
        .addOperation(smartWalletOperation)
        .setTimeout(30)
        .build();

        tx.sign(sponsorKeypair);

        // 4. Submit to Network
        const response = await server.submitTransaction(tx);

        // 5. Update Bookkeeping + Persistent Log
        userLimit.count += 1;
        userRateLimits.set(pubKey, userLimit);
        totalTransactions += 1;
        const sponsoredFeeXlm = DEFAULT_INTENT_FEE_XLM;
        const sponsoredTotalXlm = roundXlm(sponsoredFeeXlm + sponsoredAmountXlm);
        totalXlmSponsored = roundXlm(totalXlmSponsored + sponsoredTotalXlm);
        if (apiKeysDb[apiKey]) {
            apiKeysDb[apiKey].transactions += 1;
            apiKeysDb[apiKey].gasSponsored += DEFAULT_INTENT_FEE_STROOPS;
        }
        appendTx({
            hash: response.hash,
            pubKey,
            action: intentData.action || 'unknown',
            route: '/relay/intent',
            transactionType,
            sponsoredAmountXlm,
            sponsoredFeeXlm,
            sponsoredTotalXlm,
            xlmFee: sponsoredFeeXlm,
            apiKey,
            nonce,
            timestamp: new Date().toISOString(),
        });

        console.log(`[Relayer Intent] ${pubKey} Action: ${intentData.action} Hash: ${response.hash}`);
        res.json({ success: true, hash: response.hash, userPubKey: pubKey });

    } catch (error) {
        console.error("Intent relay failed:", error);
        res.status(500).json({ error: "Execution failed", details: error.message });
    }
});

// Metrics endpoint — indexed transaction data for dashboard & Black Belt requirement
app.get('/api/metrics', (req, res) => {
    res.json(buildMetrics(loadTxLog()));
});

// 3. Developer Portal: Mock API Key Generation
app.post('/api/keys/generate', (req, res) => {
    // Generate a secure-looking mock API key for the dashboard
    const newKey = 'sb_test_' + Math.random().toString(36).substr(2, 16);
    const appName = req.body.appName || 'New dApp Integration';

    apiKeysDb[newKey] = { transactions: 0, gasSponsored: 0, appName };
    res.json({ success: true, apiKey: newKey, appName });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 StellarBloom Relayer running on http://localhost:${PORT}`);
    console.log(`Waiting to sponsor transactions...`);
});
