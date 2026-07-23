"use client";

// Browser Supabase client. Returns null when env vars are absent, which is
// how the app falls back to demo mode: /start and the seeded walkthrough
// stay public and instant, while real rounds require configuration.

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && key);

let cached: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient | null {
  if (!isConfigured) return null;
  if (!cached) cached = createBrowserClient(url as string, key as string);
  return cached;
}
