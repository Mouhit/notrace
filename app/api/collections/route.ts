import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { nanoid } from "nanoid";

// GET — fetch all collections for an owner
export async function GET(req: NextRequest) {
  const owner_id = req.nextUrl.searchParams.get("owner_id");
  if (!owner_id) return NextResponse.json({ error: "Missing owner_id" }, { status: 400 });

  const supabase = createServerClient();

  const { data: collections, error } = await supabase
    .from("collections")
    .select("*")
    .eq("owner_id", owner_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // For each collection, get secret stats
  const enriched = await Promise.all(
    (collections || []).map(async (col) => {
      const { data: secrets } = await supabase
        .from("secrets")
        .select("id, is_read, expires_at, created_at")
        .eq("collection_id", col.id);

      const total = secrets?.length ?? 0;
      const unread = secrets?.filter((s) => !s.is_read && (!s.expires_at || new Date(s.expires_at) > new Date())).length ?? 0;
      const expired = secrets?.filter((s) => s.expires_at && new Date(s.expires_at) < new Date() && !s.is_read).length ?? 0;

      return { ...col, total, unread, expired };
    })
  );

  return NextResponse.json({ collections: enriched });
}

// POST — create a new collection
export async function POST(req: NextRequest) {
  try {
    const { owner_id, name, emoji } = await req.json();
    if (!owner_id || !name) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const supabase = createServerClient();
    const id = nanoid(10);

    const { error } = await supabase.from("collections").insert({
      id,
      owner_id,
      name: name.trim(),
      emoji: emoji || "📁",
    });

    if (error) throw error;
    return NextResponse.json({ id });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}

// DELETE — delete a collection
export async function DELETE(req: NextRequest) {
  try {
    const { id, owner_id } = await req.json();
    if (!id || !owner_id) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const supabase = createServerClient();
    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", id)
      .eq("owner_id", owner_id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
