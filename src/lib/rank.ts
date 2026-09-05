/**
 * Personal ranking for Kindred. Given a shopper's signals (style tags they picked, sizes,
 * follows, saves, recent views, orders) turn them into a score for each brand and each product.
 * The higher the score, the earlier in a feed it should show.
 *
 * Every function is pure — no store, no fetching. Callers pass the signals in; useApp holds them.
 * Weights are documented inline so anyone tuning the algorithm can see the tradeoffs at a glance.
 */
import type { Brand, Product } from "./data";
import { styleOverlap } from "./looks";

export type Signal = {
  styleTags: string[];
  sizes: { tops: string; waist: string; shoe: string };
  follows: string[];       // brand slugs
  saved: string[];         // product slugs
  recent: string[];        // product slugs
  waitlist: string[];      // product slugs
  alerts: string[];        // product slugs
  orderedProducts: string[];  // product slugs ever ordered
  orderedBrands: string[];    // brand slugs ever ordered
  viewedBrands: Record<string, number>; // brand slug → view count
  viewedProducts: Record<string, number>; // product slug → view count (derived from recent duplicates)
};

/** Build a Signal from the shopper's raw store state — the one place we normalise it. */
export function toSignal(input: {
  styleTags?: string[];
  sizes?: { tops: string; waist: string; shoe: string };
  follows?: string[];
  saved?: string[];
  recent?: string[];
  waitlist?: string[];
  alerts?: string[];
  orders?: Array<{ items: Array<{ product: string; brand: string }> }>;
  views?: Record<string, number>;
}): Signal {
  const orderedProducts = new Set<string>();
  const orderedBrands = new Set<string>();
  for (const o of input.orders ?? []) for (const it of o.items ?? []) {
    orderedProducts.add(it.product);
    orderedBrands.add(it.brand);
  }
  const viewedProducts: Record<string, number> = {};
  for (const s of input.recent ?? []) viewedProducts[s] = (viewedProducts[s] ?? 0) + 1;
  // The store's `views` is a mixed bag of brand and product slugs. We split heuristically:
  // known slugs get sorted at call time when we have `brands` / `products` maps.
  return {
    styleTags: input.styleTags ?? [],
    sizes: input.sizes ?? { tops: "M", waist: "32", shoe: "10" },
    follows: input.follows ?? [],
    saved: input.saved ?? [],
    recent: input.recent ?? [],
    waitlist: input.waitlist ?? [],
    alerts: input.alerts ?? [],
    orderedProducts: [...orderedProducts],
    orderedBrands: [...orderedBrands],
    viewedBrands: input.views ?? {},
    viewedProducts,
  };
}

/**
 * Score a brand for this shopper. Higher = show sooner. Scale is roughly 0-100 for common
 * cases; huge signals (10+ shared styles + follow + orders) can push past 100.
 */
export function scoreBrand(brand: Brand, signal: Signal, products?: Product[]): number {
  let s = 0;

  // Style overlap is the single strongest signal from onboarding (0-40+ points).
  s += styleOverlap(brand.styles, signal.styleTags) * 12;

  // They already follow this brand — huge positive.
  if (signal.follows.includes(brand.slug)) s += 25;

  // They've bought from this brand — even stronger positive.
  if (signal.orderedBrands.includes(brand.slug)) s += 18;

  // They've been looking at this brand's page. Capped at 12 to avoid stalking bias.
  s += Math.min((signal.viewedBrands[brand.slug] ?? 0) * 2, 12);

  // Saved / waitlisted / alerted products by this brand — clear purchase intent.
  if (products) {
    const brandProducts = products.filter((p) => p.brand === brand.slug);
    const savedCount = brandProducts.filter((p) => signal.saved.includes(p.slug)).length;
    const waitCount = brandProducts.filter((p) => signal.waitlist.includes(p.slug)).length;
    const alertCount = brandProducts.filter((p) => signal.alerts.includes(p.slug)).length;
    s += savedCount * 3 + waitCount * 4 + alertCount * 2;
  }

  // Plan tier boost — Signature and Premium brands paid to rank higher. Kept small so
  // it can never fully drown an unpaid brand with strong personal signals.
  if (brand.plan === "premium") s += 14;
  else if (brand.plan === "signature") s += 6;

  // Recency bump: brands created in the last two weeks are boosted so the newest labels
  // don't get buried by anyone with a big head start.
  if (brand.createdAt && Date.now() - Date.parse(brand.createdAt) < 14 * 864e5) s += 5;

  // Small tiebreaker on followers so if two brands score equal, the smaller one wins —
  // this is a discovery platform, not a bestsellers chart.
  s += Math.max(0, 3 - Math.log10(brand.followers + 10));

  return s;
}

/**
 * Score a product for this shopper. Uses the brand's score as a floor (a good brand's
 * products all deserve a boost) plus product-specific signals.
 */
export function scoreProduct(product: Product, brand: Brand | undefined, signal: Signal, brandScore?: number): number {
  if (!brand) return -1000; // orphaned product, never surface
  let s = (brandScore ?? scoreBrand(brand, signal)) * 0.6;

  // Category affinity: if they've saved / ordered other pieces in this category, boost.
  // We can't look up saved-product categories from here without the products list, so
  // callers that care can pass the brandScore and add category signals themselves.
  // Simpler: their onboarding tags include the category or a related term.
  const cat = product.category.toLowerCase();
  if (signal.styleTags.some((t) => t.toLowerCase().includes(cat))) s += 6;

  // Wrong-size penalty — never make someone fall for a piece they can't wear.
  const sizes = product.sizes ?? [];
  if (sizes.length > 0 && !sizes.includes(signal.sizes.tops) && cat !== "footwear" && cat !== "accessories") s -= 8;

  // Already saved — they already know they want it, don't burn a slot re-showing it.
  if (signal.saved.includes(product.slug)) s -= 3;

  // Already viewed a bunch — some novelty preference.
  const views = signal.viewedProducts[product.slug] ?? 0;
  s -= Math.min(views, 4);

  // Already bought — strongly downweight in discovery feeds (they own it).
  if (signal.orderedProducts.includes(product.slug)) s -= 15;

  // Newness bump — new pieces bubble up.
  if (product.createdAt && Date.now() - Date.parse(product.createdAt) < 14 * 864e5) s += 3;

  // On sale — small mercantile bump so promos land in front of shoppers who care.
  if (product.compareAt && product.compareAt > product.price) s += 2;

  // Sold out — kill the score. Never lead a feed with a sold-out piece unless they waitlisted.
  if (product.stock === 0 && !signal.waitlist.includes(product.slug)) s -= 20;

  return s;
}

/** Sort helpers. Deterministic (stable sort in modern JS) so re-renders don't reshuffle. */
export function rankBrands(brands: Brand[], signal: Signal, products?: Product[]): Brand[] {
  const scored = brands.map((b) => ({ b, s: scoreBrand(b, signal, products) }));
  scored.sort((a, x) => x.s - a.s);
  return scored.map((r) => r.b);
}

export function rankProducts(products: Product[], brands: Brand[], signal: Signal): Product[] {
  const bmap = new Map(brands.map((b) => [b.slug, b]));
  const brandScoreCache = new Map<string, number>();
  const scored = products.map((p) => {
    const b = bmap.get(p.brand);
    let bs = b ? brandScoreCache.get(p.brand) : undefined;
    if (b && bs === undefined) { bs = scoreBrand(b, signal, products); brandScoreCache.set(p.brand, bs); }
    return { p, s: scoreProduct(p, b, signal, bs) };
  });
  scored.sort((a, x) => x.s - a.s);
  return scored.map((r) => r.p);
}
