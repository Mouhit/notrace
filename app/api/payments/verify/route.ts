import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { verifyPaymentSignature, getPaymentDetails } from "@/lib/payments/razorpay";

/**
 * POST /api/payments/verify
 * Verify Razorpay payment and update status
 */
export async function POST(req: NextRequest) {
  try {
    const { orderId, paymentId, signature } = await req.json();

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ error: "Missing payment data" }, { status: 400 });
    }

    // Verify signature
    const isValid = verifyPaymentSignature(orderId, paymentId, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await getPaymentDetails(paymentId);

    const supabase = createServerClient();

    // Update payment status
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        status: paymentDetails.status === "captured" || paymentDetails.status === "authorized" ? "completed" : "failed",
        amount_paid: paymentDetails.amount ? paymentDetails.amount / 100 : undefined,
        paid_at: new Date(),
        updated_at: new Date(),
      })
      .eq("razorpay_order_id", orderId);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      status: paymentDetails.status,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
