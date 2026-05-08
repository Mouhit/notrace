import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (!username || username.trim().length < 3) {
    return NextResponse.json({ error: "Username too short" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("username, public_key")
    .ilike("username", username.trim())
    .single();

  if (error || !data) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({
    found: true,
    username: data.username,
    public_key: data.public_key,
  });
}
