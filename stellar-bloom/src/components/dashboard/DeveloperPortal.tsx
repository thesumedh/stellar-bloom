import { useState, useEffect } from 'react';

export default function DeveloperPortal({ onBack }: { onBack: () => void }) {
  const [balanceAlert, setBalanceAlert] = useState(true);
  
  // Dynamic metrics for the "Funding Round" demo
  const [apiStats, setApiStats] = useState({
    totalTransactions: 0,
    xlmSponsored: "0.00",
    gasRemaining: "100.00",
    activeUsers: 0
  });
  const [relayStatus, setRelayStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const fetchStats = () => {
      fetch('http://localhost:3000/api/stats/sb_test_5kq9v2x8m4j1c0p3')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setApiStats(data.stats);
            setRelayStatus('online');
          }
        })
        .catch(() => setRelayStatus('offline'));
    };
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-300 font-sans selection:bg-indigo-500/30">
      {/* Top Navigation */}
      <nav className="border-b border-zinc-800/60 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center cursor-pointer" onClick={onBack}>
              <span className="text-xl mr-2">✨</span>
              <span className="font-bold text-white tracking-tight">StellarBloom</span>
              <span className="ml-3 px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 flex items-center">
                Developer Portal
                <span className={`ml-2 w-2 h-2 rounded-full ${relayStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : relayStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-zinc-500">Project:</span>
              <span className="text-sm font-medium text-white bg-zinc-900 px-3 py-1 rounded-md border border-zinc-800">☕ Coffee Shop Demo</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 ml-4"></div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Gas Tank Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Gas Tank</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage your Relayer API keys and global XLM sponsor pools.</p>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Available Gas Pool</h3>
            <div className="flex items-end">
              <span className="text-3xl font-semibold text-white">{apiStats.gasRemaining}</span>
              <span className="ml-2 text-sm text-zinc-500 mb-1">XLM</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer">Deposit XLM ↗</span>
              <span className="text-zinc-500">~ 94,000 Txns</span>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Total Relayed</h3>
            <div className="text-3xl font-semibold text-white">{apiStats.totalTransactions}</div>
            <div className="mt-4 text-xs text-emerald-400">
              ↑ 12% from last week
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Smart Accounts Created</h3>
            <div className="text-3xl font-semibold text-white">{apiStats.activeUsers}</div>
            <div className="mt-4 text-xs text-zinc-500">
               Session Keys Generated
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-2">Automated Protections</h3>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-white">Low Balance Alert</span>
                <button 
                  onClick={() => setBalanceAlert(!balanceAlert)} 
                  className={`w-10 h-5 rounded-full transition-colors relative ${balanceAlert ? 'bg-indigo-500' : 'bg-zinc-700'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${balanceAlert ? 'translate-x-5' : ''}`}></span>
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-white">Rate Limiting</span>
                <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded text-zinc-400 border border-zinc-700">5 tx/hr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture & SDK Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main SDK Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#0f0f11] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
              <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between bg-zinc-900/40">
                <h2 className="text-lg font-medium text-white">Integration Quickstart</h2>
                <span className="inline-flex items-center rounded-md bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300">TypeScript SDK</span>
              </div>
              <div className="p-6">
                <p className="text-sm text-zinc-400 mb-4">Initialize the SDK to handle Social Login, generate local Session Keys, and trigger Meta-Transactions. Your dApp never touches a private key.</p>
                <div className="bg-[#18181b] rounded-lg p-4 font-mono text-sm overflow-x-auto border border-zinc-800/60 shadow-inner">
<pre className="text-indigo-300">
{`import { StellarBloom } from '@stellarbloom/sdk';

// 1. Initialize with your Relayer API Key
const bloom = new StellarBloom('pk_test_8f92j...3k9d');

// 2. Handle Google Login (Creates Smart Account)
const session = await bloom.initAuth({ provider: 'google' });

// 3. Send a Gasless Meta-Transaction
const receipt = await bloom.transact({
  intent: 'mint_coffee_nft',
  contractId: 'CBM3...8FJ',
  args: [ session.user.id ]
});

console.log('NFT Minted! Gas paid by Developer Tank:', receipt);`}
</pre>
                </div>
              </div>
            </div>

            <div className="bg-[#0f0f11] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
               <div className="border-b border-zinc-800 px-6 py-4 bg-zinc-900/40">
                  <h2 className="text-lg font-medium text-white">Fiat-Native Onramp (SEP-24)</h2>
               </div>
               <div className="p-6 flex flex-col sm:flex-row gap-6 items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 flex-shrink-0">
                     <span className="text-2xl text-emerald-400">💳</span>
                  </div>
                  <div>
                     <h3 className="text-white font-medium mb-1">Atomic Stellar Anchors</h3>
                     <p className="text-sm text-zinc-400">Credit card purchases trigger regulated SEP-24 Anchors (MoneyGram, Linker). Assets are deposited directly into the user's Smart Wallet, immediately triggering your Soroban contract call in one seamless flow.</p>
                     <button className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">View Reference Implementation ↗</button>
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-6">
               <h3 className="text-white font-medium mb-4 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 pulse-bg"></span>
                  Live Relayer Stream
               </h3>
               <div className="space-y-4">
                  <div className="border-l-2 border-indigo-500 pl-3">
                     <div className="text-xs text-zinc-500 mb-1">Just now</div>
                     <div className="text-sm text-zinc-300 font-mono">mint_coffee_nft</div>
                     <div className="text-xs text-emerald-400 mt-1">Confirmed • 0.0019 XLM</div>
                  </div>
                  <div className="border-l-2 border-zinc-700 pl-3 opacity-60">
                     <div className="text-xs text-zinc-500 mb-1">2 mins ago</div>
                     <div className="text-sm text-zinc-300 font-mono">Bloom.InitAuth(google)</div>
                     <div className="text-xs text-emerald-400 mt-1">Session Key Generated</div>
                  </div>
                  <div className="border-l-2 border-zinc-700 pl-3 opacity-60">
                     <div className="text-xs text-zinc-500 mb-1">1 hr ago</div>
                     <div className="text-sm text-zinc-300 font-mono">gas_pool_deposit</div>
                     <div className="text-xs text-emerald-400 mt-1">+100.00 XLM</div>
                  </div>
               </div>
            </div>

            <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-900/20 relative overflow-hidden">
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
               <h3 className="font-medium mb-2 relative z-10">Export to Real Wallet</h3>
               <p className="text-sm text-indigo-100 mb-4 relative z-10 leading-relaxed">
                  StellarBloom is non-custodial. Your users can always export their Smart Account keys to standard wallets like LOBSTR or Freighter.
               </p>
               <button className="bg-white text-indigo-600 text-sm font-medium px-4 py-2 rounded-lg w-full relative z-10 hover:bg-indigo-50 transition-colors">
                  View Recovery Logic
               </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
