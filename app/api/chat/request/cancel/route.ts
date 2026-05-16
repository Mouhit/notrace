import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

/**
 * POST /api/chat/request/cancel
 * User A cancels pending chat request
 */

export async function POST(req: NextRequest) {
  try {
    const { requestId } = await req.json();

    if (!requestId) {
      return NextResponse.json({ error: "Request ID required" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from("chat_requests")
      .update({ status: "cancelled" })
      .eq("id", requestId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Chat request cancelled",
    });
  } catch (error) {
    console.error("POST /api/chat/request/cancel error:", error);
    return NextResponse.json({ error: "Failed to cancel request" }, { status: 500 });
  }
}
