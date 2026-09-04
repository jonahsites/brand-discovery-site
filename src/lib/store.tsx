"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type Brand, type Product, type Promo, type Drop, type Order, type GiftCard, type Review, type Post, type Thread, type Lookbook } from "./data";
import { computeCart, pointsEarned, type BagGroup } from "./cart";
import { getSupabase, supabaseEnabled } from "./supabase";
import { slugify } from "./catalog";
import { LOOKBOOKS } from "./data";
import { allBrands, allProducts, effectivePrice } from "./catalog";

export type { BagItem, BagGroup, BagLine } from "./cart";
import type { BagItem } from "./cart";
export type Session = { role: "shopper" | "brand"; name: string; brand?: string };
export type Account = { name: string; email: string; provider: "email" | "x" | "apple" | "google"; signedIn: boolean; createdAt: string; pendingConfirmation?: boolean };

type Persisted = {
  bag: BagItem[]; follows: string[]; saved: string[]; ship: Record<string, number>;
  session: Session;
  customBrands: Brand[]; customProducts: Product[]; removedProducts: string[];
  promos: Promo[]; drops: Drop[]; orders: Order[]; reviews: Review[];
  styleTags: string[]; sizes: { tops: string; waist: string; shoe: string };
  notify: string[]; alerts: string[]; promoCode?: string;
  posts: Post[]; threads: Thread[]; sizeOnly: boolean;
  lookbooks: Lookbook[]; waitlist: string[]; featured?: string; recent: string[]; redeem: number; giftCards: GiftCard[]; giftCode?: string; referredBy?: string;
  account?: Account; onboarded: boolean;
  boards: { id: string; name: string; products: string[] }[]; views: Record<string, number>;
};
type Toast = { id: string; text: string; href?: string };
type State = Persisted & { bagOpen: boolean; searchOpen: boolean; toasts: Toast[] };

