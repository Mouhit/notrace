// app/api/cron/check-expiry/route.ts
// Check expiry and apply grace periods - By Engage Ad

import { createClient } from '@supabase/supabase-js';
import { GRACE_PERIOD_DAYS, SUBSCRIPTION_STATUS } from '@/lib/constants';

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
    const now = new Date().toISOString();

    // Find expired subscriptions
    const { data: expiredSubs, error: expiredError } = await supabase
      .from('subscriptions')
      .select('*')
      .lt('end_date', now.split('T')[0])
      .eq('is_active', true);

    if (expiredError) throw expiredError;

    let gracePeriods = 0;
    let expired = 0;

    for (const sub of expiredSubs || []) {
      // Calculate grace period end date
      const graceEndDate = new Date();
      graceEndDate.setDate(graceEndDate.getDate() + GRACE_PERIOD_DAYS);

      // Check if still in grace period window
      const daysSinceExpiry = Math.floor(
        (Date.now() - new Date(sub.end_date).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceExpiry <= GRACE_PERIOD_DAYS) {
        // Still in grace period
        await supabase
          .from('subscriptions')
          .update({
            renewal_date: graceEndDate.toISOString().split('T')[0],
          })
          .eq('id', sub.id);

        gracePeriods++;
      } else {
        // Grace period ended, deactivate
        await supabase
          .from('subscriptions')
          .update({
            is_active: false,
            plan: 'FREE',
          })
          .eq('id', sub.id);

        // Update user to FREE tier
        await supabase
          .from('users')
          .update({ subscription_tier: 'FREE' })
          .eq('id', sub.user_id);

        expired++;
      }
    }

    console.log(`✅ Grace periods: ${gracePeriods}, Expired: ${expired}`);

    return Response.json({
      success: true,
      gracePeriods,
      expired,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Expiry check error:', error);
    return Response.json(
      { error: 'Check failed' },
      { status: 500 }
    );
  }
}
