// Typed CRUD + realtime helpers for the Supabase-backed shared state. Every function returns
// the same shape as the in-memory types in `data.ts` so the store just plugs them in.
"use client";
import { getSupabase } from "./supabase";
import type { Brand, Product, Order, OrderItem, Promo, Drop, GiftCard, Post, Thread, Message, Lookbook, LookFrame, Review, Batch } from "./data";

type Row = Record<string, unknown>;

/* -------------------- row <-> type mappers -------------------- */

const brandFromRow = (r: Row): Brand => ({
  slug: r.slug as string, name: r.name as string, init: r.init as string,
  city: (r.city as string) ?? "", country: (r.country as string) ?? "",
  tagline: (r.tagline as string) ?? "", items: (r.items as number) ?? 0,
  followers: (r.followers as number) ?? 0, verified: !!r.verified,
  tint: (r.tint as string) ?? "#EAEAE4", ink: (r.ink as string) ?? "#0F1113",
  founded: r.founded as number | undefined, website: r.website as string | undefined, story: r.story as string | undefined,
  styles: (r.styles as string[]) ?? [], moods: (r.moods as string[]) ?? [],
  categories: (r.categories as string[]) ?? [], materials: (r.materials as string[]) ?? [],
  values: (r.values as string[]) ?? [], madeIn: (r.made_in as string) ?? "",
  batch: ((r.batch as string) ?? "small") as Batch, gender: (r.gender as string[]) ?? [],
  priceBand: [(r.price_min as number) ?? 0, (r.price_max as number) ?? 0],
  sizeRange: [(r.size_min as string) ?? "S", (r.size_max as string) ?? "XL"],
  shipsTo: (r.ships_to as string[]) ?? [], shipsFrom: (r.ships_from as string) ?? "",
  createdAt: r.created_at as string | undefined,
  logo: r.logo as string | undefined, cover: r.cover as string | undefined,
  verification: r.verification as "pending" | undefined,
  accent: r.accent as string | undefined, bg: r.bg as string | undefined,
  headlineFont: r.headline_font as "serif" | "sans" | undefined,
  intro: r.intro as string | undefined, quote: r.quote as string | undefined, quoteBy: r.quote_by as string | undefined,
  plan: r.plan as Brand["plan"],
});

const brandToRow = (b: Brand, ownerId?: string) => ({
  slug: b.slug, owner_id: ownerId ?? null, name: b.name, init: b.init,
  city: b.city, country: b.country, tagline: b.tagline, items: b.items,
  followers: b.followers, verified: b.verified, tint: b.tint, ink: b.ink,
  founded: b.founded ?? null, website: b.website ?? null, story: b.story ?? null,
  styles: b.styles, moods: b.moods, categories: b.categories, materials: b.materials,
  values: b.values, made_in: b.madeIn, batch: b.batch, gender: b.gender,
  price_min: b.priceBand[0], price_max: b.priceBand[1],
  size_min: b.sizeRange[0], size_max: b.sizeRange[1],
  ships_to: b.shipsTo, ships_from: b.shipsFrom,
  logo: b.logo ?? null, cover: b.cover ?? null, verification: b.verification ?? null,
  accent: b.accent ?? null, bg: b.bg ?? null, headline_font: b.headlineFont ?? null,
  intro: b.intro ?? null, quote: b.quote ?? null, quote_by: b.quoteBy ?? null,
  plan: b.plan ?? null,
});

const productFromRow = (r: Row): Product => ({
  slug: r.slug as string, brand: r.brand_slug as string, name: r.name as string,
  price: r.price as number, compareAt: r.compare_at as number | undefined,
  tag: r.tag as string | undefined, tagBg: r.tag_bg as string | undefined, tagFg: r.tag_fg as string | undefined,
  category: (r.category as string) ?? "",
  sizes: (r.sizes as string[]) ?? undefined, colors: (r.colors as string[]) ?? undefined,
  materials: (r.materials as string[]) ?? undefined, tags: (r.tags as string[]) ?? undefined,
  stock: r.stock as number | undefined, description: r.description as string | undefined,
  createdAt: r.created_at as string | undefined,
  image: r.image as string | undefined, images: (r.images as string[]) ?? undefined,
  preorder: r.preorder as string | undefined,
});

