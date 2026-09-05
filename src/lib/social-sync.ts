/**
 * Server-side sync engine — fetches every post from a brand's connected
 * Instagram / TikTok account and upserts them into the `posts` table.
 *
 * Idempotency comes from the (brand_slug, source, external_id) unique index
 * from migration 0003; running twice never duplicates.
 *
 * Rate-limit / auth failures bubble up as a soft error object so the caller
 * can log-and-continue (the hourly cron shouldn't fail loud).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { instagramMediaToPost, tiktokVideoToPost, type InstagramMedia, type TikTokVideo, type Provider } from "./integrations";

export type SyncResult =
  | { ok: true; added: number; total: number }
  | { ok: false; error: string; retryable: boolean };

export type ConnectionRow = {
  id: string;
  brand_slug: string;
  provider: Provider;
  external_user_id: string | null;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: string | null;
  username: string | null;
  scope: string | null;
};

const IG_GRAPH = "https://graph.instagram.com";
const TT_API = "https://open.tiktokapis.com";

/* -------------------- Instagram -------------------- */

// Instagram long-lived tokens expire in ~60d; refresh if less than 7d left.
async function refreshInstagramIfNeeded(row: ConnectionRow, sb: SupabaseClient): Promise<string | null> {
  if (!row.access_token) return null;
  const expiresIn = row.expires_at ? new Date(row.expires_at).getTime() - Date.now() : Infinity;
  if (expiresIn > 7 * 24 * 3600 * 1000) return row.access_token;
  try {
    const url = new URL(`${IG_GRAPH}/refresh_access_token`);
    url.searchParams.set("grant_type", "ig_refresh_token");
    url.searchParams.set("access_token", row.access_token);
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return row.access_token; // keep going with the current token
    const j = (await r.json()) as { access_token?: string; expires_in?: number };
    if (!j.access_token) return row.access_token;
    const newExpiry = new Date(Date.now() + (j.expires_in ?? 60 * 24 * 3600) * 1000).toISOString();
    await sb.from("social_connections").update({ access_token: j.access_token, expires_at: newExpiry }).eq("id", row.id);
    return j.access_token;
  } catch {
    return row.access_token;
  }
}

export async function syncInstagram(row: ConnectionRow, sb: SupabaseClient): Promise<SyncResult> {
  const token = await refreshInstagramIfNeeded(row, sb);
  if (!token) return { ok: false, error: "no access token", retryable: false };
  const fields = "id,caption,media_url,thumbnail_url,permalink,timestamp,media_type";
  let next: string | null = `${IG_GRAPH}/me/media?fields=${fields}&limit=100&access_token=${encodeURIComponent(token)}`;
  const rows: ReturnType<typeof instagramMediaToPost>[] = [];
  let pages = 0;
  while (next && pages < 20) {
    pages++;
    const r: Response = await fetch(next, { cache: "no-store" });
    if (r.status === 429) return { ok: false, error: "rate limited", retryable: true };
    if (!r.ok) return { ok: false, error: `ig ${r.status}`, retryable: r.status >= 500 };
    const j = (await r.json()) as { data?: InstagramMedia[]; paging?: { next?: string } };
    for (const m of j.data ?? []) rows.push(instagramMediaToPost(m, row.brand_slug));
    next = j.paging?.next ?? null;
  }
  return await upsertPosts(rows, sb, row.id);
}

/* -------------------- TikTok -------------------- */

async function refreshTikTokIfNeeded(row: ConnectionRow, sb: SupabaseClient): Promise<string | null> {
  if (!row.access_token) return null;
  const expiresIn = row.expires_at ? new Date(row.expires_at).getTime() - Date.now() : Infinity;
  if (expiresIn > 60 * 60 * 1000) return row.access_token;
  if (!row.refresh_token) return row.access_token;
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  if (!clientKey || !clientSecret) return row.access_token;
  try {
    const r = await fetch(`${TT_API}/v2/oauth/token/`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: row.refresh_token,
      }),
    });
    if (!r.ok) return row.access_token;
    const j = (await r.json()) as { access_token?: string; refresh_token?: string; expires_in?: number };
    if (!j.access_token) return row.access_token;
    const newExpiry = new Date(Date.now() + (j.expires_in ?? 86400) * 1000).toISOString();
    await sb.from("social_connections").update({
      access_token: j.access_token,
      refresh_token: j.refresh_token ?? row.refresh_token,
      expires_at: newExpiry,
    }).eq("id", row.id);
    return j.access_token;
  } catch {
    return row.access_token;
  }
}

export async function syncTikTok(row: ConnectionRow, sb: SupabaseClient): Promise<SyncResult> {
  const token = await refreshTikTokIfNeeded(row, sb);
  if (!token) return { ok: false, error: "no access token", retryable: false };
  const fields = "id,cover_image_url,video_description,create_time,share_url,embed_link,duration";
  const rows: ReturnType<typeof tiktokVideoToPost>[] = [];
  let cursor: number | null = null;
  let pages = 0;
  while (pages < 20) {
    pages++;
    const body: Record<string, unknown> = { max_count: 20 };
    if (cursor != null) body.cursor = cursor;
    const r: Response = await fetch(`${TT_API}/v2/video/list/?fields=${fields}`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (r.status === 429) return { ok: false, error: "rate limited", retryable: true };
    if (!r.ok) return { ok: false, error: `tt ${r.status}`, retryable: r.status >= 500 };
    const j = (await r.json()) as { data?: { videos?: TikTokVideo[]; cursor?: number; has_more?: boolean } };
    for (const v of j.data?.videos ?? []) rows.push(tiktokVideoToPost(v, row.brand_slug));
    if (!j.data?.has_more) break;
    cursor = j.data.cursor ?? null;
    if (cursor == null) break;
  }
  return await upsertPosts(rows, sb, row.id);
}

/* -------------------- shared writer -------------------- */

async function upsertPosts(
  rows: ReturnType<typeof instagramMediaToPost>[],
  sb: SupabaseClient,
  connectionId: string,
): Promise<SyncResult> {
  if (!rows.length) {
    await sb.from("social_connections").update({ last_synced_at: new Date().toISOString() }).eq("id", connectionId);
    return { ok: true, added: 0, total: 0 };
  }
  const { error } = await sb.from("posts").upsert(rows, { onConflict: "brand_slug,source,external_id" });
  if (error) return { ok: false, error: error.message, retryable: false };
  await sb.from("social_connections").update({ last_synced_at: new Date().toISOString() }).eq("id", connectionId);
  return { ok: true, added: rows.length, total: rows.length };
}
