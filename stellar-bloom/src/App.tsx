import { useState, useEffect } from 'react';
import { isConnected, requestAccess, getAddress } from '@stellar/freighter-api';
import { executeGasless } from './lib/bloom-sdk';
import './App.css';

const RELAYER_URL = import.meta.env.VITE_RELAYER_URL || 'http://localhost:3000';
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
type Stage = 'idle' | 'generating' | 'signing' | 'relaying' | 'success' | 'error';
type CoffeeStage = Stage; // alias kept for compatibility

const DEMOS = [
  { id: 'claim_coffee',  emoji: '☕', label: 'Coffee Shop',    desc: 'Claim a free coffee — no wallet needed',         badge: 'Food & Drink' },
  { id: 'claim_ticket',  emoji: '🎟️', label: 'Event Ticket',   desc: 'Reserve your festival ticket instantly',          badge: 'Events' },
  { id: 'unlock_item',   emoji: '🎮', label: 'Game Item',       desc: 'Unlock an in-game item without gas fees',         badge: 'Gaming' },
] as const;
type DemoId = typeof DEMOS[number]['id'];

interface RecentTransaction {
  hash: string;
  pubKey: string;
  action: string;
  timestamp: string;
  transactionType?: string;
  sponsoredTotalXlm?: number;
  explorerUrl?: string | null;
}

interface TopWallet {
  pubKey: string;
  txCount: number;
  firstSeen: string;
  lastSeen: string;
  dayCount: number;
  actions: string[];
  totalSponsoredXlm: number;
  explorerUrl: string | null;
}

interface MetricsData {
  totalTransactions: number;
  uniqueUsers: number;
  repeatUsers: number;
  powerUsers: number;
  multiDayUsers: number;
  activeToday: number;
  activeLast7Days: number;
  avgTransactionsPerUser: number;
  repeatUserRatePct: number;
  xlmSponsored: string;
  sponsoredFeeXlm: string;
  sponsoredValueXlm: string;
  sponsorSpendTotalXlm: string;
  transactionsByDay: Record<string, number>;
  dailyActiveUsers: Record<string, number>;
  transactionsByAction: Record<string, number>;
  transactionsByType: Record<string, number>;
  topWallets: TopWallet[];
  recentTransactions: RecentTransaction[];
  goalProgress: {
    targetWallets: number;
    currentWallets: number;
    currentTransactions: number;
    walletGoalMet: boolean;
  };
  indexing: {
    source: string;
    endpoint: string;
    strategy: string;
    indexedAt: string;
    latestTxAt: string | null;
  };
}

function CopyBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="code-block" style={{position:'relative'}}>
      <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
        {copied ? '✓ Copied!' : 'Copy'}
      </button>
      <pre>{code}</pre>
    </div>
  );
}


