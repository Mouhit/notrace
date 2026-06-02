// lib/payment-reconciliation.ts
// Payment reconciliation logic - By Engage Ad

import { createClient } from '@supabase/supabase-js';
import { PAYMENT_STATUS, SUBSCRIPTION_STATUS } from './constants';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Reconcile payments - called by cron job
export async function reconcilePayments() {
  try {
    // Find payments that succeeded on Razorpay but not updated in DB
    const { data: pendingPayments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('status', PAYMENT_STATUS.PENDING)
      .lt('created_at', new Date(Date.now() - 300000).toISOString()); // Older than 5 minutes

    if (error) throw error;

    let fixed = 0;
    let failed = 0;

    for (const payment of pendingPayments || []) {
      try {
        // Try to fetch from Razorpay to verify actual status
        const response = await fetch(
          `https://api.razorpay.com/v1/orders/${payment.razorpay_order_id}`,
          {
            headers: {
              Authorization: `Basic ${Buffer.from(
                `${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
              ).toString('base64')}`,
            },
          }
        );

        const order = await response.json();

        // If order has payments, mark as success
        if (order.amount_paid > 0) {
          await supabase
            .from('payments')
            .update({
              status: PAYMENT_STATUS.SUCCESS,
              paid_at: new Date().toISOString(),
            })
            .eq('id', payment.id);

          // Update subscription
          await supabase
            .from('subscriptions')
            .update({
              plan: payment.plan,
              is_active: true,
            })
            .eq('user_id', payment.user_id);

          fixed++;
        }
      } catch (err) {
        console.error(`Failed to reconcile payment ${payment.id}:`, err);
        failed++;
      }
    }

    return {
      success: true,
      fixed,
      failed,
      checked: (pendingPayments || []).length,
    };
  } catch (error) {
    console.error('Reconciliation error:', error);
    throw error;
  }
}

// Detect duplicate payments
export async function detectDuplicatePayments(
  userId: string,
  plan: string,
  hoursWindow: number = 1
) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('id')
      .eq('user_id', userId)
      .eq('plan', plan)
      .eq('status', PAYMENT_STATUS.SUCCESS)
      .gte(
        'created_at',
        new Date(Date.now() - hoursWindow * 60 * 60 * 1000).toISOString()
      );

    if (error) throw error;

    return (data || []).length > 1;
  } catch (error) {
    console.error('Duplicate detection error:', error);
    return false;
  }
}

// Automatically refund duplicate payments
export async function refundDuplicate(
  userId: string,
  plan: string,
  keepPaymentId: string
) {
  try {
    const { data: duplicates, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .eq('plan', plan)
      .eq('status', PAYMENT_STATUS.SUCCESS)
      .neq('id', keepPaymentId);

    if (error) throw error;

    for (const dup of duplicates || []) {
      if (dup.razorpay_payment_id) {
        // Mark for refund
        await supabase
          .from('payments')
          .update({
            status: PAYMENT_STATUS.REFUNDED,
          })
          .eq('id', dup.id);
      }
    }

    return duplicates?.length || 0;
  } catch (error) {
    console.error('Duplicate refund error:', error);
    throw error;
  }
}
