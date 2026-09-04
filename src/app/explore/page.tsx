"use client";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { CHIPS, MATERIAL_OPTIONS, REGION_OPTIONS, VALUE_OPTIONS, SIZE_LADDER } from "@/lib/data";
import { filterProducts, searchCatalog, type Filters } from "@/lib/catalog";
import { useApp } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import { Button, Chip, Label } from "@/components/ui";

const TIERS = [["Indie", "Indie · under 1k followers"], ["Rising", "Rising · 1k–10k"], ["Established", "Established · 10k+"]];
const SORTS = ["Newest", "Price · low to high", "Price · high to low", "Most followed"];

export default function Explore() { return <Suspense><ExploreInner /></Suspense>; }

function ExploreInner() {
  const sp = useSearchParams(); const router = useRouter();
  const { products, brands, promos, priceOf, sizes: mySizes, sizeOnly, setSizeOnly } = useApp();
  const q = sp.get("q") ?? "";
  const [chip, setChip] = useState(sp.get("cat") ?? "All");
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState(SORTS[0]);
  const [f, setF] = useState<Filters>({ sizes: [], tiers: [], materials: [], values: [], shipsFrom: [], sale: false, price: [0, 700] });
  const tog = (k: "sizes" | "tiers" | "materials" | "values" | "shipsFrom", v: string) => setF((p) => ({ ...p, [k]: p[k]!.includes(v) ? p[k]!.filter((x) => x !== v) : [...p[k]!, v] }));

  const results = useMemo(() => {
    let base = products;
    let why: string[] = [];
    if (q) { const s = searchCatalog(q, brands, products, promos); base = s.products.map((h) => h.item); why = s.terms; if (s.maxPrice) why.push(`under $${s.maxPrice}`); }
    let list = filterProducts(base, brands, promos, { ...f, category: chip, sizes: sizeOnly && !(f.sizes?.length) ? [mySizes.tops] : f.sizes });
    const bmap = new Map(brands.map((b) => [b.slug, b]));
    if (sort === SORTS[1]) list = [...list].sort((a, b) => priceOf(a).price - priceOf(b).price);
    if (sort === SORTS[2]) list = [...list].sort((a, b) => priceOf(b).price - priceOf(a).price);
    if (sort === SORTS[3]) list = [...list].sort((a, b) => (bmap.get(b.brand)?.followers ?? 0) - (bmap.get(a.brand)?.followers ?? 0));
    if (sort === SORTS[0] && !q) list = [...list].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    return { list, why };
  }, [products, brands, promos, q, chip, f, sort, priceOf, sizeOnly, mySizes.tops]);
  const grid = results.list;
  const count = (f.sizes?.length ?? 0) + (f.tiers?.length ?? 0) + (f.materials?.length ?? 0) + (f.values?.length ?? 0) + (f.shipsFrom?.length ?? 0) + (f.sale ? 1 : 0) + (f.price && (f.price[0] > 0 || f.price[1] < 700) ? 1 : 0);
  const brandCount = new Set(grid.map((p) => p.brand)).size;

  return (
    <>
      <div className="glass-bar sticky top-[56px] md:top-[64px] z-30">
        <div className="mx-auto flex h-[60px] md:h-[72px] max-w-[1440px] items-center gap-[10px] px-4 md:px-10">
          <button onClick={() => setOpen(true)} className="press flex flex-none items-center gap-2 rounded-pill border border-black/12 bg-white px-4 md:px-5 py-[10px] text-[12.5px] font-semibold">≡ <span className="hidden sm:inline">Filters</span>{count > 0 && <span className="rounded-pill bg-sky px-[7px] py-[2px] text-[10px] font-semibold">{count}</span>}</button>
          <div className="h-[26px] w-px bg-black/10" />
          <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">{CHIPS.map((c) => <Chip key={c} active={chip === c} onClick={() => setChip(c)}>{c}</Chip>)}</div>
        </div>
      </div>
      <main className="mx-auto max-w-[1440px] px-4 md:px-10 pt-6 pb-16">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-[5px] text-[26px] md:text-[30px] font-bold leading-[1.05] tracking-[-.035em]">{q ? `“${q}”` : chip === "All" ? "Everything, everywhere" : chip}</h1>
            <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-black/48">
              <span>{grid.length} piece{grid.length === 1 ? "" : "s"} from {brandCount} independent brand{brandCount === 1 ? "" : "s"}</span>
              {q && <>{results.why.slice(0, 6).map((w) => <span key={w} className="rounded-pill bg-peri px-2 py-[2px] text-[11px] font-medium text-ink">{w}</span>)}<button onClick={() => router.push("/explore")} className="text-[12px] font-semibold text-navy">Clear ✕</button></>}
            </div>
          </div>
          <div className="flex items-center gap-2"><button onClick={() => setSizeOnly(!sizeOnly)} className={clsx("press rounded-pill border px-4 py-[10px] text-[12.5px] font-medium", sizeOnly ? "bg-sky border-sky" : "bg-white border-black/10")}>{sizeOnly ? "✓ " : ""}My size · {mySizes.tops}</button><select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-pill border border-black/10 bg-white px-[18px] py-[10px] text-[12.5px] font-medium outline-none">{SORTS.map((s) => <option key={s}>{s}</option>)}</select></div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">{grid.map((p) => <ProductCard key={p.slug} p={p} hoverAdd tall />)}</div>
        {grid.length === 0 && <div className="rounded-lg bg-white p-10 text-center text-[14px] text-black/55">Nothing matches yet. Try fewer filters, or <button onClick={() => { setF({ sizes: [], tiers: [], materials: [], values: [], shipsFrom: [], sale: false, price: [0, 700] }); setChip("All"); }} className="font-semibold text-navy">clear everything</button>.</div>}
      </main>

      {open && (
        <div className="fixed inset-0 z-50">
          <div onClick={() => setOpen(false)} className="absolute inset-0 bg-black/18 backdrop-blur-[2px]" />
          <div className="glass absolute bottom-3 right-3 top-3 left-3 md:left-auto md:w-[392px] overflow-auto rounded-lg p-5 md:p-[26px]" style={{ backdropFilter: "blur(30px)" }}>
            <div className="mb-6 flex items-center justify-between"><div className="text-[22px] font-bold tracking-[-.03em]">Filters</div><button onClick={() => setOpen(false)} className="press grid h-[38px] w-[38px] place-items-center rounded-pill border border-white/90 bg-white/80 text-[15px]">✕</button></div>
            <Label className="mb-3">Price</Label>
            <div className="mb-[10px] flex justify-between text-[13px] font-medium"><span>${f.price![0]}</span><span>${f.price![1]}{f.price![1] >= 700 ? "+" : ""}</span></div>
            <div className="mb-6 flex gap-3"><input type="range" min={0} max={700} step={10} value={f.price![0]} onChange={(e) => setF((p) => ({ ...p, price: [Math.min(Number(e.target.value), p.price![1] - 10), p.price![1]] }))} className="w-full accent-black" /><input type="range" min={0} max={700} step={10} value={f.price![1]} onChange={(e) => setF((p) => ({ ...p, price: [p.price![0], Math.max(Number(e.target.value), p.price![0] + 10)] }))} className="w-full accent-black" /></div>
            <Label className="mb-3">Size</Label>
            <div className="mb-[26px] flex flex-wrap gap-[7px]">{SIZE_LADDER.slice(1, 7).map((s) => <button key={s} onClick={() => tog("sizes", s)} className={clsx("press min-w-[46px] rounded-pill border py-[10px] text-center text-[12.5px] font-medium", f.sizes!.includes(s) ? "bg-black text-white border-black" : "bg-white/75 border-black/10")}>{s}</button>)}</div>
            <Label className="mb-3">Brand size</Label>
            <div className="mb-[26px] flex flex-col gap-2">{TIERS.map(([k, l]) => <button key={k} onClick={() => tog("tiers", k)} className={clsx("flex items-center justify-between rounded-[10px] px-4 py-3 text-left text-[13px] font-medium", f.tiers!.includes(k) ? "bg-white/75" : "bg-white/50 text-black/60")}>{l}<span className={clsx("grid h-5 w-5 place-items-center rounded-[6px] text-[11px] font-semibold", f.tiers!.includes(k) ? "bg-black text-white" : "border border-black/18")}>{f.tiers!.includes(k) ? "✓" : ""}</span></button>)}</div>
            <Label className="mb-3">Materials</Label>
            <div className="mb-[26px] flex flex-wrap gap-[7px]">{MATERIAL_OPTIONS.map((m) => <button key={m} onClick={() => tog("materials", m)} className={clsx("press rounded-pill px-[13px] py-[8px] text-[12px] font-medium", f.materials!.includes(m) ? "bg-navy text-offwhite" : "bg-white/75 border border-black/8")}>{m}</button>)}</div>
            <Label className="mb-3">Values</Label>
            <div className="mb-[26px] flex flex-wrap gap-[7px]">{VALUE_OPTIONS.map((m) => <button key={m} onClick={() => tog("values", m)} className={clsx("press rounded-pill px-[13px] py-[8px] text-[12px] font-medium", f.values!.includes(m) ? "bg-navy text-offwhite" : "bg-white/75 border border-black/8")}>{m}</button>)}</div>
            <Label className="mb-3">Ships from</Label>
            <div className="mb-[26px] flex flex-wrap gap-[7px]">{["NL", "PT", "JP", "DK", "AU", ...REGION_OPTIONS.filter((r) => r !== "Worldwide")].map((m) => <button key={m} onClick={() => tog("shipsFrom", m)} className={clsx("press rounded-pill px-[13px] py-[8px] text-[12px] font-medium", f.shipsFrom!.includes(m) ? "bg-black text-white" : "bg-white/75 border border-black/8")}>{m}</button>)}</div>
            <button onClick={() => setF((p) => ({ ...p, sale: !p.sale }))} className="mb-[26px] flex w-full items-center justify-between rounded-[10px] bg-white/50 px-4 py-[14px] text-[13px] font-medium">On sale only<span className={clsx("relative h-[26px] w-11 rounded-pill transition-colors", f.sale ? "bg-black" : "bg-black/14")}><span className={clsx("absolute top-[3px] h-5 w-5 rounded-pill bg-white transition-all", f.sale ? "left-[21px]" : "left-[3px]")} /></span></button>
            <div className="flex gap-[10px]"><Button full size="lg" onClick={() => setOpen(false)}>Show {grid.length} piece{grid.length === 1 ? "" : "s"}</Button><Button variant="secondary" size="lg" onClick={() => setF({ sizes: [], tiers: [], materials: [], values: [], shipsFrom: [], sale: false, price: [0, 700] })}>Clear</Button></div>
          </div>
        </div>
      )}
    </>
  );
}
