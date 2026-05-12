import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// Mark this route as dynamic - it uses searchParams
export const dynamic = 'force-dynamic';

/**
 * GET /api/chat/discover?username=...
 * Discover users by username for chat
 */
export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get("username");
    
    // Validate input
    if (!username || username.trim().length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("username, public_key")
      .ilike("username", username.trim())
      .single();

    // Handle not found
    if (error || !data) {
      return NextResponse.json({ found: false });
    }

    // Validate response data
    if (!data.username || !data.public_key) {
      return NextResponse.json(
        { error: "Invalid user data" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      found: true,
      username: data.username,
      public_key: data.public_key,
    });
  } catch (err) {
    console.error("Discover error:", err);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
