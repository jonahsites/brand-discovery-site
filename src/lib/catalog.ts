import { BRANDS, PRODUCTS, brandTier, type Brand, type Product, type Promo } from "./data";

/* ---------- merging static seed data with user-created entities ---------- */
export const allBrands = (custom: Brand[] = []) => [...custom, ...BRANDS.filter((b) => !custom.some((c) => c.slug === b.slug))];
export const allProducts = (custom: Product[] = [], removed: string[] = []) =>
  [...custom, ...PRODUCTS.filter((p) => !custom.some((c) => c.slug === p.slug))].filter((p) => !removed.includes(p.slug));
export const findBrand = (slug: string, custom: Brand[] = []) => allBrands(custom).find((b) => b.slug === slug);
export const findProduct = (slug: string, custom: Product[] = []) => allProducts(custom).find((p) => p.slug === slug);

export const slugify = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "K";
export const TINTS: [string, string][] = [["#DCD5C7", "#121A24"], ["#E5DFD3", "#121A24"], ["#121A24", "#F6F4EF"], ["#7C8C6F", "#F6F4EF"], ["#D6D9CE", "#121A24"], ["#CFC8B8", "#121A24"]];

/* ---------- promos ---------- */
export function activePromoFor(p: Product, promos: Promo[], now = Date.now()) {
  return promos.find((pr) => pr.active && pr.brand === p.brand && (pr.products === "all" || pr.products.includes(p.slug)) && (!pr.ends || new Date(pr.ends).getTime() > now));
}
export function effectivePrice(p: Product, promos: Promo[]) {
  const pr = activePromoFor(p, promos);
  if (pr) return { price: Math.round(p.price * (1 - pr.pct / 100)), compareAt: p.price, promo: pr };
  return { price: p.price, compareAt: p.compareAt, promo: undefined };
}

/* ---------- filters ---------- */
export type Filters = {
  category?: string; price?: [number, number]; sizes?: string[]; tiers?: string[];
  materials?: string[]; values?: string[]; shipsFrom?: string[]; sale?: boolean; gender?: string[]; brand?: string;
  priceBands?: string[]; leadTimes?: string[]; studio?: string[];
};
export const PRICE_BANDS: [string, number, number][] = [["Under $150", 0, 149], ["$150–$300", 150, 300], ["Over $300", 301, Infinity]];
export const leadTimeOf = (b: Brand) => (b.batch === "one-off" ? "Made to order" : b.batch === "small" ? "Ships in 1 week" : "Ships in 2 days");
export const studioOf = (b: Brand) => [...(b.batch === "one-off" || b.batch === "small" ? ["Under 10 people"] : []), ...(b.values.includes("Made locally") || b.values.includes("Repairs for life") ? ["Family-run"] : []), ...(b.materials.includes("Deadstock") || b.values.includes("Deadstock") ? ["Deadstock only"] : [])];
const norm = (s: string) => s.toLowerCase();
export function filterProducts(products: Product[], brands: Brand[], promos: Promo[], f: Filters) {
  const bmap = new Map(brands.map((b) => [b.slug, b]));
  return products.filter((p) => {
    const b = bmap.get(p.brand); if (!b) return false;
    const { price, compareAt } = effectivePrice(p, promos);
    if (f.brand && p.brand !== f.brand) return false;
    if (f.category && f.category !== "All") {
      const inCat = p.category === f.category || b.categories.includes(f.category);
      const inStyle = b.styles.map(norm).includes(norm(f.category)) || (p.tags ?? []).map(norm).includes(norm(f.category));
      const inValue = f.category === "Sustainable" ? b.values.some((v) => ["Recycled", "Organic", "Deadstock", "Carbon neutral shipping"].includes(v)) : f.category === "Upcycled" ? b.values.includes("Deadstock") || b.materials.includes("Deadstock") : false;
      if (!inCat && !inStyle && !inValue) return false;
    }
    if (f.price && (price < f.price[0] || price > f.price[1])) return false;
    if (f.sizes?.length) { const ps = p.sizes ?? sizesBetween(b.sizeRange); if (!f.sizes.some((s) => ps.includes(s))) return false; }
    if (f.tiers?.length && !f.tiers.includes(brandTier(b.followers))) return false;
    if (f.materials?.length && !f.materials.some((m) => b.materials.map(norm).includes(norm(m)) || (p.materials ?? []).map(norm).includes(norm(m)) || b.values.map(norm).includes(norm(m)))) return false;
    if (f.values?.length && !f.values.some((v) => b.values.map(norm).includes(norm(v)))) return false;
    if (f.shipsFrom?.length && !f.shipsFrom.some((r) => norm(b.country) === norm(r) || norm(b.shipsFrom).includes(norm(r)) || norm(b.madeIn).includes(norm(r)))) return false;
    if (f.gender?.length && !f.gender.some((g) => b.gender.includes(g))) return false;
    if (f.sale && !compareAt) return false;
    if (f.priceBands?.length && !f.priceBands.some((n) => { const band = PRICE_BANDS.find((x) => x[0] === n); return band && price >= band[1] && price <= band[2]; })) return false;
    if (f.leadTimes?.length && !f.leadTimes.includes(leadTimeOf(b))) return false;
    if (f.studio?.length && !f.studio.some((s) => studioOf(b).includes(s))) return false;
    return true;
  });
}
import { SIZE_LADDER } from "./data";
export const sizesBetween = ([a, b]: [string, string]) => { const i = SIZE_LADDER.indexOf(a), j = SIZE_LADDER.indexOf(b); return i >= 0 && j >= i ? SIZE_LADDER.slice(i, j + 1) : ["S", "M", "L", "XL"]; };

