import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

/**
 * GET /api/chat/active?username=alice
 * Get current active chat for a user
 */

export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username parameter required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Get active chat for this user
    const { data: activeChat, error } = await supabase
      .from("active_chats")
      .select("id, user1, user2, room_id, status, started_at")
      .or(`user1.eq.${username},user2.eq.${username}`)
      .eq("status", "connected")
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found (normal case)
      throw error;
    }

    if (!activeChat) {
      return NextResponse.json({
        hasActiveChat: false,
        activeChat: null,
      });
    }

    // Determine who the other user is
    const otherUser = activeChat.user1 === username ? activeChat.user2 : activeChat.user1;

    return NextResponse.json({
      hasActiveChat: true,
      activeChat: {
        ...activeChat,
        otherUser,
      },
    });
  } catch (error) {
    console.error("GET /api/chat/active error:", error);
    return NextResponse.json({ error: "Failed to fetch active chat" }, { status: 500 });
  }
}