const productToRow = (p: Product) => ({
  slug: p.slug, brand_slug: p.brand, name: p.name, price: p.price,
  compare_at: p.compareAt ?? null, tag: p.tag ?? null, tag_bg: p.tagBg ?? null, tag_fg: p.tagFg ?? null,
  category: p.category, sizes: p.sizes ?? [], colors: p.colors ?? [],
  materials: p.materials ?? [], tags: p.tags ?? [],
  stock: p.stock ?? null, description: p.description ?? null,
  image: p.image ?? null, images: p.images ?? [], preorder: p.preorder ?? null,
});

const promoFromRow = (r: Row): Promo => ({
  id: r.id as string, brand: r.brand_slug as string, code: r.code as string,
  pct: r.pct as number, label: (r.label as string) ?? "",
  products: r.scope === "all" ? "all" : ((r.products as string[]) ?? []),
  ends: r.ends_at as string | undefined, active: !!r.active,
});
const promoToRow = (p: Promo) => ({
  id: p.id, brand_slug: p.brand, code: p.code, pct: p.pct, label: p.label,
  scope: p.products === "all" ? "all" : "products",
  products: p.products === "all" ? [] : p.products,
  ends_at: p.ends ?? null, active: p.active,
});

const dropFromRow = (r: Row): Drop => ({
  id: r.id as string, brand: r.brand_slug as string, title: r.title as string,
  at: r.at_time as string, pieces: r.pieces as number, blurb: (r.blurb as string) ?? "",
  products: (r.products as string[]) ?? [],
});
const dropToRow = (d: Drop) => ({
  id: d.id, brand_slug: d.brand, title: d.title, at_time: d.at,
  pieces: d.pieces, blurb: d.blurb, products: d.products,
});

const postFromRow = (r: Row): Post => ({
  id: r.id as string, brand: r.brand_slug as string, caption: (r.caption as string) ?? "",
  image: r.image as string | undefined, products: (r.products as string[]) ?? [],
  at: r.created_at as string, likes: (r.likes as number) ?? 0,
});
const reviewFromRow = (r: Row): Review => ({
  id: r.id as string, product: r.product_slug as string, name: r.author_name as string,
  init: (r.init as string) ?? "", tint: (r.tint as string) ?? "#EAEAE4",
  stars: r.stars as number, fit: r.fit as 1 | 2 | 3, body: (r.body as string) ?? "",
  size: (r.size as string) ?? "", at: r.created_at as string,
});
const giftFromRow = (r: Row): GiftCard => ({
  code: r.code as string, amount: Number(r.amount), balance: Number(r.balance),
  to: (r.to_name as string) ?? "", from: (r.from_name as string) ?? "",
  note: r.note as string | undefined, at: r.created_at as string,
});
const orderFromRow = (r: Row, items: OrderItem[]): Order => ({
  id: r.id as string, placedAt: r.placed_at as string, status: r.status as Order["status"],
  promo: r.promo_code as string | undefined,
  items, subtotal: Number(r.subtotal), shipping: Number(r.shipping), total: Number(r.total),
  credit: r.credit != null ? Number(r.credit) : undefined,
  gift: r.gift != null ? Number(r.gift) : undefined,
});
const orderItemFromRow = (r: Row): OrderItem => ({
  product: r.product_slug as string, name: r.name as string, brand: r.brand_slug as string,
  variant: (r.variant as string) ?? "", qty: r.qty as number, unit: Number(r.unit),
});

/* -------------------- fetchers -------------------- */