/* ---------- search: "type how you feel" ---------- */
const SYN: Record<string, string[]> = {
  cozy: ["cozy", "warm", "soft", "knitwear", "merino", "wool", "cabin", "winter", "cardigan", "half-zip", "crew"],
  cold: ["cold", "winter", "warm", "wool", "merino", "outerwear", "jacket", "coat", "knitwear"],
  warm: ["warm", "wool", "merino", "knitwear", "winter", "cozy", "jacket"],
  rain: ["rain", "rainy", "waxed", "canvas", "outerwear", "jacket", "mac", "ripstop", "rugged"],
  rainy: ["rain", "rainy", "waxed", "canvas", "outerwear", "jacket", "ripstop", "rugged", "worn-in"],
  summer: ["summer", "beach", "linen", "tee", "salt", "coastal", "relaxed", "short", "sun-faded", "warm evening"],
  beach: ["beach", "coastal", "surf", "salt", "linen", "tee", "summer", "relaxed"],
  office: ["office", "smart casual", "polished", "poplin", "shirt", "tailoring", "trouser", "clean"],
  work: ["office", "polished", "shirt", "tailoring", "trouser", "workwear"],
  date: ["date night", "polished", "shirt", "tailoring", "clean", "quiet"],
  travel: ["travel", "hiking", "ripstop", "cargo", "bag", "tote", "functional", "durable", "adventure"],
  hike: ["hiking", "trail", "outdoors", "ripstop", "cargo", "durable", "functional"],
  hiking: ["hiking", "trail", "outdoors", "ripstop", "cargo", "durable", "functional"],
  rugged: ["rugged", "canvas", "workwear", "heavy", "durable", "worn-in", "jacket"],
  minimal: ["minimalist", "clean", "quiet", "uniform", "boxy", "calm"],
  minimalist: ["minimalist", "clean", "quiet", "uniform", "boxy", "calm"],
  clean: ["clean", "minimalist", "quiet", "poplin", "white"],
  heavy: ["heavy", "heavyweight", "canvas", "workwear", "rugged"],
  heavyweight: ["heavy", "heavyweight", "canvas", "crew", "tee"],
  sustainable: ["recycled", "organic", "deadstock", "plastic-free", "carbon neutral shipping", "traceable"],
  eco: ["recycled", "organic", "deadstock", "plastic-free"],
  cheap: ["under", "tee", "cap", "tote", "short"],
  weekend: ["relaxed", "everyday", "worn-in", "soft", "casual"],
  chill: ["relaxed", "everyday", "soft", "casual", "cozy"],
  japanese: ["japanese streetwear", "kyoto", "japan", "boxy"],
  jacket: ["jacket", "coat", "overshirt", "outerwear", "chore"],
  pants: ["trouser", "trousers", "cargo", "short"],
  trousers: ["trouser", "trousers", "cargo"],
  shirt: ["shirt", "shirting", "overshirt", "poplin", "tee"],
  bag: ["bag", "tote", "accessories"],
  gift: ["tote", "cap", "accessories", "beanie", "small batch"],
  snow: ["winter", "wool", "merino", "cozy", "cabin"],
  autumn: ["wool", "canvas", "jacket", "overshirt", "layered", "worn-in"],
  fall: ["wool", "canvas", "jacket", "overshirt", "layered"],
  spring: ["spring", "poplin", "linen", "light", "shirt"],
};
const STOP = new Set(["i", "me", "my", "a", "an", "the", "for", "to", "of", "and", "or", "in", "on", "with", "something", "some", "want", "need", "looking", "feel", "feeling", "like", "im", "i'm", "that", "is", "it", "this", "be", "at", "very", "really", "kind", "sort", "just", "wear", "outfit", "clothes", "clothing"]);
const tokenize = (s: string) => s.toLowerCase().replace(/[^a-z0-9$\s-]/g, " ").split(/\s+/).filter((t) => t && !STOP.has(t));
const stem = (t: string) => t.replace(/(ies)$/, "y").replace(/(s|ing|ed)$/, "");

