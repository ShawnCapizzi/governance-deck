import { createClient } from "@supabase/supabase-js";

// v1 runs on the in-memory session store. This client is the wiring
// point for production. Schema and RLS live in supabase/migrations.
export const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    : null;
