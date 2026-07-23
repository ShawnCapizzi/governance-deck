// Server Supabase client for route handlers and server components.
// Cookie handling follows the @supabase/ssr contract so the auth session
// survives redirects and refreshes.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isConfiguredServer = Boolean(url && key);

export async function getServerClient(): Promise<SupabaseClient | null> {
  if (!isConfiguredServer) return null;
  const store = await cookies();
  return createServerClient(url as string, key as string, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component: middleware refreshes the session.
        }
      },
    },
  });
}
