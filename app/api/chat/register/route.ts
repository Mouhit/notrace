import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { username, password_hash, public_key } = await req.json();

    if (!username?.trim() || !password_hash || !public_key) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate username: 3-20 chars, alphanumeric + underscore
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json({
        error: "Username must be 3-20 characters, letters, numbers, underscores only"
      }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check if username already exists
    const { data: existing } = await supabase
      .from("profiles")
      .select("username")
      .ilike("username", username)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    // Insert new profile
    const { error } = await supabase.from("profiles").insert({
      username: username.trim(),
      password_hash,
      public_key,
    });

    if (error) throw error;

    return NextResponse.json({ success: true, username: username.trim() });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
