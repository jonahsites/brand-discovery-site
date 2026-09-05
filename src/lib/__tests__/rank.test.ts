import { describe, expect, it } from "vitest";
import type { Brand, Product } from "@/lib/data";
import { rankBrands, rankProducts, scoreBrand, scoreProduct, toSignal } from "@/lib/rank";

const brand = (over: Partial<Brand>): Brand => ({
  slug: "b", name: "B", init: "B", city: "X", country: "XX", tagline: "", items: 0,
  followers: 500, verified: false, tint: "#eee", ink: "#111",
  styles: [], moods: [], categories: [], materials: [], values: [],
  madeIn: "", batch: "small", gender: ["Unisex"], priceBand: [50, 200], sizeRange: ["S", "XL"],
  shipsTo: [], shipsFrom: "",
  ...over,
});

const product = (over: Partial<Product>): Product => ({
  slug: "p", brand: "b", name: "Thing", price: 100, category: "Shirting", ...over,
});

describe("scoreBrand", () => {
  const sig = toSignal({ styleTags: ["Workwear", "Minimalist"], follows: [], saved: [], recent: [], orders: [], views: {} });
  it("boosts brands whose styles overlap the shopper", () => {
    const a = brand({ slug: "a", styles: ["Workwear", "Minimalist"] });
    const b = brand({ slug: "z", styles: ["Techwear"] });
    expect(scoreBrand(a, sig)).toBeGreaterThan(scoreBrand(b, sig));
  });
  it("boosts brands the shopper follows", () => {
    const followed = { ...sig, follows: ["a"] };
    const a = brand({ slug: "a", styles: [] });
    const b = brand({ slug: "z", styles: [] });
    expect(scoreBrand(a, followed)).toBeGreaterThan(scoreBrand(b, followed));
  });
  it("gives a small underdog tiebreaker to smaller brands", () => {
    const big = brand({ slug: "big", followers: 100_000 });
    const small = brand({ slug: "small", followers: 100 });
    expect(scoreBrand(small, sig)).toBeGreaterThan(scoreBrand(big, sig));
  });
});

describe("scoreProduct", () => {
  const sig = toSignal({ styleTags: [], sizes: { tops: "M", waist: "32", shoe: "10" }, saved: [], recent: [], orders: [] });
  const b = brand({ slug: "b" });
  it("penalises products whose sizes don't include the shopper's size", () => {
    const fit = product({ slug: "f", sizes: ["S", "M", "L"] });
    const miss = product({ slug: "m", sizes: ["XS", "S", "L"] });
    expect(scoreProduct(fit, b, sig)).toBeGreaterThan(scoreProduct(miss, b, sig));
  });
  it("kills sold-out products unless waitlisted", () => {
    const gone = product({ slug: "g", stock: 0 });
    const live = product({ slug: "l" });
    expect(scoreProduct(gone, b, sig)).toBeLessThan(scoreProduct(live, b, sig));
    const wait = { ...sig, waitlist: ["g"] };
    expect(scoreProduct(gone, b, wait)).toBeGreaterThan(scoreProduct(gone, b, sig));
  });
  it("downweights products the shopper already bought", () => {
    const sig2 = { ...sig, orderedProducts: ["p"] };
    const p = product({});
    expect(scoreProduct(p, b, sig2)).toBeLessThan(scoreProduct(p, b, sig));
  });
});

describe("rankBrands / rankProducts", () => {
  const brands: Brand[] = [
    brand({ slug: "unknown", followers: 5000 }),
    brand({ slug: "followed", styles: ["Workwear"], followers: 1000 }),
    brand({ slug: "matched", styles: ["Workwear", "Minimalist"], followers: 800 }),
  ];
  const sig = toSignal({ styleTags: ["Workwear", "Minimalist"], follows: ["followed"] });
  it("ranks follows above unknown above one-tag matches, all ties broken by underdog", () => {
    const order = rankBrands(brands, sig).map((b) => b.slug);
    expect(order[0]).toBe("followed"); // 2 shared + underdog beats followed's follow bonus at these weights
    expect(order[1]).toBe("matched");
    expect(order[2]).toBe("unknown");
  });
  it("puts sold-out products at the bottom", () => {
    const products: Product[] = [product({ slug: "sold", brand: "matched", stock: 0 }), product({ slug: "live", brand: "matched" })];
    const order = rankProducts(products, brands, sig).map((p) => p.slug);
    expect(order[0]).toBe("live");
    expect(order[1]).toBe("sold");
  });
});
