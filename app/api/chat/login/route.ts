import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// Timing-safe comparison
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(req: NextRequest) {
  try {
    const { username, password_hash } = await req.json();
    if (!username || !password_hash) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("username, password_hash, public_key")
      .ilike("username", username)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    if (!timingSafeEqual(password_hash, data.password_hash)) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      username: data.username,
      public_key: data.public_key,
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
