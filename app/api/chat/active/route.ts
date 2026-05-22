import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * GET /api/chat/active?username=sumit
 * Check if user has an active chat (FIXED: handles multiple chats correctly)
 * Returns room_id when request was accepted
 * 
 * CRITICAL FIX: Now handles multiple concurrent chats by returning LATEST
 */
export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get("username");
    const roomId = req.nextUrl.searchParams.get("roomId"); // ✅ NEW: Optional filter

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    const supabase = createServerClient();

    let query = supabase
      .from("active_chats")
      .select("id, user1, user2, room_id, status, started_at")
      .or(`user1.eq.${username},user2.eq.${username}`)
      .eq("status", "connected");

    // ✅ If specific roomId provided, filter by it
    if (roomId) {
      query = query.eq("room_id", roomId);
    } else {
      // ✅ If multiple chats, return LATEST (to prevent .single() crash)
      query = query.order("started_at", { ascending: false }).limit(1);
    }

    const { data: activeChat, error } = await query.single();

    // Check for "no rows found" error
    if (error && error.code === "PGRST116") {
      // No active chat found
      return NextResponse.json({
        hasActiveChat: false,
        activeChat: null,
      });
    }

    if (error) {
      console.error("Active chat query error:", error);
      throw error;
    }

    if (!activeChat) {
      return NextResponse.json({
        hasActiveChat: false,
        activeChat: null,
      });
    }

    // ✅ Determine who the other user is from this user's perspective
    const otherUser = activeChat.user1 === username ? activeChat.user2 : activeChat.user1;

    return NextResponse.json({
      hasActiveChat: true,
      activeChat: {
        id: activeChat.id,
        room_id: activeChat.room_id,
        user1: activeChat.user1,
        user2: activeChat.user2,
        otherUser: otherUser,
        status: activeChat.status,
        started_at: activeChat.started_at,
      },
    });
  } catch (error) {
    console.error("GET /api/chat/active error:", error);
    return NextResponse.json({ error: "Failed to fetch active chat" }, { status: 500 });
  }
}
