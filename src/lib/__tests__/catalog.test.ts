import { describe, expect, it } from "vitest";
import type { Brand, Product, Promo } from "@/lib/data";
import { activePromoFor, allProducts, dailyPick, effectivePrice, expandQuery, filterProducts, initials, searchCatalog, sizesBetween, slugify } from "@/lib/catalog";

/* Fixtures — the seed data is now empty, so every test brings its own. */
const brand = (over: Partial<Brand> = {}): Brand => ({
  slug: "b", name: "B", init: "B", city: "X", country: "XX", tagline: "", items: 0,
  followers: 100, verified: false, tint: "#eee", ink: "#111",
  styles: [], moods: [], categories: [], materials: [], values: [],
  madeIn: "", batch: "small", gender: ["Unisex"], priceBand: [50, 300], sizeRange: ["S", "XL"],
  shipsTo: [], shipsFrom: "",
  ...over,
});
const product = (over: Partial<Product> = {}): Product => ({ slug: "p", brand: "b", name: "P", price: 100, category: "Shirting", ...over });

describe("slugify + initials", () => {
  it("slugifies with & → and, trims edges, drops non-alphanumerics", () => {
    expect(slugify("Form & Void")).toBe("form-and-void");
    expect(slugify("  Studio Arva!  ")).toBe("studio-arva");
    expect(slugify("---")).toBe("");
  });
  it("takes up to two initials, falls back to K for empty", () => {
    expect(initials("Form Void")).toBe("FV");
    expect(initials("")).toBe("K");
  });
});

describe("sizesBetween", () => {
  it("returns the closed range on the size ladder", () => {
    expect(sizesBetween(["S", "L"])).toEqual(["S", "M", "L"]);
    expect(sizesBetween(["M", "M"])).toEqual(["M"]);
  });
});

describe("expandQuery", () => {
  it("expands feel words with synonyms and lifts an under-$N clause", () => {
    const r = expandQuery("cozy rainy weekend under $150");
    expect(r.maxPrice).toBe(150);
    expect(r.terms.some((t) => /rain|cozy|weekend/.test(t))).toBe(true);
  });
  it("handles empty input", () => {
    const r = expandQuery("");
    expect(r.terms).toEqual([]);
    expect(r.maxPrice).toBeUndefined();
  });
});

describe("effectivePrice", () => {
  const jacket = product({ slug: "j", brand: "b", price: 248, compareAt: 310 });
  it("keeps the list price without promos", () => {
    expect(effectivePrice(jacket, [])).toMatchObject({ price: 248, compareAt: 310 });
  });
  it("applies an active brand-wide promo and exposes the original as compareAt", () => {
    const promo: Promo = { id: "x", brand: "b", code: "TEN", pct: 10, label: "ten", products: "all", active: true };
    const r = effectivePrice(jacket, [promo]);
    expect(r.price).toBe(223);
    expect(r.compareAt).toBe(248);
    expect(r.promo?.code).toBe("TEN");
  });
  it("ignores paused, other-brand and non-matching-product promos", () => {
    const base = { id: "x", brand: "b", code: "TEN", pct: 10, label: "ten" } as const;
    const paused: Promo = { ...base, products: "all", active: false };
    const otherBrand: Promo = { ...base, brand: "other", products: "all", active: true };
    const wrongProduct: Promo = { ...base, products: ["other-product"], active: true };
    expect(effectivePrice(jacket, [paused, otherBrand, wrongProduct]).price).toBe(248);
    expect(activePromoFor(jacket, [paused])).toBeUndefined();
  });
});

describe("filterProducts", () => {
  const b = brand({ slug: "b", materials: ["Linen"] });
  const p1 = product({ slug: "p1", brand: "b", category: "Outerwear", price: 200 });
  const p2 = product({ slug: "p2", brand: "b", category: "Shirting", price: 400 });
  it("filters by price band", () => {
    const list = filterProducts([p1, p2], [b], [], { price: [0, 300] });
    expect(list.map((x) => x.slug)).toEqual(["p1"]);
  });
  it("filters by material via the brand's materials", () => {
    const list = filterProducts([p1], [b], [], { materials: ["Linen"] });
    expect(list.length).toBe(1);
  });
});

describe("searchCatalog", () => {
  const b = brand({ slug: "b", name: "Linen Co", styles: ["Minimalist"], moods: ["clean"], categories: ["Shirting"], materials: ["Linen"], values: ["Small batch"] });
  const p = product({ slug: "p", brand: "b", name: "Linen shirt", category: "Shirting", materials: ["Linen"], tags: ["shirt"] });
  it("returns nothing for empty query, real hits for a matching one", () => {
    expect(searchCatalog("", [b], [p], []).brands).toHaveLength(0);
    expect(searchCatalog("linen shirt", [b], [p], []).products.length).toBeGreaterThan(0);
  });
});

describe("dailyPick", () => {
  const list = [product({ slug: "a" }), product({ slug: "z", brand: "b" })];
  it("is stable across day; runs on empty input", () => {
    const a = dailyPick(list, new Date(2026, 8, 4));
    const b = dailyPick(list, new Date(2026, 8, 4));
    expect(a?.slug).toBe(b?.slug);
    expect(dailyPick([])).toBeUndefined();
  });
});

describe("allProducts", () => {
  it("puts custom entries before seed (seed is now empty)", () => {
    const p = product({ slug: "custom" });
    expect(allProducts([p], []).map((x) => x.slug)).toEqual(["custom"]);
  });
  it("removes anything in the removedProducts set", () => {
    expect(allProducts([product({ slug: "gone" })], ["gone"]).length).toBe(0);
  });
});
