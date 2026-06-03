// app/api/cron/retry-failed-payments/route.ts
// Retry failed payments - By Engage Ad

import { createClient } from '@supabase/supabase-js';
import { createOrder } from '@/lib/razorpay';
import { PAYMENT_STATUS } from '@/lib/constants';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MAX_RETRIES = 3;

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Find failed payments from last 24 hours
    const oneDayAgo = new Date(Date.now() - 86400000).toISOString();

    const { data: failedPayments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('status', PAYMENT_STATUS.FAILED)
      .gte('created_at', oneDayAgo);

    if (error) throw error;

    let retried = 0;
    let failed = 0;

    for (const payment of failedPayments || []) {
      try {
        // Check retry count (store in metadata)
        const retryCount = payment.metadata?.retryCount || 0;

        if (retryCount >= MAX_RETRIES) {
          continue; // Skip if max retries exceeded
        }

        // Create new order
        const receipt = `rcpt_retry_${payment.id}_${Date.now()}`;
        const newOrder = await createOrder(
          payment.amount_paise,
          receipt,
          `NoTrace Retry - ${payment.plan}`
        );

        // Update payment with retry info
        await supabase
          .from('payments')
          .update({
            razorpay_order_id: newOrder.id,
            status: PAYMENT_STATUS.PENDING,
            metadata: { ...payment.metadata, retryCount: retryCount + 1 },
          })
          .eq('id', payment.id);

        retried++;
      } catch (err) {
        console.error(`Failed to retry payment ${payment.id}:`, err);
        failed++;
      }
    }

    console.log(`✅ Retried ${retried} payments, ${failed} failed`);

    return Response.json({
      success: true,
      retried,
      failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Retry payments error:', error);
    return Response.json(
      { error: 'Retry failed' },
      { status: 500 }
    );
  }
}
