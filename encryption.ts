import nacl from 'tweetnacl-js';

/**
 * Derive encryption key from password using PBKDF2-like approach
 * For production, consider using libsodium.js for Argon2
 */
export async function deriveKeyFromPassword(password: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
}

/**
 * Generate random key (32 bytes for NaCl secretbox)
 */
export function generateRandomKey(): Uint8Array {
  return nacl.randomBytes(32);
}

/**
 * Generate nonce (24 bytes for NaCl secretbox)
 */
export function generateNonce(): Uint8Array {
  return nacl.randomBytes(24);
}

/**
 * Encrypt message with optional password
 */
export async function encryptMessage(
  message: string,
  password?: string
): Promise<{
  encryptedContent: string;
  nonce: string;
  encryptedPassword: string | null;
  passwordNonce: string | null;
}> {
  const messageBytes = nacl.util.decodeUTF8(message);
  const nonce = generateNonce();
  
  let encryptedPassword: string | null = null;
  let passwordNonce: string | null = null;
  let encryptionKey: Uint8Array;

  if (password) {
    // Derive key from password
    encryptionKey = await deriveKeyFromPassword(password);
    
    // Also encrypt the password hash for validation
    const passwordNonceForEncryption = generateNonce();
    const passwordBytes = nacl.util.decodeUTF8(password);
    const encryptedPasswordBytes = nacl.secretbox(
      passwordBytes,
      passwordNonceForEncryption,
      encryptionKey
    );
    
    encryptedPassword = nacl.util.encodeBase64(encryptedPasswordBytes);
    passwordNonce = nacl.util.encodeBase64(passwordNonceForEncryption);
  } else {
    // Generate random key if no password
    encryptionKey = generateRandomKey();
  }

  // Encrypt the message
  const encryptedContentBytes = nacl.secretbox(messageBytes, nonce, encryptionKey);
  const encryptedContent = nacl.util.encodeBase64(encryptedContentBytes);
  const nonceString = nacl.util.encodeBase64(nonce);

  return {
    encryptedContent,
    nonce: nonceString,
    encryptedPassword,
    passwordNonce,
  };
}

/**
 * Decrypt message with optional password
 */
export async function decryptMessage(
  encryptedContent: string,
  nonce: string,
  password?: string
): Promise<string> {
  try {
    const encryptedBytes = nacl.util.decodeBase64(encryptedContent);
    const nonceBytes = nacl.util.decodeBase64(nonce);
    
    let decryptionKey: Uint8Array;

    if (password) {
      decryptionKey = await deriveKeyFromPassword(password);
    } else {
      throw new Error('Password required but not provided');
    }

    const decryptedBytes = nacl.secretbox.open(encryptedBytes, nonceBytes, decryptionKey);
    
    if (!decryptedBytes) {
      throw new Error('Decryption failed - incorrect password or corrupted data');
    }

    return nacl.util.encodeUTF8(decryptedBytes);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt message');
  }
}

/**
 * Verify password by attempting decryption
 */
export async function verifyPassword(
  encryptedContent: string,
  nonce: string,
  password: string
): Promise<boolean> {
  try {
    await decryptMessage(encryptedContent, nonce, password);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert bytes to Base64 string for storage
 */
export function bytesToBase64(bytes: Uint8Array): string {
  return nacl.util.encodeBase64(bytes);
}

/**
 * Convert Base64 string to bytes for decryption
 */
export function base64ToBytes(base64: string): Uint8Array {
  return nacl.util.decodeBase64(base64);
}
