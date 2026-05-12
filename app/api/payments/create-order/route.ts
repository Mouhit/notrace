import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { createRazorpayOrder } from "@/lib/payments/razorpay";
import { PaymentRequest } from "@/types/payments";
import { v4 as uuidv4 } from "uuid";

// Type definition for Razorpay Order Response
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

/**
 * POST /api/payments/create-order
 * Admin creates a payment order for a client
 */
export async function POST(req: NextRequest) {
  try {
    // Verify admin secret (use environment variable)
    const authHeader = req.headers.get("x-admin-secret");
    if (authHeader !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: PaymentRequest = await req.json();

    if (!body.invoiceNumber || !body.serviceDescription || !body.amount || !body.currency || !body.clientEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (body.amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }

    if (!["USD", "INR"].includes(body.currency)) {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }

    if (!["service_1", "service_2"].includes(body.serviceType)) {
      return NextResponse.json({ error: "Invalid service type" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data: existing } = await supabase
      .from("payments")
      .select("invoice_number")
      .eq("invoice_number", body.invoiceNumber)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Invoice number already exists" }, { status: 409 });
    }

    // Type the response properly
    const razorpayOrder: RazorpayOrderResponse = await createRazorpayOrder(
      body.amount,
      body.currency,
      body.invoiceNumber,
      {
        invoiceNumber: body.invoiceNumber,
        serviceDescription: body.serviceDescription,
        serviceType: body.serviceType,
        clientEmail: body.clientEmail,
        clientName: body.clientName || "",
      }
    );

    // Verify we got a valid order response
    if (!razorpayOrder || !razorpayOrder.id) {
      throw new Error("Invalid Razorpay order response");
    }

    const { error: dbError } = await supabase.from("payments").insert({
      invoice_number: body.invoiceNumber,
      service_description: body.serviceDescription,
      amount: body.amount,
      currency: body.currency,
      service_type: body.serviceType,
      client_email: body.clientEmail,
      client_name: body.clientName,
      notes: body.notes,
      razorpay_order_id: razorpayOrder.id,
      status: "pending",
    });

    if (dbError) throw dbError;

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: body.amount,
      currency: body.currency,
      invoiceNumber: body.invoiceNumber,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
