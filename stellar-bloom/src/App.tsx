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
        <section className="enterprise-hero">
          <div className="tagline">Zero-Wallet Onboarding Infrastructure</div>
          <h1>End the Gas Fee Friction.</h1>
          
          <div className="value-props">
            <div className="glass-panel prop-card">
              <div className="prop-icon">🚨</div>
              <h3>The Problem</h3>
              <p>Onboarding users to Web3 is fundamentally broken. Users must acquire network tokens, manage gas reserves, and navigate complex exchanges just to send their first transaction. This causes a staggering 90% drop-off rate.</p>
            </div>
            
            <div className="glass-panel prop-card">
              <div className="prop-icon">✨</div>
              <h3>Our Solution</h3>
              <p>StellarBloom abstracts away the complexity. Using Soroban's native Fee-Bump architecture, our Relayer automatically sponsors gas fees on behalf of your users. They interact instantly with your dApp—without ever holding XLM.</p>
            </div>
          </div>

          <div className="hero-actions">
            <a href="#live-demo" className="btn-secondary pulse-hover">Try the Live Demo ↓</a>
          </div>
        </section>

        <section id="live-demo" className="demo-section">
          <div className="demo-header">
            <h2>Interactive Meta-Transaction Demo</h2>
            <p>Experience seamless onboarding. Connect your Freighter testnet wallet, send a transaction, and watch our Relayer cover the gas fee automatically behind the scenes.</p>
          </div>

          {!pubKey ? (
            <div className="glass-panel connect-card">
              <div className="connect-icon">👛</div>
              <h3>Ready to experience gasless?</h3>
              <p>Connect your Freighter wallet on the Testnet to begin.</p>
              <button className="btn-primary large mt-4" onClick={handleConnect} disabled={isLoading}>
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          ) : (
            <div className="dashboard">
              <div className="glass-panel balance-card">
                <h2>Your Wallet Balance</h2>
                <div className="balance-amount">{balance} <span className="currency">XLM</span></div>
                <div className="badge">Testnet Connected</div>
              </div>

              <div className="glass-panel payment-card">
                <h2>Send Gasless Payment</h2>
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
                    {isLoading ? 'Processing via Relayer...' : 'Send XLM (Gas-Free)'}
                  </button>
                </form>
              </div>

              {error && <div className="alert error">❌ {error}</div>}
              {txHash && (
                <div className="alert success">
                  ✅ <strong>Transaction Successful!</strong> <br /><br />
                  <span>The relayer successfully paid the gas fee.</span><br />
                  <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" rel="noreferrer">
                    View execution on Stellar Expert ↗
                  </a>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <div className="background-elements">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
    </div>
  );
}

export default App;
