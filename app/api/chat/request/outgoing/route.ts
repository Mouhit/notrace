import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * ✅ NEW FILE: app/api/chat/request/outgoing/route.ts
 * 
 * GET /api/chat/request/outgoing?username=sumit
 * Get all OUTGOING requests SENT BY a user
 * 
 * Used by useRequests hook to:
 * - Track requests the user has sent
 * - Detect when sent request was accepted
 * - Display "Sent Requests" list
 */

export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username parameter required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // ✅ Get all requests SENT BY this user (where user is REQUESTER)
    const { data: requests, error } = await supabase
      .from("chat_requests")
      .select("id, requester, recipient, status, created_at")
      .eq("requester", username)  // ✅ User who SENT the request
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      requests: requests || [],
      count: requests?.length || 0,
    });
  } catch (error) {
    console.error("GET /api/chat/request/outgoing error:", error);
    return NextResponse.json({ error: "Failed to fetch outgoing requests" }, { status: 500 });
  }
}
