/**
 * One Supabase browser client. Missing env vars turn the client off (`supabase === null`),
 * so the store falls back to the local demo account. Set both to switch on real auth:
 *   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
 * See docs/supabase-setup.md for the four commands to create the project and run the migration.
 */
"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled = !!(URL && KEY);

let cached: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient | null {
  if (!supabaseEnabled) return null;
  if (!cached) cached = createBrowserClient(URL!, KEY!);
  return cached;
}
