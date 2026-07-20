import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyPasswordAndRecord, getFailedAttemptsCount, getEncryptedMessage, getClientIP } from '@/lib/api';

interface VerifyPasswordRequest {
  password: string;
}

interface VerifyPasswordResponse {
  success: boolean;
  valid?: boolean;
  attempts_remaining?: number;
  error?: string;
}

const MAX_ATTEMPTS = 3;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyPasswordResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { password } = req.body as VerifyPasswordRequest;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, error: 'Message ID is required' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    if (password.length > 256) {
      return res.status(400).json({ success: false, error: 'Invalid password' });
    }

    // Check failed attempts
    const failedAttempts = await getFailedAttemptsCount(id);
    const attemptsRemaining = MAX_ATTEMPTS - failedAttempts;

    if (attemptsRemaining <= 0) {
      return res.status(429).json({
        success: false,
        error: 'Too many failed attempts. Please try again later.',
      });
    }

    // Get encrypted message
    const message = await getEncryptedMessage(id);
    if (!message.encrypted_password) {
      return res.status(400).json({
        success: false,
        error: 'This message does not require a password',
      });
    }

    // Verify password
    const clientIP = getClientIP(req);
    const isValid = await verifyPasswordAndRecord(
      id,
      message.encrypted_content,
      message.nonce,
      password,
      clientIP
    );

    if (!isValid) {
      const newAttemptsRemaining = attemptsRemaining - 1;
      return res.status(401).json({
        success: false,
        valid: false,
        attempts_remaining: newAttemptsRemaining,
        error: `Incorrect password. ${newAttemptsRemaining} attempt${newAttemptsRemaining !== 1 ? 's' : ''} remaining.`,
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
    });
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
