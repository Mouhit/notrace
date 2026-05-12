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

    // Validate required fields
    if (
      !body.invoiceNumber ||
      !body.serviceDescription ||
      !body.amount ||
      !body.currency ||
      !body.clientEmail
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate amount is a number and greater than 0
    if (typeof body.amount !== "number" || body.amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a number greater than 0" },
        { status: 400 }
      );
    }

    // Validate currency
    if (!["USD", "INR"].includes(body.currency)) {
      return NextResponse.json(
        { error: "Invalid currency. Must be USD or INR" },
        { status: 400 }
      );
    }

    // Validate service type
    if (!["service_1", "service_2"].includes(body.serviceType)) {
      return NextResponse.json(
        { error: "Invalid service type" },
        { status: 400 }
      );
    }

    // Check for duplicate invoice number
    const supabase = createServerClient();
    const { data: existing } = await supabase
      .from("payments")
      .select("invoice_number")
      .eq("invoice_number", body.invoiceNumber)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Invoice number already exists" },
        { status: 409 }
      );
    }

    // Create Razorpay order with proper typing
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
    if (
      !razorpayOrder ||
      typeof razorpayOrder !== "object" ||
      !razorpayOrder.id
    ) {
      throw new Error("Invalid Razorpay order response");
    }

    // Ensure numeric fields are safe before operations
    const orderAmount =
      typeof razorpayOrder.amount === "number" ? razorpayOrder.amount : body.amount;
    const amountPaid =
      typeof razorpayOrder.amount_paid === "number"
        ? razorpayOrder.amount_paid
        : 0;
    const amountDue =
      typeof razorpayOrder.amount_due === "number"
        ? razorpayOrder.amount_due
        : orderAmount;

    // Insert payment record into database
    const { error: dbError } = await supabase.from("payments").insert({
      invoice_number: body.invoiceNumber,
      service_description: body.serviceDescription,
      amount: orderAmount,
      currency: body.currency,
      service_type: body.serviceType,
      client_email: body.clientEmail,
      client_name: body.clientName || null,
      notes: body.notes || null,
      razorpay_order_id: razorpayOrder.id,
      status: "pending",
      amount_paid: amountPaid,
      amount_due: amountDue,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: orderAmount,
      currency: body.currency,
      invoiceNumber: body.invoiceNumber,
      amountPaid: amountPaid,
      amountDue: amountDue,
      status: razorpayOrder.status,
    });
  } catch (error) {
    console.error("Create order error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create payment order";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
