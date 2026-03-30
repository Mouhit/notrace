import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { hashPassword } from "@/lib/utils";

// PEEK - check if secret exists without consuming it
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("secrets")
    .select("id, title, password_hash, expires_at, is_read, scheduled_at")
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ exists: false });

  // Check expiry
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    await supabase.from("secrets").delete().eq("id", id);
    return NextResponse.json({ exists: false });
  }

  if (data.is_read) return NextResponse.json({ exists: false, already_read: true });

  // Check if scheduled — return scheduled_at if not yet unlocked
  if (data.scheduled_at && new Date(data.scheduled_at) > new Date()) {
    return NextResponse.json({
      exists: true,
      scheduled: true,
      scheduled_at: data.scheduled_at,
      title: data.title,
    });
  }

  return NextResponse.json({
    exists: true,
    has_password: !!data.password_hash,
    title: data.title,
    scheduled: false,
  });
}

// READ - consume and return the secret
export async function POST(req: NextRequest) {
  try {
    const { id, password } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("secrets")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      await supabase.from("secrets").delete().eq("id", id);
      return NextResponse.json({ error: "Expired" }, { status: 410 });
    }

    if (data.is_read) {
      return NextResponse.json({ error: "Already read" }, { status: 410 });
    }

    // Check schedule lock
    if (data.scheduled_at && new Date(data.scheduled_at) > new Date()) {
      return NextResponse.json({ error: "Not yet unlocked", scheduled_at: data.scheduled_at }, { status: 423 });
    }

    // Verify password
    if (data.password_hash) {
      if (!password) {
        return NextResponse.json({ error: "Password required" }, { status: 403 });
      }
      const inputHash = await hashPassword(password);
      if (inputHash !== data.password_hash) {
        return NextResponse.json({ error: "Wrong password" }, { status: 403 });
      }
    }

    // Mark as read
    await supabase
      .from("secrets")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id);

    if (!data.is_reply) {
      await supabase.rpc("increment_stat", { stat_key: "total_read" });
    }

    return NextResponse.json({
      title: data.title,
      content: data.content,
      allow_reply: !data.is_reply, // only allow reply on original secrets
      original_id: id,
    });
  } catch (err) {
    console.error("Read error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