export async function fetchBrands(): Promise<Brand[]> {
  const sb = getSupabase(); if (!sb) return [];
  const { data } = await sb.from("brands").select("*"); return (data ?? []).map(brandFromRow);
}
export async function fetchProducts(): Promise<{ products: Product[]; removed: string[] }> {
  const sb = getSupabase(); if (!sb) return { products: [], removed: [] };
  const [p, r] = await Promise.all([
    sb.from("products").select("*"),
    sb.from("removed_products").select("product_slug"),
  ]);
  return { products: (p.data ?? []).map(productFromRow), removed: (r.data ?? []).map((x: { product_slug: string }) => x.product_slug) };
}
export async function fetchPromos(): Promise<Promo[]> {
  const sb = getSupabase(); if (!sb) return [];
  const { data } = await sb.from("promos").select("*"); return (data ?? []).map(promoFromRow);
}
export async function fetchDrops(): Promise<Drop[]> {
  const sb = getSupabase(); if (!sb) return [];
  const { data } = await sb.from("drops").select("*").order("at_time"); return (data ?? []).map(dropFromRow);
}
export async function fetchPosts(): Promise<Post[]> {
  const sb = getSupabase(); if (!sb) return [];
  const { data } = await sb.from("posts").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(postFromRow);
}
export async function fetchReviews(): Promise<Review[]> {
  const sb = getSupabase(); if (!sb) return [];
  const { data } = await sb.from("reviews").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(reviewFromRow);
}
export async function fetchLookbooks(): Promise<Lookbook[]> {
  const sb = getSupabase(); if (!sb) return [];
  const [l, f] = await Promise.all([
    sb.from("lookbooks").select("*"),
    sb.from("lookbook_frames").select("*").order("position"),
  ]);
  const framesBySlug: Record<string, LookFrame[]> = {};
  for (const fr of (f.data ?? []) as Row[]) {
    const slug = fr.lookbook_slug as string;
    (framesBySlug[slug] ??= []).push({
      image: fr.image as string | undefined, h: (fr.h as number) ?? 400,
      bg: fr.bg as string | undefined, product: fr.product_slug as string | undefined,
      x: fr.x != null ? Number(fr.x) : undefined, y: fr.y != null ? Number(fr.y) : undefined,
      label: fr.label as string | undefined,
    });
  }
  return (l.data ?? []).map((r: Row) => ({
    slug: r.slug as string, brand: r.brand_slug as string, title: r.title as string,
    season: (r.season as string) ?? "", blurb: (r.blurb as string) ?? "",
    bg: (r.bg as string) ?? "", frames: framesBySlug[r.slug as string] ?? [],
    createdAt: r.created_at as string | undefined,
  }));
}
export async function fetchOrders(): Promise<Order[]> {
  const sb = getSupabase(); if (!sb) return [];
  const { data: os } = await sb.from("orders").select("*").order("placed_at", { ascending: false });
  if (!os?.length) return [];
  const ids = os.map((o) => o.id);
  const { data: items } = await sb.from("order_items").select("*").in("order_id", ids);
  const byOrder: Record<string, OrderItem[]> = {};
  for (const it of (items ?? []) as Row[]) (byOrder[it.order_id as string] ??= []).push(orderItemFromRow(it));
  return (os as Row[]).map((r) => orderFromRow(r, byOrder[r.id as string] ?? []));
}
export async function fetchThreads(): Promise<Thread[]> {
  const sb = getSupabase(); if (!sb) return [];
  const { data: ts } = await sb.from("threads").select("*").order("created_at", { ascending: false });
  if (!ts?.length) return [];
  const ids = ts.map((t) => t.id);
  const { data: ms } = await sb.from("messages").select("*").in("thread_id", ids).order("created_at");
  const byThread: Record<string, Message[]> = {};
  for (const m of (ms ?? []) as Row[]) (byThread[m.thread_id as string] ??= []).push({
    id: m.id as string, from: m.from_role as "shopper" | "brand", text: m.body as string, at: m.created_at as string,
  });
  return (ts as Row[]).map((t) => ({
    id: t.id as string, brand: t.brand_slug as string, shopper: (t.shopper_name as string) ?? "",
    messages: byThread[t.id as string] ?? [],
  }));
}
export async function fetchGiftCards(): Promise<GiftCard[]> {
  const sb = getSupabase(); if (!sb) return [];
  const { data } = await sb.from("gift_cards").select("*"); return (data ?? []).map(giftFromRow);
}
export async function fetchWaitlist(userId: string): Promise<string[]> {
  const sb = getSupabase(); if (!sb) return [];
  const { data } = await sb.from("waitlist").select("product_slug").eq("user_id", userId);
  return (data ?? []).map((r: { product_slug: string }) => r.product_slug);
}
export async function fetchAlerts(userId: string): Promise<string[]> {
  const sb = getSupabase(); if (!sb) return [];
  const { data } = await sb.from("price_alerts").select("product_slug").eq("user_id", userId);
  return (data ?? []).map((r: { product_slug: string }) => r.product_slug);
}
export async function fetchNotifies(userId: string): Promise<string[]> {
  const sb = getSupabase(); if (!sb) return [];
  const { data } = await sb.from("drop_notifies").select("drop_id").eq("user_id", userId);
  return (data ?? []).map((r: { drop_id: string }) => r.drop_id);
}
export async function fetchFeatured(): Promise<string | undefined> {
  const sb = getSupabase(); if (!sb) return undefined;
  const { data } = await sb.from("site_config").select("data").eq("key", "featured").maybeSingle();
  return (data?.data as { slug?: string } | null)?.slug;
}

