"use client";
import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { CHIPS, MATERIAL_OPTIONS, VALUE_OPTIONS, SIZE_LADDER, brandTier } from "@/lib/data";
import { PRICE_BANDS, filterProducts, leadTimeOf, searchCatalog, studioOf, type Filters } from "@/lib/catalog";
import { useApp } from "@/lib/store";
import { Fob } from "@/components/Fob";
import { styleOverlap } from "@/lib/looks";
import { rankProducts, toSignal } from "@/lib/rank";
import ProductCard from "@/components/ProductCard";

const SORTS = ["For you", "Newest", "Price · low to high", "Price · high to low", "Most followed"];
type Key = "priceBands" | "leadTimes" | "studio" | "sizes" | "tiers" | "materials" | "values";
const EMPTY: Filters = { priceBands: [], leadTimes: [], studio: [], sizes: [], tiers: [], materials: [], values: [] };

export default function Explore() { return <Suspense><ExploreInner /></Suspense>; }

function ExploreInner() {
  const sp = useSearchParams(); const router = useRouter();
  const { products, brands, promos, priceOf, sizes: mySizes, sizeOnly, setSizeOnly, openSearch, styleTags, follows, saved, recent, waitlist, alerts, orders, views } = useApp();
  const q = sp.get("q") ?? "";
  const gender = sp.get("gender") ?? undefined;
  const [chip, setChip] = useState(sp.get("cat") ?? "All");
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState(SORTS[0]);
  const [f, setF] = useState<Filters>(EMPTY);
  const tog = (k: Key, v: string) => setF((p) => ({ ...p, [k]: (p[k] ?? []).includes(v) ? (p[k] ?? []).filter((x) => x !== v) : [...(p[k] ?? []), v] }));
  const count = (Object.keys(EMPTY) as Key[]).reduce((s, k) => s + (f[k]?.length ?? 0), 0) + (sizeOnly ? 1 : 0);

  const base = useMemo(() => { if (!q) return { list: products, why: [] as string[] }; const s = searchCatalog(q, brands, products, promos); const why = [...s.terms]; if (s.maxPrice) why.push(`under $${s.maxPrice}`); return { list: s.products.map((h) => h.item), why }; }, [q, products, brands, promos]);
  const grid = useMemo(() => {
    let list = filterProducts(base.list, brands, promos, { ...f, category: chip, gender: gender ? [gender] : undefined, sizes: sizeOnly && !(f.sizes?.length) ? [mySizes.tops] : f.sizes });
    const bmap = new Map(brands.map((b) => [b.slug, b]));
    if (sort === SORTS[2]) list = [...list].sort((a, b) => priceOf(a).price - priceOf(b).price);
    if (sort === SORTS[3]) list = [...list].sort((a, b) => priceOf(b).price - priceOf(a).price);
    if (sort === SORTS[4]) list = [...list].sort((a, b) => (bmap.get(b.brand)?.followers ?? 0) - (bmap.get(a.brand)?.followers ?? 0));
    if (sort === SORTS[1] && !q) list = [...list].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    if (sort === SORTS[0] && !q) { const sig = toSignal({ styleTags, sizes: mySizes, follows, saved, recent, waitlist, alerts, orders, views }); list = rankProducts(list, brands, sig); }
    return list;
  }, [base.list, brands, promos, f, chip, gender, sort, priceOf, sizeOnly, mySizes.tops, q, styleTags]);

  // facet counts against the current chip + query (not the other filters), like the design's row counts
  const pool = useMemo(() => filterProducts(base.list, brands, promos, { category: chip, gender: gender ? [gender] : undefined }), [base.list, brands, promos, chip, gender]);
  const bOf = (slug: string) => brands.find((b) => b.slug === slug)!;
  const cnt = (fn: (p: (typeof pool)[number]) => boolean) => pool.filter(fn).length;
  const groups: { title: string; key: Key; rows: [string, number][] }[] = [
    { title: "Price", key: "priceBands", rows: PRICE_BANDS.map(([n, lo, hi]) => [n, cnt((p) => { const pr = priceOf(p).price; return pr >= lo && pr <= hi; })]) },
    { title: "Lead time", key: "leadTimes", rows: ["Ships in 2 days", "Ships in 1 week", "Made to order"].map((n) => [n, cnt((p) => leadTimeOf(bOf(p.brand)) === n)]) },
    { title: "Studio", key: "studio", rows: ["Under 10 people", "Family-run", "Deadstock only"].map((n) => [n, cnt((p) => studioOf(bOf(p.brand)).includes(n))]) },
    { title: "Brand size", key: "tiers", rows: ["Indie", "Rising", "Established"].map((n) => [n, cnt((p) => brandTier(bOf(p.brand).followers) === n)]) },
    { title: "Size", key: "sizes", rows: SIZE_LADDER.slice(1, 7).map((n) => [n, cnt((p) => (p.sizes ?? ["S", "M", "L", "XL"]).includes(n))]) },
    { title: "Materials", key: "materials", rows: MATERIAL_OPTIONS.map((n) => [n, cnt((p) => bOf(p.brand).materials.includes(n) || (p.materials ?? []).includes(n))] as [string, number]).filter((r) => r[1] > 0) },
    { title: "Values", key: "values", rows: VALUE_OPTIONS.map((n) => [n, cnt((p) => bOf(p.brand).values.includes(n))] as [string, number]).filter((r) => r[1] > 0) },
  ];
  const emptyMarketplace = products.length === 0;
  const title = q ? `“${q}”` : gender ? `${gender}` : chip === "All" ? "Everything new" : chip;

  return (
    <main className="mx-auto max-w-[1440px] px-4 md:px-8 pt-4 md:pt-7 pb-16">
      <h1 className="mb-3 text-[26px] md:hidden">Explore</h1>
      <div className="flex items-center gap-3 md:gap-4">
        <button onClick={() => openSearch()} className="flex flex-1 items-center gap-3 rounded-pill bg-white px-4 md:px-5 py-3 md:py-[14px] text-left soft"><span className="text-[13px] text-ink/40">⌕</span><span className="truncate text-[12px] md:text-[13px] font-medium text-ink/40">{q || `Search ${brands.length} brands — cut, fabric, city, lead time`}</span>{q && <button onClick={(e) => { e.stopPropagation(); router.push("/explore"); }} className="ml-auto text-[11px] font-semibold text-ink/55">Clear ✕</button>}</button>
        <button onClick={() => setOpen(!open)} className={clsx("press hidden md:block rounded-pill px-[22px] py-[14px] text-[12px] font-semibold", open ? "bg-ink text-paper" : "bg-white soft")}>Filters · {count}</button>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="hidden md:block rounded-pill bg-white px-5 py-[14px] text-[12px] font-semibold outline-none soft">{SORTS.map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      <div className="no-scrollbar mt-4 md:mt-5 flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible">
        <button onClick={() => setOpen(!open)} className={clsx("press flex-none rounded-pill px-[15px] py-[9px] text-[11px] font-semibold md:hidden", open ? "bg-ink text-paper" : "bg-white soft")}>Filters {count}</button>
        {CHIPS.map((c) => <Fob key={c} active={chip === c} onClick={() => setChip(c)} size="sm">{c}</Fob>)}
      </div>
      <div className="mt-5 md:mt-[26px] flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-[20px] md:text-[34px]">{title}</h2>
        <div className="flex items-center gap-2 text-[11px] md:text-[12px] text-ink/50">{grid.length} pieces · {count ? `${count} filters on` : "no filters"}{base.why.length > 0 && <span className="hidden md:flex gap-1">{base.why.slice(0, 5).map((w) => <span key={w} className="rounded-pill bg-cream px-2 py-[2px] text-[10px] font-semibold text-ink/70">{w}</span>)}</span>}</div>
      </div>

      <div className="mt-4 md:mt-[18px] flex flex-col md:flex-row gap-5 items-start">
        {open && (
          <div className="w-full md:w-[250px] flex-none rounded-[24px] bg-cream p-5">
            <div className="flex items-center justify-between"><div className="text-[15px] font-bold tracking-[-.02em]">Refine</div><button onClick={() => setOpen(false)} className="text-[13px] text-ink/45">✕</button></div>
            <button onClick={() => setSizeOnly(!sizeOnly)} className="mt-4 flex w-full items-center gap-[10px] text-left"><span className={clsx("grid h-[17px] w-[17px] place-items-center rounded-[6px] text-[9px] font-semibold text-paper shadow-[inset_0_0_0_1px_rgba(18,26,36,.15)]", sizeOnly ? "bg-ink" : "bg-white/70")}>{sizeOnly ? "✓" : ""}</span><span className="flex-1 text-[12px] font-medium">Only my size · {mySizes.tops}</span></button>
            <div className="md:block flex flex-wrap gap-x-6">
              {groups.map((g) => (
                <div key={g.title} className="mt-5 min-w-[45%]">
                  <div className="label !tracking-[.12em]">{g.title}</div>
                  <div className="mt-[11px] flex flex-col gap-[9px]">
                    {g.rows.map(([label, n]) => { const on = (f[g.key] ?? []).includes(label); return (
                      <button key={label} onClick={() => tog(g.key, label)} className="flex items-center gap-[10px] text-left">
                        <span className={clsx("grid h-[17px] w-[17px] flex-none place-items-center rounded-[6px] text-[9px] font-semibold text-paper shadow-[inset_0_0_0_1px_rgba(18,26,36,.15)]", on ? "bg-ink" : "bg-white/70")}>{on ? "✓" : ""}</span>
                        <span className="flex-1 text-[12px] font-medium">{label}</span>
                        <span className="text-[11px] text-ink/40">{n}</span>
                      </button>); })}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { setF(EMPTY); setSizeOnly(false); }} className="mt-[22px] w-full rounded-pill bg-white py-3 text-[11px] font-semibold">Clear all</button>
          </div>
        )}
        <div className={clsx("grid min-w-0 flex-1 w-full grid-cols-2 gap-[14px] md:gap-5", open ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-4")}>
          {grid.map((p) => <ProductCard key={p.slug} p={p} hoverAdd />)}
          {grid.length === 0 && (
            emptyMarketplace ? (
              <div className="card col-span-full rounded-lg p-10 md:p-14 text-center">
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-[.14em] text-ink/50">Kindred, day one</div>
                <h2 className="mb-3 text-[28px] tracking-[-.015em]" style={{fontFamily:"var(--font-instrument), Georgia, serif"}}>No pieces here yet.</h2>
                <p className="mb-6 mx-auto max-w-[440px] text-[13.5px] text-ink/60">Kindred launched today. There will be pieces here the moment a brand opens up shop.</p>
                <Link href="/sell" className="press inline-flex rounded-sm bg-ink px-5 py-[11px] text-[12px] font-semibold text-paper">Open a brand account</Link>
              </div>
            ) : (
              <div className="card col-span-full rounded-[24px] p-10 text-center text-[13px] text-ink/55">Nothing matches yet. <button onClick={() => { setF(EMPTY); setChip("All"); setSizeOnly(false); }} className="font-semibold text-ink">Clear everything</button>.</div>
            )
          )}
        </div>
      </div>
    </main>
  );
}
