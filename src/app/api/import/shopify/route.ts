import { NextResponse } from "next/server";
import { fetchShopifyProducts, normalizeProduct, normalizeStoreUrl } from "@/lib/shopify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/import/shopify  { url: string; brand: string }
 * Fetches every product page from the given Shopify store's public /products.json,
 * normalizes each into a Kindred Product, and hands them back to the client to
 * confirm and save into the local store.
 */
export async function POST(req: Request) {
  const { url, brand } = (await req.json().catch(() => ({}))) as { url?: string; brand?: string };
  if (!url) return NextResponse.json({ ok: false, error: "Missing store URL" }, { status: 400 });
  if (!brand) return NextResponse.json({ ok: false, error: "Missing brand slug" }, { status: 400 });
  const jsonUrl = normalizeStoreUrl(url);
  if (!jsonUrl) return NextResponse.json({ ok: false, error: "Couldn't read that as a Shopify store URL" }, { status: 400 });
  try {
    const raw = await fetchShopifyProducts(jsonUrl);
    const products = raw.map((r) => normalizeProduct(r, brand));
    return NextResponse.json({ ok: true, source: jsonUrl, count: products.length, products });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
