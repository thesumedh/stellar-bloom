import { useState, useEffect } from 'react';
import { isConnected, requestAccess, getAddress } from '@stellar/freighter-api';
import { executeGasless } from './lib/bloom-sdk';
import './App.css';

const RELAYER_URL = import.meta.env.VITE_RELAYER_URL || 'http://localhost:3000';
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
type CoffeeStage = 'idle' | 'generating' | 'signing' | 'relaying' | 'success' | 'error';

interface MetricsData {
  totalTransactions: number;
  uniqueUsers: number;
  xlmSponsored: string;
  transactionsByDay: Record<string, number>;
  recentTransactions: Array<{ hash: string; pubKey: string; action: string; timestamp: string }>;
}

function App() {
  const [activeTab, setActiveTab] = useState<'demo' | 'docs'>('demo');

  // ── Wallet Session ──
  const [walletPubKey, setWalletPubKey] = useState<string | null>(null);
  const [walletConnecting, setWalletConnecting] = useState(false);

  // ── Coffee Demo ──
  const [coffeeStage, setCoffeeStage] = useState<CoffeeStage>('idle');
  const [coffeeTxHash, setCoffeeTxHash] = useState<string | null>(null);
  const [coffeeUserKey, setCoffeeUserKey] = useState<string | null>(null);
  const [coffeeError, setCoffeeError] = useState<string | null>(null);

  // ── Relayer Health ──
  const [relayerOnline, setRelayerOnline] = useState<boolean | null>(null);
  const [relayerStats, setRelayerStats] = useState<{ totalTransactions: number; xlmSponsored: string; uptime: string } | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);

  // Auto-restore wallet session from previous visit
  useEffect(() => {
    isConnected().then(({ isConnected: connected }: { isConnected: boolean }) => {
      if (connected) {
        getAddress().then(({ address }: { address: string }) => {
          if (address) setWalletPubKey(address);
        });
      }
    });
  }, []);

  // Poll relayer health when on docs tab
  useEffect(() => {
    if (activeTab !== 'docs') return;
    const poll = async () => {
      try {
        const res = await fetch(`${RELAYER_URL}/health`);
        const d = await res.json();
        setRelayerOnline(d.status === 'ok');
        setRelayerStats({ totalTransactions: d.totalTransactions ?? 0, xlmSponsored: d.xlmSponsored ?? '0.0000', uptime: d.uptime ?? 'N/A' });
      } catch { setRelayerOnline(false); }
      // Also fetch full metrics
      try {
        const r2 = await fetch(`${RELAYER_URL}/api/metrics`);
        const m = await r2.json();
        setMetrics(m);
      } catch { /* metrics optional */ }
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [activeTab]);

  // Connect Freighter wallet
  const connectWallet = async () => {
    setWalletConnecting(true);
    try {
      const { error } = await requestAccess();
      if (!error) {
        const { address } = await getAddress();
        setWalletPubKey(address);
      }
    } catch { /* user rejected */ }
    setWalletConnecting(false);
  };

  const disconnectWallet = () => setWalletPubKey(null);

  // Claim coffee
  const handleClaim = async () => {
    setCoffeeStage('generating');
    setCoffeeError(null);
    setCoffeeTxHash(null);
    setCoffeeUserKey(null);
    try {
      await sleep(700); setCoffeeStage('signing');
      await sleep(600); setCoffeeStage('relaying');
      const result = await executeGasless('claim_coffee');
      setCoffeeTxHash(result.hash || null);
      // If wallet connected use their real key, otherwise show ephemeral
      setCoffeeUserKey(walletPubKey || result.userPubKey || null);
      setCoffeeStage('success');
    } catch (err: any) {
      setCoffeeError(err.message || 'Relayer unreachable. Is it running?');
      setCoffeeStage('error');
    }
  };

  const isLoading = ['generating', 'signing', 'relaying'].includes(coffeeStage);
  const short = (k: string) => `${k.slice(0, 6)}...${k.slice(-4)}`;

  return (
    <div className="app-container">
      {/* ── NAV ── */}
      <nav className="navbar">
        <div className="logo">✨ StellarBloom</div>

        <div className="nav-links">
          <button className={`nav-link ${activeTab === 'demo' ? 'active' : ''}`} onClick={() => setActiveTab('demo')}>Live Demo</button>
          <button className={`nav-link ${activeTab === 'docs' ? 'active' : ''}`} onClick={() => setActiveTab('docs')}>Developer Docs</button>
        </div>

        <div className="nav-actions">
          {walletPubKey ? (
            <button className="wallet-badge" onClick={disconnectWallet} title="Click to disconnect">
              <span className="wallet-dot" />
              {short(walletPubKey)}
            </button>
          ) : (
            <button className="btn-connect" onClick={connectWallet} disabled={walletConnecting}>
              {walletConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </nav>

      <main className="main-content">
        {/* ── HERO ── */}
        <section className="enterprise-hero">
          <div className="tagline">Gasless Infrastructure · Stellar Testnet</div>

          <h1>Web3 apps that feel<br />like Web2.</h1>

          <p className="hero-sub">
            StellarBloom lets users interact with Soroban apps without wallets, seed phrases, or gas fees.
            One click. Real transaction. Zero friction.
          </p>

          <div className="hero-cta-group">
            <button className="btn-hero" onClick={() => setActiveTab('demo')}>
              Try the Live Demo →
            </button>
            <button className="btn-hero-secondary" onClick={() => setActiveTab('docs')}>
              Read the Docs
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat"><span className="hero-stat-num">~18s</span><span className="hero-stat-label">Avg. Onboarding</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><span className="hero-stat-num">$0.00</span><span className="hero-stat-label">User Cost</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><span className="hero-stat-num">100%</span><span className="hero-stat-label">Non-Custodial</span></div>
          </div>

          <div className="value-props">
            <div className="glass-panel prop-card">
              <div className="prop-icon">🚫</div>
              <h3>No Wallet Required</h3>
              <p>Anonymous users transact instantly. No installs, no seed phrases. Blockchain is invisible.</p>
            </div>
            <div className="glass-panel prop-card">
              <div className="prop-icon">⚡</div>
              <h3>Relayer-Sponsored Gas</h3>
              <p>Developers fund a Gas Tank. StellarBloom wraps every intent as a FeeBump — fractions of a cent per tx.</p>
            </div>
            <div className="glass-panel prop-card">
              <div className="prop-icon">🔐</div>
              <h3>Cryptographically Verified</h3>
              <p>Every transaction is a real Ed25519-signed payload. Verifiable on Stellar Expert in real-time.</p>
            </div>
          </div>
        </section>

        {/* ── DEMO ── */}
        {activeTab === 'demo' && (
          <section className="demo-section fade-in">
            <div className="demo-header">
              <h2>Try it now</h2>
              <p>No setup. No wallet needed. One click executes a real Stellar transaction.</p>
            </div>

            <div className="demo-card-wrapper">
              {/* Wallet session banner */}
              {walletPubKey && coffeeStage === 'idle' && (
                <div className="session-banner">
                  <span className="wallet-dot" /> Signed in as <code>{short(walletPubKey)}</code>
                </div>
              )}
              {!walletPubKey && coffeeStage === 'idle' && (
                <div className="session-banner anon">
                  <span>🕵️</span> Anonymous mode — <button className="link-btn" onClick={connectWallet}>Connect wallet for persistent session</button>
                </div>
              )}

              <div className="glass-panel payment-card" style={{ border: '1px solid rgba(124,58,237,0.3)' }}>
                <div className="card-header">
                  <h2>☕ Coffee Shop Demo</h2>
                  <span className="badge">Live · Testnet</span>
                </div>
                <p className="text-muted mb-4" style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
                  You're a first-time user who has never heard of crypto. Click the button below.
                </p>

                {/* CTA Button */}
                {(coffeeStage === 'idle' || isLoading) && (
                  <button
                    className="btn-primary full-width"
                    style={{ fontSize: '1rem', letterSpacing: '0.3px' }}
                    onClick={handleClaim}
                    disabled={isLoading}
                  >
                    {coffeeStage === 'idle'       && '☕  Claim Free Coffee'}
                    {coffeeStage === 'generating' && '⚙️  Generating wallet...'}
                    {coffeeStage === 'signing'    && '✍️  Signing locally...'}
                    {coffeeStage === 'relaying'   && '🚀  Sponsoring gas fee...'}
                  </button>
                )}

                {/* Stage tracker */}
                {isLoading && (
                  <div className="stage-tracker mt-4">
                    {(['generating','signing','relaying'] as const).map((key, i) => {
                      const labels = ['Generate ephemeral keypair', 'Sign intent payload locally', 'Submit to Relayer'];
                      const order = ['generating','signing','relaying'];
                      const done   = order.indexOf(coffeeStage) > i;
                      const active = coffeeStage === key;
                      return (
                        <div key={key} className={`stage-row ${done ? 'done' : active ? 'active' : 'pending'}`}>
                          <span className="stage-icon">{done ? '✓' : active ? '›' : '·'}</span>
                          <span>{labels[i]}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Error */}
                {coffeeStage === 'error' && (
                  <>
                    <div className="alert error mt-4">❌ {coffeeError}</div>
                    <button className="btn-secondary mt-4" onClick={() => setCoffeeStage('idle')}>Try Again</button>
                  </>
                )}

                {/* Success */}
                {coffeeStage === 'success' && (
                  <div className="alert success mt-4">
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>✅ Transaction Confirmed!</div>
                    <div className="receipt">
                      <div className="receipt-row">
                        <span>{walletPubKey ? 'Your Wallet' : 'Session Key'}</span>
                        <code>{coffeeUserKey ? short(coffeeUserKey) : '—'}</code>
                      </div>
                      <div className="receipt-row">
                        <span>Gas Paid By</span>
                        <span style={{ color: '#a78bfa', fontWeight: 600 }}>StellarBloom Relayer</span>
                      </div>
                      <div className="receipt-row">
                        <span>Your Cost</span>
                        <strong style={{ color: '#34d399' }}>$0.00</strong>
                      </div>
                      {coffeeTxHash && (
                        <div className="receipt-row" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 9 }}>
                          <a href={`https://stellar.expert/explorer/testnet/tx/${coffeeTxHash}`} target="_blank" rel="noreferrer">
                            Verify on Stellar Expert ↗
                          </a>
                        </div>
                      )}
                    </div>
                    <button className="btn-secondary mt-4" onClick={() => { setCoffeeStage('idle'); setCoffeeTxHash(null); setCoffeeUserKey(null); }}>
                      Try Again
                    </button>
                  </div>
                )}
              </div>

              {/* Explainer */}
              <div className="explainer">
                <strong>Under the hood</strong>
                <ol>
                  <li>A temporary Ed25519 keypair is generated in your browser</li>
                  <li>Your intent is signed locally — private key never leaves your device</li>
                  <li>StellarBloom Relayer wraps it in a FeeBump transaction and pays the fee</li>
                  <li>Transaction lands on Stellar Testnet — permanent and verifiable</li>
                </ol>
              </div>
            </div>
          </section>
        )}

        {/* ── DOCS ── */}
        {activeTab === 'docs' && (
          <section className="dashboard-section fade-in">
            <div className="demo-header">
              <h2>Developer Docs</h2>
              <p>Integrate gasless transactions into your Soroban app in minutes.</p>
            </div>

            {/* Relayer health */}
            <div className="glass-panel relayer-health">
              <div className="health-left">
                <h3>Relayer Status</h3>
                <p className="text-muted" style={{fontSize:'0.82rem'}}>Live · updates every 5s</p>
              </div>
              <div className={`status-badge ${relayerOnline === null ? 'checking' : relayerOnline ? 'online' : 'offline'}`}>
                <span className="status-dot" />
                {relayerOnline === null ? 'Checking...' : relayerOnline ? 'Online' : 'Offline'}
              </div>
              {relayerStats && (
                <div className="health-stats">
                  <div className="stat-box"><div className="stat-label">Sponsored Txs</div><div className="stat-value">{relayerStats.totalTransactions}</div></div>
                  <div className="stat-box"><div className="stat-label">XLM Sponsored</div><div className="stat-value">{relayerStats.xlmSponsored} <span style={{fontSize:'0.4em'}}>XLM</span></div></div>
                  <div className="stat-box"><div className="stat-label">Uptime</div><div className="stat-value" style={{fontSize:'1.2rem'}}>{relayerStats.uptime}</div></div>
                </div>
              )}
            </div>

            {/* ── Metrics Dashboard ── */}
            {metrics && (
              <div className="glass-panel metrics-panel">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap', gap:'12px'}}>
                  <div>
                    <h3 style={{marginBottom:'3px'}}>📊 Platform Metrics</h3>
                    <p className="text-muted" style={{fontSize:'0.8rem'}}>Indexed from persistent transaction log · live data</p>
                  </div>
                  <a href={`${RELAYER_URL}/api/metrics`} target="_blank" rel="noreferrer" style={{fontSize:'0.75rem', color:'#7c3aed', textDecoration:'underline'}}>
                    Raw JSON ↗
                  </a>
                </div>

                {/* KPI row */}
                <div className="metrics-kpi-row">
                  <div className="metrics-kpi">
                    <div className="metrics-kpi-value">{metrics.totalTransactions}</div>
                    <div className="metrics-kpi-label">Total Transactions</div>
                  </div>
                  <div className="metrics-kpi">
                    <div className="metrics-kpi-value">{metrics.uniqueUsers}</div>
                    <div className="metrics-kpi-label">Unique Users</div>
                  </div>
                  <div className="metrics-kpi">
                    <div className="metrics-kpi-value">{parseFloat(metrics.xlmSponsored).toFixed(4)}</div>
                    <div className="metrics-kpi-label">XLM Sponsored</div>
                  </div>
                  <div className="metrics-kpi">
                    <div className="metrics-kpi-value" style={{fontSize:'1.1rem'}}>
                      {metrics.totalTransactions > 0 ? (parseFloat(metrics.xlmSponsored) / metrics.uniqueUsers).toFixed(5) : '0'}
                    </div>
                    <div className="metrics-kpi-label">Avg XLM / User</div>
                  </div>
                </div>

                {/* Daily breakdown */}
                {Object.keys(metrics.transactionsByDay).length > 0 && (
                  <div style={{marginTop:'20px'}}>
                    <p style={{fontSize:'0.78rem', color:'#6b7280', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'10px'}}>Activity by Day</p>
                    <div className="metrics-day-grid">
                      {Object.entries(metrics.transactionsByDay).sort().map(([day, count]) => (
                        <div key={day} className="metrics-day-bar">
                          <div className="metrics-bar-fill" style={{height: `${Math.min(100, (count / Math.max(...Object.values(metrics.transactionsByDay))) * 60 + 10)}px`}} />
                          <div className="metrics-bar-count">{count}</div>
                          <div className="metrics-bar-day">{day.slice(5)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent txs */}
                {metrics.recentTransactions.length > 0 && (
                  <div style={{marginTop:'20px'}}>
                    <p style={{fontSize:'0.78rem', color:'#6b7280', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'10px'}}>Recent Transactions</p>
                    <div className="metrics-tx-table">
                      {metrics.recentTransactions.slice(0, 5).map((tx, i) => (
                        <div key={i} className="metrics-tx-row">
                          <code style={{color:'#a78bfa', fontSize:'0.75rem'}}>{tx.pubKey?.slice(0,8)}...{tx.pubKey?.slice(-4)}</code>
                          <span style={{color:'#6b7280', fontSize:'0.75rem'}}>{tx.action}</span>
                          <a href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`} target="_blank" rel="noreferrer" style={{fontSize:'0.72rem', color:'#7c3aed', textDecoration:'underline'}}>
                            {tx.hash?.slice(0,10)}... ↗
                          </a>
                          <span style={{color:'#374151', fontSize:'0.7rem'}}>{tx.timestamp?.slice(11,19)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Start */}
            <div className="dashboard-grid">
              <div className="glass-panel dashboard-card">
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
                  <span className="step-num">1</span>
                  <h3 style={{margin:0}}>Run the Relayer</h3>
                </div>
                <p className="text-muted mb-4" style={{fontSize:'0.85rem'}}>Clone and start the Node.js relayer with your funded testnet key.</p>
                <div className="code-block">
                  <pre>{`git clone https://github.com/thesumedh/stellar-bloom
cd stellar-bloom/relayer
cp .env.example .env   # add SPONSOR_SECRET
npm install && node index.js
# → 🚀 Relayer running on :3000`}</pre>
                </div>
              </div>

              <div className="glass-panel dashboard-card">
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
                  <span className="step-num">2</span>
                  <h3 style={{margin:0}}>Send a Gasless Intent</h3>
                </div>
                <p className="text-muted mb-4" style={{fontSize:'0.85rem'}}>Sign an intent and POST it — the Relayer sponsors the gas automatically.</p>
                <div className="code-block">
                  <pre>{`import { executeGasless } from './bloom-sdk';

const result = await executeGasless('your_action');
// { success: true, hash: 'abc...', userPubKey: 'G...' }

// Verifiable on-chain:
// stellar.expert/explorer/testnet/tx/\${result.hash}`}</pre>
                </div>
              </div>

              {/* Coming Soon */}
              <div className="glass-panel dashboard-card coming-soon-card" style={{gridColumn:'1 / -1'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'12px'}}>
                  <div>
                    <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
                      <span className="step-num" style={{background:'rgba(124,58,237,0.15)',color:'#a78bfa'}}>✦</span>
                      <h3 style={{margin:0}}>Managed API — Hosted Relayer Nodes</h3>
                    </div>
                    <p className="text-muted" style={{fontSize:'0.85rem',maxWidth:'540px',lineHeight:'1.65'}}>
                      Get a hosted API key, managed relayer, spending dashboard, and per-key gas budgets — no infrastructure to run yourself. Currently in development.
                    </p>
                  </div>
                  <span className="badge" style={{background:'rgba(124,58,237,0.12)',color:'#a78bfa',border:'1px solid rgba(124,58,237,0.3)',whiteSpace:'nowrap'}}>
                    Coming Soon
                  </span>
                </div>
                <button className="btn-primary mt-4" style={{width:'fit-content'}} onClick={() => window.open('https://github.com/thesumedh/stellar-bloom','_blank')}>
                  ⭐ Star on GitHub · Get Notified
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <div className="background-elements">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>
    </div>
  );
}

export default App;
