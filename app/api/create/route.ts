import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { hashPassword, expiryToSeconds } from "@/lib/utils";
import { Expiry } from "@/types";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const { title, content, password, expiry } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    if (content.length > 5000) {
      return NextResponse.json({ error: "Content too long" }, { status: 400 });
    }

    const supabase = createServerClient();
    const id = nanoid(12);
    const password_hash = password ? await hashPassword(password) : null;
    const expirySeconds = expiryToSeconds(expiry as Expiry);
    const expires_at = expirySeconds
      ? new Date(Date.now() + expirySeconds * 1000).toISOString()
      : null;

    const { error } = await supabase.from("secrets").insert({
      id,
      title: title?.trim() || null,
      content: content.trim(),
      password_hash,
      expiry,
      expires_at,
    });

    if (error) throw error;

    // Increment total created stat
    await supabase.rpc("increment_stat", { stat_key: "total_created" });

    return NextResponse.json({ id });
  } catch (err) {
    console.error("Create error:", err);
    return NextResponse.json({ error: "Failed to create secret" }, { status: 500 });
  }
}
