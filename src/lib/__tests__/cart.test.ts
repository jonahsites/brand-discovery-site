import { describe, expect, it } from "vitest";
import { BRANDS, PRODUCTS, type GiftCard, type Promo } from "@/lib/data";
import { computeCart, pointsEarned, shipCostFor, type CartInput } from "@/lib/cart";

const jacket = PRODUCTS.find((p) => p.slug === "panel-work-jacket")!; // 248, form-and-void
const tee = PRODUCTS.find((p) => p.slug === "salt-wash-tee")!; // 68, onda-studio

const base = (over: Partial<CartInput> = {}): CartInput => ({
  bag: [{ key: "a", product: jacket.slug, variant: "L · Faded black", qty: 1 }],
  ship: {}, promos: [], redeem: 0, giftCards: [], customProducts: [], removedProducts: [], brands: BRANDS,
  ...over,
});

describe("computeCart", () => {
  it("groups lines by brand and adds one shipping fee per brand", () => {
    const c = computeCart(base({ bag: [{ key: "a", product: jacket.slug, variant: "L", qty: 1 }, { key: "b", product: tee.slug, variant: "M", qty: 2 }] }));
    expect(c.bagGroups.map((g) => g.brand.slug).sort()).toEqual(["form-and-void", "onda-studio"]);
    expect(c.bagCount).toBe(3);
    expect(c.subtotal).toBe(248 + 68 * 2);
    expect(c.shipTotal).toBe(shipCostFor("form-and-void", 0) + shipCostFor("onda-studio", 0));
    expect(c.total).toBe(c.subtotal + c.shipTotal);
  });

  it("drops lines whose product was removed by the brand", () => {
    const c = computeCart(base({ removedProducts: [jacket.slug] }));
    expect(c.bagGroups).toHaveLength(0);
    expect(c.total).toBe(0);
  });

  it("applies a promo code only to that brand and only to full-price lines", () => {
    const promo: Promo = { id: "p", brand: "form-and-void", code: "TEN", pct: 10, label: "ten", products: "all", active: false };
    const c = computeCart(base({ bag: [{ key: "a", product: jacket.slug, variant: "L", qty: 1 }, { key: "b", product: tee.slug, variant: "M", qty: 1 }], promos: [promo], promoCode: "ten" }));
    // paused promo → no discount even though the code matches
    expect(c.promoDiscount).toBe(0);
    const on = computeCart(base({ bag: [{ key: "a", product: jacket.slug, variant: "L", qty: 1 }, { key: "b", product: tee.slug, variant: "M", qty: 1 }], promos: [{ ...promo, active: true }], promoCode: "TEN" }));
    // an active brand-wide promo already lowers the unit price, so the code cannot stack on top of it
    expect(on.bagGroups.find((g) => g.brand.slug === "form-and-void")!.items[0].unit).toBe(223);
    expect(on.promoDiscount).toBe(0);
  });

  it("spends points at 100 per dollar and never past the payable amount", () => {
    const c = computeCart(base({ redeem: 500 }));
    expect(c.credit).toBe(5);
    expect(c.total).toBe(248 + shipCostFor("form-and-void", 0) - 5);
    const capped = computeCart(base({ redeem: 10_000_000 }));
    expect(capped.total).toBe(0);
    expect(capped.credit).toBe(248 + shipCostFor("form-and-void", 0));
  });

  it("applies a gift card after points and caps it at the card balance", () => {
    const card: GiftCard = { code: "KIND-TEST-0001", amount: 100, balance: 40, to: "A", from: "B", at: "" };
    const c = computeCart(base({ redeem: 500, giftCards: [card], giftCode: card.code }));
    expect(c.credit).toBe(5);
    expect(c.giftCredit).toBe(40);
    expect(c.discount).toBe(45);
    expect(c.total).toBe(248 + shipCostFor("form-and-void", 0) - 45);
  });

  it("ignores an unknown gift code and an unknown promo code", () => {
    const c = computeCart(base({ giftCode: "KIND-NOPE-0000", promoCode: "NOPE" }));
    expect(c.giftCredit).toBe(0);
    expect(c.promoDiscount).toBe(0);
  });

  it("uses the chosen shipping option per brand", () => {
    const std = computeCart(base());
    const fast = computeCart(base({ ship: { "form-and-void": 1 } }));
    expect(fast.shipTotal).toBeGreaterThanOrEqual(std.shipTotal);
    expect(fast.shipTotal).toBe(shipCostFor("form-and-void", 1));
  });
});

describe("pointsEarned", () => {
  it("earns one point per merchandise dollar, minus points spent", () => {
    expect(pointsEarned({ subtotal: 248 })).toBe(248);
    expect(pointsEarned({ subtotal: 248, credit: 5 })).toBe(248 - 500);
  });
});
