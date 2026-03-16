import express from 'express';
import cors from 'cors';
import { Horizon, TransactionBuilder, Networks, Keypair } from '@stellar/stellar-sdk';
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

// --- Stellar Configuration ---
const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const SPONSOR_SECRET = process.env.SPONSOR_SECRET;

// --- Endpoints ---

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

// 2. Developer Analytics Dashboard Data
app.get('/api/stats/:apiKey', (req, res) => {
    const { apiKey } = req.params;
    const stats = apiKeysDb[apiKey];
    if (!stats) {
        return res.status(404).json({ error: "API Key not found" });
    }
    
    // Convert stroops to standard XLM for the dashboard
    res.json({
        success: true,
        stats: {
            appName: stats.appName,
            totalTransactions: stats.transactions,
            xlmSponsored: (stats.gasSponsored / 10000000).toFixed(6)
        }
    });
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
