import { NextResponse } from "next/server";
import { SITE } from "@/lib/seo";
import { verifyState } from "@/lib/integrations";
import { getServerClient } from "@/lib/supabase-server";
import { syncTikTok, type ConnectionRow } from "@/lib/social-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/oauth/tiktok/callback?code=…&state=…
 * Exchanges code via open.tiktokapis.com/v2/oauth/token/, stores tokens,
 * fires first sync, redirects to /dashboard#connections.
 */
export async function GET(req: Request) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const signing = process.env.INTEGRATIONS_SIGNING_SECRET;
  if (!clientKey || !clientSecret || !signing) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const err = url.searchParams.get("error_description") || url.searchParams.get("error");
  if (err) return NextResponse.redirect(`${SITE.url}/dashboard?tab=Connections&connect=err&provider=tiktok&reason=${encodeURIComponent(err)}`, { status: 302 });
  if (!code || !state) return NextResponse.json({ error: "missing code or state" }, { status: 400 });

  const payload = await verifyState(signing, state);
  if (!payload || payload.provider !== "tiktok") return NextResponse.json({ error: "bad state" }, { status: 400 });

  const sb = await getServerClient();
  if (!sb) return NextResponse.json({ error: "auth backend offline" }, { status: 503 });
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return NextResponse.json({ error: "sign in first" }, { status: 401 });
  const { data: b } = await sb.from("brands").select("slug").eq("slug", payload.brand).eq("owner_id", u.user.id).maybeSingle();
  if (!b) return NextResponse.json({ error: "not your brand" }, { status: 403 });

  const redirect = `${SITE.url}/api/oauth/tiktok/callback`;

  const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirect,
    }),
  });
  if (!tokenRes.ok) return NextResponse.json({ error: "tiktok token exchange failed", status: tokenRes.status }, { status: 502 });
  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    open_id?: string;
    scope?: string;
  };
  if (!tokenJson.access_token) return NextResponse.json({ error: "no access token" }, { status: 502 });

  const expiresAt = new Date(Date.now() + (tokenJson.expires_in ?? 86400) * 1000).toISOString();

  // Optional: fetch username for the connection card.
  let username: string | null = null;
  try {
    const infoRes = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=display_name,username", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      cache: "no-store",
    });
    if (infoRes.ok) {
      const infoJson = (await infoRes.json()) as { data?: { user?: { username?: string; display_name?: string } } };
      username = infoJson.data?.user?.username ?? infoJson.data?.user?.display_name ?? null;
    }
  } catch { /* non-fatal */ }

  await sb.from("social_connections").upsert({
    brand_slug: payload.brand,
    provider: "tiktok",
    external_user_id: tokenJson.open_id ?? null,
    access_token: tokenJson.access_token,
    refresh_token: tokenJson.refresh_token ?? null,
    expires_at: expiresAt,
    username,
    scope: tokenJson.scope ?? "user.info.basic,video.list",
  }, { onConflict: "brand_slug,provider" });

  const { data: conn } = await sb.from("social_connections").select("*").eq("brand_slug", payload.brand).eq("provider", "tiktok").maybeSingle();
  if (conn) await syncTikTok(conn as ConnectionRow, sb).catch(() => undefined);

  return NextResponse.redirect(`${SITE.url}/dashboard?tab=Connections&connect=ok&provider=tiktok#connections`, { status: 302 });
}
