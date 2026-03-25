export default function LandingPage({ onDemo, onDashboard }: { onDemo: () => void, onDashboard: () => void }) {
  return (
    <div className="bg-[#0a0a0b] min-h-screen font-sans text-zinc-300 selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Magic Metrics Banner */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border-b border-indigo-500/20 px-4 py-3 text-indigo-300 text-center text-xs font-medium flex justify-center items-center tracking-wide backdrop-blur-sm sticky top-0 z-50">
        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 pulse-bg"></span> 1,240 Gasless Transactions Sponsored</span>
        <span className="opacity-30 mx-4 hidden sm:inline">|</span>
        <span className="hidden sm:flex items-center">⏱️ Average Onboarding: 18 Seconds</span>
      </div>

      {/* Global Background Grid & Blobs */}
      <div className="absolute inset-0 bg-grid-white bg-grid-white-fade z-0 pointer-events-none hidden md:block"></div>
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[128px] animate-blob z-0 pointer-events-none hidden md:block"></div>
      <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[128px] animate-blob animation-delay-2000 z-0 pointer-events-none hidden md:block"></div>
      <div className="absolute -bottom-32 left-[20%] w-96 h-96 bg-blue-600/20 rounded-full mix-blend-screen filter blur-[128px] animate-blob animation-delay-4000 z-0 pointer-events-none hidden md:block"></div>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center lg:pt-36">
        <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 mb-8 shadow-[0_0_16px_rgba(99,102,241,0.2)] backdrop-blur-xl">
          ✨ Welcome to the Blue Belt MVP
        </div>
        <h1 className="mx-auto max-w-5xl text-5xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl flex flex-col gap-2">
          <span>The Easiest Way to Build</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x px-2 py-1">
            on Soroban.
          </span>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg sm:text-xl tracking-tight text-zinc-400 leading-relaxed font-light">
          StellarBloom completely abstracts away blockchain complexity. Give your users the seamless Web2 experience they deserve. <strong className="text-zinc-200 font-medium">No wallets. No seed phrases. Zero gas fees.</strong>
        </p>
        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-5 items-center">
          <button onClick={onDemo} className="group flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-bold text-black shadow-[0_0_24px_rgba(255,255,255,0.2)] hover:shadow-[0_0_32px_rgba(255,255,255,0.4)] hover:bg-zinc-100 transition-all w-full sm:w-auto">
            Try the Live Demo
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <button onClick={onDashboard} className="rounded-full px-8 py-3.5 text-sm font-bold text-zinc-300 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 hover:bg-zinc-800 transition-all w-full sm:w-auto shadow-xl">
            Developer Console
          </button>
        </div>
      </div>

      {/* Before / After Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="mx-auto max-w-3xl lg:text-center mb-16">
           <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400">The 1-Click Transformation</h2>
           <p className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">End the Onboarding Friction</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch max-w-6xl mx-auto">
          
          {/* Web3 Card */}
          <div className="bg-zinc-900/40 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-zinc-800/80 shadow-2xl relative overflow-hidden group hover:border-red-500/30 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-white font-bold text-xl mb-8 flex items-center">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mr-4 border border-red-500/20 text-red-400">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              </div>
              Traditional Web3
            </h3>
            <ul className="space-y-5 text-zinc-400 text-sm font-medium">
              <li className="flex items-center"><span className="mr-4 flex w-6 h-6 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-500">1</span> Install third-party browser wallet</li>
              <li className="flex items-center"><span className="mr-4 flex w-6 h-6 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-500">2</span> Secure a 24-word generated seed phrase</li>
              <li className="flex items-center"><span className="mr-4 flex w-6 h-6 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-500">3</span> Pass identity KYC on a centralized exchange</li>
              <li className="flex items-center"><span className="mr-4 flex w-6 h-6 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-500">4</span> Purchase tokens specifically to pay for gas</li>
              <li className="flex items-center"><span className="mr-4 flex w-6 h-6 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-500">5</span> Transfer tokens to wallet and wait for finality</li>
              <li className="flex items-center"><span className="mr-4 flex w-6 h-6 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-500">6</span> Return to dApp and sign an incomprehensible payload</li>
            </ul>
            <div className="mt-8 pt-6 border-t border-zinc-800/80 text-center text-red-400 font-bold text-sm bg-red-500/5 rounded-xl py-3 border-x border-b border-red-500/10">Result: 90% Drop-off Rate before the first click</div>
          </div>

          {/* StellarBloom Card */}
          <div className="bg-zinc-900/60 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.1)] relative transform lg:-translate-y-4 group overflow-hidden hover:border-indigo-400/50 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/0 via-indigo-500 to-indigo-500/0 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute -top-4 -right-4 bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-bl-3xl rounded-tr-3xl shadow-lg">StellarBloom</div>
            
            <h3 className="text-white font-bold text-xl mb-8 flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center mr-4 border border-indigo-500/30 text-indigo-400">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </div>
              The 1-Click Experience
            </h3>
            
            <div className="bg-black/50 rounded-2xl p-8 border border-zinc-800 shadow-inner text-center my-10 relative overflow-hidden group-hover:border-indigo-500/20 transition-colors">
              <div className="w-16 h-16 bg-zinc-900 rounded-full mx-auto mb-5 flex items-center justify-center text-3xl border border-zinc-800 shadow-[0_0_15px_rgba(0,0,0,0.5)]">📧</div>
              <div className="text-white font-bold text-lg mb-3 tracking-wide">Sign in with Google</div>
              <p className="text-zinc-500 text-xs mb-8 max-w-[200px] mx-auto font-medium leading-relaxed">StellarBloom provisions the Soroban Contract Account invisibly.</p>
              <button disabled className="w-full bg-white text-black rounded-xl py-3.5 text-sm font-bold opacity-30 cursor-not-allowed">Continue with Google</button>
            </div>
            
            <div className="text-center text-indigo-400 font-bold text-sm bg-indigo-500/10 rounded-xl py-3 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)] flex items-center justify-center">
               <span className="mr-2">💫</span> Result: 18 Second Average Onboarding
            </div>
          </div>
        </div>
      </div>

      {/* The Magic Layer Section */}
      <div className="relative z-10 border-t border-zinc-800 bg-black/40 backdrop-blur-3xl py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
             <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400">The Magic Layer</h2>
             <p className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Under the Hood</p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
             {/* Card 1 */}
             <div className="bg-zinc-900/40 rounded-3xl p-8 border border-zinc-800/80 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all shadow-xl group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 font-bold text-xl border border-indigo-500/20 group-hover:scale-110 transition-transform">1</div>
                <h3 className="text-lg font-bold text-white mb-3">Consumer UX</h3>
                <ul className="text-zinc-400 text-sm leading-relaxed space-y-3 font-medium">
                  <li className="flex items-start"><span className="mr-2 text-indigo-400">✦</span> User clicks an action ("Mint Coffee")</li>
                  <li className="flex items-start"><span className="mr-2 text-indigo-400">✦</span> Logs in via localized OAuth</li>
                  <li className="flex items-start"><span className="mr-2 text-indigo-400">✦</span> Transaction executes instantly</li>
                </ul>
                <p className="mt-6 text-xs font-semibold text-indigo-300 bg-indigo-500/10 px-4 py-3 rounded-xl border border-indigo-500/20">Users never pay gas, manage wallets, or even know it is a cryptocurrency application.</p>
             </div>
             
             {/* Card 2 */}
             <div className="bg-zinc-900/40 rounded-3xl p-8 border border-zinc-800/80 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all shadow-xl group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 font-bold text-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">2</div>
                <h3 className="text-lg font-bold text-white mb-3">Developer Workflow</h3>
                <ul className="text-zinc-400 text-sm leading-relaxed space-y-3 font-medium">
                  <li className="flex items-start"><span className="mr-2 text-emerald-400">✦</span> Top up your Developer Gas Tank</li>
                  <li className="flex items-start"><span className="mr-2 text-emerald-400">✦</span> Add the 5-line Bloom SDK snippet</li>
                  <li className="flex items-start"><span className="mr-2 text-emerald-400">✦</span> Track sponsored txs in the Dashboard</li>
                </ul>
                <p className="mt-6 text-xs font-semibold text-emerald-300 bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20">You pay the fraction-of-a-cent ledger fees so your users do not have to.</p>
             </div>
             
             {/* Card 3 */}
             <div className="bg-zinc-900/40 rounded-3xl p-8 border border-zinc-800/80 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all shadow-xl group sm:col-span-2 lg:col-span-1">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 font-bold text-xl border border-blue-500/20 group-hover:scale-110 transition-transform">3</div>
                <h3 className="text-lg font-bold text-white mb-3">Why Meta-Transactions?</h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                  Normally, crypto applications are wildly complicated. Installing extensions, wrapping tokens natively, and saving physical seed phrases drives non-technical users away.
                </p>
                <div className="mt-5 text-white font-bold text-sm tracking-wide">This causes a 90% UX drop-off.</div>
                <p className="mt-4 text-xs font-semibold text-blue-300 bg-blue-500/10 px-4 py-3 rounded-xl border border-blue-500/20">StellarBloom removes all friction to help you instantly onboard and retain mass-market users.</p>
             </div>
          </div>
          
          <div className="mt-20 text-center">
             <div className="inline-flex items-center rounded-full px-6 py-2.5 text-sm font-bold text-white bg-zinc-800 ring-1 ring-inset ring-zinc-700 shadow-xl cursor-pointer hover:bg-zinc-700 hover:ring-zinc-600 transition-all group" onClick={onDemo}>
                ☕ <span className="ml-3">Try the Live Coffee Shop Demo</span>
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