export type SearchHit<T> = { item: T; score: number; why: string[] };
export function expandQuery(q: string) {
  const toks = tokenize(q);
  const terms = new Set<string>();
  for (const t of toks) { terms.add(t); terms.add(stem(t)); for (const s of SYN[t] ?? SYN[stem(t)] ?? []) terms.add(s); }
  const under = q.match(/under\s*\$?(\d+)/i) ?? q.match(/\$?(\d+)\s*(or less|max|and under)/i) ?? q.match(/<\s*\$?(\d+)/);
  const maxPrice = under ? parseInt(under[1], 10) : undefined;
  return { terms: [...terms].filter(Boolean), maxPrice, tokens: toks };
}
function bag(b: Brand) { return { styles: b.styles, moods: b.moods, categories: b.categories, materials: b.materials, values: b.values, misc: [b.name, b.city, b.country, b.tagline, b.madeIn, b.shipsFrom, ...b.gender] }; }
function scoreText(fields: Record<string, string[]>, terms: string[], weights: Record<string, number>) {
  let score = 0; const why: string[] = [];
  for (const [k, vals] of Object.entries(fields)) {
    for (const v of vals) { const nv = v.toLowerCase();
      for (const t of terms) { if (t.length < 3) continue; if (nv === t) { score += weights[k] * 2; why.push(v); } else if (nv.includes(t) || t.includes(nv)) { score += weights[k]; why.push(v); } }
    }
  }
  return { score, why: [...new Set(why)].slice(0, 4) };
}
export function searchCatalog(q: string, brands: Brand[], products: Product[], promos: Promo[]) {
  const { terms, maxPrice } = expandQuery(q);
  if (terms.length === 0 && !maxPrice) return { brands: [] as SearchHit<Brand>[], products: [] as SearchHit<Product>[], terms, maxPrice };
  const bmap = new Map(brands.map((b) => [b.slug, b]));
  const bHits = brands.map((b) => { const r = scoreText(bag(b), terms, { styles: 3, moods: 3, categories: 2, materials: 2, values: 2, misc: 2 }); return { item: b, ...r }; }).filter((h) => h.score > 0).sort((a, b) => b.score - a.score);
  const bScore = new Map(bHits.map((h) => [h.item.slug, h.score]));
  const pHits = products.map((p) => {
    const b = bmap.get(p.brand); if (!b) return null;
    const r = scoreText({ name: [p.name], cat: [p.category], tags: p.tags ?? [], mats: p.materials ?? [], desc: p.description ? [p.description] : [] }, terms, { name: 4, cat: 3, tags: 3, mats: 2, desc: 1 });
    const inherited = (bScore.get(b.slug) ?? 0) * 0.35;
    const { price } = effectivePrice(p, promos);
    if (maxPrice && price > maxPrice) return null;
    const score = r.score + inherited + (maxPrice ? 1 : 0);
    return score > 0 ? { item: p, score, why: r.why.length ? r.why : bHits.find((h) => h.item.slug === b.slug)?.why ?? [] } : null;
  }).filter((x): x is SearchHit<Product> => !!x).sort((a, b) => b.score - a.score);
  return { brands: bHits.slice(0, 6), products: pHits.slice(0, 12), terms, maxPrice };
}

/* ---------- daily pick: deterministic per calendar day ---------- */
export function dailyPick(products: Product[], date = new Date()) {
  if (products.length === 0) return undefined;
  const key = Number(`${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`);
  let h = key; h = ((h >>> 16) ^ h) * 0x45d9f3b; h = ((h >>> 16) ^ h) * 0x45d9f3b; h = (h >>> 16) ^ h;
  return products[Math.abs(h) % products.length];
}
