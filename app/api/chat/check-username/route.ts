import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * POST /api/chat/check-username
 * Check if username is available before registration
 * Prevents showing passphrase after username is taken
 */
export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    if (username.length < 3) {
      return NextResponse.json({ error: "Username too short" }, { status: 400 });
    }

    if (username.length > 30) {
      return NextResponse.json({ error: "Username too long" }, { status: 400 });
    }

    // Only allow alphanumeric and underscore
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: "Invalid username format" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check if username exists
    const { data: existingUser, error: queryError } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .single();

    if (queryError && queryError.code !== "PGRST116") {
      // PGRST116 = no rows found (which is what we want)
      console.error("Username check error:", queryError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const available = !existingUser;

    return NextResponse.json({
      available,
      username,
      message: available ? "Username available" : "Username already taken",
    });
  } catch (error) {
    console.error("POST /api/chat/check-username error:", error);
    return NextResponse.json({ error: "Failed to check username" }, { status: 500 });
  }
}
