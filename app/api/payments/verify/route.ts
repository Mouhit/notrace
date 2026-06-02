// app/api/payments/verify/route.ts
// Verify payment success - By Engage Ad

import { verifyPayment } from '@/lib/razorpay';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { orderId, paymentId, signature } = await request.json();

    if (!orderId || !paymentId || !signature) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = verifyPayment(orderId, paymentId, signature);
    if (!isValid) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Update payment record
    const { data: payment, error } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        status: 'success',
        paid_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment:', error);
      return Response.json(
        { error: 'Failed to verify payment' },
        { status: 500 }
      );
    }

    // Update user subscription
    const { error: subError } = await supabase
      .from('subscriptions')
      .update({
        plan: payment.plan,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true,
      })
      .eq('user_id', payment.user_id);

    if (subError) {
      console.error('Error updating subscription:', subError);
    }

    return Response.json({
      success: true,
      message: 'Payment verified',
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
