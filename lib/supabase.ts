import { createClient } from "@supabase/supabase-js";

// Server-side only — uses service role key to bypass RLS
// Never expose this on the client side
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
