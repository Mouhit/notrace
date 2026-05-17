import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * POST /api/chat/signal
 * Store WebRTC signal (offer, answer, ice-candidate)
 * GET /api/chat/signal?roomId=xxx&receiver=yyy
 * Poll for signals directed to this user
 */

export async function POST(req: NextRequest) {
  try {
    const { roomId, sender, receiver, type, payload } = await req.json();

    if (!roomId || !sender || !receiver || !type || !payload) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["offer", "answer", "ice-candidate"].includes(type)) {
      return NextResponse.json({ error: "Invalid signal type" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: signal, error } = await supabase
      .from("chat_signals")
      .insert({
        room_id: roomId,
        sender,
        receiver,
        type,
        payload,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      signalId: signal.id,
    });
  } catch (error) {
    console.error("POST /api/chat/signal error:", error);
    return NextResponse.json({ error: "Failed to store signal" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const roomId = req.nextUrl.searchParams.get("roomId");
    const receiver = req.nextUrl.searchParams.get("receiver");

    if (!roomId || !receiver) {
      return NextResponse.json({ error: "roomId and receiver parameters required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Get unconsumed signals for this receiver in this room
    const { data: signals, error } = await supabase
      .from("chat_signals")
      .select("id, room_id, sender, receiver, type, payload, created_at")
      .eq("room_id", roomId)
      .eq("receiver", receiver)
      .eq("consumed", false)
      .order("created_at", { ascending: true });

    if (error) throw error;

    if (signals && signals.length > 0) {
      // Mark signals as consumed
      const signalIds = signals.map((s) => s.id);
      await supabase
        .from("chat_signals")
        .update({ consumed: true })
        .in("id", signalIds);
    }

    return NextResponse.json({
      signals: signals || [],
      count: signals?.length || 0,
    });
  } catch (error) {
    console.error("GET /api/chat/signal error:", error);
    return NextResponse.json({ error: "Failed to fetch signals" }, { status: 500 });
  }
}
