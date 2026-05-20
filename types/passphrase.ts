/**
 * TypeScript type definitions for passphrase recovery system
 */

export interface PassphraseConfig {
  minLength: number;
  minIterations: number;
  saltLength: number;
}

export interface EncryptedKeyData {
  encrypted_private_key: string;
  key_salt: string;
  key_iterations: number;
}

export interface KeyRecoveryRequest {
  username: string;
  passphrase: string;
}

export interface KeyRecoveryResponse {
  success: boolean;
  privateKey?: string;
  error?: string;
  message?: string;
}

export interface KeyRecoveryAttempt {
  id: string;
  username: string;
  success: boolean;
  error_reason?: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  username: string;
  password_hash: string;
  public_key: string;
  encrypted_private_key: string;
  key_salt: string;
  key_iterations: number;
  created_at: string;
}

export interface PassphraseSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (passphrase: string) => Promise<void>;
  loading?: boolean;
}

export interface PassphraseRecoveryProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
  onRecover: (privateKey: string) => Promise<void>;
}
