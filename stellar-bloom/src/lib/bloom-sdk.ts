import { Keypair } from '@stellar/stellar-sdk';

export interface BloomResult {
  success: boolean;
  hash?: string;
  userPubKey?: string;
  error?: string;
}

const RELAYER_URL = 'http://localhost:3000/relay/intent';
const API_KEY = 'sb_test_5kq9v2x8m4j1c0p3';

/**
 * StellarBloom SDK - Core gasless transaction layer.
 * The user never knows a wallet was created. Everything is ephemeral and invisible.
 */
export async function executeGasless(action: string): Promise<BloomResult> {
  // 1. Generate a fresh ephemeral keypair every time (truly disposable)
  const ephemeralKeypair = Keypair.random();
  const pubKey = ephemeralKeypair.publicKey();

  // 2. Build the intent payload with a unique nonce to prevent replay attacks
  const payload = JSON.stringify({
    action,
    userPubKey: pubKey,
    nonce: crypto.randomUUID(),
    timestamp: Date.now(),
  });

  // 3. Sign the intent locally (private key never leaves the browser)
  const payloadBytes = new TextEncoder().encode(payload);
  const signatureBuffer = ephemeralKeypair.sign(payloadBytes as unknown as Buffer);
  const signature = btoa(
    Array.from(new Uint8Array(signatureBuffer))
      .map(b => String.fromCharCode(b))
      .join('')
  );

  // 4. Send signed intent to Relayer — Relayer pays the gas
  const res = await fetch(RELAYER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({ payload, signature, pubKey }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Relayer error: ${res.status}`);
  }

  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Transaction failed');

  return { success: true, hash: data.hash, userPubKey: pubKey };
}
