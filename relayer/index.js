import express from 'express';
import cors from 'cors';
import { Horizon, TransactionBuilder, Networks, Keypair, Operation, Asset } from '@stellar/stellar-sdk';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

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
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per 15 mins
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use(limiter);

// --- In-Memory API Key & Gas Budget Database ---
// In a real startup, this connects to PostgreSQL or Redis
const apiKeysDb = {
    // Starting with a seed key mapping to track app usage
    'sb_test_5kq9v2x8m4j1c0p3': { transactions: 0, gasSponsored: 0, appName: 'Demo App' }
};

// --- Rate Limiting State for Intents ---
const userRateLimits = new Map(); // pubKey -> { count, resetTime }

// --- Nonce tracking to prevent replay attacks ---
const seenNonces = new Set(); // store used nonces (in prod, use Redis with TTL)

// --- Stellar Configuration ---
const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const SPONSOR_SECRET = process.env.SPONSOR_SECRET;

// --- Endpoints ---
const startTime = Date.now();
let totalTransactions = 0;
let totalXlmSponsored = 0;

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

        const sponsorKeypair = Keypair.fromSecret(SPONSOR_SECRET);

        // 1. Rebuild the user's transaction from the XDR
        const userTx = TransactionBuilder.fromXDR(xdr, Networks.TESTNET);

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
        apiKeysDb[apiKey].gasSponsored += 10000;

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
        const apiKey = req.headers['x-api-key'] || 'sb_test_5kq9v2x8m4j1c0p3';
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
        try {
            await server.loadAccount(pubKey);
            // Account already exists on ledger, send an interactive payment
            smartWalletOperation = Operation.payment({
                destination: pubKey,
                asset: Asset.native(),
                amount: "0.0100000"
            });
        } catch (e) {
            // Account doesn't exist, create it and give it 2.5 XLM!
            smartWalletOperation = Operation.createAccount({
                destination: pubKey,
                startingBalance: "2.5000000"
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

        // 5. Update Bookkeeping
        userLimit.count += 1;
        userRateLimits.set(pubKey, userLimit);
        if (apiKeysDb[apiKey]) {
            apiKeysDb[apiKey].transactions += 1;
            apiKeysDb[apiKey].gasSponsored += 100;
        }

        console.log(`[Relayer Intent] ${pubKey} Action: ${intentData.action} Hash: ${response.hash}`);
        res.json({ success: true, hash: response.hash });

    } catch (error) {
        console.error("Intent relay failed:", error);
        res.status(500).json({ error: "Execution failed", details: error.message });
    }
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
