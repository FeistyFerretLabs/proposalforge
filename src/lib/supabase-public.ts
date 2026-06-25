import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Anon, no-cookie client for the public proposal view. RLS permits reading
// only proposals whose status is sent/viewed/signed/expired (drafts stay private).
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
