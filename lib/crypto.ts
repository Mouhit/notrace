// lib/crypto.ts - AES-256-GCM Encryption for NoTrace by Engage Ad
// FIXED: Proper type casting for nonce

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const NONCE_LENGTH = 12;
const TAG_LENGTH = 128;

export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

export function generateNonce(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(NONCE_LENGTH));
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  const array = new Uint8Array(exported);
  return btoa(String.fromCharCode(...array));
}

export async function importKey(keyString: string): Promise<CryptoKey> {
  const binaryString = atob(keyString);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return await crypto.subtle.importKey(
    'raw',
    bytes,
    { name: ALGORITHM },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptMessage(
  message: string,
  key: CryptoKey
): Promise<{ encrypted: string }> {
  const nonce = generateNonce();
  const encoder = new TextEncoder();
  const messageData = encoder.encode(message);

  const encrypted = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: nonce as BufferSource,
      tagLength: TAG_LENGTH,
    },
    key,
    messageData
  );

  // Combine nonce + encrypted data
  const encryptedBytes = new Uint8Array(encrypted);
  const combined = new Uint8Array(nonce.length + encryptedBytes.length);
  combined.set(nonce, 0);
  combined.set(encryptedBytes, nonce.length);

  return {
    encrypted: btoa(String.fromCharCode(...combined)),
  };
}

export async function decryptMessage(
  encryptedBase64: string,
  key: CryptoKey
): Promise<string> {
  // Decode from base64
  const combined = new Uint8Array(atob(encryptedBase64).split('').map(c => c.charCodeAt(0)));

  // Extract nonce (first 12 bytes) and encrypted data (rest)
  const nonce = combined.slice(0, NONCE_LENGTH);
  const encryptedData = combined.slice(NONCE_LENGTH);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: nonce as BufferSource,
      tagLength: TAG_LENGTH,
    },
    key,
    encryptedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === hash;
}
