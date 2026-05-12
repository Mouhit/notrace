import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// Mark this route as dynamic - it uses searchParams
export const dynamic = 'force-dynamic';

/**
 * GET /api/payments/get-order?orderId=...
 * Fetch payment details for client payment page
 */
export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get("orderId");
    
    // Validate input
    if (!orderId || orderId.trim().length === 0) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("razorpay_order_id", orderId.trim())
      .single();

    // Handle not found or error
    if (error || !data) {
      console.error("Payment fetch error:", error);
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!data.razorpay_order_id || !data.amount || !data.currency) {
      return NextResponse.json(
        { error: "Invalid payment data" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: data.razorpay_order_id,
      invoiceNumber: data.invoice_number || "",
      serviceDescription: data.service_description || "",
      amount: typeof data.amount === "number" ? data.amount : parseFloat(data.amount),
      currency: data.currency,
      clientEmail: data.client_email || "",
      clientName: data.client_name || "",
      status: data.status || "pending",
    });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment details" },
      { status: 500 }
    );
  }
}
