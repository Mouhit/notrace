/**
 * NoTrace — Zero-Knowledge AES-256-GCM Encryption
 * -------------------------------------------------
 * All encryption and decryption happens locally in the browser.
 * The server only ever sees ciphertext — never the plaintext or the key.
 *
 * Flow:
 *   Encrypt → base64(iv + ciphertext)  →  stored in Supabase
 *   Key     → base64url(rawKey)        →  appended to URL #fragment (never sent to server)
 *   Decrypt → read key from #fragment  →  decrypt ciphertext in browser
 */

// ─── Key Generation ──────────────────────────────────────────────────────────

/**
 * Generate a fresh random AES-256-GCM key.
 * Returns the CryptoKey object and its base64url-encoded string for the URL.
 */
export async function generateEncryptionKey(): Promise<{
  key: CryptoKey;
  keyString: string;
}> {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,       // extractable — so we can export it to the URL fragment
    ["encrypt", "decrypt"]
  );

  const rawKey = await crypto.subtle.exportKey("raw", key);
  const keyString = bufferToBase64url(rawKey);

  return { key, keyString };
}

/**
 * Import an AES-256-GCM key from a base64url string (read from URL fragment).
 */
export async function importEncryptionKey(keyString: string): Promise<CryptoKey> {
  const rawKey = base64urlToBuffer(keyString);
  return crypto.subtle.importKey(
    "raw",
    rawKey.buffer as ArrayBuffer,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

// ─── Encryption ──────────────────────────────────────────────────────────────

/**
 * Encrypt plaintext using AES-256-GCM.
 *
 * Returns a base64-encoded string of: [12-byte IV] + [ciphertext]
 * This is what gets stored on the server.
 */
export async function encryptSecret(plaintext: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // Generate a random 12-byte IV (recommended size for AES-GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  // Prepend IV to ciphertext so we can extract it during decryption
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);

  return bufferToBase64(combined.buffer);
}

// ─── Decryption ──────────────────────────────────────────────────────────────

/**
 * Decrypt a base64-encoded ciphertext string using AES-256-GCM.
 *
 * Expects the format produced by encryptSecret: [12-byte IV] + [ciphertext]
 */
export async function decryptSecret(encryptedData: string, key: CryptoKey): Promise<string> {
  const combined = base64ToBuffer(encryptedData);

  // Extract the 12-byte IV from the front
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

// ─── URL Fragment Key Helpers ─────────────────────────────────────────────────

/**
 * Build the shareable URL by appending the encryption key as a URL fragment.
 * The fragment (#) is NEVER sent to the server in HTTP requests.
 *
 * Example: https://notrace.app/s/abc123#AaBbCcDdEe...
 */
export function buildShareUrl(baseUrl: string, keyString: string): string {
  return `${baseUrl}#${keyString}`;
}

/**
 * Extract the encryption key string from the current page's URL fragment.
 * Returns null if no key is present.
 */
export function extractKeyFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const fragment = window.location.hash.slice(1); // remove leading '#'
  return fragment.length > 0 ? fragment : null;
}

// ─── Buffer / Base64 Utilities ────────────────────────────────────────────────

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bufferToBase64url(buffer: ArrayBuffer): string {
  return bufferToBase64(buffer)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64urlToBuffer(base64url: string): Uint8Array {
  const base64 = base64url
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(base64url.length + ((4 - (base64url.length % 4)) % 4), "=");
  return base64ToBuffer(base64);
}

// ─── Detection ───────────────────────────────────────────────────────────────

/**
 * Detect if a content string is AES-256-GCM encrypted (base64, >20 chars).
 * Used to decide whether to attempt decryption on the read page.
 */
export function isEncrypted(content: string): boolean {
  return content.length > 20 && /^[A-Za-z0-9+/]+=*$/.test(content);
}
