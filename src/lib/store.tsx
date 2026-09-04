"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { SHIP_OPTS, type Brand, type Product, type Promo, type Drop, type Order, type Review, type Post, type Thread, type Lookbook } from "./data";
import { LOOKBOOKS } from "./data";
import { allBrands, allProducts, effectivePrice, findProduct } from "./catalog";

export type BagItem = { key: string; product: string; variant: string; qty: number };
export type Session = { role: "shopper" | "brand"; name: string; brand?: string };

type Persisted = {
  bag: BagItem[]; follows: string[]; saved: string[]; ship: Record<string, number>;
  session: Session;
  customBrands: Brand[]; customProducts: Product[]; removedProducts: string[];
  promos: Promo[]; drops: Drop[]; orders: Order[]; reviews: Review[];
  styleTags: string[]; sizes: { tops: string; waist: string; shoe: string };
  notify: string[]; alerts: string[]; promoCode?: string;
  posts: Post[]; threads: Thread[]; sizeOnly: boolean;
  lookbooks: Lookbook[]; waitlist: string[]; featured?: string;
};
type State = Persisted & { bagOpen: boolean; searchOpen: boolean };

type BagGroup = { brand: Brand; items: (BagItem & { p: Product; unit: number; total: number })[]; shipCost: number };
type Ctx = State & {
  hydrated: boolean;
  brands: Brand[]; products: Product[];
  bagCount: number; bagGroups: BagGroup[]; subtotal: number; shipTotal: number; discount: number; total: number;
  priceOf: (p: Product) => ReturnType<typeof effectivePrice>;
  addToBag: (product: string, variant: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void; removeItem: (key: string) => void; clearBag: () => void;
  toggleFollow: (slug: string) => void; isFollowing: (slug: string) => boolean;
  toggleSaved: (slug: string) => void; isSaved: (slug: string) => boolean;
  setShip: (brand: string, idx: number) => void;
  openBag: (v?: boolean) => void; openSearch: (v?: boolean) => void;
  setSession: (s: Session) => void;
  upsertBrand: (b: Brand) => void;
  upsertProduct: (p: Product) => void; deleteProduct: (slug: string) => void;
  upsertPromo: (p: Promo) => void; deletePromo: (id: string) => void;
  upsertDrop: (d: Drop) => void; deleteDrop: (id: string) => void;
  placeOrder: () => Order | undefined; setOrderStatus: (id: string, status: Order["status"]) => void;
  addReview: (r: Omit<Review, "id" | "at">) => void;
  setStyleTags: (t: string[]) => void; setSizes: (s: Persisted["sizes"]) => void;
  toggleNotify: (dropId: string) => void; toggleAlert: (slug: string) => void;
  applyPromoCode: (code: string) => boolean; clearPromoCode: () => void;
  addPost: (p: Omit<Post, "id" | "at" | "likes">) => void; deletePost: (id: string) => void; likePost: (id: string) => void;
  sendMessage: (brand: string, text: string, from: "shopper" | "brand") => string;
  setSizeOnly: (v: boolean) => void;
  points: number;
  allLookbooks: Lookbook[];
  upsertLookbook: (l: Lookbook) => void; deleteLookbook: (slug: string) => void;
  renameShopper: (name: string) => void;
  toggleWaitlist: (slug: string) => void; setFeatured: (slug?: string) => void;
  notifications: { id: string; kind: "drop" | "price" | "order" | "message"; title: string; body: string; href: string; at: string }[];
};

const DEFAULT_BAG: BagItem[] = [
  { key: "panel-work-jacket|XL · Faded black", product: "panel-work-jacket", variant: "XL · Faded black", qty: 1 },
  { key: "wide-wool-trouser|L · Bone", product: "wide-wool-trouser", variant: "L · Bone", qty: 1 },
  { key: "heavyweight-crew|L · Ecru", product: "heavyweight-crew", variant: "L · Ecru", qty: 2 },
  { key: "sail-overshirt|M · Salt", product: "sail-overshirt", variant: "M · Salt", qty: 1 },
];
const DEFAULT_DROPS: Drop[] = [
  { id: "drop-fv-bone", brand: "form-and-void", title: "Bone colourway", at: nextFriday().toISOString(), pieces: 40, blurb: "Forty pieces cut from the last of the sailmaker's roll. Followers get the link an hour early.", products: ["panel-work-jacket", "corozo-overshirt"] },
  { id: "drop-os-salt", brand: "onda-studio", title: "Salt run 04", at: new Date(Date.now() + 9 * 864e5).toISOString(), pieces: 40, blurb: "Salt-washed overshirts, cut once, never restocked.", products: ["sail-overshirt", "salt-wash-tee"] },
];
const DEFAULT_PROMOS: Promo[] = [
  { id: "promo-ct-autumn", brand: "core-theory", code: "WARMUP", pct: 15, label: "Autumn knit week", products: "all", active: true, ends: new Date(Date.now() + 6 * 864e5).toISOString() },
];
function nextFriday() { const d = new Date(); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7)); d.setHours(9, 0, 0, 0); return d; }

