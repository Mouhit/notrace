import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { room_id, sender, type, payload } = await req.json();
    if (!room_id || !sender || !type || !payload) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Broadcast SDP signal via Supabase Realtime
    // This does NOT store data in the database — pure realtime relay
    await supabase.channel(`signal:${room_id}`).send({
      type: "broadcast",
      event: "signal",
      payload: { room_id, sender, type, payload },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Signal error:", err);
    return NextResponse.json({ error: "Signaling failed" }, { status: 500 });
  }
}
