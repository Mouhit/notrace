import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

/**
 * POST /api/chat/request/accept
 * User B accepts chat request from User A
 * Creates active_chat and returns room_id
 */

export async function POST(req: NextRequest) {
  try {
    const { requestId, requester, recipient } = await req.json();

    if (!requestId || !requester || !recipient) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const supabase = createServerClient();
    const roomId = uuidv4();

    // Update request status to accepted
    const { error: updateError } = await supabase
      .from("chat_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (updateError) throw updateError;

    // Create active chat session
    const { data: activeChat, error: chatError } = await supabase
      .from("active_chats")
      .insert({
        user1: requester,
        user2: recipient,
        room_id: roomId,
        status: "connected",
      })
      .select()
      .single();

    if (chatError) throw chatError;

    return NextResponse.json({
      success: true,
      roomId: roomId,
      activeChat: activeChat,
      message: "Chat request accepted",
    });
  } catch (error) {
    console.error("POST /api/chat/request/accept error:", error);
    return NextResponse.json({ error: "Failed to accept request" }, { status: 500 });
  }
}
