/**
 * NoTrace P2P Chat — Cryptographic Utilities
 * Complete implementation with BIP39, Ed25519, password hashing
 */

export interface ChatKeypair {
  publicKey: string;
  privateKey: string;
}

// ─── BIP39 Mnemonic ──────────────────────────────────────────────────────────

/**
 * Generate a 12-word BIP39 mnemonic phrase (128 bits entropy).
 * Stays entirely in the browser — never sent to server.
 */
export async function generateMnemonic(): Promise<string> {
  const { generateMnemonic: gen } = await import("@scure/bip39");
  const { wordlist } = await import("@scure/bip39/wordlists/english");
  return gen(wordlist, 128);
}

/**
 * Derive a 32-byte seed from mnemonic using PBKDF2.
 */
export async function mnemonicToSeed(mnemonic: string): Promise<Uint8Array> {
  const { mnemonicToSeedSync } = await import("@scure/bip39");
  const seed = mnemonicToSeedSync(mnemonic);
  return seed.slice(0, 32);
}

// ─── Ed25519 Keypair ─────────────────────────────────────────────────────────

/**
 * Generate Ed25519 keypair from a 32-byte seed.
 * Public key goes to Supabase.
 * Private key stays ONLY in localStorage.
 */
export async function generateKeypair(seed: Uint8Array): Promise<ChatKeypair> {
  const ed = await import("@noble/ed25519");
  const { sha512 } = await import("@noble/hashes/sha512");

  // noble/ed25519 requires sha512 to be set
  ed.etc.sha512Sync = (...m: any[]) => sha512(ed.etc.concatBytes(...m));

  const privateKey = seed;
  const publicKey = await ed.getPublicKeyAsync(privateKey);

  return {
    publicKey: bytesToHex(publicKey),
    privateKey: bytesToHex(privateKey),
  };
}

/**
 * Sign a message with the private key.
 */
export async function signMessage(message: string, privateKeyHex: string): Promise<string> {
  const ed = await import("@noble/ed25519");
  const { sha512 } = await import("@noble/hashes/sha512");
  ed.etc.sha512Sync = (...m: any[]) => sha512(ed.etc.concatBytes(...m));

  const msgBytes = new TextEncoder().encode(message);
  const privBytes = hexToBytes(privateKeyHex);
  const signature = await ed.signAsync(msgBytes, privBytes);
  return bytesToHex(signature);
}

// ─── Password Hashing ────────────────────────────────────────────────────────

/**
 * Hash password using SHA-256 with username salt.
 * For production, consider bcrypt on server-side.
 */
export async function hashPassword(password: string, username: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`notrace:${username.toLowerCase()}:${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(hashBuffer));
}

/**
 * Verify password against stored hash (timing-safe).
 */
export async function verifyPassword(
  password: string,
  username: string,
  storedHash: string
): Promise<boolean> {
  const hash = await hashPassword(password, username);
  if (hash.length !== storedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) {
    diff |= hash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return diff === 0;
}

// ─── LocalStorage Management ──────────────────────────────────────────────────

export const STORAGE_KEYS = {
  username: "notrace-chat-username",
  privateKey: "notrace-chat-privkey",
  publicKey: "notrace-chat-pubkey",
  mnemonic: "notrace-chat-mnemonic",
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

// ─── Utility: Hex Conversion ──────────────────────────────────────────────────

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
/**
 * Add this function to your lib/chat/crypto.ts file
 * This generates the RSA key pair for the user
 */

export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  try {
    // Generate RSA key pair
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true, // extractable
      ["encrypt", "decrypt"]
    );

    // Export public key
    const publicKeyData = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    const publicKeyHex = Array.from(new Uint8Array(publicKeyData))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Export private key
    const privateKeyData = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
    const privateKeyHex = Array.from(new Uint8Array(privateKeyData))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return {
      publicKey: publicKeyHex,
      privateKey: privateKeyHex,
    };
  } catch (error) {
    console.error("Key pair generation error:", error);
    throw new Error("Failed to generate key pair");
  }
}
