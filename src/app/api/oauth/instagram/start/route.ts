import { NextResponse } from "next/server";
import { SITE } from "@/lib/seo";
import { randomNonce, signState } from "@/lib/integrations";
import { getServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/oauth/instagram/start?brand=<slug>
 * Kicks off Meta's Instagram Business OAuth. Verifies the caller owns the
 * brand, HMAC-signs a state token, and 302s to Meta's authorize URL.
 */
export async function GET(req: Request) {
  const appId = process.env.META_APP_ID;
  const secret = process.env.INTEGRATIONS_SIGNING_SECRET;
  if (!appId || !process.env.META_APP_SECRET || !secret) {
    return NextResponse.json(
      { error: "not_configured", detail: "Instagram integration is not live yet — the admin needs to add META_APP_ID and META_APP_SECRET to Vercel env." },
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

  const state = await signState(secret, { brand, provider: "instagram", ts: Date.now(), nonce: randomNonce() });
  const redirect = `${SITE.url}/api/oauth/instagram/callback`;
  const authorize = new URL("https://www.instagram.com/oauth/authorize");
  authorize.searchParams.set("client_id", appId);
  authorize.searchParams.set("redirect_uri", redirect);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("scope", "instagram_business_basic,instagram_business_content_publish");
  authorize.searchParams.set("state", state);
  return NextResponse.redirect(authorize.toString(), { status: 302 });
}
