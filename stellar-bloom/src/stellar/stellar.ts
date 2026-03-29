import { StellarWalletsKit, Networks as KitNetworks } from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { Horizon, TransactionBuilder, Networks, Contract, xdr, Address, Asset, rpc } from '@stellar/stellar-sdk';

const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const rpcServer = new rpc.Server("https://soroban-testnet.stellar.org");
const RELAYER_BASE_URL = (import.meta.env.VITE_RELAYER_URL || 'http://localhost:3000').replace(/\/$/, '');
const RELAYER_API_KEY = import.meta.env.VITE_RELAYER_API_KEY || 'sb_test_5kq9v2x8m4j1c0p3';

function isNotFoundError(error: unknown): error is { response?: { status?: number } } {
    return typeof error === 'object' && error !== null;
}

StellarWalletsKit.init({
    network: KitNetworks.TESTNET,
    selectedWalletId: 'freighter',
    modules: [
        new FreighterModule(),
        new AlbedoModule(),
        new xBullModule()
    ],
});

export async function connectWallet(): Promise<string> {
    const result = await StellarWalletsKit.authModal();
    return result.address;
}

export async function fetchBalance(pubKey: string): Promise<string> {
    try {
        const account = await server.loadAccount(pubKey);
        const nativeBalance = account.balances.find((balance) => balance.asset_type === 'native');
        return nativeBalance?.balance || '0';
    } catch (error: unknown) {
        if (isNotFoundError(error) && error.response?.status === 404) {
            return "0"; // Account not funded on testnet yet
        }
        throw error;
    }
}

// Level 3: Gas Sponsor Implementation
// We invoke the smart contract user_wallet, but we DO NOT submit it ourselves.
// We sign it, and send it to our node.js relayer.
export async function sendXlm(sender: string, receiver: string, amount: string, apiKey?: string): Promise<string> {
    const account = await server.loadAccount(sender);

    // The deployed Level 2/3 Contract ID
    const CONTRACT_ID = "CBRCZHNXOYXLIWWNWAEUMLXWKP6HH534RWISAA7DOTEVEDBR3HEVSJCF";
    const contract = new Contract(CONTRACT_ID);

    // Build the execute_transfer ScVal arguments: (from: Address, to: Address, token: Address, amount: i128)
    // token: the native XLM token ID on testnet
    const tokenAddress = Asset.native().contractId(Networks.TESTNET);

    const contractArgs = [
        new Address(sender).toScVal(),
        new Address(receiver).toScVal(),
        new Address(tokenAddress).toScVal(),
        xdr.ScVal.scvI128(new xdr.Int128Parts({
            hi: new xdr.Int64([0, 0]),
            lo: new xdr.Uint64([Number(amount) * 10000000, 0]) // amount in stroops, sloppy cast for demo. Better: big number lib.
        }))
    ];

    const operation = contract.call("execute_transfer", ...contractArgs);

    let tx = new TransactionBuilder(account, {
        fee: "100", // Will be replaced/covered by the fee bump on backend
        networkPassphrase: Networks.TESTNET
    })
        .addOperation(operation)
        .setTimeout(60)
        .build();

    // Soroban transactions MUST be prepared (simulated + assembled) to generate auth and footprints
    tx = await rpcServer.prepareTransaction(tx);
    
    // Note: prepareTransaction returns a Transaction. We need to cast it or just use it.
    const txXdr = tx.toXDR();

    // User signs the transaction (authentication)
    const signedResult = await StellarWalletsKit.signTransaction(txXdr, {
        networkPassphrase: Networks.TESTNET,
        address: sender
    });

    if (!signedResult || !signedResult.signedTxXdr) {
        throw new Error("Failed to sign transaction or action was rejected.");
    }

    const relayApiKey = apiKey || RELAYER_API_KEY;

    // Instead of submitting to network, POST to relayer!
    const relayResponse = await fetch(`${RELAYER_BASE_URL}/relay`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-api-key': relayApiKey
        },
        body: JSON.stringify({ xdr: signedResult.signedTxXdr })
    });

    const data = await relayResponse.json();

    if (!relayResponse.ok) {
        throw new Error(data.error || "Relay submission failed.");
    }

    return data.hash; // Return the fee-bumped transaction hash!
}
