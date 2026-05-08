/**
 * NoTrace Chat — Cryptographic Utilities
 * ----------------------------------------
 * - BIP39 12-word recovery phrase (local only, never sent to server)
 * - Ed25519 keypair generation from seed
 * - Password hashing via SHA-256
 */

// ─── BIP39 Mnemonic ──────────────────────────────────────────────────────────

/**
 * Generate a 12-word BIP39 mnemonic phrase.
 * Uses Web Crypto API for entropy — stays entirely in the browser.
 */
export async function generateMnemonic(): Promise<string> {
  const { generateMnemonic: gen } = await import("@scure/bip39");
  const { wordlist } = await import("@scure/bip39/wordlists/english");
  return gen(wordlist, 128); // 128 bits = 12 words
}

/**
 * Derive a 32-byte seed from a mnemonic using PBKDF2.
 */
export async function mnemonicToSeed(mnemonic: string): Promise<Uint8Array> {
  const { mnemonicToSeedSync } = await import("@scure/bip39");
  const seed = mnemonicToSeedSync(mnemonic);
  return seed.slice(0, 32); // use first 32 bytes for Ed25519
}

// ─── Ed25519 Keypair ─────────────────────────────────────────────────────────

export interface ChatKeypair {
  publicKey: string;   // hex
  privateKey: string;  // hex — stored locally only, NEVER sent to server
}

/**
 * Generate Ed25519 keypair from a 32-byte seed.
 * The public key is saved to Supabase.
 * The private key is stored ONLY in localStorage.
 */
export async function generateKeypair(seed: Uint8Array): Promise<ChatKeypair> {
  const ed = await import("@noble/ed25519");
  const { sha512 } = await import("@noble/hashes/sha512");

  // noble/ed25519 v2 requires sha512 to be set
  ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

  const privateKey = seed;
  const publicKey = await ed.getPublicKeyAsync(privateKey);

  return {
    publicKey: bytesToHex(publicKey),
    privateKey: bytesToHex(privateKey),
  };
}

/**
 * Sign a message with the private key (for future message auth).
 */
export async function signMessage(message: string, privateKeyHex: string): Promise<string> {
  const ed = await import("@noble/ed25519");
  const { sha512 } = await import("@noble/hashes/sha512");
  ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

  const msgBytes = new TextEncoder().encode(message);
  const privBytes = hexToBytes(privateKeyHex);
  const signature = await ed.signAsync(msgBytes, privBytes);
  return bytesToHex(signature);
}

// ─── Password Hashing ────────────────────────────────────────────────────────

/**
 * Hash a password using SHA-256 with a username salt.
 * Simple but consistent — for production consider bcrypt via server.
 */
export async function hashPassword(password: string, username: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`notrace:${username.toLowerCase()}:${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(hashBuffer));
}

/**
 * Verify a password against a stored hash.
 */
export async function verifyPassword(
  password: string,
  username: string,
  storedHash: string
): Promise<boolean> {
  const hash = await hashPassword(password, username);
  // Timing-safe comparison
  if (hash.length !== storedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) {
    diff |= hash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return diff === 0;
}

// ─── Local Storage Keys ──────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  username: "notrace-chat-username",
  privateKey: "notrace-chat-privkey",
  publicKey: "notrace-chat-pubkey",
  mnemonic: "notrace-chat-mnemonic", // only stored during registration flow
};

export function saveChatIdentity(username: string, keypair: ChatKeypair) {
  localStorage.setItem(STORAGE_KEYS.username, username);
  localStorage.setItem(STORAGE_KEYS.privateKey, keypair.privateKey);
  localStorage.setItem(STORAGE_KEYS.publicKey, keypair.publicKey);
}

export function loadChatIdentity(): { username: string; privateKey: string; publicKey: string } | null {
  const username = localStorage.getItem(STORAGE_KEYS.username);
  const privateKey = localStorage.getItem(STORAGE_KEYS.privateKey);
  const publicKey = localStorage.getItem(STORAGE_KEYS.publicKey);
  if (!username || !privateKey || !publicKey) return null;
  return { username, privateKey, publicKey };
}

export function clearChatIdentity() {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
}

// ─── Hex Utils ───────────────────────────────────────────────────────────────

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    result[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return result;
}
