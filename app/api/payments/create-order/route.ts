// app/api/payments/create-order/route.ts
// Create Razorpay payment order - By Engage Ad

import { createOrder } from '@/lib/razorpay';
import { PLANS } from '@/lib/constants';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId, plan, idempotencyKey } = await request.json();

    if (!userId || !plan) {
      return Response.json(
        { error: 'Missing userId or plan' },
        { status: 400 }
      );
    }

    const planConfig = PLANS[plan as keyof typeof PLANS];
    if (!planConfig) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Check for duplicate order (idempotency)
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('user_id', userId)
      .eq('plan', plan)
      .eq('status', 'pending')
      .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Last 1 hour
      .single();

    if (existingPayment) {
      return Response.json(
        { error: 'Duplicate order. Please wait before retrying.' },
        { status: 409 }
      );
    }

    // Create Razorpay order
    const receipt = `rcpt_${userId}_${Date.now()}`;
    const razorpayOrder = await createOrder(
      planConfig.price,
      receipt,
      `NoTrace ${plan} Plan`
    );

    // Save payment record
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        razorpay_order_id: razorpayOrder.id,
        plan,
        amount_paise: planConfig.price,
        status: 'pending',
        receipt_id: receipt,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving payment:', error);
      return Response.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    return Response.json({
      orderId: razorpayOrder.id,
      amount: planConfig.price,
      currency: 'INR',
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
