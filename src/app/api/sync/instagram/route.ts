import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";
import { syncInstagram, type ConnectionRow } from "@/lib/social-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET/POST /api/sync/instagram?brand=<slug>
 * Manual "Sync now" trigger for a single brand. Uses the caller's session
 * (RLS enforces they own the brand).
 */
async function handle(req: Request) {
  const brand = new URL(req.url).searchParams.get("brand");
  if (!brand) return NextResponse.json({ error: "missing brand" }, { status: 400 });
  const sb = await getServerClient();
  if (!sb) return NextResponse.json({ error: "auth backend offline" }, { status: 503 });
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return NextResponse.json({ error: "sign in first" }, { status: 401 });
  const { data: conn } = await sb.from("social_connections").select("*").eq("brand_slug", brand).eq("provider", "instagram").maybeSingle();
  if (!conn) return NextResponse.json({ error: "not connected" }, { status: 404 });
  const result = await syncInstagram(conn as ConnectionRow, sb);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
export const GET = handle;
export const POST = handle;
