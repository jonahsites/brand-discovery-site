import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-server";
import { syncInstagram, syncTikTok, type ConnectionRow } from "@/lib/social-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/sync/all
 * Hourly Vercel Cron sweep. Fans out to every connection row. Guarded by a
 * shared secret so nobody else can burn the API quota.
 *
 * Rate limits are treated as retryable (logged, not thrown) — the next tick
 * picks them up.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const url = new URL(req.url);
  const secret = process.env.CRON_SECRET;
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const provided = bearer || url.searchParams.get("secret") || "";
  // Vercel's cron adds `x-vercel-cron: 1` when it invokes; accept that as a
  // trusted internal call too so the cron doesn't require the secret in the
  // request line.
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  if (!isVercelCron && (!secret || provided !== secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sb = getServiceClient();
  if (!sb) return NextResponse.json({ error: "service backend offline" }, { status: 503 });

  const { data: rows } = await sb.from("social_connections").select("*");
  const conns = (rows ?? []) as ConnectionRow[];
  const results: Record<string, unknown>[] = [];

  for (const c of conns) {
    try {
      const r = c.provider === "instagram" ? await syncInstagram(c, sb) : await syncTikTok(c, sb);
      results.push({ brand: c.brand_slug, provider: c.provider, ...r });
    } catch (e) {
      results.push({ brand: c.brand_slug, provider: c.provider, ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return NextResponse.json({ ok: true, count: conns.length, results });
}
