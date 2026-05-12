import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { verifyPaymentSignature, getPaymentDetails } from "@/lib/payments/razorpay";

// Type definitions
interface PaymentDetails {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  invoice_id?: string;
  international?: boolean;
  method: string;
  amount_refunded?: number;
  refund_status?: string;
  captured: boolean;
  description?: string;
  card_id?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  email: string;
  contact: string;
  notes?: Record<string, any>;
  fee?: number;
  tax?: number;
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_reason?: string;
  error_step?: string;
  error_field?: string;
  acquirer_data?: Record<string, any>;
  created_at: number;
}

/**
 * PUT /api/payments/verify
 * Verify Razorpay payment signature and update payment status
 */
export async function PUT(req: NextRequest) {
  try {
    const { orderId, razorpayPaymentId, razorpaySignature } = await req.json();

    if (!orderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Get order details from database
    const { data: order } = await supabase
      .from("payments")
      .select("*")
      .eq("razorpay_order_id", orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify signature
    const isSignatureValid = await verifyPaymentSignature(orderId, razorpayPaymentId, razorpaySignature);

    if (!isSignatureValid) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // Get payment details from Razorpay
    const paymentDetails: PaymentDetails = await getPaymentDetails(razorpayPaymentId);

    // Ensure amount is a number
    const amountPaid = typeof paymentDetails.amount === "number" ? paymentDetails.amount / 100 : 0;

    // Update payment record
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        status: paymentDetails.status === "captured" || paymentDetails.status === "authorized" ? "completed" : "failed",
        amount_paid: amountPaid,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", orderId);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      orderId: orderId,
      paymentId: razorpayPaymentId,
      status: paymentDetails.status === "captured" || paymentDetails.status === "authorized" ? "completed" : "failed",
      amount: amountPaid,
    });
  } catch (error) {
    console.error("PUT /api/payments/verify error:", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
