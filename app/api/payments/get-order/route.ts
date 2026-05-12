import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * GET /api/payments/get-order?orderId=...
 * Fetch payment details for client payment page
 */
export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get("orderId");
    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("razorpay_order_id", orderId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({
      orderId: data.razorpay_order_id,
      invoiceNumber: data.invoice_number,
      serviceDescription: data.service_description,
      amount: data.amount,
      currency: data.currency,
      clientEmail: data.client_email,
      clientName: data.client_name,
      status: data.status,
    });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 });
  }
}
