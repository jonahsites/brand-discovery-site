/**
 * Pure cart math. No React, no storage. The store feeds it state and renders what it returns,
 * which is also what a future server-side checkout should compute so the two never disagree.
 */
import { SHIP_OPTS, type Brand, type GiftCard, type Product, type Promo } from "./data";
import { effectivePrice, findProduct } from "./catalog";

export type BagItem = { key: string; product: string; variant: string; qty: number };
export type BagLine = BagItem & { p: Product; unit: number; total: number };
export type BagGroup = { brand: Brand; items: BagLine[]; shipCost: number };

export type CartInput = {
  bag: BagItem[];
  ship: Record<string, number>;
  promos: Promo[];
  promoCode?: string;
  /** Kindred points the shopper chose to spend. 100 points = $1. */
  redeem: number;
  giftCode?: string;
  giftCards: GiftCard[];
  customProducts: Product[];
  removedProducts: string[];
  brands: Brand[];
};

export type Cart = {
  bagGroups: BagGroup[];
  bagCount: number;
  subtotal: number;
  shipTotal: number;
  /** Promo code discount, applied only to lines that are not already on a promo price. */
  promoDiscount: number;
  /** Points spent, in dollars. */
  credit: number;
  /** Gift card balance applied, in dollars. */
  giftCredit: number;
  discount: number;
  total: number;
};

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function shipCostFor(brandSlug: string, choice: number | undefined): number {
  const opts = SHIP_OPTS[brandSlug]?.opts ?? [{ cost: 9 }];
  return opts[Math.min(choice ?? 0, opts.length - 1)].cost;
}

export function findPromoByCode(promos: Promo[], code?: string): Promo | undefined {
  if (!code) return undefined;
  const c = code.trim().toLowerCase();
  return promos.find((pr) => pr.active && pr.code.toLowerCase() === c);
}

export function computeCart(i: CartInput): Cart {
  const map = new Map<string, BagGroup>();
  for (const it of i.bag) {
    const p = findProduct(it.product, i.customProducts);
    if (!p || i.removedProducts.includes(p.slug)) continue;
    const brand = i.brands.find((b) => b.slug === p.brand);
    if (!brand) continue;
    if (!map.has(brand.slug)) map.set(brand.slug, { brand, items: [], shipCost: shipCostFor(brand.slug, i.ship[brand.slug]) });
    const unit = effectivePrice(p, i.promos).price;
    map.get(brand.slug)!.items.push({ ...it, p, unit, total: unit * it.qty });
  }
  const bagGroups = [...map.values()];
  const subtotal = bagGroups.reduce((s, g) => s + g.items.reduce((a, l) => a + l.total, 0), 0);
  const shipTotal = bagGroups.reduce((s, g) => s + g.shipCost, 0);

  const code = findPromoByCode(i.promos, i.promoCode);
  const promoDiscount = code
    ? Math.round(bagGroups.filter((g) => g.brand.slug === code.brand).reduce((s, g) => s + g.items.reduce((a, l) => a + (l.p.price === l.unit ? (l.total * code.pct) / 100 : 0), 0), 0))
    : 0;

  const afterPromo = Math.max(0, subtotal + shipTotal - promoDiscount);
  const credit = Math.min(Math.max(0, i.redeem) / 100, afterPromo);

  const giftCard = i.giftCode ? i.giftCards.find((g) => g.code === i.giftCode) : undefined;
  const giftCredit = giftCard ? round2(Math.min(giftCard.balance, Math.max(0, afterPromo - credit))) : 0;

  const discount = round2(promoDiscount + credit + giftCredit);
  return {
    bagGroups,
    bagCount: i.bag.reduce((s, b) => s + b.qty, 0),
    subtotal, shipTotal, promoDiscount, credit, giftCredit, discount,
    total: round2(subtotal + shipTotal - discount),
  };
}

/** Points earned by an order: 1 per whole dollar of merchandise, minus dollars paid with points. */
export function pointsEarned(order: { subtotal: number; credit?: number }): number {
  return Math.round(order.subtotal) - Math.round((order.credit ?? 0) * 100);
}
