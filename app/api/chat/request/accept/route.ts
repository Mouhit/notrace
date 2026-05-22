import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid"; // ✅ FIX: Make sure uuid is installed

/**
 * POST /api/chat/request/accept
 * Accept a chat request and create active chat
 * ✅ CRITICAL FIX: Now generates and returns room_id
 */
export async function POST(req: NextRequest) {
  try {
    const { requestId, requester, recipient } = await req.json();

    if (!requestId || !requester || !recipient) {
      return NextResponse.json(
        { error: "Missing requestId, requester, or recipient" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verify request exists and is pending
    const { data: chatRequest, error: requestError } = await supabase
      .from("chat_requests")
      .select("id, status")
      .eq("id", requestId)
      .single();

    if (requestError || !chatRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (chatRequest.status !== "pending") {
      return NextResponse.json(
        { error: `Request is already ${chatRequest.status}` },
        { status: 409 }
      );
    }

    // ✅ FIX: Generate room_id FIRST
    const roomId = uuidv4();

    // Create active chat
    const { data: activeChat, error: chatError } = await supabase
      .from("active_chats")
      .insert({
        user1: recipient, // Recipient is the one accepting
        user2: requester, // Requester is the one who sent
        room_id: roomId,  // ✅ CRITICAL: Include room_id
        status: "connected",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (chatError) {
      console.error("Active chat creation error:", chatError);
      return NextResponse.json({ error: "Failed to create active chat" }, { status: 500 });
    }

    // Update request status to accepted
    const { error: updateError } = await supabase
      .from("chat_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (updateError) {
      console.error("Request update error:", updateError);
      return NextResponse.json({ error: "Failed to update request status" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      roomId: roomId, // ✅ CRITICAL: Return room_id to client
      activeChat: {
        id: activeChat.id,
        user1: activeChat.user1,
        user2: activeChat.user2,
        room_id: activeChat.room_id,
        status: activeChat.status,
        started_at: activeChat.started_at,
      },
      message: "Chat request accepted",
    });
  } catch (error) {
    console.error("POST /api/chat/request/accept error:", error);
    return NextResponse.json({ error: "Failed to accept request" }, { status: 500 });
  }
}
