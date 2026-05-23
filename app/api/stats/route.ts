import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

const COUNTER_OFFSET = 100993;
const INCREMENT_INTERVAL = 180000; // 180 seconds in milliseconds

export async function GET() {
  try {
    const supabase = createServerClient();

    // ✅ Get current counter and last increment time
    const { data } = await supabase
      .from("stats")
      .select("value, counter_randomized, last_increment_time")
      .eq("key", "total_created")
      .single();

    const real = data?.value ?? 0;
    let counterRandomized = data?.counter_randomized ?? 101054;
    const lastIncrementTime = data?.last_increment_time ? new Date(data.last_increment_time).getTime() : Date.now();

    const now = Date.now();
    const timeSinceLastIncrement = now - lastIncrementTime;

    // ✅ Check if 180 seconds have passed
    if (timeSinceLastIncrement >= INCREMENT_INTERVAL) {
      // ✅ Generate random increment (1-99)
      const randomIncrement = Math.floor(Math.random() * 99) + 1;
      counterRandomized += randomIncrement;

      // ✅ Update in database
      await supabase
        .from("stats")
        .update({
          counter_randomized: counterRandomized,
          last_increment_time: new Date().toISOString(),
        })
        .eq("key", "total_created");

      console.log(`✅ Counter incremented by ${randomIncrement}. New total: ${counterRandomized}`);
    }

    // ✅ Return the randomized counter (not the fixed offset)
    const display = counterRandomized;

    return NextResponse.json({ 
      count: display,
      nextIncrementIn: Math.max(0, INCREMENT_INTERVAL - timeSinceLastIncrement)
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ count: 101054 });
  }
}
