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
    .select("id, title, password_hash, expires_at, is_read")
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ exists: false });

  // Check expiry
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    await supabase.from("secrets").delete().eq("id", id);
    return NextResponse.json({ exists: false });
  }

  if (data.is_read) return NextResponse.json({ exists: false, already_read: true });

  return NextResponse.json({
    exists: true,
    has_password: !!data.password_hash,
    title: data.title,
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

    await supabase.rpc("increment_stat", { stat_key: "total_read" });

    return NextResponse.json({
      title: data.title,
      content: data.content,
    });
  } catch (err) {
    console.error("Read error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
