import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

const COUNTER_OFFSET = 100993;

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("stats")
      .select("value")
      .eq("key", "total_created")
      .single();

    const real = data?.value ?? 0;
    const display = Number(real) + COUNTER_OFFSET;

    return NextResponse.json({ count: display });
  } catch {
    return NextResponse.json({ count: COUNTER_OFFSET });
  }
}
