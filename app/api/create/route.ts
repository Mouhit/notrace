import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { hashPassword, expiryToSeconds } from "@/lib/utils";
import { Expiry } from "@/types";
import { nanoid } from "nanoid";
import { rateLimit, getIP } from "@/lib/rateLimit";
import { sendTelegramAlert } from "@/lib/alerts";

export async function POST(req: NextRequest) {
  const ip = getIP(req as any);

  // Rate limit: 10 secrets per 10 minutes per IP
  const rl = rateLimit({ key: `create:${ip}`, limit: 10, windowMs: 10 * 60 * 1000 });
  if (!rl.allowed) {
    await sendTelegramAlert({
      type: rl.count >= 50 ? "mass_creation" : "rate_limit_breach",
      ip,
      details: "Too many secrets created",
      count: rl.count,
    });
    return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      await sendTelegramAlert({ type: "invalid_requests", ip, details: "Malformed JSON in create request" });
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { title, content, password, expiry, scheduled_at, is_reply, reply_to_id, collection_id, encrypted } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    if (content.length > 10000) {
      await sendTelegramAlert({ type: "invalid_requests", ip, details: "Oversized content payload" });
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
      expiry: expiry || "1hr",
      expires_at,
      scheduled_at: scheduled_at || null,
      is_reply: is_reply || false,
      reply_to_id: reply_to_id || null,
      collection_id: collection_id || null,
    });

    if (error) throw error;

    if (!is_reply) {
      await supabase.rpc("increment_stat", { stat_key: "total_created" });
    }

    return NextResponse.json({ id });
  } catch (err) {
    console.error("Create error:", err);
    return NextResponse.json({ error: "Failed to create secret" }, { status: 500 });
  }
}
