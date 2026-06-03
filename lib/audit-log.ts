// lib/audit-log.ts
// Audit logging - By Engage Ad

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type AuditAction =
  | 'payment_created'
  | 'payment_verified'
  | 'payment_failed'
  | 'refund_issued'
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'admin_action';

export async function logAudit(
  action: AuditAction,
  userId: string | null,
  description: string,
  metadata?: Record<string, any>
) {
  try {
    await supabase.from('audit_logs').insert({
      action,
      user_id: userId,
      description,
      metadata,
      ip_address: null, // Would get from request in real implementation
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

export async function getAuditLogs(
  userId?: string,
  days: number = 30
) {
  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    let query = supabase
      .from('audit_logs')
      .select('*')
      .gte('created_at', fromDate.toISOString())
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get audit logs error:', error);
    return [];
  }
}
