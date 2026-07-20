import { supabase } from './supabase';
import { encryptMessage, decryptMessage, verifyPassword } from './encryption';

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  return realIP || 'unknown';
}

/**
 * Create a new message
 */
export async function createMessage(
  content: string,
  templateType: string,
  expiryMinutes: number,
  password?: string,
  scheduledFor?: Date,
  clientIP?: string
) {
  try {
    // Encrypt the message
    const { encryptedContent, nonce, encryptedPassword, passwordNonce } = 
      await encryptMessage(content, password);

    // Calculate expiry time
    const expiryAt = scheduledFor 
      ? new Date(scheduledFor.getTime() + expiryMinutes * 60000)
      : new Date(Date.now() + expiryMinutes * 60000);

    // Insert into database
    const { data, error } = await supabase
      .from('messages')
      .insert({
        encrypted_content: encryptedContent,
        nonce,
        encrypted_password: encryptedPassword,
        password_nonce: passwordNonce,
        template_type: templateType,
        expiry_at: expiryAt.toISOString(),
        scheduled_for: scheduledFor?.toISOString(),
        created_by_ip: clientIP,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create message: ${error.message}`);
    }

    return { id: data.id, success: true };
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
}

/**
 * Get message metadata (without encrypted content)
 */
export async function getMessageMetadata(messageId: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id, template_type, expiry_at, scheduled_for, opened_at, destroyed_at, view_count')
      .eq('id', messageId)
      .single();

    if (error) {
      throw new Error(`Message not found: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching message metadata:', error);
    throw error;
  }
}

/**
 * Get encrypted message (for decryption on client side)
 */
export async function getEncryptedMessage(messageId: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id, encrypted_content, nonce, encrypted_password, password_nonce, template_type, expiry_at, scheduled_for, destroyed_at, opened_at')
      .eq('id', messageId)
      .single();

    if (error) {
      throw new Error(`Message not found: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching encrypted message:', error);
    throw error;
  }
}

/**
 * Check if message is expired
 */
export async function isMessageExpired(messageId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('is_message_expired', { message_id: messageId });

    if (error) {
      throw new Error(`Failed to check expiry: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error checking message expiry:', error);
    return true; // Assume expired on error for safety
  }
}

/**
 * Check if scheduled message is available
 */
export async function isMessageAvailable(messageId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('is_message_available', { message_id: messageId });

    if (error) {
      throw new Error(`Failed to check availability: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error checking message availability:', error);
    return false;
  }
}

/**
 * Get time until message is available (for scheduled messages)
 */
export async function getTimeUntilAvailable(messageId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .rpc('time_until_available', { message_id: messageId });

    if (error) {
      throw new Error(`Failed to get time until available: ${error.message}`);
    }

    // Convert PostgreSQL interval to milliseconds
    const interval = data as string;
    const parts = interval.match(/(\d+):(\d+):(\d+)/);
    
    if (parts) {
      const hours = parseInt(parts[1], 10);
      const minutes = parseInt(parts[2], 10);
      const seconds = parseInt(parts[3], 10);
      return (hours * 3600 + minutes * 60 + seconds) * 1000;
    }

    return 0;
  } catch (error) {
    console.error('Error getting time until available:', error);
    return 0;
  }
}

/**
 * Mark message as opened
 */
export async function markMessageOpened(messageId: string, clientIP: string) {
  try {
    await supabase.rpc('mark_message_opened', {
      message_id: messageId,
      access_ip: clientIP,
    });
  } catch (error) {
    console.error('Error marking message as opened:', error);
  }
}

/**
 * Mark message as destroyed
 */
export async function markMessageDestroyed(messageId: string) {
  try {
    await supabase.rpc('mark_message_destroyed', { message_id: messageId });
  } catch (error) {
    console.error('Error marking message as destroyed:', error);
  }
}

/**
 * Record password attempt
 */
export async function recordPasswordAttempt(
  messageId: string,
  success: boolean,
  clientIP: string
) {
  try {
    await supabase.from('password_attempts').insert({
      message_id: messageId,
      success,
      ip_address: clientIP,
    });
  } catch (error) {
    console.error('Error recording password attempt:', error);
  }
}

/**
 * Get failed password attempts count
 */
export async function getFailedAttemptsCount(messageId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .rpc('get_failed_attempts_count', { message_id: messageId });

    if (error) {
      throw new Error(`Failed to get attempts count: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error getting failed attempts:', error);
    return 0;
  }
}

/**
 * Verify password and record attempt
 */
export async function verifyPasswordAndRecord(
  messageId: string,
  encryptedContent: string,
  nonce: string,
  password: string,
  clientIP: string
): Promise<boolean> {
  try {
    const isValid = await verifyPassword(encryptedContent, nonce, password);
    await recordPasswordAttempt(messageId, isValid, clientIP);
    return isValid;
  } catch (error) {
    console.error('Error verifying password:', error);
    await recordPasswordAttempt(messageId, false, clientIP);
    return false;
  }
}
