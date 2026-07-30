const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const ITERATIONS = 100000;
const HASH = 'SHA-256';

function getDeviceFingerprint(): string {
  const ua = navigator.userAgent || 'unknown';
  const s = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}` : 'unknown';
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return `${ua}|${s}|${tz}`;
}

async function deriveKey(salt: Uint8Array): Promise<CryptoKey> {
  const fingerprint = getDeviceFingerprint();
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(fingerprint),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: ITERATIONS,
      hash: HASH,
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

function getOrCreateSalt(): Uint8Array {
  const stored = localStorage.getItem('medisense_crypto_salt');
  if (stored) {
    return new Uint8Array(JSON.parse(stored));
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  localStorage.setItem('medisense_crypto_salt', JSON.stringify(Array.from(salt)));
  return salt;
}

export async function encryptData(plaintext: string): Promise<string> {
  const salt = getOrCreateSalt();
  const key = await deriveKey(salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    enc.encode(plaintext)
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptData(ciphertextB64: string): Promise<string> {
  try {
    const salt = getOrCreateSalt();
    const key = await deriveKey(salt);
    const combined = new Uint8Array(
      atob(ciphertextB64).split('').map(c => c.charCodeAt(0))
    );
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      data
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    console.warn('Decryption failed — data may be corrupted or salt changed');
    return '';
  }
}
