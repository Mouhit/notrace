// app/api/webhooks/razorpay/route.ts
// Razorpay webhook handler - By Engage Ad

import { verifyWebhookSignature } from '@/lib/razorpay';
import { createClient } from '@supabase/supabase-js';
import { PAYMENT_STATUS } from '@/lib/constants';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-razorpay-signature');
    if (!signature) {
      return new Response('Missing signature', { status: 401 });
    }

    const body = await request.text();
    const isValid = verifyWebhookSignature(body, signature);

    if (!isValid) {
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(body);
    const { event: eventType } = event;

    if (eventType === 'payment.authorized') {
      const { payload } = event;
      const { payment } = payload;

      // Update payment status
      await supabase
        .from('payments')
        .update({
          razorpay_payment_id: payment.id,
          status: PAYMENT_STATUS.SUCCESS,
          paid_at: new Date().toISOString(),
        })
        .eq('razorpay_order_id', payment.order_id);

      // Get payment record to find user
      const { data: paymentRecord } = await supabase
        .from('payments')
        .select('user_id, plan')
        .eq('razorpay_payment_id', payment.id)
        .single();

      if (paymentRecord) {
        // Update subscription
        await supabase
          .from('subscriptions')
          .update({
            plan: paymentRecord.plan,
            is_active: true,
            start_date: new Date().toISOString().split('T')[0],
          })
          .eq('user_id', paymentRecord.user_id);
      }
    }

    if (eventType === 'payment.failed') {
      const { payload } = event;
      const { payment } = payload;

      await supabase
        .from('payments')
        .update({
          razorpay_payment_id: payment.id,
          status: PAYMENT_STATUS.FAILED,
          error_message: payment.error_description,
        })
        .eq('razorpay_order_id', payment.order_id);
    }

    if (eventType === 'refund.created') {
      const { payload } = event;
      const { refund } = payload;

      await supabase
        .from('payments')
        .update({
          status: PAYMENT_STATUS.REFUNDED,
        })
        .eq('razorpay_payment_id', refund.payment_id);
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
