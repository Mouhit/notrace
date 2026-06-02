// app/api/cron/delete-expired-secrets/route.ts
// Phase 1.6: Auto-delete expired secrets every hour
// By Engage Ad

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const maxDuration = 60; // 60 seconds timeout for cron job

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date().toISOString();

    // Find all expired secrets (where expires_at < now)
    const { data: expiredSecrets, error: fetchError } = await supabase
      .from('secrets')
      .select('id')
      .lt('expires_at', now)
      .eq('is_read', false); // Only delete unread secrets

    if (fetchError) {
      console.error('Error fetching expired secrets:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch expired secrets' }),
        { status: 500 }
      );
    }

    if (!expiredSecrets || expiredSecrets.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No expired secrets to delete',
          deleted: 0,
        }),
        { status: 200 }
      );
    }

    // Delete all expired secrets
    const secretIds = expiredSecrets.map((s) => s.id);
    const { error: deleteError, count } = await supabase
      .from('secrets')
      .delete()
      .in('id', secretIds);

    if (deleteError) {
      console.error('Error deleting secrets:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete expired secrets' }),
        { status: 500 }
      );
    }

    console.log(`✅ Deleted ${count} expired secrets at ${now}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully deleted ${count} expired secrets`,
        deleted: count,
        timestamp: now,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Cron job error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
}