type Ctx = State & {
  hydrated: boolean;
  brands: Brand[]; products: Product[];
  bagCount: number; bagGroups: BagGroup[]; subtotal: number; shipTotal: number; discount: number; promoDiscount: number; credit: number; giftCredit: number; total: number;
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
  referralCode: string; applyReferral: (code: string) => boolean;
  signUp: (a: { name: string; email: string; password?: string; provider: Account["provider"] }) => Promise<{ ok: true; needsConfirmation?: boolean } | { ok: false; error: string }>; logIn: (email: string, password?: string) => Promise<{ ok: true } | { ok: false; error: string }>; logOut: () => Promise<void>; completeOnboarding: () => Promise<void>; requestPasswordReset: (email: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  buyGiftCard: (g: { amount: number; to: string; from: string; note?: string }) => string; applyGiftCode: (code: string) => boolean; clearGiftCode: () => void;
  addPost: (p: Omit<Post, "id" | "at" | "likes">) => void; deletePost: (id: string) => void; likePost: (id: string) => void;
  sendMessage: (brand: string, text: string, from: "shopper" | "brand") => string;
  setSizeOnly: (v: boolean) => void;
  points: number;
  allLookbooks: Lookbook[];
  upsertLookbook: (l: Lookbook) => void; deleteLookbook: (slug: string) => void;
  renameShopper: (name: string) => void;
  toggleWaitlist: (slug: string) => void; setFeatured: (slug?: string) => void;
  markViewed: (slug: string) => void; setRedeem: (points: number) => void;
  toast: (text: string, href?: string) => void; dismissToast: (id: string) => void;
  createBoard: (name: string, product?: string) => string; toggleInBoard: (id: string, product: string) => void; deleteBoard: (id: string) => void;
  recordView: (brand: string) => void; resetDemo: () => void;
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
    { id: "post-os-1", brand: "onda-studio", image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=900&q=75&auto=format&fit=crop", caption: "Salt-washed cotton, cut once and never restocked. Shot on the seawall at 6am — the whole run is 40 pieces.", products: ["sail-overshirt", "salt-wash-tee"], at: new Date(Date.now() - 4 * 36e5).toISOString(), likes: 1204 },
    { id: "post-fv-1", brand: "form-and-void", image: "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=900&q=75&auto=format&fit=crop", caption: "Cutting the autumn run. Corozo buttons arrived from Ecuador this morning; the bone colourway goes up Friday.", products: ["panel-work-jacket"], at: new Date(Date.now() - 26 * 36e5).toISOString(), likes: 842 },
    { id: "post-ct-1", brand: "core-theory", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&q=75&auto=format&fit=crop", caption: "First cold week in Kyoto. The felted cardigan is back on the hand-flat, nine at a time.", products: ["felted-cardigan", "merino-half-zip"], at: new Date(Date.now() - 3 * 864e5).toISOString(), likes: 296 },
  ], threads: [], sizeOnly: false, lookbooks: [], waitlist: [], recent: [], redeem: 0, giftCards: [], onboarded: false,
  boards: [{ id: "board-autumn", name: "Autumn layers", products: ["felted-cardigan", "panel-work-jacket", "wide-wool-trouser"] }], views: {},
};

const AppContext = createContext<Ctx | null>(null);
const LS = "kindred.v2";
export const uid = () => Math.random().toString(36).slice(2, 10);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ ...DEFAULTS, bagOpen: false, searchOpen: false, toasts: [] });
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
    const { bagOpen: _b, searchOpen: _s, toasts: _t, ...persist } = state; void _b; void _s; void _t;
    // `look` is written resolved so the inline <head> script can apply it before hydration.
    try { localStorage.setItem(LS, JSON.stringify(persist)); } catch {}
  }, [state, hydrated]);
  // Supabase session sync: on first load pull the current session (so a reload keeps you signed
  // in), then listen for auth changes and mirror them into the local account.
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    let alive = true;
    const pull = async (userId: string) => {
      // Best-effort: profile flags, style tags, sizes, follows, saves. Ignore errors — the local
      // state stays intact if any of these fail (offline, RLS not applied yet, etc.).
      const [prof, tags, sz, fol, sav] = await Promise.all([
        sb.from("profiles").select("onboarded").eq("id", userId).maybeSingle(),
        sb.from("style_tags").select("tag").eq("user_id", userId),
        sb.from("sizes").select("tops, waist, shoe").eq("user_id", userId).maybeSingle(),
        sb.from("follows").select("brand_slug").eq("user_id", userId),
        sb.from("saves").select("product_slug").eq("user_id", userId),
      ]);
      if (!alive) return;
      setState((p) => ({
        ...p,
        onboarded: prof.data?.onboarded ?? p.onboarded,
        styleTags: tags.data?.length ? tags.data.map((r: { tag: string }) => r.tag) : p.styleTags,
        sizes: sz.data ? { tops: sz.data.tops ?? p.sizes.tops, waist: sz.data.waist ?? p.sizes.waist, shoe: sz.data.shoe ?? p.sizes.shoe } : p.sizes,
        follows: fol.data ? fol.data.map((r: { brand_slug: string }) => r.brand_slug) : p.follows,
        saved: sav.data ? sav.data.map((r: { product_slug: string }) => r.product_slug) : p.saved,
      }));
    };
    const applySession = async () => {
      const { data } = await sb.auth.getSession();
      if (!alive) return;
      const user = data.session?.user;
      if (user) {
        const meta = (user.user_metadata ?? {}) as { name?: string };
        setState((p) => ({ ...p, account: { name: meta.name ?? p.account?.name ?? (user.email ?? "").split("@")[0], email: user.email ?? "", provider: (p.account?.provider ?? "email"), signedIn: true, createdAt: p.account?.createdAt ?? new Date().toISOString(), pendingConfirmation: false } }));
        pull(user.id).catch(() => {});
      } else {
        setState((p) => (p.account?.signedIn ? { ...p, account: { ...p.account!, signedIn: false } } : p));
      }
    };
    applySession();
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      const user = session?.user;
      if (!user) { setState((p) => (p.account?.signedIn ? { ...p, account: { ...p.account!, signedIn: false } } : p)); return; }
      const meta = (user.user_metadata ?? {}) as { name?: string };
      setState((p) => ({ ...p, account: { name: meta.name ?? p.account?.name ?? (user.email ?? "").split("@")[0], email: user.email ?? "", provider: (p.account?.provider ?? "email"), signedIn: true, createdAt: p.account?.createdAt ?? new Date().toISOString(), pendingConfirmation: false } }));
      pull(user.id).catch(() => {});
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = state.bagOpen || state.searchOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setState((p) => ({ ...p, bagOpen: false, searchOpen: false })); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.bagOpen, state.searchOpen]);

  // Skip the re-render when a reducer returns an empty patch, so effects that call these never loop.
  const up = useCallback((fn: (p: State) => Partial<State>) => setState((p) => { const patch = fn(p); return Object.keys(patch).length ? { ...p, ...patch } : p; }), []);
  // Stable references for functions that are used inside effects.
  const markViewed = useCallback((slug: string) => up((p) => (p.recent[0] === slug ? {} : { recent: [slug, ...p.recent.filter((s) => s !== slug)].slice(0, 12) })), [up]);
  const recordView = useCallback((brand: string) => up((p) => ({ views: { ...p.views, [brand]: (p.views[brand] ?? 0) + 1 } })), [up]);
  const toggleIn = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const brands = useMemo(() => allBrands(state.customBrands), [state.customBrands]);
  const products = useMemo(() => allProducts(state.customProducts, state.removedProducts), [state.customProducts, state.removedProducts]);
  const priceOf = useCallback((p: Product) => effectivePrice(p, state.promos), [state.promos]);

  const derived = useMemo(() => computeCart({ bag: state.bag, ship: state.ship, promos: state.promos, promoCode: state.promoCode, redeem: state.redeem, giftCode: state.giftCode, giftCards: state.giftCards, customProducts: state.customProducts, removedProducts: state.removedProducts, brands }),
    [state.bag, state.ship, state.promos, state.customProducts, state.removedProducts, state.promoCode, state.redeem, state.giftCode, state.giftCards, brands]);
  const allLookbooks = useMemo(() => [...state.lookbooks, ...LOOKBOOKS.filter((l) => !state.lookbooks.some((c) => c.slug === l.slug))], [state.lookbooks]);
  const notifications = useMemo(() => {
    const out: Ctx["notifications"] = [];
    for (const id of state.notify) { const d = state.drops.find((x) => x.id === id); const b = d && brands.find((x) => x.slug === d.brand); if (d && b) out.push({ id: "n-" + id, kind: "drop", title: `${b.name} drops ${d.title}`, body: new Date(d.at).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" }), href: "/?feed=Drops", at: d.at }); }
    for (const slug of state.alerts) { const p = products.find((x) => x.slug === slug); if (!p) continue; const e = effectivePrice(p, state.promos); if (e.price < p.price) out.push({ id: "p-" + slug, kind: "price", title: `${p.name} dropped to $${e.price}`, body: `was $${p.price} · ${e.promo?.label ?? "on sale"}`, href: `/product/${slug}`, at: new Date().toISOString() }); }
    for (const o of state.orders.slice(0, 3)) out.push({ id: "o-" + o.id, kind: "order", title: `Order #${o.id} · ${o.status}`, body: `${o.items.length} piece${o.items.length === 1 ? "" : "s"} · $${o.total.toFixed(2)}`, href: "/account?tab=Orders", at: o.placedAt });
    for (const t of state.threads) { const last = t.messages[t.messages.length - 1]; const b = brands.find((x) => x.slug === t.brand); if (last && b && ((state.session.role === "brand") !== (last.from === "brand"))) out.push({ id: "m-" + t.id, kind: "message", title: state.session.role === "brand" ? `${t.shopper} messaged you` : `${b.name} replied`, body: last.text, href: `/messages?t=${t.id}`, at: last.at }); }
    return out.sort((a, b) => b.at.localeCompare(a.at));
  }, [state.notify, state.drops, state.alerts, state.promos, state.orders, state.threads, state.session.role, brands, products]);
  const points = useMemo(() => 1240 + (state.referredBy ? 200 : 0) + state.orders.reduce((s, o) => s + pointsEarned(o), 0), [state.orders, state.referredBy]);
  const referralCode = useMemo(() => slugify(state.session.name) || "friend", [state.session.name]);

  const value: Ctx = {
    ...state, ...derived, hydrated, brands, products, priceOf, points, allLookbooks, notifications,
    addToBag: (product, variant, qty = 1) => up((p) => { const key = product + "|" + variant; const ex = p.bag.find((b) => b.key === key); return { bag: ex ? p.bag.map((b) => (b.key === key ? { ...b, qty: b.qty + qty } : b)) : [...p.bag, { key, product, variant, qty }] }; }),
    setQty: (key, qty) => up((p) => ({ bag: p.bag.map((b) => (b.key === key ? { ...b, qty: Math.max(1, qty) } : b)) })),
    removeItem: (key) => up((p) => ({ bag: p.bag.filter((b) => b.key !== key) })),
    clearBag: () => up(() => ({ bag: [], promoCode: undefined, giftCode: undefined })),
    toggleFollow: (slug) => { const sb = getSupabase(); const on = state.follows.includes(slug); up((p) => ({ follows: toggleIn(p.follows, slug) })); if (sb) { (async () => { const { data } = await sb.auth.getUser(); if (!data.user) return; if (on) await sb.from("follows").delete().eq("user_id", data.user.id).eq("brand_slug", slug); else await sb.from("follows").upsert({ user_id: data.user.id, brand_slug: slug }); })().catch(() => {}); } },
    isFollowing: (s) => state.follows.includes(s),
    toggleSaved: (slug) => { const sb = getSupabase(); const on = state.saved.includes(slug); up((p) => ({ saved: toggleIn(p.saved, slug) })); if (sb) { (async () => { const { data } = await sb.auth.getUser(); if (!data.user) return; if (on) await sb.from("saves").delete().eq("user_id", data.user.id).eq("product_slug", slug); else await sb.from("saves").upsert({ user_id: data.user.id, product_slug: slug }); })().catch(() => {}); } },
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
        subtotal: derived.subtotal, shipping: derived.shipTotal, total: derived.total, credit: derived.credit, gift: derived.giftCredit || undefined,
      };
      up((p) => ({ orders: [order, ...p.orders], bag: [], promoCode: undefined, giftCode: undefined, redeem: 0, giftCards: derived.giftCredit && p.giftCode ? p.giftCards.map((g) => (g.code === p.giftCode ? { ...g, balance: Math.max(0, Math.round((g.balance - derived.giftCredit) * 100) / 100) } : g)) : p.giftCards, customProducts: p.customProducts.map((cp) => { const bought = order.items.filter((i) => i.product === cp.slug).reduce((s, i) => s + i.qty, 0); return bought && cp.stock !== undefined ? { ...cp, stock: Math.max(0, cp.stock - bought) } : cp; }) }));
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
    referralCode,
signUp: async ({ name, email, password, provider }) => {
      const clean = { name: name.trim(), email: email.trim().toLowerCase() };
      const sb = getSupabase();
      if (sb && provider === "email" && password) {
        const { data, error } = await sb.auth.signUp({ email: clean.email, password, options: { data: { name: clean.name }, emailRedirectTo: `${location.origin}/login` } });
        if (error) return { ok: false, error: error.message };
        // Supabase returns a user with no session when email-confirmation is on.
        const needsConfirmation = !data.session && !!data.user;
        up((p) => ({ account: { name: clean.name, email: clean.email, provider, signedIn: !needsConfirmation, createdAt: new Date().toISOString(), pendingConfirmation: needsConfirmation }, onboarded: false, styleTags: [], session: { ...p.session, role: "shopper", name: clean.name } }));
        return { ok: true, needsConfirmation };
      }
      if (sb && provider !== "email") {
        const { error } = await sb.auth.signInWithOAuth({ provider: provider === "x" ? "twitter" : provider, options: { redirectTo: `${location.origin}/onboarding` } });
        if (error) return { ok: false, error: error.message };
        return { ok: true }; // navigation goes to the provider
      }
      // Local demo mode.
      up((p) => ({ account: { name: clean.name, email: clean.email, provider, signedIn: true, createdAt: new Date().toISOString() }, onboarded: false, styleTags: [], session: { ...p.session, role: "shopper", name: clean.name } }));
      return { ok: true };
    },
    logIn: async (email, password) => {
      const sb = getSupabase();
      const clean = email.trim().toLowerCase();
      if (sb && password) {
        const { data, error } = await sb.auth.signInWithPassword({ email: clean, password });
        if (error) return { ok: false, error: error.message };
        const meta = (data.user?.user_metadata ?? {}) as { name?: string };
        up((p) => ({ account: { name: meta.name ?? p.account?.name ?? clean.split("@")[0], email: clean, provider: "email", signedIn: true, createdAt: p.account?.createdAt ?? new Date().toISOString(), pendingConfirmation: false }, session: { ...p.session, name: meta.name ?? p.session.name } }));
        return { ok: true };
      }
      const a = state.account;
      if (!a || a.email.toLowerCase() !== clean) return { ok: false, error: supabaseEnabled ? "That email needs a password with your Supabase account." : "No account on this device with that email." };
      up((p) => ({ account: { ...p.account!, signedIn: true }, session: { ...p.session, name: p.account!.name } }));
      return { ok: true };
    },
    logOut: async () => { const sb = getSupabase(); if (sb) await sb.auth.signOut(); up((p) => (p.account ? { account: { ...p.account, signedIn: false, pendingConfirmation: false } } : {})); },
    requestPasswordReset: async (email) => {
      const sb = getSupabase();
      if (!sb) return { ok: false, error: "Password reset needs Supabase; see docs/supabase-setup.md." };
      const { error } = await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${location.origin}/reset-password` });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },
    completeOnboarding: async () => {
      const sb = getSupabase();
      if (sb) {
        const { data } = await sb.auth.getUser();
        if (data.user) {
          await sb.from("profiles").update({ onboarded: true }).eq("id", data.user.id);
          if (state.styleTags.length) await sb.from("style_tags").upsert(state.styleTags.map((tag) => ({ user_id: data.user!.id, tag })), { onConflict: "user_id,tag" });
          await sb.from("sizes").upsert({ user_id: data.user.id, ...state.sizes });
          if (state.follows.length) await sb.from("follows").upsert(state.follows.map((brand_slug) => ({ user_id: data.user!.id, brand_slug })), { onConflict: "user_id,brand_slug" });
          if (state.saved.length) await sb.from("saves").upsert(state.saved.map((product_slug) => ({ user_id: data.user!.id, product_slug })), { onConflict: "user_id,product_slug" });
        }
      }
      up(() => ({ onboarded: true }));
    },
    applyReferral: (code) => { const c = code.trim().toLowerCase().replace(/^.*\/r\//, ""); if (!/^[a-z0-9-]{3,40}$/.test(c) || c === referralCode || state.referredBy) return false; up(() => ({ referredBy: c })); return true; },
    buyGiftCard: ({ amount, to, from, note }) => { const seg = () => Math.random().toString(36).replace(/[^a-z0-9]/g, "").slice(0, 4).toUpperCase().padEnd(4, "7"); const code = `KIND-${seg()}-${seg()}`; up((p) => ({ giftCards: [{ code, amount, balance: amount, to, from, note, at: new Date().toISOString() }, ...p.giftCards] })); return code; },
    applyGiftCode: (code) => { const c = code.trim().toUpperCase(); const g = state.giftCards.find((x) => x.code === c); if (!g || g.balance <= 0) return false; up(() => ({ giftCode: c })); return true; },
    clearGiftCode: () => up(() => ({ giftCode: undefined })),
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
    markViewed,
    setRedeem: (redeem) => up(() => ({ redeem: Math.max(0, Math.min(redeem, points)) })),
    toast: (text, href) => { const id = uid(); up((p) => ({ toasts: [...p.toasts, { id, text, href }] })); setTimeout(() => setState((p) => ({ ...p, toasts: p.toasts.filter((t) => t.id !== id) })), 2600); },
    dismissToast: (id) => up((p) => ({ toasts: p.toasts.filter((t) => t.id !== id) })),
    createBoard: (name, product) => { const id = uid(); up((p) => ({ boards: [...p.boards, { id, name: name.trim() || "Untitled", products: product ? [product] : [] }] })); return id; },
    toggleInBoard: (id, product) => up((p) => ({ boards: p.boards.map((b) => (b.id === id ? { ...b, products: toggleIn(b.products, product) } : b)) })),
    deleteBoard: (id) => up((p) => ({ boards: p.boards.filter((b) => b.id !== id) })),
    recordView,
    resetDemo: () => { try { localStorage.removeItem(LS); } catch {} setState({ ...DEFAULTS, bagOpen: false, searchOpen: false, toasts: [] }); },
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const c = useContext(AppContext);
  if (!c) throw new Error("useApp outside AppProvider");
  return c;
}
