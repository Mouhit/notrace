import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET — fetch secrets in a collection
export async function GET(req: NextRequest) {
  const collection_id = req.nextUrl.searchParams.get("collection_id");
  const owner_id = req.nextUrl.searchParams.get("owner_id");
  if (!collection_id || !owner_id) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const supabase = createServerClient();

  // Verify collection belongs to owner
  const { data: col } = await supabase
    .from("collections")
    .select("id")
    .eq("id", collection_id)
    .eq("owner_id", owner_id)
    .single();

  if (!col) return NextResponse.json({ error: "Collection not found" }, { status: 404 });

  const { data: secrets } = await supabase
    .from("secrets")
    .select("id, title, is_read, expires_at, created_at, scheduled_at, expiry")
    .eq("collection_id", collection_id)
    .eq("is_reply", false)
    .order("created_at", { ascending: false });

  const enriched = (secrets || []).map((s) => {
    const isExpired = s.expires_at && new Date(s.expires_at) < new Date() && !s.is_read;
    const status = s.is_read ? "read" : isExpired ? "expired" : "unread";
    return { ...s, status };
  });

  return NextResponse.json({ secrets: enriched });
}
