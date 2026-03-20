

export default function LandingPage({ onDemo, onDashboard }: { onDemo: () => void, onDashboard: () => void }) {
  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Magic Metrics Banner */}
      <div className="bg-indigo-600 px-4 py-3 text-white text-center text-sm font-medium flex justify-center items-center space-x-4">
        <span>⚡ 1,240 Gasless Transactions Sponsored</span>
        <span className="opacity-50 hidden sm:inline">|</span>
        <span className="hidden sm:inline">⏱️ Average Onboarding: 18 Seconds</span>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
          The Easiest Way to Build on <span className="text-indigo-600">Soroban</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-600">
          StellarBloom abstracts away blockchain complexity. Offer your users a seamless Web2-like experience where you automatically sponsor their gas fees. No crypto required.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={onDemo} className="rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all">
            Try the Live Demo
          </button>
          <button onClick={onDashboard} className="rounded-full px-8 py-3.5 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-all">
            Developer Documentation
          </button>
        </div>
      </div>

      {/* Before / After Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
           <h2 className="text-base font-semibold leading-7 text-indigo-600">The 1-Click Transformation</h2>
           <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">End the Onboarding Friction</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div className="bg-red-50/50 rounded-3xl p-8 border border-red-100/50">
            <h3 className="text-slate-800 font-semibold mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3 text-red-600">❌</span>
              Traditional Web3 Onboarding
            </h3>
            <ul className="space-y-4 text-slate-600 text-sm">
              <li className="flex items-center"><span className="mr-3 flex w-6 h-6 items-center justify-center rounded-full bg-white border border-slate-200 text-xs font-medium">1</span> User installs a third-party browser wallet</li>
              <li className="flex items-center"><span className="mr-3 flex w-6 h-6 items-center justify-center rounded-full bg-white border border-slate-200 text-xs font-medium">2</span> User secures a 24-word seed phrase offline</li>
              <li className="flex items-center"><span className="mr-3 flex w-6 h-6 items-center justify-center rounded-full bg-white border border-slate-200 text-xs font-medium">3</span> User passes KYC on a centralized exchange</li>
              <li className="flex items-center"><span className="mr-3 flex w-6 h-6 items-center justify-center rounded-full bg-white border border-slate-200 text-xs font-medium">4</span> User buys native tokens to pay for network gas</li>
              <li className="flex items-center"><span className="mr-3 flex w-6 h-6 items-center justify-center rounded-full bg-white border border-slate-200 text-xs font-medium">5</span> User transfers tokens and waits for finality</li>
              <li className="flex items-center"><span className="mr-3 flex w-6 h-6 items-center justify-center rounded-full bg-white border border-slate-200 text-xs font-medium">6</span> User navigates back to your dApp to finally interact</li>
            </ul>
            <div className="mt-6 pt-6 border-t border-red-200/50 text-center text-red-600 font-medium text-sm">Result: 90% Drop-off Rate before the first click</div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-8 border border-indigo-100 shadow-xl shadow-indigo-900/5 relative transform lg:-translate-y-4">
            <div className="absolute -top-4 -right-4 bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">StellarBloom</div>
            <h3 className="text-slate-800 font-semibold mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 text-indigo-600">✨</span>
              The 1-Click Experience
            </h3>
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center my-8">
              <div className="w-16 h-16 bg-slate-50 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl border border-slate-100">📧</div>
              <div className="text-slate-900 font-semibold text-lg mb-2">Sign in with Google</div>
              <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">StellarBloom provisions the Smart Contract Account entirely behind the scenes.</p>
              <button disabled className="w-full bg-slate-900 text-white rounded-xl py-3 text-sm font-medium opacity-70 cursor-not-allowed">Continue with Google</button>
            </div>
            <div className="text-center text-indigo-600 font-medium text-sm">Result: 18 Second Average Onboarding</div>
          </div>
        </div>
      </div>

      {/* The Magic Layer Section */}
      <div className="bg-slate-50 py-24 sm:py-32 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
             <h2 className="text-base font-semibold leading-7 text-indigo-600">The Magic Layer for Stellar</h2>
             <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Make blockchain apps work like normal apps</p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
             <div className="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-slate-200/50 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 font-bold text-xl">1</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">What Users Experience</h3>
                <ul className="text-slate-600 text-sm leading-relaxed space-y-2">
                  <li className="flex items-start"><span className="mr-2 text-indigo-400">✦</span> Click a button ("Claim Coffee")</li>
                  <li className="flex items-start"><span className="mr-2 text-indigo-400">✦</span> Log in with Google</li>
                  <li className="flex items-start"><span className="mr-2 text-indigo-400">✦</span> Transaction happens instantly</li>
                </ul>
                <p className="mt-4 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">Users never pay gas, manage wallets, or even know it's crypto.</p>
             </div>
             <div className="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-slate-200/50 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 font-bold text-xl">2</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">What Developers Do</h3>
                <ul className="text-slate-600 text-sm leading-relaxed space-y-2">
                  <li className="flex items-start"><span className="mr-2 text-emerald-400">✦</span> Top up your Developer Gas Tank</li>
                  <li className="flex items-start"><span className="mr-2 text-emerald-400">✦</span> Add the 5-line Bloom SDK snippet</li>
                  <li className="flex items-start"><span className="mr-2 text-emerald-400">✦</span> Track sponsored txs in the Dashboard</li>
                </ul>
                <p className="mt-4 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">You pay the fraction-of-a-cent ledger fees so your users don't have to.</p>
             </div>
             <div className="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-slate-200/50 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 font-bold text-xl">3</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Why It Exists</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Normally, crypto apps are complicated: installing wallets, buying tokens for gas, saving seed phrases.
                </p>
                <div className="mt-4 text-slate-900 font-medium text-sm">This causes a 90% drop-off.</div>
                <p className="mt-2 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">StellarBloom removes all friction to help you onboard and retain mass-market users.</p>
             </div>
          </div>
          
          <div className="mt-16 text-center">
             <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium text-slate-600 bg-white ring-1 ring-inset ring-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors" onClick={onDemo}>
                ☕ <span className="ml-2 font-semibold">Try the Coffee Shop Demo to see it live →</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