const DEFAULTS: Persisted = {
  bag: DEFAULT_BAG, follows: ["form-and-void", "onda-studio"],
  saved: ["cotton-chore-coat", "sail-overshirt", "felted-cardigan", "ripstop-cargo", "wide-wool-trouser", "boxy-poplin-shirt"],
  ship: {}, session: { role: "shopper", name: "Jules Renard" },
  customBrands: [], customProducts: [], removedProducts: [], promos: DEFAULT_PROMOS, drops: DEFAULT_DROPS, orders: [], reviews: [],
  styleTags: ["Japanese streetwear", "Workwear", "Minimalist", "Deadstock", "Unisex", "Knitwear", "Under $200"],
  sizes: { tops: "L", waist: "32", shoe: "43" }, notify: [], alerts: [],
  posts: [
    { id: "post-os-1", brand: "onda-studio", caption: "Salt-washed cotton, cut once and never restocked. Shot on the seawall at 6am — the whole run is 40 pieces.", products: ["sail-overshirt", "salt-wash-tee"], at: new Date(Date.now() - 4 * 36e5).toISOString(), likes: 1204 },
    { id: "post-fv-1", brand: "form-and-void", caption: "Cutting the autumn run. Corozo buttons arrived from Ecuador this morning; the bone colourway goes up Friday.", products: ["panel-work-jacket"], at: new Date(Date.now() - 26 * 36e5).toISOString(), likes: 842 },
    { id: "post-ct-1", brand: "core-theory", caption: "First cold week in Kyoto. The felted cardigan is back on the hand-flat, nine at a time.", products: ["felted-cardigan", "merino-half-zip"], at: new Date(Date.now() - 3 * 864e5).toISOString(), likes: 296 },
  ], threads: [], sizeOnly: false, lookbooks: [], waitlist: [],
};

