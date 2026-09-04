"use client";
import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { STYLE_OPTIONS, VALUE_OPTIONS, brandTier, fmtFollowers } from "@/lib/data";
import { useApp } from "@/lib/store";
import { FollowButton } from "@/components/BrandCard";
import { Avatar, Chip, Label, Page, Placeholder } from "@/components/ui";

const TIERS = ["Indie", "Rising", "Established"];
const SORTS = ["Trending", "Newest", "Most followed", "A–Z"];

export default function Brands() { return <Suspense><BrandsInner /></Suspense>; }

function BrandsInner() {
  const sp = useSearchParams();
  const { brands, products, follows, promos, drops } = useApp();
  const [tier, setTier] = useState<string[]>([]);
  const [style, setStyle] = useState(sp.get("style") ?? "All");
  const [values, setValues] = useState<string[]>([]);
  const [country, setCountry] = useState("All");
  const [sort, setSort] = useState(SORTS[0]);
  const [showFilters, setShowFilters] = useState(false);
  const countries = useMemo(() => ["All", ...new Set(brands.map((b) => b.country))], [brands]);
  const list = useMemo(() => {
    let l = brands.filter((b) => (tier.length === 0 || tier.includes(brandTier(b.followers))) && (style === "All" || b.styles.includes(style)) && (values.length === 0 || values.some((v) => b.values.includes(v))) && (country === "All" || b.country === country));
    if (sort === "Newest") l = [...l].sort((a, b) => (b.createdAt ?? `${b.founded ?? 0}`).localeCompare(a.createdAt ?? `${a.founded ?? 0}`));
    if (sort === "Most followed") l = [...l].sort((a, b) => b.followers - a.followers);
    if (sort === "A–Z") l = [...l].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "Trending") l = [...l].sort((a, b) => (promos.some((p) => p.brand === b.slug && p.active) ? 1 : 0) + (drops.some((d) => d.brand === b.slug) ? 1 : 0) - ((promos.some((p) => p.brand === a.slug && p.active) ? 1 : 0) + (drops.some((d) => d.brand === a.slug) ? 1 : 0)) || b.followers - a.followers);
    return l;
  }, [brands, tier, style, values, country, sort, promos, drops]);
  const tog = (arr: string[], v: string, set: (a: string[]) => void) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  return (
    <>
      <div className="glass-bar sticky top-[56px] md:top-[64px] z-30">
        <div className="mx-auto flex h-[52px] md:h-[58px] max-w-[1440px] items-center gap-[10px] px-4 md:px-10">
          <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">{["All", ...STYLE_OPTIONS].map((c) => <Chip key={c} active={style === c} onClick={() => setStyle(c)}>{c}</Chip>)}</div>
        </div>
      </div>
      <Page className="pt-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="mb-[5px] text-[26px] md:text-[30px] font-extrabold leading-[1.05] tracking-[-.035em]">{style === "All" ? "Every brand on Kindred" : `${style} brands`}</h1><div className="text-[12.5px] text-ink/48">{list.length} independent label{list.length === 1 ? "" : "s"} · {list.filter((b) => brandTier(b.followers) === "Indie").length} under 1k followers</div></div>
          <div className="flex gap-2"><button onClick={() => setShowFilters(!showFilters)} className={clsx("lg:hidden rounded-pill px-4 py-[10px] text-[12px] font-semibold", showFilters ? "bg-ink text-paper" : "bg-white soft")}>≡ Filters{tier.length + values.length + (country !== "All" ? 1 : 0) > 0 ? ` · ${tier.length + values.length + (country !== "All" ? 1 : 0)}` : ""}</button><select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-pill bg-white soft px-[18px] py-[10px] text-[12px] font-semibold outline-none">{SORTS.map((s) => <option key={s}>{s}</option>)}</select></div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[240px_1fr] items-start">
          <aside className={clsx("flex-col gap-6 lg:sticky lg:top-[150px] lg:flex", showFilters ? "flex" : "hidden")}>
            <div><Label className="mb-3">Brand size</Label><div className="flex flex-wrap gap-[6px]">{TIERS.map((t) => <button key={t} onClick={() => tog(tier, t, setTier)} className={clsx("rounded-pill px-3 py-[7px] text-[12px] font-medium", tier.includes(t) ? "bg-ink text-paper" : "bg-white soft")}>{t}</button>)}</div></div>
            <div><Label className="mb-3">Based in</Label><div className="flex flex-wrap gap-[6px]">{countries.map((c) => <button key={c} onClick={() => setCountry(c)} className={clsx("rounded-pill px-3 py-[7px] text-[12px] font-medium", country === c ? "bg-ink text-paper" : "bg-white soft")}>{c}</button>)}</div></div>
            <div><Label className="mb-3">Values</Label><div className="flex flex-wrap gap-[6px]">{VALUE_OPTIONS.map((v) => <button key={v} onClick={() => tog(values, v, setValues)} className={clsx("rounded-pill px-3 py-[7px] text-[12px] font-medium", values.includes(v) ? "bg-ink text-paper" : "bg-white soft")}>{v}</button>)}</div></div>
            <Link href="/sell" className="rounded-lg bg-cream p-5"><div className="mb-1 text-[14px] font-semibold tracking-[-.02em]">Your brand isn&apos;t here?</div><div className="text-[12px] leading-[1.5] text-ink/60">Apply in five minutes. Your onboarding answers become these filters.</div></Link>
          </aside>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((b) => { const own = products.filter((p) => p.brand === b.slug); const promo = promos.find((p) => p.active && p.brand === b.slug); const drop = drops.find((d) => d.brand === b.slug); return (
              <div key={b.slug} className="card overflow-hidden rounded-lg lift">
                <Link href={`/brand/${b.slug}`}><Placeholder src={b.cover} wide className="h-[120px]" label="Cover">{(promo || drop) && <span className="glass-chip absolute left-3 top-3 rounded-pill px-3 py-[5px] text-[10.5px] font-semibold">{promo ? `${promo.pct}% off` : "Drop soon"}</span>}</Placeholder></Link>
                <div className="p-4 pt-0">
                  <div className="-mt-7 mb-2"><Avatar init={b.init} tint={b.tint} ink={b.ink} size={52} radius={14} src={b.logo} className="ring-[3px] ring-white" /></div>
                  <Link href={`/brand/${b.slug}`} className="block truncate text-[19px] font-bold leading-tight tracking-[-.03em]">{b.name}</Link>
                  <div className="mono mb-2 text-[10.5px] text-ink/45">{b.city}, {b.country} · {own.length} items · {fmtFollowers(b.followers + (follows.includes(b.slug) && b.followers === 0 ? 1 : 0))} followers</div>
                  <p className="mb-3 line-clamp-2 text-[13px] leading-[1.5] text-ink/62">{b.tagline}</p>
                  <div className="mb-4 flex flex-wrap gap-[5px]">{[brandTier(b.followers), ...b.styles.slice(0, 2), b.values[0]].filter(Boolean).map((t) => <span key={t} className="rounded-pill bg-cream px-[9px] py-[4px] text-[10.5px] font-medium">{t}</span>)}</div>
                  <div className="flex gap-2"><FollowButton slug={b.slug} size="sm" className="flex-1" /><Link href={`/brand/${b.slug}`} className="grid h-[34px] w-[34px] place-items-center rounded-pill bg-white soft text-[13px]">↗</Link></div>
                </div>
              </div>); })}
            {list.length === 0 && <div className="card col-span-full rounded-lg p-10 text-center text-[14px] text-ink/55">No brands match those filters yet.</div>}
          </div>
        </div>
      </Page>
    </>
  );
}
