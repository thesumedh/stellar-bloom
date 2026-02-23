import { isConnected, requestAccess, signTransaction, getAddress } from '@stellar/freighter-api';
import { Horizon, TransactionBuilder, Networks, Asset, Operation } from '@stellar/stellar-sdk';

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export async function connectWallet(): Promise<string> {
    const connectedResult = await isConnected();
    if (!connectedResult.isConnected) throw new Error("Freighter not installed. Please install the Freighter extension.");

    // requestAccess handles both the connection prompt and returning the allowed address
    const access = await requestAccess();
    if (access.error) throw new Error(access.error);

    // Alternatively, if they have already granted access, getAddress() will return the address
    if (access.address) {
        return access.address;
    }

    const addressResult = await getAddress();
    if (addressResult.error) throw new Error(addressResult.error);
    return addressResult.address;
}

export async function fetchBalance(pubKey: string): Promise<string> {
    try {
        const account = await server.loadAccount(pubKey);
        const nativeBalance = account.balances.find((b: any) => b.asset_type === 'native');
        return nativeBalance ? nativeBalance.balance : '0';
    } catch (error: any) {
        if (error?.response?.status === 404) {
            return "0"; // Account not funded on testnet yet
        }
        throw error;
    }
}

export async function sendXlm(sender: string, receiver: string, amount: string): Promise<string> {
    const account = await server.loadAccount(sender);
    const feeInfo = await server.fetchBaseFee();

    const tx = new TransactionBuilder(account, {
        fee: feeInfo.toString(),
        networkPassphrase: Networks.TESTNET
    })
        .addOperation(Operation.payment({
            destination: receiver,
            asset: Asset.native(),
            amount: amount,
        }))
        .setTimeout(60)
        .build();

    const xdr = tx.toXDR();
    const signedResult = await signTransaction(xdr, { networkPassphrase: Networks.TESTNET });

    if (signedResult.error) {
        throw new Error(signedResult.error || "Failed to sign transaction or action was rejected.");
    }

    // Convert signed XDR string back to a transaction to submit
    const signedTx = TransactionBuilder.fromXDR(signedResult.signedTxXdr, Networks.TESTNET);
    const result = await server.submitTransaction(signedTx as any);

    return result.hash;
}
