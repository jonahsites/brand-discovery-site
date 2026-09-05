import { NextResponse } from "next/server";
import { SITE } from "@/lib/seo";
import { verifyState } from "@/lib/integrations";
import { getServerClient } from "@/lib/supabase-server";
import { syncInstagram, type ConnectionRow } from "@/lib/social-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/oauth/instagram/callback?code=…&state=…
 * Exchanges code → short → long-lived token, upserts the connection row,
 * kicks off a first sync, then bounces the brand to /dashboard#connections.
 */
export async function GET(req: Request) {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const signing = process.env.INTEGRATIONS_SIGNING_SECRET;
  if (!appId || !appSecret || !signing) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const err = url.searchParams.get("error_description") || url.searchParams.get("error");
  if (err) return NextResponse.redirect(`${SITE.url}/dashboard?tab=Connections&connect=err&provider=instagram&reason=${encodeURIComponent(err)}`, { status: 302 });
  if (!code || !state) return NextResponse.json({ error: "missing code or state" }, { status: 400 });

  const payload = await verifyState(signing, state);
  if (!payload || payload.provider !== "instagram") return NextResponse.json({ error: "bad state" }, { status: 400 });

  const sb = await getServerClient();
  if (!sb) return NextResponse.json({ error: "auth backend offline" }, { status: 503 });
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return NextResponse.json({ error: "sign in first" }, { status: 401 });
  const { data: b } = await sb.from("brands").select("slug").eq("slug", payload.brand).eq("owner_id", u.user.id).maybeSingle();
  if (!b) return NextResponse.json({ error: "not your brand" }, { status: 403 });

  const redirect = `${SITE.url}/api/oauth/instagram/callback`;

  // 1) Exchange code -> short-lived token
  const short = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    cache: "no-store",
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirect,
      code,
    }),
  });
  if (!short.ok) return NextResponse.json({ error: "instagram token exchange failed", status: short.status }, { status: 502 });
  const shortJson = (await short.json()) as { access_token?: string; user_id?: string | number };
  if (!shortJson.access_token) return NextResponse.json({ error: "no short token" }, { status: 502 });

  // 2) Exchange short -> long-lived (60d) token
  const longUrl = new URL("https://graph.instagram.com/access_token");
  longUrl.searchParams.set("grant_type", "ig_exchange_token");
  longUrl.searchParams.set("client_secret", appSecret);
  longUrl.searchParams.set("access_token", shortJson.access_token);
  const long = await fetch(longUrl, { cache: "no-store" });
  if (!long.ok) return NextResponse.json({ error: "instagram long-token exchange failed" }, { status: 502 });
  const longJson = (await long.json()) as { access_token?: string; expires_in?: number };
  const token = longJson.access_token ?? shortJson.access_token;
  const expiresAt = new Date(Date.now() + (longJson.expires_in ?? 60 * 24 * 3600) * 1000).toISOString();

  // 3) /me?fields=id,username
  const me = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${encodeURIComponent(token)}`, { cache: "no-store" });
  const meJson = me.ok ? ((await me.json()) as { id?: string; username?: string }) : {};

  // 4) Upsert the connection row.
  await sb.from("social_connections").upsert({
    brand_slug: payload.brand,
    provider: "instagram",
    external_user_id: meJson.id ?? String(shortJson.user_id ?? ""),
    access_token: token,
    refresh_token: null,
    expires_at: expiresAt,
    username: meJson.username ?? null,
    scope: "instagram_business_basic,instagram_business_content_publish",
  }, { onConflict: "brand_slug,provider" });

  // 5) Fire the first sync inline (best-effort; the hourly cron will retry).
  const { data: conn } = await sb.from("social_connections").select("*").eq("brand_slug", payload.brand).eq("provider", "instagram").maybeSingle();
  if (conn) await syncInstagram(conn as ConnectionRow, sb).catch(() => undefined);

  return NextResponse.redirect(`${SITE.url}/dashboard?tab=Connections&connect=ok&provider=instagram#connections`, { status: 302 });
}
