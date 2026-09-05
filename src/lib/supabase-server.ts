/**
 * Server-only Supabase clients.
 *   - `getServerClient()` uses the user's session cookie (RLS enforced).
 *     Use it from OAuth callbacks after the user has just come back through
 *     the browser and is signed in.
 *   - `getServiceClient()` uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).
 *     Use it ONLY from the cron sync route, which runs without a user session.
 *     Never expose this client to the browser.
 */
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function getServerClient(): Promise<SupabaseClient | null> {
  if (!URL || !ANON) return null;
  const jar = await cookies();
  return createServerClient(URL, ANON, {
    cookies: {
      getAll: () => jar.getAll().map((c) => ({ name: c.name, value: c.value })),
      // Callbacks may not always be able to set cookies (some redirect paths);
      // swallow errors so we don't crash the OAuth exchange.
      setAll: (list) => {
        try { for (const c of list) jar.set(c.name, c.value, c.options); } catch { /* ignore */ }
      },
    },
  });
}

export function getServiceClient(): SupabaseClient | null {
  if (!URL || !SERVICE) return null;
  return createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });
}
