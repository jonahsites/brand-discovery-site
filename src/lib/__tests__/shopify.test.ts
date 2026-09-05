import { describe, expect, it } from "vitest";
import { normalizeStoreUrl, mapCategory, normalizeProduct, type ShopifyRaw } from "@/lib/shopify";

describe("normalizeStoreUrl", () => {
  it("accepts a bare store handle", () => {
    expect(normalizeStoreUrl("foo")).toBe("https://foo.myshopify.com/products.json");
  });
  it("accepts a myshopify host", () => {
    expect(normalizeStoreUrl("foo.myshopify.com")).toBe("https://foo.myshopify.com/products.json");
  });
  it("accepts a full https URL and strips paths", () => {
    expect(normalizeStoreUrl("https://example.com/collections/all")).toBe("https://example.com/products.json");
  });
  it("rejects empty and whitespace input", () => {
    expect(normalizeStoreUrl("")).toBeNull();
    expect(normalizeStoreUrl("   ")).toBeNull();
  });
});

describe("mapCategory", () => {
  it("maps common Shopify product types to Kindred categories", () => {
    expect(mapCategory("Sweater")).toBe("Knitwear");
    expect(mapCategory("Men's Jackets")).toBe("Outerwear");
    expect(mapCategory("Shoes")).toBe("Footwear");
    expect(mapCategory("Jeans")).toBe("Denim");
    expect(mapCategory("Backpack")).toBe("Shirting"); // fallback
    expect(mapCategory(undefined)).toBe("Shirting");
  });
});

describe("normalizeProduct", () => {
  const raw: ShopifyRaw = {
    id: 1, title: "Test Jacket", handle: "test-jacket", product_type: "Jackets",
    vendor: "Someone", tags: ["outdoor", "waxed"],
    body_html: "<p>A <strong>great</strong> jacket.</p>",
    options: [{ name: "Size", values: ["S", "M", "L"] }, { name: "Color", values: ["Bone", "Ink"] }],
    variants: [
      { id: 1, title: "S / Bone", option1: "S", option2: "Bone", price: "199.00", compare_at_price: "249.00", available: true, inventory_quantity: 3 },
      { id: 2, title: "M / Bone", option1: "M", option2: "Bone", price: "199.00", compare_at_price: "249.00", available: true, inventory_quantity: 2 },
    ],
    images: [{ src: "https://example.com/1.jpg" }, { src: "https://example.com/2.jpg" }],
  };
  it("maps every field into the Kindred Product shape", () => {
    const p = normalizeProduct(raw, "test-brand");
    expect(p.slug).toBe("test-brand-test-jacket");
    expect(p.name).toBe("Test Jacket");
    expect(p.price).toBe(199);
    expect(p.compareAt).toBe(249);
    expect(p.category).toBe("Outerwear");
    expect(p.sizes).toEqual(["S", "M", "L"]);
    expect(p.colors).toEqual(["Bone", "Ink"]);
    expect(p.tags).toEqual(["outdoor", "waxed"]);
    expect(p.stock).toBe(5);
    expect(p.image).toBe("https://example.com/1.jpg");
    expect(p.images).toEqual(["https://example.com/2.jpg"]);
    expect(p.description).toContain("great jacket");
    expect(p.brand).toBe("test-brand");
  });
  it("skips a compareAt price that's not actually higher than the sale price", () => {
    const p = normalizeProduct({ ...raw, variants: [{ ...raw.variants[0], compare_at_price: "199.00" }] }, "b");
    expect(p.compareAt).toBeUndefined();
  });
  it("falls back to a synthetic image list when Shopify has none", () => {
    const p = normalizeProduct({ ...raw, images: [] }, "b");
    expect(p.image).toBeUndefined();
    expect(p.images ?? []).toEqual([]);
  });
});
