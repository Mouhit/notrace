/**
 * Passphrase-based encryption library
 * Handles key derivation, encryption, and decryption
 */

// Generate random salt for PBKDF2
export async function generateSalt(): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Derive encryption key from passphrase using PBKDF2
export async function deriveKeyFromPassphrase(
  passphrase: string,
  saltHex: string,
  iterations: number = 100000
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));

  const passphraseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: iterations,
      hash: "SHA-256",
    },
    passphraseKey,
    256 // 32 bytes for AES-256
  );

  return crypto.subtle.importKey(
    "raw",
    derivedBits,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt private key with derived key
export async function encryptPrivateKey(
  privateKey: string,
  passphrase: string,
  saltHex: string,
  iterations: number = 100000
): Promise<string> {
  try {
    const key = await deriveKeyFromPassphrase(passphrase, saltHex, iterations);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96 bits for GCM
    const encoder = new TextEncoder();

    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encoder.encode(privateKey)
    );

    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(new Uint8Array(iv), 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    return Array.from(combined)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt private key");
  }
}

// Decrypt private key with passphrase
export async function decryptPrivateKey(
  encryptedHex: string,
  passphrase: string,
  saltHex: string,
  iterations: number = 100000
): Promise<string> {
  try {
    const key = await deriveKeyFromPassphrase(passphrase, saltHex, iterations);

    // Extract IV and encrypted data
    const data = new Uint8Array(encryptedHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt private key. Invalid passphrase?");
  }
}

// Generic encryption utility
export async function encryptData(
  data: string,
  key: CryptoKey
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encoder.encode(data)
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(new Uint8Array(iv), 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return Array.from(combined)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Generic decryption utility
export async function decryptData(
  encryptedHex: string,
  key: CryptoKey
): Promise<string> {
  const data = new Uint8Array(encryptedHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
  const iv = data.slice(0, 12);
  const encrypted = data.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encrypted
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
