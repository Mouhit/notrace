import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * POST /api/chat/signal — Store WebRTC signal (offer/answer/ICE)
 * 
 * Uses database persistence instead of Realtime broadcast.
 * This ensures signals don't get lost if receiver isn't subscribed yet.
 */
export async function POST(req: NextRequest) {
  try {
    const { room_id, sender, receiver, type, payload } = await req.json();

    if (!room_id || !sender || !receiver || !type || !payload) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["offer", "answer", "ice"].includes(type)) {
      return NextResponse.json({ error: "Invalid signal type" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Store signal in database — stays for 90 seconds then auto-deletes
    const { error } = await supabase.from("signaling").insert({
      room_id,
      sender: sender.trim().toLowerCase(),
      receiver: receiver.trim().toLowerCase(),
      type,
      payload,
      consumed: false,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Signal error:", err);
    return NextResponse.json({ error: "Signal failed" }, { status: 500 });
  }
}

/**
 * GET /api/chat/signal?receiver=username&room_id=room — Poll for signals
 * 
 * Client polls every 500ms to check for new signals.
 * Marks as consumed after reading.
 */
export async function GET(req: NextRequest) {
  try {
    const receiver = req.nextUrl.searchParams.get("receiver");
    const room_id = req.nextUrl.searchParams.get("room_id");

    if (!receiver || !room_id) {
      return NextResponse.json({ error: "Missing receiver or room_id" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Get unconsumed signals for this receiver
    const { data: signals, error } = await supabase
      .from("signaling")
      .select("*")
      .eq("room_id", room_id)
      .eq("receiver", receiver.toLowerCase())
      .eq("consumed", false)
      .order("created_at", { ascending: true });

    if (error) throw error;

    if (signals && signals.length > 0) {
      // Mark as consumed
      await supabase
        .from("signaling")
        .update({ consumed: true })
        .eq("room_id", room_id)
        .eq("receiver", receiver.toLowerCase())
        .eq("consumed", false);

      return NextResponse.json({ signals });
    }

    return NextResponse.json({ signals: [] });
  } catch (err) {
    console.error("Poll error:", err);
    return NextResponse.json({ error: "Poll failed" }, { status: 500 });
  }
}
