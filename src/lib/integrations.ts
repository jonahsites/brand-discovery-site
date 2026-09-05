/**
 * Social integrations — client-safe helpers.
 *
 * The server routes (src/app/api/oauth/*, src/app/api/sync/*) live in Node and
 * do the actual token dance. This file holds:
 *   - pure post-mapping functions (Instagram media / TikTok video → Post row)
 *     used by both the server sync and the vitest tests
 *   - a Web-Crypto HMAC signer/verifier for OAuth state, safe to run in edge
 *     or node runtimes
 *   - a client-side status probe that reads NEXT_PUBLIC_INTEGRATIONS_STATUS
 *     so the dashboard can grey out "coming soon" cards without a round-trip.
 *
 * Nothing in here reads any secret. Access tokens never leave the server.
 */

export type Provider = "instagram" | "tiktok";

export type SocialPostRow = {
  brand_slug: string;
  source: Provider;
  external_id: string;
  external_url: string | null;
  image: string | null;
  video_url: string | null;
  caption: string;
  created_at: string; // ISO
  products: string[];
  likes: number;
};

/* -------------------- Instagram media → post row -------------------- */

export type InstagramMedia = {
  id: string;
  caption?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
  media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | string;
};

export function instagramMediaToPost(m: InstagramMedia, brandSlug: string): SocialPostRow {
  const isVideo = m.media_type === "VIDEO";
  return {
    brand_slug: brandSlug,
    source: "instagram",
    external_id: String(m.id),
    external_url: m.permalink ?? null,
    // Videos: thumbnail is the still we render; the mp4 lives in video_url.
    image: (isVideo ? m.thumbnail_url : m.media_url) ?? m.thumbnail_url ?? m.media_url ?? null,
    video_url: isVideo ? m.media_url ?? null : null,
    caption: (m.caption ?? "").trim(),
    created_at: m.timestamp ?? new Date().toISOString(),
    products: [],
    likes: 0,
  };
}

/* -------------------- TikTok video → post row -------------------- */

export type TikTokVideo = {
  id: string;
  cover_image_url?: string;
  video_description?: string;
  create_time?: number; // unix seconds
  share_url?: string;
  embed_link?: string;
  duration?: number;
};

export function tiktokVideoToPost(v: TikTokVideo, brandSlug: string): SocialPostRow {
  const iso = typeof v.create_time === "number"
    ? new Date(v.create_time * 1000).toISOString()
    : new Date().toISOString();
  return {
    brand_slug: brandSlug,
    source: "tiktok",
    external_id: String(v.id),
    // TikTok's permalink for a video is share_url. embed_link is only useful
    // for iframe playback and is stored in video_url so the UI can hand it to
    // the embed player as a fallback.
    external_url: v.share_url ?? null,
    image: v.cover_image_url ?? null,
    video_url: v.embed_link ?? null,
    caption: (v.video_description ?? "").trim(),
    created_at: iso,
    products: [],
    likes: 0,
  };
}

/* -------------------- OAuth state HMAC (Web Crypto) -------------------- */

// Encodes an arbitrary payload (brand slug, nonce, timestamp) into a URL-safe
// token signed with INTEGRATIONS_SIGNING_SECRET so callbacks can verify the
// caller round-tripped through us. Uses Web Crypto so it works in edge + node.

const enc = new TextEncoder();

function b64urlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacSha256(secret: string, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return new Uint8Array(sig);
}

export type StatePayload = { brand: string; provider: Provider; ts: number; nonce: string };

export async function signState(secret: string, payload: StatePayload): Promise<string> {
  const body = b64urlEncode(enc.encode(JSON.stringify(payload)));
  const mac = b64urlEncode(await hmacSha256(secret, body));
  return `${body}.${mac}`;
}

export async function verifyState(
  secret: string,
  state: string,
  maxAgeMs = 10 * 60 * 1000,
): Promise<StatePayload | null> {
  const parts = state.split(".");
  if (parts.length !== 2) return null;
  const [body, mac] = parts;
  const expected = b64urlEncode(await hmacSha256(secret, body));
  // Constant-time-ish compare (short strings; timing leak is negligible here
  // since a valid MAC is required to distinguish anything).
  if (mac.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < mac.length; i++) diff |= mac.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body))) as StatePayload;
    if (typeof payload.brand !== "string" || typeof payload.ts !== "number") return null;
    if (payload.provider !== "instagram" && payload.provider !== "tiktok") return null;
    if (Date.now() - payload.ts > maxAgeMs) return null;
    return payload;
  } catch {
    return null;
  }
}

export function randomNonce(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return b64urlEncode(b);
}

/* -------------------- client-side status probe -------------------- */

export type IntegrationStatus = { instagram: boolean; tiktok: boolean };

// NEXT_PUBLIC_INTEGRATIONS_STATUS is a JSON string set by ops once the
// upstream OAuth apps are approved. Server routes still re-check the actual
// secrets — this is only for greying out the "coming soon" card in the UI.
export function integrationStatus(): IntegrationStatus {
  const raw = process.env.NEXT_PUBLIC_INTEGRATIONS_STATUS ?? "";
  if (!raw) return { instagram: false, tiktok: false };
  try {
    const parsed = JSON.parse(raw) as Partial<IntegrationStatus>;
    return { instagram: !!parsed.instagram, tiktok: !!parsed.tiktok };
  } catch {
    return { instagram: false, tiktok: false };
  }
}
