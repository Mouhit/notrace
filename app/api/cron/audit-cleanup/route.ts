// app/api/cron/audit-cleanup/route.ts
// Clean up old audit logs - By Engage Ad

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Delete audit logs older than 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    const { data, error } = await supabase
      .from('audit_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select('count');

    if (error) throw error;

    console.log(`✅ Deleted old audit logs`);

    return Response.json({
      success: true,
      message: 'Audit logs cleaned up',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Audit cleanup error:', error);
    return Response.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}
