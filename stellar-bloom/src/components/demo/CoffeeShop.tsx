import { useState, useEffect } from 'react';
import { bloom, type BloomSession } from '../../lib/bloom-sdk';

export default function CoffeeShop({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const [session, setSession] = useState<BloomSession | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bloom.init();
  }, []);
  
  const handleLogin = async () => {
    setIsProcessing(true);
    let p = 0;
    const interval = setInterval(() => { p = Math.min(p + 15, 90); setProgress(p); }, 400);
    
    try {
      const activeSession = await bloom.login('google');
      setSession(activeSession);
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setIsProcessing(false);
        setStep(2);
        setProgress(0);
      }, 500);
    } catch (err) {
      clearInterval(interval);
      setIsProcessing(false);
      console.error(err);
    }
  };

  const handleMint = async () => {
    setIsProcessing(true);
    setError(null);
    let p = 0;
    const interval = setInterval(() => { p = Math.min(p + 10, 85); setProgress(p); }, 600);
    
    try {
      const response = await bloom.transact({ action: 'mint_coffee' });
      clearInterval(interval);
      setProgress(100);
      
      if (response.success) {
        setTxHash(response.hash || null);
        setTimeout(() => {
          setIsProcessing(false);
          setStep(3);
        }, 500);
      } else {
        throw new Error(response.error || "Failed");
      }
    } catch (err: any) {
      clearInterval(interval);
      setIsProcessing(false);
      setError(err.message || 'Minting failed. Ensure the relayer is running.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="absolute top-4 left-4">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-900 font-medium text-sm flex items-center">
          ← Back to StellarBloom
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto text-3xl mb-4">
          ☕
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          The Virtual Coffee Shop
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Experience frictionless Web3. No wallets, no seed phrases, no crypto.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100/50 relative overflow-hidden">
          
          {/* Step 1: Login */}
          {step === 1 && (
            <div className="fade-in">
              <h3 className="text-lg font-medium text-slate-900 mb-6 text-center">Claim Your Free Morning Coffee</h3>
              
              <button 
                onClick={handleLogin}
                disabled={isProcessing}
                className="w-full flex justify-center items-center py-3 px-4 border border-slate-300 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-3" />
                {isProcessing ? 'Generating Smart Wallet...' : 'Continue with Google'}
              </button>
              
              {isProcessing && (
                <div className="mt-6">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-xs text-center text-slate-500">StellarBloom is provisioning a Soroban Smart Contract Account mapped to your session...</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Minting */}
          {step === 2 && (
            <div className="fade-in text-center">
              <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 mb-6">
                Connected: {session ? session.pubKey.slice(0, 4) + "..." + session.pubKey.slice(-4) : "Unknown"}
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6">
                <div className="text-4xl mb-4">🎟️</div>
                <h4 className="text-slate-900 font-medium mb-1">Soroban Coffee NFT</h4>
                <p className="text-xs text-slate-500">Mint your proof-of-concept token directly to your new Smart Account.</p>
              </div>

              <button 
                onClick={handleMint}
                disabled={isProcessing}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70"
              >
                {isProcessing ? 'Waiting for Relayer...' : 'Mint Coffee NFT (Gasless)'}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-50 rounded-md text-red-600 text-sm">
                  {error}
                </div>
              )}

              {isProcessing && (
                <div className="mt-6 text-left">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 overflow-hidden">
                    <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 flex items-center">
                      <span className="w-4">✓</span> Intent signed via Browser Session Key
                    </p>
                    <p className="text-xs text-slate-500 flex items-center">
                      <span className="w-4">{progress > 30 ? '✓' : '•'}</span> StellarBloom Relayer received Request
                    </p>
                    <p className="text-xs text-slate-500 flex items-center">
                      <span className="w-4">{progress > 60 ? '✓' : '•'}</span> Gas Tank applied 0.1 XLM Sponsor Fee
                    </p>
                    <p className="text-xs text-slate-500 flex items-center">
                      <span className="w-4">{progress > 80 ? '✓' : '•'}</span> Submitting to Soroban Testnet RPC...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Success Confetti */}
          {step === 3 && (
            <div className="fade-in text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-emerald-600 text-2xl">✓</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Token Minted!</h3>
              <p className="text-slate-600 text-sm mb-6">
                You just executed a real transaction on the Stellar network. You didn't pay a cent, and you didn't even notice the wallet.
              </p>
              
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left mb-6">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-semibold text-slate-500">Transaction Receipt</span>
                   <span className="text-xs text-emerald-600 font-medium">Confirmed On-Chain</span>
                </div>
                <p className="text-xs text-slate-600 mb-1"><strong>Sponsor:</strong> StellarBloom App Dev Pool</p>
                <p className="text-xs text-slate-600 mb-3"><strong>Gas Paid:</strong> 0.00010 XLM</p>
                {txHash && (
                  <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:text-indigo-500 font-medium underline block text-center mt-2 border-t border-slate-200 pt-3">
                    View execution on Stellar Expert ↗
                  </a>
                )}
              </div>

              <button 
                onClick={() => {
                  setStep(1);
                  setTxHash(null);
                  bloom.logout();
                }}
                className="text-indigo-600 text-sm font-medium hover:text-indigo-500"
              >
                Reset Demo & Clear Session Key
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
