"use client";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { CHIPS, PRODUCTS } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { Button, Chip, Label } from "@/components/ui";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const MATERIALS = ["Recycled", "Organic cotton", "Deadstock", "Merino", "Small batch"];
const BRAND_SIZES = ["Indie · under 1k followers", "Rising · 1k–10k", "Established · 10k+"];

export default function Explore() {
  const [chip, setChip] = useState("All");
  const [open, setOpen] = useState(false);
  const [sizes, setSizes] = useState(["M", "L"]);
  const [mats, setMats] = useState(["Recycled"]);
  const [bsz, setBsz] = useState([0]);
  const [sale, setSale] = useState(false);
  const grid = useMemo(() => PRODUCTS.filter((p) => chip === "All" || p.category === chip || (chip === "Sustainable" && !!p.tag)).filter((p) => !sale || !!p.compareAt), [chip, sale]);
  const count = (open ? 2 : 0) + sizes.length + mats.length + bsz.length + (sale ? 1 : 0);
  const toggle = <T,>(arr: T[], v: T, set: (a: T[]) => void) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  return (
    <>
      <div className="glass-bar sticky top-[64px] md:top-[76px] z-30 !shadow-none">
        <div className="mx-auto flex h-[60px] md:h-[72px] max-w-[1440px] items-center gap-[10px] px-4 md:px-10">
          <button onClick={() => setOpen(true)} className="press flex flex-none items-center gap-2 rounded-pill border border-black/12 bg-white px-4 md:px-5 py-[10px] text-[12.5px] font-semibold">≡ <span className="hidden sm:inline">Filters</span><span className="rounded-pill bg-sky px-[7px] py-[2px] text-[10px] font-semibold">{count}</span></button>
          <div className="h-[26px] w-px bg-black/10" />
          <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
            {CHIPS.map((c) => <Chip key={c} active={chip === c} onClick={() => setChip(c)}>{c}</Chip>)}
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-[1440px] px-4 md:px-10 pt-6 pb-16">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <div>
            <h1 className="mb-[5px] text-[26px] md:text-[30px] font-bold leading-[1.05] tracking-[-.035em]">{chip === "All" ? "Everything, everywhere" : chip}</h1>
            <div className="text-[12.5px] text-black/48">{chip === "All" ? "1,284" : "218"} pieces from 64 independent brands</div>
          </div>
          <button className="hidden sm:block rounded-pill border border-black/10 bg-white px-[18px] py-[10px] text-[12.5px] font-medium">Sort · Newest ▾</button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
          {grid.map((p) => <ProductCard key={p.slug} p={p} hoverAdd tall />)}
        </div>
        {grid.length === 0 && <div className="rounded-lg bg-white p-10 text-center text-[14px] text-black/55">Nothing in {chip} yet. Brands are onboarding — check back Friday.</div>}
      </main>

      {open && (
        <div className="fixed inset-0 z-50">
          <div onClick={() => setOpen(false)} className="absolute inset-0 bg-black/18 backdrop-blur-[2px]" />
          <div className="glass absolute bottom-3 right-3 top-3 left-3 md:left-auto md:w-[392px] overflow-auto rounded-lg p-5 md:p-[26px]" style={{ backdropFilter: "blur(30px)" }}>
            <div className="mb-6 flex items-center justify-between">
              <div className="text-[22px] font-bold tracking-[-.03em]">Filters</div>
              <button onClick={() => setOpen(false)} className="press grid h-[38px] w-[38px] place-items-center rounded-pill border border-white/90 bg-white/80 text-[15px]">✕</button>
            </div>
            <Label className="mb-3">Price</Label>
            <div className="mb-[10px] flex justify-between text-[13px] font-medium"><span>$40</span><span>$620</span></div>
            <div className="relative mb-[26px] h-[5px] rounded-pill bg-black/10">
              <div className="absolute inset-y-0 left-[12%] right-[34%] rounded-pill bg-black" />
              <div className="absolute left-[12%] top-[-7px] h-[19px] w-[19px] -ml-[9px] rounded-pill bg-white shadow-[0_2px_8px_rgba(0,0,0,.2)]" />
              <div className="absolute right-[34%] top-[-7px] h-[19px] w-[19px] -mr-[9px] rounded-pill bg-white shadow-[0_2px_8px_rgba(0,0,0,.2)]" />
            </div>
            <Label className="mb-3">Size</Label>
            <div className="mb-[26px] flex flex-wrap gap-[7px]">
              {SIZES.map((s) => <button key={s} onClick={() => toggle(sizes, s, setSizes)} className={clsx("press min-w-[46px] rounded-pill border py-[10px] text-center text-[12.5px] font-medium", sizes.includes(s) ? "bg-black text-white border-black" : "bg-white/75 border-black/10")}>{s}</button>)}
            </div>
            <Label className="mb-3">Colour</Label>
            <div className="mb-[26px] flex gap-[10px]">
              {["#1A1A1A", "#EDF1F4", "#C7DCEF", "#DBE1EF", "#456F94", "#1C3247"].map((c, i) => <button key={c} className="h-[30px] w-[30px] rounded-pill" style={{ background: c, boxShadow: i === 0 ? "0 0 0 2px rgba(255,255,255,.9),0 0 0 3.5px #1A1A1A" : c === "#EDF1F4" ? "inset 0 0 0 1px rgba(0,0,0,.1)" : undefined }} />)}
            </div>
            <Label className="mb-3">Brand size</Label>
            <div className="mb-[26px] flex flex-col gap-2">
              {BRAND_SIZES.map((b, i) => (
                <button key={b} onClick={() => toggle(bsz, i, setBsz)} className={clsx("flex items-center justify-between rounded-[16px] px-4 py-3 text-left text-[13px] font-medium", bsz.includes(i) ? "bg-white/75" : "bg-white/50 text-black/60")}>
                  {b}<span className={clsx("grid h-5 w-5 place-items-center rounded-[6px] text-[11px] font-semibold", bsz.includes(i) ? "bg-black text-white" : "border border-black/18")}>{bsz.includes(i) ? "✓" : ""}</span>
                </button>
              ))}
            </div>
            <Label className="mb-3">Materials &amp; values</Label>
            <div className="mb-[26px] flex flex-wrap gap-[7px]">
              {MATERIALS.map((m) => <button key={m} onClick={() => toggle(mats, m, setMats)} className={clsx("press rounded-pill px-[15px] py-[9px] text-[12px] font-medium", mats.includes(m) ? "bg-navy text-offwhite" : "bg-white/75 border border-black/8")}>{m}</button>)}
            </div>
            <Label className="mb-3">Ships from</Label>
            <div className="mb-3 rounded-[16px] bg-white/75 px-4 py-[13px] text-[13px] font-medium">Portugal, Japan, UK ▾</div>
            <button onClick={() => setSale(!sale)} className="mb-[26px] flex w-full items-center justify-between rounded-[16px] bg-white/50 px-4 py-[14px] text-[13px] font-medium">On sale only
              <span className={clsx("relative h-[26px] w-11 rounded-pill transition-colors", sale ? "bg-black" : "bg-black/14")}><span className={clsx("absolute top-[3px] h-5 w-5 rounded-pill bg-white transition-all", sale ? "left-[21px]" : "left-[3px]")} /></span>
            </button>
            <div className="flex gap-[10px]">
              <Button full size="lg" onClick={() => setOpen(false)}>Show {grid.length} pieces</Button>
              <Button variant="secondary" size="lg" onClick={() => { setSizes([]); setMats([]); setBsz([]); setSale(false); }}>Clear</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
