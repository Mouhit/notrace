import type { NextApiRequest, NextApiResponse } from 'next';
import { markMessageDestroyed } from '@/lib/api';

interface DestroyResponse {
  success: boolean;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DestroyResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, error: 'Message ID is required' });
    }

    await markMessageDestroyed(id);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error destroying message:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
