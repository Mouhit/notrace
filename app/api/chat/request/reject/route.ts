import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

/**
 * POST /api/chat/request/reject
 * User B rejects chat request from User A
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
      .update({ status: "rejected" })
      .eq("id", requestId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Chat request rejected",
    });
  } catch (error) {
    console.error("POST /api/chat/request/reject error:", error);
    return NextResponse.json({ error: "Failed to reject request" }, { status: 500 });
  }
}
