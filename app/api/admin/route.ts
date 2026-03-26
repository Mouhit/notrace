import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const adminKey = req.nextUrl.searchParams.get("key");
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  const [statsRes, activeRes, expiredRes] = await Promise.all([
    supabase.from("stats").select("*"),
    supabase.from("secrets").select("id", { count: "exact" }).eq("is_read", false),
    supabase.from("secrets").select("id", { count: "exact" }).eq("is_read", true),
  ]);

  const stats: Record<string, number> = {};
  for (const row of statsRes.data ?? []) {
    stats[row.key] = row.value;
  }

  return NextResponse.json({
    total_created: stats["total_created"] ?? 0,
    total_read: stats["total_read"] ?? 0,
    active_secrets: activeRes.count ?? 0,
    destroyed_secrets: expiredRes.count ?? 0,
  });
}
