import { useState } from 'react';
import { connectWallet, fetchBalance, sendXlm } from './stellar/stellar';
import './App.css';

function App() {
  const [pubKey, setPubKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const key = await connectWallet();
      setPubKey(key);
      const bal = await fetchBalance(key);
      setBalance(bal);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setPubKey(null);
    setBalance('0');
    setTxHash(null);
    setError(null);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubKey) return;
    setIsLoading(true);
    setError(null);
    setTxHash(null);
    try {
      const hash = await sendXlm(pubKey, receiver, amount);
      setTxHash(hash);
      const newBal = await fetchBalance(pubKey);
      setBalance(newBal);
      setAmount('');
      setReceiver('');
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo cursor-pointer">✨ StellarBloom</div>
        <div className="nav-actions">
          {pubKey ? (
            <button className="btn-secondary" onClick={handleDisconnect}>
              Disconnect {pubKey.slice(0, 4)}...{pubKey.slice(-4)}
            </button>
          ) : (
            <button className="btn-primary" onClick={handleConnect} disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </nav>

      <main className="main-content">
        {!pubKey ? (
          <div className="hero-section glass-panel">
            <h1>Send XLM in Seconds</h1>
            <p>Connect your Freighter wallet on the Testnet to get started.</p>
            <button className="btn-primary large mt-4" onClick={handleConnect} disabled={isLoading}>
              Connect Freighter
            </button>
          </div>
        ) : (
          <div className="dashboard">
            <div className="glass-panel balance-card">
              <h2>Your Balance</h2>
              <div className="balance-amount">{balance} <span className="currency">XLM</span></div>
              <div className="badge">Testnet</div>
            </div>

            <div className="glass-panel payment-card">
              <h2>Send Payment</h2>
              <form onSubmit={handleSend} className="payment-form">
                <div className="input-group">
                  <label>Recipient Address</label>
                  <input
                    type="text"
                    placeholder="G..."
                    value={receiver}
                    onChange={e => setReceiver(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Amount (XLM)</label>
                  <input
                    type="number"
                    step="0.0000001"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary full-width" disabled={isLoading || !receiver || !amount}>
                  {isLoading ? 'Processing...' : 'Send XLM'}
                </button>
              </form>
            </div>

            {error && <div className="alert error">❌ {error}</div>}
            {txHash && (
              <div className="alert success">
                ✅ Transaction Successful! <br />
                <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" rel="noreferrer">
                  View on Stellar Expert
                </a>
              </div>
            )}
          </div>
        )}
      </main>

      <div className="background-elements">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
    </div>
  );
}

export default App;
