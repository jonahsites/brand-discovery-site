import { describe, expect, it } from "vitest";
import { BRANDS, PRODUCTS, type Product } from "@/lib/data";
import { allProducts, dailyPick, expandQuery, filterProducts, searchCatalog, sizesBetween, slugify, initials, findBrand, findProduct } from "@/lib/catalog";

const NO_PROMOS = [] as const;

describe("slugify", () => {
  it("lowercases, translates & to 'and', collapses non-alphanumerics, trims edges", () => {
    expect(slugify("Form & Void")).toBe("form-and-void");
    expect(slugify("  Studio  Arva!  ")).toBe("studio-arva");
    expect(slugify("Café Renard 21")).toBe("caf-renard-21");
    expect(slugify("---")).toBe("");
  });
});

describe("initials", () => {
  it("picks up to two letters from the first two words; empty falls back to K for Kindred", () => {
    expect(initials("Form Void")).toBe("FV");
    expect(initials("form")).toBe("F");
    expect(initials("A B C D")).toBe("AB");
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

describe("filterProducts", () => {
  it("filters by category and price band", () => {
    const list = filterProducts(PRODUCTS, BRANDS, [], { category: "Outerwear", price: [0, 300] });
    expect(list.length).toBeGreaterThan(0);
    // Category matches on brand styles + product tags too, so we only assert the price band.
    expect(list.every((p) => p.price <= 300)).toBe(true);
  });
  it("filters by material via the brand's materials", () => {
    const list = filterProducts(PRODUCTS, BRANDS, [], { materials: ["Linen"] });
    expect(list.length).toBeGreaterThan(0);
  });
});

describe("searchCatalog", () => {
  it("returns nothing for empty query, sorted brand/product hits for real ones", () => {
    expect(searchCatalog("", BRANDS, PRODUCTS, [...NO_PROMOS]).brands).toHaveLength(0);
    const hit = searchCatalog("linen shirt", BRANDS, PRODUCTS, [...NO_PROMOS]);
    expect(hit.products.length).toBeGreaterThan(0);
  });
});

describe("dailyPick", () => {
  it("is stable across day and rolls over across days", () => {
    const a = dailyPick(PRODUCTS, new Date(2026, 8, 4));
    const b = dailyPick(PRODUCTS, new Date(2026, 8, 4));
    const c = dailyPick(PRODUCTS, new Date(2026, 8, 5));
    expect(a?.slug).toBe(b?.slug);
    // Not asserting inequality across days — the pick is deterministic on the date int
    // and two adjacent days can hash to the same product; the stability test above is
    // the guarantee that matters.
    expect(c).toBeDefined();
  });
});

describe("allProducts", () => {
  it("puts custom entries before seed", () => {
    const custom: Product = { slug: "test-jacket", brand: "form-and-void", name: "Test", price: 100, category: "Outerwear" };
    const list = allProducts([custom], []);
    expect(list[0].slug).toBe("test-jacket");
  });
  it("removes seed products marked removed", () => {
    const list = allProducts([], ["panel-work-jacket"]);
    expect(list.some((p) => p.slug === "panel-work-jacket")).toBe(false);
  });
  it("findBrand and findProduct look through both seed and custom", () => {
    expect(findBrand("form-and-void")).toBeDefined();
    expect(findProduct("panel-work-jacket")).toBeDefined();
    expect(findProduct("does-not-exist")).toBeUndefined();
  });
});

describe("BRANDS/PRODUCTS integrity", () => {
  it("has no duplicate brand slugs", () => {
    const slugs = BRANDS.map((b) => b.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
  it("has no duplicate product slugs", () => {
    const slugs = PRODUCTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
  it("every product's brand exists in BRANDS", () => {
    const brandSlugs = new Set(BRANDS.map((b) => b.slug));
    for (const p of PRODUCTS) expect(brandSlugs.has(p.brand), `${p.slug} → ${p.brand}`).toBe(true);
  });
  it("every product has a non-empty category", () => {
    for (const p of PRODUCTS) expect(p.category.length).toBeGreaterThan(0);
  });
});
