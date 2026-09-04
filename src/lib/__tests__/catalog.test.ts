import { describe, expect, it } from "vitest";
import { BRANDS, PRODUCTS, SIZE_LADDER, brandTier, type Promo } from "@/lib/data";
import { allProducts, dailyPick, effectivePrice, expandQuery, filterProducts, searchCatalog, sizesBetween, slugify, initials } from "@/lib/catalog";

const NO_PROMOS: Promo[] = [];

describe("effectivePrice", () => {
  const jacket = PRODUCTS.find((p) => p.slug === "panel-work-jacket")!;
  it("keeps the list price without promos", () => {
    expect(effectivePrice(jacket, NO_PROMOS)).toMatchObject({ price: 248, compareAt: 310 });
  });
  it("applies an active brand-wide promo and exposes the original as compareAt", () => {
    const promo: Promo = { id: "x", brand: "form-and-void", code: "TEN", pct: 10, label: "ten", products: "all", active: true };
    const r = effectivePrice(jacket, [promo]);
    expect(r.price).toBe(223);
    expect(r.compareAt).toBe(248);
    expect(r.promo?.code).toBe("TEN");
  });
  it("ignores paused, expired, other-brand and non-matching-product promos", () => {
    const base = { id: "x", brand: "form-and-void", code: "TEN", pct: 10, label: "ten" } as const;
    expect(effectivePrice(jacket, [{ ...base, products: "all", active: false }]).price).toBe(248);
    expect(effectivePrice(jacket, [{ ...base, products: "all", active: true, ends: new Date(Date.now() - 1000).toISOString() }]).price).toBe(248);
    expect(effectivePrice(jacket, [{ ...base, brand: "nomad", products: "all", active: true }]).price).toBe(248);
    expect(effectivePrice(jacket, [{ ...base, products: ["waxed-tote"], active: true }]).price).toBe(248);
  });
});

describe("filterProducts", () => {
  it("filters by category, price band, brand tier and sale", () => {
    const outer = filterProducts(PRODUCTS, BRANDS, NO_PROMOS, { category: "Outerwear" });
    expect(outer.length).toBeGreaterThan(0);
    expect(outer.every((p) => p.category === "Outerwear" || BRANDS.find((b) => b.slug === p.brand)!.categories.includes("Outerwear"))).toBe(true);
    const cheap = filterProducts(PRODUCTS, BRANDS, NO_PROMOS, { price: [0, 100] });
    expect(cheap.every((p) => p.price <= 100)).toBe(true);
    const indie = filterProducts(PRODUCTS, BRANDS, NO_PROMOS, { tiers: ["Indie"] });
    expect(indie.every((p) => brandTier(BRANDS.find((b) => b.slug === p.brand)!.followers) === "Indie")).toBe(true);
    const sale = filterProducts(PRODUCTS, BRANDS, NO_PROMOS, { sale: true });
    expect(sale.every((p) => !!p.compareAt)).toBe(true);
  });
  it("treats Sustainable as a values filter", () => {
    const s = filterProducts(PRODUCTS, BRANDS, NO_PROMOS, { category: "Sustainable" });
    expect(s.length).toBeGreaterThan(0);
  });
  it("filters by size using the brand's size range when the product has no sizes", () => {
    const xxl = filterProducts(PRODUCTS, BRANDS, NO_PROMOS, { sizes: ["XXL"] });
    expect(xxl.every((p) => sizesBetween(BRANDS.find((b) => b.slug === p.brand)!.sizeRange).includes("XXL"))).toBe(true);
  });
});

describe("searchCatalog", () => {
  it("understands feelings: cozy + rainy surfaces knitwear and canvas outerwear brands", () => {
    const r = searchCatalog("something cozy for a rainy weekend", BRANDS, PRODUCTS, NO_PROMOS);
    const brandSlugs = r.brands.map((h) => h.item.slug);
    expect(brandSlugs).toContain("core-theory");
    expect(brandSlugs).toContain("form-and-void");
    expect(r.products.length).toBeGreaterThan(0);
  });
  it("parses a price ceiling", () => {
    const { maxPrice } = expandQuery("linen shirt under $120");
    expect(maxPrice).toBe(120);
    const r = searchCatalog("shirt under $120", BRANDS, PRODUCTS, NO_PROMOS);
    expect(r.products.every((h) => h.item.price <= 120)).toBe(true);
  });
  it("returns nothing for an empty query", () => {
    expect(searchCatalog("   ", BRANDS, PRODUCTS, NO_PROMOS).products).toHaveLength(0);
  });
  it("ranks a product whose name matches the query above brand-only matches", () => {
    const r = searchCatalog("panel work jacket", BRANDS, PRODUCTS, NO_PROMOS);
    expect(r.products[0]?.item.slug).toBe("panel-work-jacket");
  });
  it("finds user-created products by their tags", () => {
    const custom = [{ slug: "test-linen", brand: "studio-arva", name: "Linen Thing", price: 90, category: "Shirting", tags: ["sunday", "breezy"] }];
    const r = searchCatalog("breezy sunday", BRANDS, allProducts(custom), NO_PROMOS);
    expect(r.products[0]?.item.slug).toBe("test-linen");
  });
});

describe("helpers", () => {
  it("slugify and initials", () => {
    expect(slugify("Form & Void")).toBe("form-and-void");
    expect(initials("Quiet Hour")).toBe("QH");
  });
  it("sizesBetween walks the ladder", () => {
    expect(sizesBetween(["S", "XL"])).toEqual(["S", "M", "L", "XL"]);
    expect(SIZE_LADDER[0]).toBe("XXS");
  });
  it("dailyPick is deterministic per day and inside the catalogue", () => {
    const d = new Date(2026, 8, 3);
    const a = dailyPick(PRODUCTS, d), b = dailyPick(PRODUCTS, d);
    expect(a).toBe(b);
    expect(PRODUCTS).toContain(a);
    expect(dailyPick([], d)).toBeUndefined();
  });
  it("allProducts prefers custom entries and honours removals", () => {
    const custom = [{ ...PRODUCTS[0], name: "Renamed" }];
    const list = allProducts(custom, ["waxed-tote"]);
    expect(list.find((p) => p.slug === PRODUCTS[0].slug)?.name).toBe("Renamed");
    expect(list.some((p) => p.slug === "waxed-tote")).toBe(false);
  });
});
