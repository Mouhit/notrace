import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * POST /api/chat/end
 * End active chat session
 */

export async function POST(req: NextRequest) {
  try {
    const { roomId, username } = await req.json();

    if (!roomId || !username) {
      return NextResponse.json({ error: "roomId and username required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Mark chat as disconnected and set end time
    const { error } = await supabase
      .from("active_chats")
      .update({
        status: "disconnected",
        ended_at: new Date().toISOString(),
      })
      .eq("room_id", roomId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Chat ended successfully",
    });
  } catch (error) {
    console.error("POST /api/chat/end error:", error);
    return NextResponse.json({ error: "Failed to end chat" }, { status: 500 });
  }
}
