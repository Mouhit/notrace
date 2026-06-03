// app/api/payments/verify-with-email/route.ts
// Verify payment and send email - By Engage Ad

import { verifyPayment } from '@/lib/razorpay';
import { createClient } from '@supabase/supabase-js';
import { paymentSuccessEmail, paymentFailedEmail } from '@/lib/emails/index';
import { sendEmail } from '@/lib/emails/send-email';

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

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .single();

    if (paymentError || !payment) {
      return Response.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Get user email
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', payment.user_id)
      .single();

    // Update payment record
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        status: 'success',
        paid_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', orderId);

    if (updateError) {
      return Response.json(
        { error: 'Failed to verify payment' },
        { status: 500 }
      );
    }

    // Update subscription
    await supabase
      .from('subscriptions')
      .update({
        plan: payment.plan,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true,
      })
      .eq('user_id', payment.user_id);

    // Send success email
    if (user?.email) {
      const emailData = paymentSuccessEmail(
        user.email,
        payment.plan,
        payment.amount_paise,
        paymentId
      );
      await sendEmail(emailData);
    }

    return Response.json({
      success: true,
      message: 'Payment verified and email sent',
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
