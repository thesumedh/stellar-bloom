import { useState } from 'react';
import { executeGasless } from '../../lib/bloom-sdk';

type Stage =
  | 'idle'
  | 'generating'
  | 'signing'
  | 'relaying'
  | 'confirming'
  | 'success'
  | 'error';

const STAGES: Record<string, { label: string; detail: string }> = {
  generating: { label: 'Generating invisible wallet...', detail: 'Creating a temporary Ed25519 keypair in your browser' },
  signing:    { label: 'Signing intent locally...',     detail: 'Private key never leaves your device' },
  relaying:   { label: 'Submitting to Relayer...',      detail: 'StellarBloom sponsors your gas fee' },
  confirming: { label: 'Writing to Soroban ledger...',  detail: 'Horizon is confirming the FeeBump transaction' },
};

export default function CoffeeShop({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [userPubKey, setUserPubKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClaim = async () => {
    setStage('generating');
    setErrorMsg(null);
    setTxHash(null);

    try {
      // Simulate deterministic visual stages for UX clarity
      await delay(700);  setStage('signing');
      await delay(600);  setStage('relaying');
      
      // Fire the actual gasless transaction in parallel with the "confirming" stage
      const txPromise = executeGasless('claim_coffee');
      setStage('confirming');
      
      const result = await txPromise;
      setTxHash(result.hash || null);
      setUserPubKey(result.userPubKey || null);
      setStage('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Is the Relayer running?');
      setStage('error');
    }
  };

  const handleReset = () => {
    setStage('idle');
    setTxHash(null);
    setUserPubKey(null);
    setErrorMsg(null);
  };

  const isLoading = ['generating', 'signing', 'relaying', 'confirming'].includes(stage);

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center py-12 px-4 font-sans relative overflow-hidden text-zinc-300">

      {/* Background glow */}
      <div className="absolute inset-0 bg-grid-white bg-grid-white-fade z-0 pointer-events-none opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full filter blur-[120px] z-0 pointer-events-none" />

      {/* Back button */}
      <div className="absolute top-6 left-6 z-20">
        <button onClick={onBack} className="text-zinc-600 hover:text-white text-sm flex items-center gap-1 transition-colors">
          ← Back
        </button>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto text-3xl mb-4 shadow-lg">
            ☕
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Virtual Coffee Shop</h1>
          <p className="text-zinc-500 text-sm mt-2">No wallet. No crypto. No fees. Just click.</p>
        </div>

        <div className="bg-zinc-900/70 backdrop-blur-2xl border border-zinc-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

          {/* IDLE */}
          {stage === 'idle' && (
            <div className="fade-in text-center">
              <div className="bg-black/40 border border-zinc-800 rounded-2xl p-6 mb-6">
                <div className="text-4xl mb-3">🎟️</div>
                <p className="text-white font-bold text-sm">Soroban Coffee Token</p>
                <p className="text-zinc-500 text-xs mt-1">Free for new users — sponsored by StellarBloom</p>
              </div>
              <button
                onClick={handleClaim}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_24px_rgba(99,102,241,0.3)] hover:shadow-[0_0_36px_rgba(99,102,241,0.5)] text-sm tracking-wide"
              >
                Claim Free Coffee ☕
              </button>
              <p className="text-zinc-600 text-[10px] mt-4 leading-relaxed">
                Clicking this generates a temporary cryptographic key in your browser, signs an intent, and executes a real Stellar transaction — all invisibly, in under 5 seconds.
              </p>
            </div>
          )}

          {/* LOADING STAGES */}
          {isLoading && (
            <div className="fade-in">
              <div className="text-center mb-8">
                <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white font-bold text-sm">{STAGES[stage]?.label}</p>
                <p className="text-zinc-500 text-xs mt-1">{STAGES[stage]?.detail}</p>
              </div>

              {/* Step tracker */}
              <div className="space-y-3">
                {Object.entries(STAGES).map(([key, { label }]) => {
                  const stageOrder = ['generating', 'signing', 'relaying', 'confirming'];
                  const currentIdx = stageOrder.indexOf(stage);
                  const thisIdx = stageOrder.indexOf(key);
                  const done = thisIdx < currentIdx;
                  const active = thisIdx === currentIdx;
                  return (
                    <div key={key} className={`flex items-center gap-3 text-xs font-mono transition-colors ${done ? 'text-indigo-400' : active ? 'text-white' : 'text-zinc-700'}`}>
                      <span className="w-4 text-center">
                        {done ? '✓' : active ? '›' : '·'}
                      </span>
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {stage === 'success' && (
            <div className="fade-in text-center">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_24px_rgba(16,185,129,0.2)]">
                <span className="text-emerald-400 text-2xl">✓</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Coffee Claimed!</h2>
              <p className="text-zinc-400 text-xs mb-6">A real Stellar transaction was executed on your behalf. You paid nothing.</p>

              {/* Receipt */}
              <div className="bg-black/50 rounded-xl p-4 border border-zinc-800 text-left text-xs space-y-3 mb-6">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                  <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Receipt</span>
                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/20">On-Chain ✓</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Gas Paid By</span>
                  <span className="text-indigo-400 font-bold">StellarBloom Relayer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Your Wallet</span>
                  <span className="text-zinc-300 font-mono">{userPubKey ? `${userPubKey.slice(0,6)}...${userPubKey.slice(-4)}` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Fee Charged</span>
                  <span className="text-white font-bold">$0.00</span>
                </div>
                {txHash && (
                  <div className="pt-2 border-t border-zinc-900">
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                    >
                      View on Stellar Expert ↗
                    </a>
                  </div>
                )}
              </div>

              <button onClick={handleReset} className="text-zinc-600 hover:text-zinc-400 text-xs font-bold uppercase tracking-widest transition-colors">
                Try Again
              </button>
            </div>
          )}

          {/* ERROR */}
          {stage === 'error' && (
            <div className="fade-in text-center">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-red-400 text-2xl">✕</span>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Transaction Failed</h2>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-left mb-6">
                <p className="text-red-400 text-xs font-mono break-words">{errorMsg}</p>
              </div>
              <p className="text-zinc-600 text-xs mb-6">Make sure the Relayer is running on localhost:3000</p>
              <button onClick={handleReset} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all text-sm">
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Bottom proof text */}
        {stage === 'idle' && (
          <p className="text-center text-zinc-700 text-[10px] mt-4 font-mono">
            Powered by Soroban · Stellar Testnet · StellarBloom SDK v0.1
          </p>
        )}
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
