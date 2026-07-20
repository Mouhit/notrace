import type { NextApiRequest, NextApiResponse } from 'next';
import { createMessage, getClientIP } from '@/lib/api';

interface CreateMessageRequest {
  content: string;
  templateType: string;
  expiryMinutes: number;
  password?: string;
  scheduledFor?: string;
}

interface CreateMessageResponse {
  success: boolean;
  id?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateMessageResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { content, templateType, expiryMinutes, password, scheduledFor } = 
      req.body as CreateMessageRequest;

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    if (content.length > 4500) {
      return res.status(400).json({ success: false, error: 'Content exceeds 4500 characters' });
    }

    const validTemplates = ['email', 'api_key', 'otp', 'journal', 'document', 'credit_card'];
    if (!validTemplates.includes(templateType)) {
      return res.status(400).json({ success: false, error: 'Invalid template type' });
    }

    const validExpiries = [60, 360, 720, 1440, 2880];
    if (!validExpiries.includes(expiryMinutes)) {
      return res.status(400).json({ success: false, error: 'Invalid expiry time' });
    }

    if (password && password.length > 256) {
      return res.status(400).json({ success: false, error: 'Password too long' });
    }

    const clientIP = getClientIP(req);
    const scheduledDate = scheduledFor ? new Date(scheduledFor) : undefined;

    // Create message
    const result = await createMessage(
      content,
      templateType,
      expiryMinutes,
      password,
      scheduledDate,
      clientIP
    );

    res.status(201).json({
      success: true,
      id: result.id,
    });
  } catch (error) {
    console.error('Error in create message API:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
