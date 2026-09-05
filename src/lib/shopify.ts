/**
 * Shopify importer. Shopify exposes a public `<store>/products.json` endpoint on any
 * standard theme (no auth, no API key). We fetch pages until empty and normalize into
 * Kindred's Product shape. This module is deliberately server-only — it does the HTTP
 * request in an API route so we bypass browser CORS, and it normalises the payload
 * before the client ever sees it.
 */
import { CATEGORY_OPTIONS, type Product } from "./data";
import { slugify } from "./catalog";

export type ShopifyRaw = {
  id: number;
  title: string;
  handle: string;
  vendor?: string;
  product_type?: string;
  tags?: string[] | string;
  body_html?: string;
  variants: Array<{
    id: number;
    title: string;
    option1?: string | null;
    option2?: string | null;
    option3?: string | null;
    price: string;
    compare_at_price?: string | null;
    available: boolean;
    inventory_quantity?: number;
  }>;
  options?: Array<{ name: string; values: string[] }>;
  images?: Array<{ src: string; position?: number }>;
};

/** Normalize a Shopify store URL to `<origin>/products.json`. Accepts any of:
 *   example                          → https://example.myshopify.com/products.json
 *   example.myshopify.com            → https://example.myshopify.com/products.json
 *   https://example.com              → https://example.com/products.json
 *   https://example.com/collections/all → https://example.com/products.json
 */
export function normalizeStoreUrl(input: string): string | null {
  const raw = input.trim().replace(/\s+/g, "");
  if (!raw) return null;
  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : raw.includes(".") ? `https://${raw}` : `https://${raw}.myshopify.com`;
    const u = new URL(withProto);
    if (!/^https?:$/.test(u.protocol)) return null;
    return `${u.origin}/products.json`;
  } catch {
    return null;
  }
}

const CATEGORY_MAP: Record<string, string> = {
  jacket: "Outerwear", jackets: "Outerwear", coat: "Outerwear", coats: "Outerwear", outerwear: "Outerwear",
  sweater: "Knitwear", sweaters: "Knitwear", jumper: "Knitwear", knit: "Knitwear", knitwear: "Knitwear", cardigan: "Knitwear",
  shirt: "Shirting", shirts: "Shirting", "button-up": "Shirting", overshirt: "Shirting", blouse: "Shirting", shirting: "Shirting",
  pants: "Trousers", trousers: "Trousers", chino: "Trousers", chinos: "Trousers",
  shoes: "Footwear", sneakers: "Footwear", boots: "Footwear", footwear: "Footwear",
  bag: "Accessories", hat: "Accessories", cap: "Accessories", scarf: "Accessories", belt: "Accessories", accessory: "Accessories", accessories: "Accessories",
  dress: "Dresses", dresses: "Dresses",
  denim: "Denim", jean: "Denim", jeans: "Denim",
};

/** Best-effort map from Shopify's `product_type` to our category vocabulary. */
export function mapCategory(productType?: string): string {
  if (!productType) return "Shirting";
  const key = productType.trim().toLowerCase();
  // exact match first
  if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];
  // partial match — "Men's Sweaters" → Knitwear
  for (const [k, v] of Object.entries(CATEGORY_MAP)) if (key.includes(k)) return v;
  // fall back to any explicit member of our list that matches
  for (const opt of CATEGORY_OPTIONS) if (key.includes(opt.toLowerCase())) return opt;
  return "Shirting";
}

/** Convert one Shopify product to a Kindred Product. Prices roll up to the cheapest variant.
 * Sizes come from the option named "Size" (case-insensitive); colors from "Color" or "Colour".
 * Everything else is a best guess — the seller can edit after import. */
export function normalizeProduct(sp: ShopifyRaw, brandSlug: string): Product {
  const prices = sp.variants.map((v) => Number(v.price)).filter((n) => n > 0);
  const compares = sp.variants.map((v) => Number(v.compare_at_price || 0)).filter((n) => n > 0);
  const price = prices.length ? Math.min(...prices) : 0;
  const compareAt = compares.length ? Math.max(...compares) : undefined;
  const stock = sp.variants.reduce((n, v) => n + (v.inventory_quantity ?? (v.available ? 5 : 0)), 0);
  const sizeOpt = sp.options?.find((o) => /size/i.test(o.name));
  const colorOpt = sp.options?.find((o) => /colou?r/i.test(o.name));
  const sizes = sizeOpt?.values?.slice() ?? [...new Set(sp.variants.map((v) => v.option1 ?? "").filter(Boolean))];
  const colors = colorOpt?.values?.slice() ?? [];
  const tags = Array.isArray(sp.tags) ? sp.tags : typeof sp.tags === "string" ? sp.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const description = sp.body_html ? sp.body_html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : undefined;
  return {
    slug: `${brandSlug}-${slugify(sp.handle || sp.title)}`.slice(0, 80),
    brand: brandSlug,
    name: sp.title,
    price: compareAt && compareAt > price ? price : price,
    compareAt: compareAt && compareAt > price ? compareAt : undefined,
    category: mapCategory(sp.product_type),
    sizes: sizes.length ? sizes : undefined,
    colors: colors.length ? colors : undefined,
    tags,
    stock: stock > 0 ? stock : undefined,
    description: description ? description.slice(0, 280) : undefined,
    image: sp.images?.[0]?.src,
    images: sp.images?.slice(1).map((i) => i.src),
    createdAt: new Date().toISOString(),
  };
}

/** Fetch every page from a Shopify store. Caps at 20 pages (600 products) to keep it snappy. */
export async function fetchShopifyProducts(productsJsonUrl: string): Promise<ShopifyRaw[]> {
  const all: ShopifyRaw[] = [];
  for (let page = 1; page <= 20; page++) {
    const url = `${productsJsonUrl}?limit=250&page=${page}`;
    const res = await fetch(url, {
      headers: {
        // Shopify serves the endpoint publicly, but some setups need a real UA.
        "User-Agent": "Mozilla/5.0 KindredImporter/1.0 (+https://brand-discovery-site.vercel.app)",
        accept: "application/json",
      },
      // No cookies, follow redirects (some stores redirect to a canonical domain).
      redirect: "follow",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Shopify returned ${res.status} — is the store URL correct?`);
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("json")) throw new Error("That URL didn't return JSON. Is the store public and Shopify-hosted?");
    const body = (await res.json()) as { products?: ShopifyRaw[] };
    const chunk = body.products ?? [];
    if (chunk.length === 0) break;
    all.push(...chunk);
    if (chunk.length < 250) break;
  }
  return all;
}
