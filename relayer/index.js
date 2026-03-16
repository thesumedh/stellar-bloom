import express from 'express';
import cors from 'cors';
import { Horizon, TransactionBuilder, Networks, Keypair, FeeBumpTransaction } from '@stellar/stellar-sdk';
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

// For Level 3, the relayer needs to fund the gas for user transactions.
// We'll use the TESTNET and a funded sponsor account.
const server = new Horizon.Server("https://horizon-testnet.stellar.org");

// The sponsor's secret key (in a real app, this should be in .env)
const SPONSOR_SECRET = process.env.SPONSOR_SECRET;

app.post('/relay', async (req, res) => {
    try {
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

        // 2. Fetch current base fee from the network
        const feeInfo = await server.fetchBaseFee();

        // The fee bump transaction needs to cover the fee for the inner transaction.
        // We set it to the current network base fee.

        // 3. Wrap it in a FeeBumpTransaction
        // We set the max fee to 10000 stroops (0.001 XLM) to easily cover the inner tx + the bump fee overhead.
        const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
            sponsorKeypair.publicKey(),
            '10000',
            userTx,
            Networks.TESTNET
        );

        // 4. The Sponsor signs the FeeBumpTransaction
        feeBumpTx.sign(sponsorKeypair);

        // 5. Submit to the network
        const response = await server.submitTransaction(feeBumpTx);

        console.log(`Successfully relayed transaction! Hash: ${response.hash}`);
        res.json({ success: true, hash: response.hash });

    } catch (error) {
        console.error("Relay failed:", error);
        res.status(500).json({
            error: "Transaction submission failed",
            details: error.response?.data || error.message
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 StellarBloom Relayer running on http://localhost:${PORT}`);
    console.log(`Waiting to sponsor transactions...`);
});
