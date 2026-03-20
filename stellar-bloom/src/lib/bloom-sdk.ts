import { Keypair } from '@stellar/stellar-sdk';

export interface BloomSession {
  user: {
    email: string;
    provider: string;
  };
  pubKey: string;
}

export class StellarBloom {
  private apiKey: string;
  private relayerUrl: string;

  constructor(apiKey: string, relayerUrl: string = 'http://localhost:3000/relay/intent') {
    this.apiKey = apiKey;
    this.relayerUrl = relayerUrl;
  }

  /**
   * Generates or retrieves the Session Keypair stored entirely locally.
   * This is ephemeral and non-custodial.
   */
  private getSessionKeypair(): Keypair {
    const saved = localStorage.getItem('bloom_session_secret');
    if (saved) {
      return Keypair.fromSecret(saved);
    }
    const kp = Keypair.random();
    localStorage.setItem('bloom_session_secret', kp.secret());
    return kp;
  }

  /**
   * Initializes the environment.
   */
  public init(): void {
    // Merely ensures a session key is ready
    this.getSessionKeypair();
  }

  /**
   * Simulates an OAuth social login overlay.
   * In a real SDK, this triggers a Magic Link or Web3Auth popup.
   * Returns a BloomSession containing the user's mapped Smart Account (pubKey).
   */
  public async login(provider: 'google' | 'email'): Promise<BloomSession> {
    // Simulate network delay for OAuth
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const sessionKp = this.getSessionKeypair();
    
    const sessionData = {
      user: {
        email: 'demo_user@gmail.com',
        provider
      },
      pubKey: sessionKp.publicKey()
    };
    
    localStorage.setItem('bloom_session_data', JSON.stringify(sessionData));
    return sessionData;
  }

  /**
   * Transmits an off-chain intent to the Relayer.
   * The Relayer wraps the intent into a genuine sponsored Stellar Testnet transaction.
   */
  public async transact(intentData: any): Promise<{ success: boolean; hash?: string; error?: string; details?: any }> {
    const sessionKp = this.getSessionKeypair();
    const payload = JSON.stringify({
      ...intentData,
      timestamp: Date.now()
    });

    // 1. Sign the intent locally using the ephemeral session key
    const signature = sessionKp.sign(Buffer.from(payload));

    // 2. Submit to Relayer
    const res = await fetch(this.relayerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey
      },
      body: JSON.stringify({
        payload,
        signature: signature.toString('hex'),
        pubKey: sessionKp.publicKey()
      })
    });

    return await res.json();
  }
  
  /**
   * Clears the active session
   */
  public logout(): void {
    localStorage.removeItem('bloom_session_secret');
    localStorage.removeItem('bloom_session_data');
  }
}

// Export a default singleton for the demo
export const bloom = new StellarBloom('sb_test_5kq9v2x8m4j1c0p3');
