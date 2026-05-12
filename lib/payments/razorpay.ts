import Razorpay from "razorpay";

interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes?: Record<string, any>;
  created_at: number;
}

interface PaymentNotes {
  invoiceNumber: string;
  serviceDescription: string;
  serviceType: string;
  clientEmail: string;
  clientName: string;
}

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

/**
 * Create a Razorpay order
 */
export async function createRazorpayOrder(
  amount: number,
  currency: string,
  receipt: string,
  notes: PaymentNotes
): Promise<RazorpayOrderResponse> {
  try {
    // Convert amount to smallest currency unit (paise for INR, cents for USD)
    const amountInSmallestUnit = Math.round(amount * 100);

    const rawOrder = await razorpay.orders.create({
      amount: amountInSmallestUnit,
      currency: currency,
      receipt: receipt,
      notes: notes as Record<string, any>,
    });

    // Convert SDK response to our typed interface
    // Razorpay SDK returns string | number for numeric fields, we ensure they're numbers
    const order: RazorpayOrderResponse = {
      id: String(rawOrder.id),
      entity: String(rawOrder.entity),
      amount: typeof rawOrder.amount === "number" 
        ? rawOrder.amount 
        : parseInt(String(rawOrder.amount), 10),
      amount_paid: typeof rawOrder.amount_paid === "number" 
        ? rawOrder.amount_paid 
        : parseInt(String(rawOrder.amount_paid), 10),
      amount_due: typeof rawOrder.amount_due === "number" 
        ? rawOrder.amount_due 
        : parseInt(String(rawOrder.amount_due), 10),
      currency: String(rawOrder.currency),
      receipt: String(rawOrder.receipt),
      status: String(rawOrder.status),
      attempts: typeof rawOrder.attempts === "number" 
        ? rawOrder.attempts 
        : 0,
      notes: rawOrder.notes as Record<string, any> | undefined,
      created_at: typeof rawOrder.created_at === "number" 
        ? rawOrder.created_at 
        : 0,
    };

    return order;
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    throw new Error(`Failed to create Razorpay order: ${error}`);
  }
}

/**
 * Verify payment signature
 */
export async function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  try {
    const crypto = require("crypto");
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    return expectedSignature === signature;
  } catch (error) {
    console.error("Payment verification error:", error);
    return false;
  }
}

/**
 * Get payment details
 */
export async function getPaymentDetails(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error("Get payment details error:", error);
    throw new Error(`Failed to get payment details: ${error}`);
  }
}

/**
 * Get order details
 */
export async function getOrderDetails(orderId: string) {
  try {
    const order = await razorpay.orders.fetch(orderId);
    return order;
  } catch (error) {
    console.error("Get order details error:", error);
    throw new Error(`Failed to get order details: ${error}`);
  }
}

/**
 * Create refund
 */
export async function createRefund(paymentId: string, amount?: number) {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount ? Math.round(amount * 100) : undefined,
    });
    return refund;
  } catch (error) {
    console.error("Refund creation error:", error);
    throw new Error(`Failed to create refund: ${error}`);
  }
}
