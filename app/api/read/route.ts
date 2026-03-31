import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { hashPassword } from "@/lib/utils";
import { rateLimit, getIP } from "@/lib/rateLimit";
import { sendTelegramAlert } from "@/lib/alerts";

// Timing-safe string comparison to prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// PEEK
export async function GET(req: NextRequest) {
  const ip = getIP(req as any);

  // Rate limit peeks: 30 per minute
  const rl = rateLimit({ key: `peek:${ip}`, limit: 30, windowMs: 60 * 1000 });
  if (!rl.allowed) {
    await sendTelegramAlert({ type: "rate_limit_breach", ip, details: "Too many peek requests", count: rl.count });
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id || id.length > 50) {
    await sendTelegramAlert({ type: "invalid_requests", ip, details: `Invalid secret ID: ${id}` });
    return NextResponse.json({ exists: false });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("secrets")
    .select("id, title, password_hash, expires_at, is_read, scheduled_at")
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ exists: false });

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    await supabase.from("secrets").delete().eq("id", id);
    return NextResponse.json({ exists: false });
  }

  if (data.is_read) return NextResponse.json({ exists: false, already_read: true });

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

// READ
export async function POST(req: NextRequest) {
  const ip = getIP(req as any);

  // Rate limit reads: 20 per minute
  const rl = rateLimit({ key: `read:${ip}`, limit: 20, windowMs: 60 * 1000 });
  if (!rl.allowed) {
    await sendTelegramAlert({ type: "rate_limit_breach", ip, details: "Too many read requests", count: rl.count });
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      await sendTelegramAlert({ type: "invalid_requests", ip, details: "Malformed JSON in read request" });
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { id, password } = body;
    if (!id || id.length > 50) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const supabase = createServerClient();
    const { data, error } = await supabase.from("secrets").select("*").eq("id", id).single();

    if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      await supabase.from("secrets").delete().eq("id", id);
      return NextResponse.json({ error: "Expired" }, { status: 410 });
    }

    if (data.is_read) return NextResponse.json({ error: "Already read" }, { status: 410 });

    if (data.scheduled_at && new Date(data.scheduled_at) > new Date()) {
      return NextResponse.json({ error: "Not yet unlocked", scheduled_at: data.scheduled_at }, { status: 423 });
    }

    // Password check with brute-force detection + timing-safe comparison
    if (data.password_hash) {
      if (!password) return NextResponse.json({ error: "Password required" }, { status: 403 });

      // Rate limit password attempts: 5 per 5 minutes per secret
      const pwRl = rateLimit({ key: `pw:${id}:${ip}`, limit: 5, windowMs: 5 * 60 * 1000 });
      if (!pwRl.allowed) {
        await sendTelegramAlert({
          type: "brute_force",
          ip,
          details: `Brute force on secret ${id}`,
          count: pwRl.count,
        });
        return NextResponse.json({ error: "Too many password attempts. Try again later." }, { status: 429 });
      }

      const inputHash = await hashPassword(password);
      // Timing-safe comparison
      if (!timingSafeEqual(inputHash, data.password_hash)) {
        if (pwRl.count >= 3) {
          await sendTelegramAlert({
            type: "brute_force",
            ip,
            details: `${pwRl.count} failed password attempts on secret ${id}`,
            count: pwRl.count,
          });
        }
        return NextResponse.json({ error: "Wrong password" }, { status: 403 });
      }
    }

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
      allow_reply: !data.is_reply,
      original_id: id,
    });
  } catch (err) {
    console.error("Read error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
