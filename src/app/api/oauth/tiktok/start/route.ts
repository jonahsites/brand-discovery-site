import { NextResponse } from "next/server";
import { SITE } from "@/lib/seo";
import { randomNonce, signState } from "@/lib/integrations";
import { getServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/oauth/tiktok/start?brand=<slug>
 * Kicks off TikTok's Login Kit v2 OAuth. Same guard-rails as the Instagram
 * start: user must own the brand; state is HMAC-signed.
 */
export async function GET(req: Request) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const secret = process.env.INTEGRATIONS_SIGNING_SECRET;
  if (!clientKey || !process.env.TIKTOK_CLIENT_SECRET || !secret) {
    return NextResponse.json(
      { error: "not_configured", detail: "TikTok integration is not live yet — the admin needs to add TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET to Vercel env." },
      { status: 503 },
    );
  }

  const brand = new URL(req.url).searchParams.get("brand");
  if (!brand) return NextResponse.json({ error: "missing brand" }, { status: 400 });

  const sb = await getServerClient();
  if (!sb) return NextResponse.json({ error: "auth backend offline" }, { status: 503 });
  const { data: user } = await sb.auth.getUser();
  if (!user.user) return NextResponse.json({ error: "sign in first" }, { status: 401 });
  const { data: b } = await sb.from("brands").select("slug").eq("slug", brand).eq("owner_id", user.user.id).maybeSingle();
  if (!b) return NextResponse.json({ error: "not your brand" }, { status: 403 });

  const state = await signState(secret, { brand, provider: "tiktok", ts: Date.now(), nonce: randomNonce() });
  const redirect = `${SITE.url}/api/oauth/tiktok/callback`;
  const authorize = new URL("https://www.tiktok.com/v2/auth/authorize/");
  authorize.searchParams.set("client_key", clientKey);
  authorize.searchParams.set("redirect_uri", redirect);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("scope", "user.info.basic,video.list");
  authorize.searchParams.set("state", state);
  return NextResponse.redirect(authorize.toString(), { status: 302 });
}
