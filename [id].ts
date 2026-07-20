import type { NextApiRequest, NextApiResponse } from 'next';
import { getEncryptedMessage, isMessageExpired, isMessageAvailable, getTimeUntilAvailable, markMessageOpened, getClientIP } from '@/lib/api';

interface MessageResponse {
  success: boolean;
  data?: {
    id: string;
    encrypted_content: string;
    nonce: string;
    encrypted_password: string | null;
    password_nonce: string | null;
    template_type: string;
    requires_password: boolean;
    is_expired: boolean;
    is_available: boolean;
    time_until_available_ms: number;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MessageResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, error: 'Message ID is required' });
    }

    // Fetch message
    const message = await getEncryptedMessage(id);

    // Check if expired
    const isExpired = await isMessageExpired(id);
    if (isExpired) {
      return res.status(410).json({
        success: false,
        error: 'This message has expired',
      });
    }

    // Check if available (for scheduled messages)
    const isAvailable = await isMessageAvailable(id);
    let timeUntilAvailable = 0;

    if (!isAvailable) {
      timeUntilAvailable = await getTimeUntilAvailable(id);
      return res.status(202).json({
        success: false,
        error: 'Message not yet available',
        data: {
          id,
          encrypted_content: '',
          nonce: '',
          encrypted_password: null,
          password_nonce: null,
          template_type: message.template_type,
          requires_password: false,
          is_expired: false,
          is_available: false,
          time_until_available_ms: timeUntilAvailable,
        },
      });
    }

    // Mark as opened
    const clientIP = getClientIP(req);
    await markMessageOpened(id, clientIP);

    res.status(200).json({
      success: true,
      data: {
        id: message.id,
        encrypted_content: message.encrypted_content,
        nonce: message.nonce,
        encrypted_password: message.encrypted_password,
        password_nonce: message.password_nonce,
        template_type: message.template_type,
        requires_password: !!message.encrypted_password,
        is_expired: false,
        is_available: true,
        time_until_available_ms: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
