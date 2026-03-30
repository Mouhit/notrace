import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const { content, reply_to_id } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    if (content.length > 5000) {
      return NextResponse.json({ error: "Content too long" }, { status: 400 });
    }
    if (!reply_to_id) {
      return NextResponse.json({ error: "reply_to_id is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check original secret exists and was read
    const { data: original } = await supabase
      .from("secrets")
      .select("id, is_read, is_reply")
      .eq("id", reply_to_id)
      .single();

    if (!original) {
      return NextResponse.json({ error: "Original secret not found" }, { status: 404 });
    }
    if (original.is_reply) {
      return NextResponse.json({ error: "Cannot reply to a reply" }, { status: 400 });
    }

    const id = nanoid(12);

    const { error } = await supabase.from("secrets").insert({
      id,
      title: "Secure Reply",
      content: content.trim(),
      password_hash: null,
      expiry: "never",
      expires_at: null,
      is_reply: true,
      reply_to_id,
    });

    if (error) throw error;

    // Store reply_id on original secret so sender can find it
    await supabase
      .from("secrets")
      .update({ reply_to_id: id })
      .eq("id", reply_to_id);

    return NextResponse.json({ reply_id: id });
  } catch (err) {
    console.error("Reply error:", err);
    return NextResponse.json({ error: "Failed to create reply" }, { status: 500 });
  }
}

// Check if a reply exists for a given original secret id
export async function GET(req: NextRequest) {
  const original_id = req.nextUrl.searchParams.get("original_id");
  if (!original_id) return NextResponse.json({ error: "Missing original_id" }, { status: 400 });

  const supabase = createServerClient();
  const { data } = await supabase
    .from("secrets")
    .select("reply_to_id")
    .eq("id", original_id)
    .single();

  if (!data?.reply_to_id) return NextResponse.json({ reply_id: null });

  // Check if reply is still unread
  const { data: reply } = await supabase
    .from("secrets")
    .select("id, is_read")
    .eq("id", data.reply_to_id)
    .single();

  return NextResponse.json({
    reply_id: reply?.id || null,
    reply_read: reply?.is_read || false,
  });
}
