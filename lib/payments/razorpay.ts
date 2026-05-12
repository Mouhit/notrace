/**
 * Razorpay Integration Utilities
 */

import Razorpay from "razorpay";
import crypto from "crypto";
import { Currency } from "@/types/payments";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

/**
 * Create a Razorpay order for payment collection
 */
export async function createRazorpayOrder(
  amount: number,
  currency: Currency,
  receipt: string,
  notes: Record<string, any>
) {
  try {
    // Razorpay expects amount in paise (smallest unit)
    // So multiply by 100
    const amountInSmallestUnit = Math.round(amount * 100);

    const orderResponse = await razorpay.orders.create({
      amount: amountInSmallestUnit,
      currency: currency === "USD" ? "USD" : "INR",
      receipt: receipt, // invoice number
      notes: notes,
      payment_capture: 1, // Auto-capture payment
    });

    return orderResponse;
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    throw error;
  }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET || "";

  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Fetch payment details from Razorpay
 */
export async function getPaymentDetails(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error("Razorpay fetch payment error:", error);
    throw error;
  }
}

/**
 * Fetch order details from Razorpay
 */
export async function getOrderDetails(orderId: string) {
  try {
    const order = await razorpay.orders.fetch(orderId);
    return order;
  } catch (error) {
    console.error("Razorpay fetch order error:", error);
    throw error;
  }
}

/**
 * Create refund for a payment
 */
export async function createRefund(paymentId: string, amount?: number) {
  try {
    const refundData: any = { payment_id: paymentId };
    if (amount) {
      // Amount in paise
      refundData.amount = Math.round(amount * 100);
    }

    const refund = await razorpay.payments.refund(paymentId, refundData);
    return refund;
  } catch (error) {
    console.error("Razorpay refund error:", error);
    throw error;
  }
}
