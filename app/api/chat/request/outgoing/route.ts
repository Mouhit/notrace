import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username parameter required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // ✅ FIX: ONLY fetch PENDING requests (not cancelled/rejected)
    const { data: requests, error } = await supabase
      .from("chat_requests")
      .select("id, requester, recipient, status, created_at")
      .eq("requester", username)
      .eq("status", "pending")  // ← FIX: Only pending!
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
