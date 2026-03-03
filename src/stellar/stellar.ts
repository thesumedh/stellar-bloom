import { StellarWalletsKit, Networks as KitNetworks } from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { Horizon, TransactionBuilder, Networks, Asset, Operation } from '@stellar/stellar-sdk';

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

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

    // Use the kit to sign the transaction
    const signedResult = await StellarWalletsKit.signTransaction(xdr, {
        networkPassphrase: Networks.TESTNET,
        address: sender
    });

    if (!signedResult || !signedResult.signedTxXdr) {
        throw new Error("Failed to sign transaction or action was rejected.");
    }

    // Convert signed XDR string back to a transaction to submit
    const signedTx = TransactionBuilder.fromXDR(signedResult.signedTxXdr, Networks.TESTNET);
    const result = await server.submitTransaction(signedTx as any);

    return result.hash;
}