function App() {
  const [activeTab, setActiveTab] = useState<'demo' | 'docs' | 'feedback'>('demo');

  // ── Wallet Session ──
  const [walletPubKey, setWalletPubKey] = useState<string | null>(null);
  const [walletConnecting, setWalletConnecting] = useState(false);

  // ── Demo ──
  const [demoType, setDemoType] = useState<DemoId>('claim_coffee');
  const [coffeeStage, setCoffeeStage] = useState<CoffeeStage>('idle');
  const [coffeeTxHash, setCoffeeTxHash] = useState<string | null>(null);
  const [coffeeUserKey, setCoffeeUserKey] = useState<string | null>(null);
  const [coffeeError, setCoffeeError] = useState<string | null>(null);

  // ── Live TX Feed ──
  const [liveFeed, setLiveFeed] = useState<RecentTransaction[]>([]);

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

  // Poll relayer health + live feed
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${RELAYER_URL}/health`);
        const d = await res.json();
        setRelayerOnline(d.status === 'ok');
        setRelayerStats({ totalTransactions: d.totalTransactions ?? 0, xlmSponsored: d.xlmSponsored ?? '0.0000', uptime: d.uptime ?? 'N/A' });
      } catch { setRelayerOnline(false); }
      try {
        const r2 = await fetch(`${RELAYER_URL}/api/metrics`);
        const m = await r2.json();
        setMetrics(m);
        if (m.recentTransactions) setLiveFeed(m.recentTransactions.slice(0, 8));
      } catch { /* metrics optional */ }
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, []);

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

  // Generalized demo claim
  const handleClaim = async () => {
    setCoffeeStage('generating');
    setCoffeeError(null);
    setCoffeeTxHash(null);
    setCoffeeUserKey(null);
    try {
      await sleep(700); setCoffeeStage('signing');
      await sleep(600); setCoffeeStage('relaying');
      const result = await executeGasless(demoType);
      setCoffeeTxHash(result.hash || null);
      setCoffeeUserKey(walletPubKey || result.userPubKey || null);
      setCoffeeStage('success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Relayer unreachable. Try again.';
      setCoffeeError(message);
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
          <button className={`nav-link ${activeTab === 'feedback' ? 'active' : ''}`} onClick={() => setActiveTab('feedback')}>Feedback</button>
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
            StellarBloom lets users complete a Stellar-powered action without handling wallets, seed phrases, or gas fees themselves.
            One click generates a session key, signs the intent locally, and the relayer submits a real sponsored transaction.
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
              <h3>Relayer-Sponsored Actions</h3>
              <p>Developers fund the relayer. Session onboarding is sponsored automatically, and the advanced `/relay` API also supports fee-bumped signed XDRs.</p>
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

            {/* Demo Selector */}
            <div className="demo-selector">
              {DEMOS.map(d => (
                <button
                  key={d.id}
                  className={`demo-selector-card ${demoType === d.id ? 'selected' : ''}`}
                  onClick={() => { setDemoType(d.id); setCoffeeStage('idle'); }}
                  disabled={['generating','signing','relaying'].includes(coffeeStage)}
                >
                  <span className="demo-selector-emoji">{d.emoji}</span>
                  <span className="demo-selector-label">{d.label}</span>
                  <span className="demo-selector-badge">{d.badge}</span>
                </button>
              ))}
            </div>

            {/* Live TX Feed */}
            {liveFeed.length > 0 && (
              <div className="live-feed">
                <div className="live-feed-header">
                  <span className="live-dot" />
                  <span style={{fontSize:'0.75rem', fontWeight:600, color:'#a78bfa', textTransform:'uppercase', letterSpacing:'0.8px'}}>Live Transactions</span>
                </div>
                <div className="live-feed-scroll">
                  {liveFeed.map((tx, i) => (
                    <div key={i} className="live-feed-item">
                      <span className="live-feed-action">{tx.action?.replace(/_/g,' ')}</span>
                      <code className="live-feed-key">{tx.pubKey?.slice(0,6)}…{tx.pubKey?.slice(-4)}</code>
                      <a href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`} target="_blank" rel="noreferrer" className="live-feed-hash">{tx.hash?.slice(0,8)}↗</a>
                    </div>
                  ))}
                </div>
              </div>
            )}


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
                  <h2>{DEMOS.find(x => x.id === demoType)?.emoji} {DEMOS.find(x => x.id === demoType)?.label}</h2>
                  <span className="badge">Live · Testnet</span>
                </div>
                <p className="text-muted mb-4" style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
                  {DEMOS.find(x => x.id === demoType)?.desc}. Zero crypto experience needed.
                </p>

                {/* CTA Button */}
                {(coffeeStage === 'idle' || isLoading) && (
                  <button
                    className="btn-primary full-width"
                    style={{ fontSize: '1rem', letterSpacing: '0.3px' }}
                    onClick={handleClaim}
                    disabled={isLoading}
                  >
                        {coffeeStage === 'idle'       && `${DEMOS.find(x => x.id ===demoType)?.emoji}  Claim Now`}
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
                  <li>StellarBloom Relayer verifies the intent, creates or funds the session account, and pays the sponsor cost</li>
                  <li>The resulting transaction lands on Stellar Testnet and is verifiable on Stellar Expert</li>
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
              <p>Integrate sponsored onboarding into your Soroban or Stellar app in minutes.</p>
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
                    <div className="metrics-kpi-label">Unique Wallets</div>
                  </div>
                  <div className="metrics-kpi">
                    <div className="metrics-kpi-value">{metrics.repeatUsers}</div>
                    <div className="metrics-kpi-label">Repeat Wallets</div>
                  </div>
                  <div className="metrics-kpi">
                    <div className="metrics-kpi-value">{metrics.activeLast7Days}</div>
                    <div className="metrics-kpi-label">Active 7D Wallets</div>
                  </div>
                </div>

                <div className="metrics-kpi-row compact">
                  <div className="metrics-kpi">
                    <div className="metrics-kpi-value">{metrics.powerUsers}</div>
                    <div className="metrics-kpi-label">3+ Tx Wallets</div>
                  </div>
                  <div className="metrics-kpi">
                    <div className="metrics-kpi-value">{metrics.activeToday}</div>
                    <div className="metrics-kpi-label">Active Today</div>
                  </div>
                  <div className="metrics-kpi">
                    <div className="metrics-kpi-value">{metrics.repeatUserRatePct}%</div>
                    <div className="metrics-kpi-label">Repeat Rate</div>
                  </div>
                  <div className="metrics-kpi">
                    <div className="metrics-kpi-value">{metrics.avgTransactionsPerUser}</div>
                    <div className="metrics-kpi-label">Avg Tx / Wallet</div>
                  </div>
                </div>

                <div className="metrics-detail-grid">
                  <div className="metrics-detail-card">
                    <p className="metrics-detail-label">Sponsorship Breakdown</p>
                    <div className="metrics-inline-list">
                      <span><strong>{parseFloat(metrics.sponsorSpendTotalXlm).toFixed(4)} XLM</strong> total sponsor spend</span>
                      <span><strong>{parseFloat(metrics.sponsoredValueXlm).toFixed(4)} XLM</strong> value transferred</span>
                      <span><strong>{parseFloat(metrics.sponsoredFeeXlm).toFixed(4)} XLM</strong> protocol fees</span>
                    </div>
                  </div>
                  <div className="metrics-detail-card">
                    <p className="metrics-detail-label">Black Belt Goal</p>
                    <div className="goal-progress-row">
                      <strong>{metrics.goalProgress.currentWallets}/{metrics.goalProgress.targetWallets}</strong>
                      <span className={`goal-pill ${metrics.goalProgress.walletGoalMet ? 'done' : ''}`}>
                        {metrics.goalProgress.walletGoalMet ? '30+ wallets reached' : 'Still scaling'}
                      </span>
                    </div>
                    <p className="text-muted" style={{fontSize:'0.78rem'}}>
                      Indexed directly from the persistent relayer log, so README proof and dashboard numbers come from the same source.
                    </p>
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

                {Object.keys(metrics.transactionsByAction).length > 0 && (
                  <div style={{marginTop:'22px'}}>
                    <p style={{fontSize:'0.78rem', color:'#6b7280', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'10px'}}>Action Mix</p>
                    <div className="metrics-chip-list">
                      {Object.entries(metrics.transactionsByAction)
                        .sort((a, b) => b[1] - a[1])
                        .map(([action, count]) => (
                          <div key={action} className="metrics-chip">
                            <span>{action.replace(/_/g, ' ')}</span>
                            <strong>{count}</strong>
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
                          <span style={{color:'#6b7280', fontSize:'0.75rem'}}>{tx.action} · {tx.transactionType}</span>
                          <a href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`} target="_blank" rel="noreferrer" style={{fontSize:'0.72rem', color:'#7c3aed', textDecoration:'underline'}}>
                            {tx.hash?.slice(0,10)}... ↗
                          </a>
                          <span style={{color:'#374151', fontSize:'0.7rem'}}>{tx.timestamp?.slice(11,19)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {metrics.topWallets.length > 0 && (
                  <div style={{marginTop:'22px'}}>
                    <p style={{fontSize:'0.78rem', color:'#6b7280', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'10px'}}>Most Active Wallets</p>
                    <div className="metrics-wallet-list">
                      {metrics.topWallets.map((wallet) => (
                        <div key={wallet.pubKey} className="metrics-wallet-row">
                          <div>
                            <code>{wallet.pubKey.slice(0, 10)}...{wallet.pubKey.slice(-4)}</code>
                            <div className="metrics-wallet-meta">{wallet.actions.join(', ')}</div>
                          </div>
                          <div className="metrics-wallet-stats">
                            <span>{wallet.txCount} tx</span>
                            <span>{wallet.dayCount} day(s)</span>
                          </div>
                          {wallet.explorerUrl && (
                            <a href={wallet.explorerUrl} target="_blank" rel="noreferrer">Explorer ↗</a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="indexing-grid">
                  <div className="indexing-card">
                    <p className="metrics-detail-label">Data Indexing</p>
                    <p className="text-muted" style={{fontSize:'0.82rem'}}>
                      <code>{metrics.indexing.source}</code> is aggregated into wallet, action, and daily activity views, then exposed at <code>{metrics.indexing.endpoint}</code> for the live dashboard and README proof table.
                    </p>
                  </div>
                  <div className="indexing-card">
                    <p className="metrics-detail-label">Index Metadata</p>
                    <div className="metrics-inline-list">
                      <span><strong>Strategy:</strong> {metrics.indexing.strategy}</span>
                      <span><strong>Latest tx:</strong> {metrics.indexing.latestTxAt ? new Date(metrics.indexing.latestTxAt).toLocaleString() : 'No data yet'}</span>
                    </div>
                  </div>
                </div>
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
                <CopyBlock code={`git clone https://github.com/thesumedh/stellar-bloom
cd stellar-bloom/relayer
cp .env.example .env   # add SPONSOR_SECRET
npm install && node index.js
# → 🚀 Relayer running on :3000`} />
              </div>

              <div className="glass-panel dashboard-card">
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
                  <span className="step-num">2</span>
                  <h3 style={{margin:0}}>Send a Gasless Intent</h3>
                </div>
                <p className="text-muted mb-4" style={{fontSize:'0.85rem'}}>Sign an intent and POST it — the Relayer sponsors the gas automatically.</p>
                <CopyBlock code={`import { executeGasless } from './bloom-sdk';

const result = await executeGasless('your_action');
// { success: true, hash: 'abc...', userPubKey: 'G...' }

// Verifiable on-chain:
// stellar.expert/explorer/testnet/tx/\${result.hash}`} />
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

        {/* ── FEEDBACK ── */}
        {activeTab === 'feedback' && (
          <section className="dashboard-section fade-in">
            <div className="demo-header">
              <h2>Share Your Feedback</h2>
              <p>Help us improve StellarBloom. Your feedback directly shapes the next release.</p>
            </div>
            <div className="glass-panel feedback-panel">
              <div className="feedback-top">
                <div>
                  <h3 style={{marginBottom:'6px'}}>📝 User Feedback Form</h3>
                  <p className="text-muted" style={{fontSize:'0.82rem'}}>Takes ~60 seconds. Anonymous responses welcome.</p>
                </div>
                <a href="https://forms.gle/Y3TjqYbCK1m6Ch629" target="_blank" rel="noreferrer" className="btn-secondary" style={{fontSize:'0.82rem', padding:'8px 16px'}}>
                  Open in new tab ↗
                </a>
              </div>
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSd7BIfbpfGjbIIopI2PMsEOkwl2-gZFMd8uq5EulKKUmh23dg/viewform?embedded=true"
                width="100%"
                height="1336"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                style={{borderRadius:'12px', marginTop:'16px', background:'#fff'}}
                title="StellarBloom Feedback Form"
              >
                Loading form…
              </iframe>
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
