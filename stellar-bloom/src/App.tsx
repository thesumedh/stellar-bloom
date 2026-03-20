import { useState, useEffect } from 'react';
import { connectWallet, fetchBalance, sendXlm } from './stellar/stellar';
import { Keypair } from '@stellar/stellar-sdk';
import './App.css';

interface ApiStats {
  appName: string;
  totalTransactions: number;
  xlmSponsored: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'demo' | 'dashboard'>('demo');
  const [pubKey, setPubKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');

  // Dashboard State
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiStats, setApiStats] = useState<ApiStats | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Coffee Shop State
  const [isCoffeeLoading, setIsCoffeeLoading] = useState(false);
  const [coffeeError, setCoffeeError] = useState<string | null>(null);
  const [coffeeSuccess, setCoffeeSuccess] = useState<string | null>(null);
  const [sessionPub, setSessionPub] = useState<string | null>(null);

  const fetchStats = async (key: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/stats/${key}`);
      const data = await res.json();
      if (data.success && data.stats) {
        setApiStats(data.stats);
      }
    } catch (e) {
      console.error("Failed to fetch stats", e);
    }
  };

  useEffect(() => {
    if (apiKey && activeTab === 'dashboard') {
      fetchStats(apiKey);
    }
  }, [apiKey, activeTab]);

  const handleGenerateKey = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`http://localhost:3000/api/keys/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName: 'My DApp Integration' })
      });
      const data = await res.json();
      if (data.success) {
        setApiKey(data.apiKey);
        await fetchStats(data.apiKey);
      }
    } catch (e) {
      console.error("Failed to generate key", e);
    } finally {
      setIsGenerating(false);
    }
  };

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
      const hash = await sendXlm(pubKey, receiver, amount, apiKey || undefined);
      setTxHash(hash);
      const newBal = await fetchBalance(pubKey);
      setBalance(newBal);
      setAmount('');
      setReceiver('');
      if (apiKey) {
        fetchStats(apiKey); // Refresh stats silently
      }
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimCoffee = async () => {
    setIsCoffeeLoading(true);
    setCoffeeError(null);
    setCoffeeSuccess(null);
    try {
        // 1. Generate anonymous session keypair instantly (No Wallet UI needed)
        const sessionKeypair = Keypair.random();
        const temporaryPubKey = sessionKeypair.publicKey();
        setSessionPub(temporaryPubKey);

        // 2. Wrap the intent
        const intentData = { action: 'mint_coffee_nft', timestamp: Date.now() };
        const payload = JSON.stringify(intentData);
        
        // 3. Sign locally with the ephemeral key
        const payloadBytes = new TextEncoder().encode(payload);
        const signatureBuffer = sessionKeypair.sign(payloadBytes as any);
        const signature = btoa(Array.from(new Uint8Array(signatureBuffer)).map(b => String.fromCharCode(b)).join(''));

        // 4. Relay to the backend to wrap in real XLM transaction
        const res = await fetch('http://localhost:3000/relay/intent', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // Use the developer's API key if generated, else a mock one
                'x-api-key': apiKey || 'sb_test_demo123' 
            },
            body: JSON.stringify({ payload, signature, pubKey: temporaryPubKey })
        });
        const data = await res.json();
        
        if (data.success) {
            setCoffeeSuccess(data.hash);
            if (apiKey) fetchStats(apiKey); // update dashboard immediately
        } else {
            setCoffeeError(data.error || 'Relayer failed to process intent');
        }
    } catch(err: any) {
        setCoffeeError(err.message || 'Network error occurred');
    } finally {
        setIsCoffeeLoading(false);
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo cursor-pointer">✨ StellarBloom</div>
        <div className="nav-links">
          <button className={`nav-link ${activeTab === 'demo' ? 'active' : ''}`} onClick={() => setActiveTab('demo')}>Live Demo</button>
          <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Developer Dashboard</button>
        </div>
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
          <div className="tagline">The Stripe for Gasless Web3 Onboarding</div>
          <h1>End the Gas Fee Friction.</h1>
          
          <div className="value-props">
            <div className="glass-panel prop-card">
              <div className="prop-icon">🚨</div>
              <h3>The Onboarding Trap</h3>
              <p>Users must acquire tokens, manage gas, and navigate exchanges to send their first transaction. This causes a 90% drop-off rate, preventing mass adoption.</p>
            </div>
            
            <div className="glass-panel prop-card">
              <div className="prop-icon">⚡</div>
              <h3>Gasless Infrastructure</h3>
              <p>StellarBloom acts as a massive gas sponsorship platform for developers. Our enterprise relayers instantly wrap user requests in FeeBump transactions. Build true invisible Web3 UX.</p>
            </div>
          </div>
        </section>

        {activeTab === 'dashboard' ? (
          <section className="dashboard-section fade-in">
            <div className="demo-header">
              <h2>Developer Infrastructure Portal</h2>
              <p>Manage your gas budgets, abuse protection, and generate API keys for your applications.</p>
            </div>
            
            <div className="dashboard-grid">
              <div className="glass-panel dashboard-card">
                <h3>API Key Management</h3>
                <p className="text-muted">Generate a secure key to authenticate your dApp with our relayer nodes.</p>
                {apiKey ? (
                  <div className="api-key-display mt-4">
                    <span className="badge success mb-2">Active Key</span>
                    <br />
                    <code>{apiKey}</code>
                  </div>
                ) : (
                  <button className="btn-primary mt-4" onClick={handleGenerateKey} disabled={isGenerating}>
                    {isGenerating ? 'Generating...' : 'Generate New API Key'}
                  </button>
                )}
              </div>

              <div className="glass-panel dashboard-card">
                <h3>Usage Analytics</h3>
                {!apiStats ? (
                  <p className="text-muted text-center mt-4">Generate an API key to view analytics.</p>
                ) : (
                  <div className="stats-grid mt-4">
                    <div className="stat-box">
                      <div className="stat-label">Total Sponsored Txs</div>
                      <div className="stat-value">{apiStats.totalTransactions}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">XLM Sponsored</div>
                      <div className="stat-value">{apiStats.xlmSponsored} <span style={{fontSize: '0.5em'}}>XLM</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {apiKey && (
              <div className="glass-panel docs-card mt-6">
                <h3>Integration Quickstart</h3>
                <p>Use your active API Key to send meta-transactions through our relayer.</p>
                <div className="code-block mt-4">
                  <pre>
{`const relayResponse = await fetch('https://api.stellarbloom.io/relay', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey}'
  },
  body: JSON.stringify({ xdr: signedTxXdr })
});`}
                  </pre>
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="demo-section fade-in">
            <div className="demo-header">
              <h2>Interactive Meta-Transaction Demo</h2>
              <p>Experience seamless onboarding. Send a transaction, and watch our Relayer cover the gas fee automatically behind the scenes.</p>
            </div>

            <div className="dashboard">
              
              {/* Coffee Shop Gasless Demo */}
              <div className="glass-panel payment-card" style={{ border: '2px solid #8B5CF6', marginBottom: '2rem' }}>
                 <h2>☕ The Coffee Shop Demo <span className="badge" style={{backgroundColor: '#8B5CF6', color: 'white', float: 'right'}}>1-Click Magic</span></h2>
                 <p className="text-muted mb-4" style={{fontSize: '14px'}}>
                   Assume you are an end-user who has never heard of crypto. Click the button below. 
                   We will instantly generate an invisible cryptographic key and execute a genuine Stellar transaction funded by our Relayer.
                 </p>
                 
                 <button className="btn-primary full-width" style={{backgroundColor: '#8B5CF6', border: 'none', padding: '16px', fontSize: '16px', cursor: 'pointer'}} onClick={handleClaimCoffee} disabled={isCoffeeLoading}>
                    {isCoffeeLoading ? 'Brewing Free Coffee (Triggering Smart Contract)...' : 'Claim Free Coffee ☕'}
                 </button>

                 {coffeeError && <div className="alert error mt-4">❌ {coffeeError}</div>}
                 {coffeeSuccess && (
                   <div className="alert success mt-4">
                     ✅ <strong>Coffee Claimed! Transaction Confirmed!</strong> 🎉<br /><br />
                     <div style={{fontSize: '13px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', marginBottom: '10px'}}>
                        <strong>Magic Under the Hood:</strong><br />
                        Your exact invisible Session Key: <code>{sessionPub?.slice(0, 10)}...{sessionPub?.slice(-10)}</code><br />
                     </div>
                     <span>StellarBloom Relayer successfully paid the blockchain gas fee and funded this key.</span><br /><br />
                     <a href={`https://stellar.expert/explorer/testnet/tx/${coffeeSuccess}`} target="_blank" rel="noreferrer" style={{color: '#8B5CF6', fontWeight: 'bold', textDecoration: 'underline'}}>
                       View +XLM execution on Stellar Expert ↗
                     </a>
                   </div>
                 )}
              </div>

              {/* Legacy Connect & Send */}
              <div className="glass-panel payment-card">
                 <h2 style={{opacity: 0.5}}>Traditional Integration Demo</h2>
                 
                 {!pubKey ? (
                  <div className="connect-card mt-4" style={{border: '1px dashed #3f3f46', padding: '20px', borderRadius: '12px', textAlign: 'center'}}>
                    <div className="connect-icon" style={{fontSize: '2rem'}}>👛</div>
                    <h3 style={{fontSize: '1.1rem'}}>Have a Freighter Wallet?</h3>
                    <p style={{fontSize: '14px', color: '#a1a1aa', margin: '10px 0'}}>Connect your wallet to test traditional signed envelopes routed through the gas relayer.</p>
                    <button className="btn-secondary mt-2" onClick={handleConnect} disabled={isLoading}>
                      {isLoading ? 'Connecting...' : 'Connect Freighter'}
                    </button>
                  </div>
                 ) : (
                  <>
                    <div className="balance-amount" style={{fontSize: '1.5rem', marginTop: '1rem'}}>{balance} <span className="currency" style={{fontSize: '1rem'}}>XLM</span></div>
                    <div className="badge mb-4">Testnet Connected</div>
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
                      <button type="submit" className="btn-secondary full-width" disabled={isLoading || !receiver || !amount}>
                        {isLoading ? 'Processing via Relayer...' : 'Send XLM (Gas-Free)'}
                      </button>
                    </form>

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
                  </>
                 )}
              </div>
            </div>
          </section>
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
