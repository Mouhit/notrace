// app/api/admin/refund/route.ts
// Manual refund endpoint (admin only) - By Engage Ad

import { createRefund } from '@/lib/razorpay';
import { createClient } from '@supabase/supabase-js';
import { PAYMENT_STATUS } from '@/lib/constants';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const adminSecret = request.headers.get('x-admin-key');
    if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentId, amount, reason } = await request.json();

    if (!paymentId) {
      return Response.json(
        { error: 'Missing paymentId' },
        { status: 400 }
      );
    }

    // Get payment details
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (fetchError || !payment) {
      return Response.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (!payment.razorpay_payment_id) {
      return Response.json(
        { error: 'No Razorpay payment ID' },
        { status: 400 }
      );
    }

    // Create refund on Razorpay
    const refundResult = await createRefund(
      payment.razorpay_payment_id,
      amount
    );

    // Update payment record
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: PAYMENT_STATUS.REFUNDED,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      return Response.json(
        { error: 'Failed to update payment' },
        { status: 500 }
      );
    }

    console.log(`✅ Refund processed for payment ${paymentId}. Reason: ${reason}`);

    return Response.json({
      success: true,
      refundId: refundResult.id,
      amount: refundResult.amount,
      status: refundResult.status,
    });
  } catch (error) {
    console.error('Refund error:', error);
    return Response.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
