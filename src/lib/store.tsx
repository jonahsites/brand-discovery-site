"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { BRANDS, PRODUCTS, SHIP_OPTS, productBySlug, type Brand, type Product } from "./data";

export type BagItem = { key: string; product: string; variant: string; qty: number };

type State = {
  bag: BagItem[];
  follows: string[];
  saved: string[];
  ship: Record<string, number>;
  bagOpen: boolean;
  searchOpen: boolean;
};

type Ctx = State & {
  bagCount: number;
  bagGroups: { brand: Brand; items: (BagItem & { p: Product; total: number })[]; shipCost: number }[];
  subtotal: number;
  shipTotal: number;
  total: number;
  addToBag: (product: string, variant: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  toggleFollow: (slug: string) => void;
  isFollowing: (slug: string) => boolean;
  toggleSaved: (slug: string) => void;
  isSaved: (slug: string) => boolean;
  setShip: (brand: string, idx: number) => void;
  openBag: (v?: boolean) => void;
  openSearch: (v?: boolean) => void;
};

const DEFAULT_BAG: BagItem[] = [
  { key: "panel-work-jacket|XL · Faded black", product: "panel-work-jacket", variant: "XL · Faded black", qty: 1 },
  { key: "wide-wool-trouser|L · Bone", product: "wide-wool-trouser", variant: "L · Bone", qty: 1 },
  { key: "heavyweight-crew|L · Ecru", product: "heavyweight-crew", variant: "L · Ecru", qty: 2 },
  { key: "sail-overshirt|M · Salt", product: "sail-overshirt", variant: "M · Salt", qty: 1 },
];

const AppContext = createContext<Ctx | null>(null);
const LS = "kindred.v1";

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({
    bag: DEFAULT_BAG, follows: ["form-and-void", "onda-studio"], saved: ["cotton-chore-coat", "sail-overshirt", "felted-cardigan", "ripstop-cargo", "wide-wool-trouser", "boxy-poplin-shirt"],
    ship: {}, bagOpen: false, searchOpen: false,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(LS);
        if (raw) {
          const s = JSON.parse(raw);
          setState((p) => ({ ...p, bag: s.bag ?? p.bag, follows: s.follows ?? p.follows, saved: s.saved ?? p.saved, ship: s.ship ?? p.ship }));
        }
      } catch {}
      setHydrated(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(LS, JSON.stringify({ bag: state.bag, follows: state.follows, saved: state.saved, ship: state.ship })); } catch {}
  }, [state.bag, state.follows, state.saved, state.ship, hydrated]);

  useEffect(() => {
    const anyOpen = state.bagOpen || state.searchOpen;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setState((p) => ({ ...p, bagOpen: false, searchOpen: false })); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.bagOpen, state.searchOpen]);

  const addToBag = useCallback((product: string, variant: string, qty = 1) => {
    setState((p) => {
      const key = product + "|" + variant;
      const ex = p.bag.find((b) => b.key === key);
      const bag = ex ? p.bag.map((b) => (b.key === key ? { ...b, qty: b.qty + qty } : b)) : [...p.bag, { key, product, variant, qty }];
      return { ...p, bag };
    });
  }, []);
  const setQty = useCallback((key: string, qty: number) => setState((p) => ({ ...p, bag: p.bag.map((b) => (b.key === key ? { ...b, qty: Math.max(1, qty) } : b)) })), []);
  const removeItem = useCallback((key: string) => setState((p) => ({ ...p, bag: p.bag.filter((b) => b.key !== key) })), []);
  const toggleFollow = useCallback((slug: string) => setState((p) => ({ ...p, follows: p.follows.includes(slug) ? p.follows.filter((s) => s !== slug) : [...p.follows, slug] })), []);
  const toggleSaved = useCallback((slug: string) => setState((p) => ({ ...p, saved: p.saved.includes(slug) ? p.saved.filter((s) => s !== slug) : [...p.saved, slug] })), []);
  const setShip = useCallback((brand: string, idx: number) => setState((p) => ({ ...p, ship: { ...p.ship, [brand]: idx } })), []);
  const openBag = useCallback((v = true) => setState((p) => ({ ...p, bagOpen: v, searchOpen: v ? false : p.searchOpen })), []);
  const openSearch = useCallback((v = true) => setState((p) => ({ ...p, searchOpen: v, bagOpen: v ? false : p.bagOpen })), []);

  const derived = useMemo(() => {
    const groupsMap = new Map<string, Ctx["bagGroups"][number]>();
    for (const it of state.bag) {
      const p = productBySlug(it.product);
      if (!p) continue;
      const brand = BRANDS.find((b) => b.slug === p.brand)!;
      if (!groupsMap.has(brand.slug)) {
        const idx = state.ship[brand.slug] ?? 0;
        groupsMap.set(brand.slug, { brand, items: [], shipCost: SHIP_OPTS[brand.slug].opts[idx].cost });
      }
      groupsMap.get(brand.slug)!.items.push({ ...it, p, total: p.price * it.qty });
    }
    const bagGroups = [...groupsMap.values()];
    const subtotal = bagGroups.reduce((s, g) => s + g.items.reduce((a, i) => a + i.total, 0), 0);
    const shipTotal = bagGroups.reduce((s, g) => s + g.shipCost, 0);
    return { bagGroups, subtotal, shipTotal, total: subtotal + shipTotal, bagCount: state.bag.reduce((s, b) => s + b.qty, 0) };
  }, [state.bag, state.ship]);

  const value: Ctx = {
    ...state, ...derived,
    addToBag, setQty, removeItem, toggleFollow, toggleSaved, setShip, openBag, openSearch,
    isFollowing: (s) => state.follows.includes(s),
    isSaved: (s) => state.saved.includes(s),
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const c = useContext(AppContext);
  if (!c) throw new Error("useApp outside AppProvider");
  return c;
}

export { PRODUCTS };