/* -------------------- writers -------------------- */

export async function upsertBrandRow(b: Brand, ownerId: string): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  await sb.from("brands").upsert(brandToRow(b, ownerId));
}
export async function upsertProductRow(p: Product): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  await sb.from("products").upsert(productToRow(p));
  await sb.from("removed_products").delete().eq("product_slug", p.slug);
}
export async function deleteProductRow(slug: string, byUser: string): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  await sb.from("products").delete().eq("slug", slug);
  await sb.from("removed_products").upsert({ product_slug: slug, removed_by: byUser });
}
export async function upsertPromoRow(p: Promo): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  await sb.from("promos").upsert(promoToRow(p));
}
export async function deletePromoRow(id: string): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  await sb.from("promos").delete().eq("id", id);
}
export async function upsertDropRow(d: Drop): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  await sb.from("drops").upsert(dropToRow(d));
}
export async function deleteDropRow(id: string): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  await sb.from("drops").delete().eq("id", id);
}
export async function insertOrder(order: Order, buyerId: string): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  await sb.from("orders").insert({
    id: order.id, buyer_id: buyerId, subtotal: order.subtotal, shipping: order.shipping,
    total: order.total, credit: order.credit ?? null, gift: order.gift ?? null,
    promo_code: order.promo ?? null, status: order.status, placed_at: order.placedAt,
  });
  if (order.items.length) {
    await sb.from("order_items").insert(order.items.map((i) => ({
      order_id: order.id, product_slug: i.product, name: i.name, brand_slug: i.brand,
      variant: i.variant, qty: i.qty, unit: i.unit,
    })));
  }
}
export async function updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  await sb.from("orders").update({ status }).eq("id", id);
}
export async function insertReview(r: Review): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  const { data: u } = await sb.auth.getUser();
  await sb.from("reviews").insert({
    id: r.id, product_slug: r.product, author_id: u.user?.id ?? null,
    author_name: r.name, init: r.init, tint: r.tint, stars: r.stars,
    fit: r.fit, body: r.body, size: r.size, created_at: r.at,
  });
}
export async function insertPost(p: Post): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  await sb.from("posts").insert({
    id: p.id, brand_slug: p.brand, caption: p.caption, image: p.image ?? null,
    products: p.products, likes: p.likes, created_at: p.at,
  });
}
export async function deletePostRow(id: string): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  await sb.from("posts").delete().eq("id", id);
}
export async function likePostRow(id: string): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return;
  const { error } = await sb.from("post_likes").insert({ user_id: u.user.id, post_id: id });
  if (error) return; // already liked
  await sb.rpc("increment_view", { p_type: "brand", p_id: "post-" + id }); // no-op placeholder
  const { data: cur } = await sb.from("posts").select("likes").eq("id", id).maybeSingle();
  if (cur) await sb.from("posts").update({ likes: (cur.likes ?? 0) + 1 }).eq("id", id);
}
export async function upsertLookbookRow(l: Lookbook): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  await sb.from("lookbooks").upsert({ slug: l.slug, brand_slug: l.brand, title: l.title, season: l.season, blurb: l.blurb, bg: l.bg });
  await sb.from("lookbook_frames").delete().eq("lookbook_slug", l.slug);
  if (l.frames.length) {
    await sb.from("lookbook_frames").insert(l.frames.map((f, i) => ({
      lookbook_slug: l.slug, position: i, image: f.image ?? null, h: f.h,
      bg: f.bg ?? null, product_slug: f.product ?? null,
      x: f.x ?? null, y: f.y ?? null, label: f.label ?? null,
    })));
  }
}
export async function deleteLookbookRow(slug: string): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  await sb.from("lookbooks").delete().eq("slug", slug);
}
export async function insertGiftCard(g: GiftCard, buyerId: string): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  await sb.from("gift_cards").insert({
    code: g.code, amount: g.amount, balance: g.balance, to_name: g.to,
    from_name: g.from, note: g.note ?? null, buyer_id: buyerId, created_at: g.at,
  });
}
export async function lookupGiftCard(code: string): Promise<GiftCard | null> {
  const sb = getSupabase(); if (!sb) return null;
  const { data } = await sb.rpc("gift_card_lookup", { p_code: code });
  if (!data || (Array.isArray(data) && !data.length)) return null;
  const row = Array.isArray(data) ? (data[0] as Row) : (data as Row);
  return giftFromRow(row);
}
export async function debitGiftCard(code: string, amount: number): Promise<number | null> {
  const sb = getSupabase(); if (!sb) return null;
  const { data } = await sb.rpc("gift_card_debit", { p_code: code, p_amount: amount });
  return data as number | null;
}
export async function toggleWaitlistRow(userId: string, slug: string, on: boolean): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  if (on) await sb.from("waitlist").upsert({ user_id: userId, product_slug: slug });
  else await sb.from("waitlist").delete().eq("user_id", userId).eq("product_slug", slug);
}
export async function toggleAlertRow(userId: string, slug: string, on: boolean): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  if (on) await sb.from("price_alerts").upsert({ user_id: userId, product_slug: slug });
  else await sb.from("price_alerts").delete().eq("user_id", userId).eq("product_slug", slug);
}
export async function toggleNotifyRow(userId: string, dropId: string, on: boolean): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  if (on) await sb.from("drop_notifies").upsert({ user_id: userId, drop_id: dropId });
  else await sb.from("drop_notifies").delete().eq("user_id", userId).eq("drop_id", dropId);
}
export async function setFeaturedRow(slug?: string): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  await sb.from("site_config").upsert({ key: "featured", data: { slug: slug ?? null }, updated_at: new Date().toISOString() });
}
export async function upsertThread(brandSlug: string, shopperId: string, shopperName: string): Promise<string | null> {
  const sb = getSupabase(); if (!sb) return null;
  const { data: ex } = await sb.from("threads").select("id").eq("brand_slug", brandSlug).eq("shopper_id", shopperId).maybeSingle();
  if (ex) return ex.id as string;
  const { data } = await sb.from("threads").insert({ brand_slug: brandSlug, shopper_id: shopperId, shopper_name: shopperName }).select("id").maybeSingle();
  return (data?.id as string) ?? null;
}
export async function insertMessage(threadId: string, from: "shopper" | "brand", text: string): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  await sb.from("messages").insert({ thread_id: threadId, from_role: from, body: text });
}
export async function recordViewRow(type: "brand" | "product", id: string): Promise<void> {
  const sb = getSupabase(); if (!sb) return;
  await sb.rpc("increment_view", { p_type: type, p_id: id });
}

/* -------------------- realtime -------------------- */

export function subscribe(table: string, onChange: () => void): () => void {
  const sb = getSupabase(); if (!sb) return () => {};
  const ch = sb.channel(`rt-${table}-${Math.random().toString(36).slice(2, 7)}`)
    .on("postgres_changes", { event: "*", schema: "public", table }, () => onChange())
    .subscribe();
  return () => { sb.removeChannel(ch); };
}
