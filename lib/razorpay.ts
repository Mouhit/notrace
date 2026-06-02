// lib/razorpay.ts
// Razorpay API utilities - By Engage Ad

import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Create Razorpay order
export async function createOrder(
  amount: number, // in paise
  receipt: string,
  description: string
) {
  try {
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt,
        description,
        notes: {
          created_at: new Date().toISOString(),
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.description || 'Failed to create order');
    }

    return data;
  } catch (error) {
    console.error('Razorpay createOrder error:', error);
    throw error;
  }
}

// Verify webhook signature
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  try {
    const hash = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    return hash === signature;
  } catch (error) {
    console.error('Webhook verification error:', error);
    return false;
  }
}

// Verify payment
export function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const body = `${orderId}|${paymentId}`;
    const hash = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    return hash === signature;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
}

// Generate idempotency key
export function generateIdempotencyKey(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create refund
export async function createRefund(paymentId: string, amount?: number) {
  try {
    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${paymentId}/refund`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
        },
        body: JSON.stringify({
          amount, // optional, full refund if not specified
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.description || 'Failed to refund');
    }

    return data;
  } catch (error) {
    console.error('Razorpay refund error:', error);
    throw error;
  }
}