const AppContext = createContext<Ctx | null>(null);
const LS = "kindred.v2";
export const uid = () => Math.random().toString(36).slice(2, 10);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ ...DEFAULTS, bagOpen: false, searchOpen: false });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // setTimeout rather than requestAnimationFrame: rAF never fires in a background tab, which would leave the app un-hydrated.
    const id = setTimeout(() => {
      try { const raw = localStorage.getItem(LS); if (raw) { const s = JSON.parse(raw) as Partial<Persisted>; setState((p) => ({ ...p, ...s })); } } catch {}
      setHydrated(true);
    }, 0);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    const { bagOpen: _b, searchOpen: _s, ...persist } = state; void _b; void _s;
    try { localStorage.setItem(LS, JSON.stringify(persist)); } catch {}
  }, [state, hydrated]);
  useEffect(() => {
    document.body.style.overflow = state.bagOpen || state.searchOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setState((p) => ({ ...p, bagOpen: false, searchOpen: false })); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.bagOpen, state.searchOpen]);

  const up = useCallback((fn: (p: State) => Partial<State>) => setState((p) => ({ ...p, ...fn(p) })), []);
  const toggleIn = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const brands = useMemo(() => allBrands(state.customBrands), [state.customBrands]);
  const products = useMemo(() => allProducts(state.customProducts, state.removedProducts), [state.customProducts, state.removedProducts]);
  const priceOf = useCallback((p: Product) => effectivePrice(p, state.promos), [state.promos]);

  const derived = useMemo(() => {
    const map = new Map<string, BagGroup>();
    for (const it of state.bag) {
      const p = findProduct(it.product, state.customProducts); if (!p || state.removedProducts.includes(p.slug)) continue;
      const brand = brands.find((b) => b.slug === p.brand); if (!brand) continue;
      if (!map.has(brand.slug)) { const idx = state.ship[brand.slug] ?? 0; const opts = SHIP_OPTS[brand.slug]?.opts ?? [{ cost: 9 }]; map.set(brand.slug, { brand, items: [], shipCost: opts[Math.min(idx, opts.length - 1)].cost }); }
      const unit = effectivePrice(p, state.promos).price;
      map.get(brand.slug)!.items.push({ ...it, p, unit, total: unit * it.qty });
    }
    const bagGroups = [...map.values()];
    const subtotal = bagGroups.reduce((s, g) => s + g.items.reduce((a, i) => a + i.total, 0), 0);
    const shipTotal = bagGroups.reduce((s, g) => s + g.shipCost, 0);
    const code = state.promoCode ? state.promos.find((pr) => pr.active && pr.code.toLowerCase() === state.promoCode!.toLowerCase()) : undefined;
    const discount = code ? Math.round(bagGroups.filter((g) => g.brand.slug === code.brand).reduce((s, g) => s + g.items.reduce((a, i) => a + (i.p.price === i.unit ? i.total * code.pct / 100 : 0), 0), 0)) : 0;
    return { bagGroups, subtotal, shipTotal, discount, total: subtotal + shipTotal - discount, bagCount: state.bag.reduce((s, b) => s + b.qty, 0) };
  }, [state.bag, state.ship, state.promos, state.customProducts, state.removedProducts, state.promoCode, brands]);
  const allLookbooks = useMemo(() => [...state.lookbooks, ...LOOKBOOKS.filter((l) => !state.lookbooks.some((c) => c.slug === l.slug))], [state.lookbooks]);
  const notifications = useMemo(() => {
    const out: Ctx["notifications"] = [];
    for (const id of state.notify) { const d = state.drops.find((x) => x.id === id); const b = d && brands.find((x) => x.slug === d.brand); if (d && b) out.push({ id: "n-" + id, kind: "drop", title: `${b.name} drops ${d.title}`, body: new Date(d.at).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" }), href: "/?feed=Drops", at: d.at }); }
    for (const slug of state.alerts) { const p = products.find((x) => x.slug === slug); if (!p) continue; const e = effectivePrice(p, state.promos); if (e.price < p.price) out.push({ id: "p-" + slug, kind: "price", title: `${p.name} dropped to $${e.price}`, body: `was $${p.price} · ${e.promo?.label ?? "on sale"}`, href: `/product/${slug}`, at: new Date().toISOString() }); }
    for (const o of state.orders.slice(0, 3)) out.push({ id: "o-" + o.id, kind: "order", title: `Order #${o.id} · ${o.status}`, body: `${o.items.length} piece${o.items.length === 1 ? "" : "s"} · $${o.total.toFixed(2)}`, href: "/account?tab=Orders", at: o.placedAt });
    for (const t of state.threads) { const last = t.messages[t.messages.length - 1]; const b = brands.find((x) => x.slug === t.brand); if (last && b && ((state.session.role === "brand") !== (last.from === "brand"))) out.push({ id: "m-" + t.id, kind: "message", title: state.session.role === "brand" ? `${t.shopper} messaged you` : `${b.name} replied`, body: last.text, href: `/messages?t=${t.id}`, at: last.at }); }
    return out.sort((a, b) => b.at.localeCompare(a.at));
  }, [state.notify, state.drops, state.alerts, state.promos, state.orders, state.threads, state.session.role, brands, products]);
  const points = useMemo(() => 1240 + state.orders.reduce((s, o) => s + Math.round(o.subtotal), 0), [state.orders]);

  const value: Ctx = {
    ...state, ...derived, hydrated, brands, products, priceOf, points, allLookbooks, notifications,
    addToBag: (product, variant, qty = 1) => up((p) => { const key = product + "|" + variant; const ex = p.bag.find((b) => b.key === key); return { bag: ex ? p.bag.map((b) => (b.key === key ? { ...b, qty: b.qty + qty } : b)) : [...p.bag, { key, product, variant, qty }] }; }),
    setQty: (key, qty) => up((p) => ({ bag: p.bag.map((b) => (b.key === key ? { ...b, qty: Math.max(1, qty) } : b)) })),
    removeItem: (key) => up((p) => ({ bag: p.bag.filter((b) => b.key !== key) })),
    clearBag: () => up(() => ({ bag: [], promoCode: undefined })),
    toggleFollow: (slug) => up((p) => ({ follows: toggleIn(p.follows, slug) })),
    isFollowing: (s) => state.follows.includes(s),
    toggleSaved: (slug) => up((p) => ({ saved: toggleIn(p.saved, slug) })),
    isSaved: (s) => state.saved.includes(s),
    setShip: (brand, idx) => up((p) => ({ ship: { ...p.ship, [brand]: idx } })),
    openBag: (v = true) => up((p) => ({ bagOpen: v, searchOpen: v ? false : p.searchOpen })),
    openSearch: (v = true) => up((p) => ({ searchOpen: v, bagOpen: v ? false : p.bagOpen })),
    setSession: (session) => up(() => ({ session })),
    upsertBrand: (b) => up((p) => ({ customBrands: [b, ...p.customBrands.filter((x) => x.slug !== b.slug)] })),
    upsertProduct: (pr) => up((p) => ({ customProducts: [pr, ...p.customProducts.filter((x) => x.slug !== pr.slug)], removedProducts: p.removedProducts.filter((s) => s !== pr.slug) })),
    deleteProduct: (slug) => up((p) => ({ customProducts: p.customProducts.filter((x) => x.slug !== slug), removedProducts: [...new Set([...p.removedProducts, slug])], bag: p.bag.filter((b) => b.product !== slug) })),
    upsertPromo: (pr) => up((p) => ({ promos: [pr, ...p.promos.filter((x) => x.id !== pr.id)] })),
    deletePromo: (id) => up((p) => ({ promos: p.promos.filter((x) => x.id !== id) })),
    upsertDrop: (d) => up((p) => ({ drops: [d, ...p.drops.filter((x) => x.id !== d.id)].sort((a, b) => a.at.localeCompare(b.at)) })),
    deleteDrop: (id) => up((p) => ({ drops: p.drops.filter((x) => x.id !== id) })),
    placeOrder: () => {
      if (derived.bagGroups.length === 0) return undefined;
      const order: Order = {
        id: "UN-" + String(40912 + state.orders.length + 1), placedAt: new Date().toISOString(), status: "Placed", promo: state.promoCode,
        items: derived.bagGroups.flatMap((g) => g.items.map((i) => ({ product: i.p.slug, name: i.p.name, brand: g.brand.slug, variant: i.variant, qty: i.qty, unit: i.unit }))),
        subtotal: derived.subtotal, shipping: derived.shipTotal, total: derived.total,
      };
      up((p) => ({ orders: [order, ...p.orders], bag: [], promoCode: undefined }));
      return order;
    },
    setOrderStatus: (id, status) => up((p) => ({ orders: p.orders.map((o) => (o.id === id ? { ...o, status } : o)) })),
    addReview: (r) => up((p) => ({ reviews: [{ ...r, id: uid(), at: new Date().toISOString() }, ...p.reviews] })),
    setStyleTags: (styleTags) => up(() => ({ styleTags })),
    setSizes: (sizes) => up(() => ({ sizes })),
    toggleNotify: (id) => up((p) => ({ notify: toggleIn(p.notify, id) })),
    toggleAlert: (slug) => up((p) => ({ alerts: toggleIn(p.alerts, slug) })),
    applyPromoCode: (code) => { const ok = state.promos.some((pr) => pr.active && pr.code.toLowerCase() === code.trim().toLowerCase()); if (ok) up(() => ({ promoCode: code.trim().toUpperCase() })); return ok; },
    clearPromoCode: () => up(() => ({ promoCode: undefined })),
    addPost: (post) => up((p) => ({ posts: [{ ...post, id: uid(), at: new Date().toISOString(), likes: 0 }, ...p.posts] })),
    deletePost: (id) => up((p) => ({ posts: p.posts.filter((x) => x.id !== id) })),
    likePost: (id) => up((p) => ({ posts: p.posts.map((x) => (x.id === id ? { ...x, likes: x.likes + 1 } : x)) })),
    sendMessage: (brand, text, from) => {
      const shopper = state.session.role === "brand" ? "Jules Renard" : state.session.name;
      const existing = state.threads.find((t) => t.brand === brand && t.shopper === shopper);
      const id = existing?.id ?? uid();
      const msg = { id: uid(), from, text, at: new Date().toISOString() };
      up((p) => ({ threads: existing ? p.threads.map((t) => (t.id === id ? { ...t, messages: [...t.messages, msg] } : t)) : [{ id, brand, shopper, messages: [msg] }, ...p.threads] }));
      return id;
    },
    setSizeOnly: (sizeOnly) => up(() => ({ sizeOnly })),
    upsertLookbook: (l) => up((p) => ({ lookbooks: [l, ...p.lookbooks.filter((x) => x.slug !== l.slug)] })),
    deleteLookbook: (slug) => up((p) => ({ lookbooks: p.lookbooks.filter((x) => x.slug !== slug) })),
    renameShopper: (name) => up((p) => ({ session: { ...p.session, name: name.trim() || p.session.name } })),
    toggleWaitlist: (slug) => up((p) => ({ waitlist: toggleIn(p.waitlist, slug) })),
    setFeatured: (featured) => up(() => ({ featured })),
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const c = useContext(AppContext);
  if (!c) throw new Error("useApp outside AppProvider");
  return c;
}
