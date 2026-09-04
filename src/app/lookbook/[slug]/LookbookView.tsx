/* eslint-disable @next/next/no-img-element -- brand-supplied image URLs */
"use client";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { lookCount, money } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Avatar, Button, Label, Placeholder, Page } from "@/components/ui";

export default function LookbookView({ slug }: { slug: string }) {
  const { allLookbooks, brands, products, addToBag, openBag, priceOf, hydrated } = useApp();
  const [spot, setSpot] = useState(0);
  const l = allLookbooks.find((x) => x.slug === slug);
  const b = l ? brands.find((x) => x.slug === l.brand) : undefined;
  if (!l || !b) return <Page className="pt-20 text-center"><h1 className="mb-2 text-[28px] font-bold tracking-[-.03em]">{hydrated ? "No lookbook here." : "Loading…"}</h1>{hydrated && <Link href="/lookbooks" className="font-semibold text-navy">All lookbooks →</Link>}</Page>;
  const { looks, shoppable } = lookCount(l);
  const shopAll = () => { l.frames.forEach((f) => { const p = f.product && products.find((x) => x.slug === f.product); if (p) addToBag(p.slug, `${(p.sizes ?? ["M"])[0]} · ${(p.colors ?? ["Default"])[0]}`); }); openBag(); };
  return (
    <Page className="pt-6 md:pt-10">
      <div className="mb-6 md:mb-[34px] flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div className="max-w-[620px]">
          <Label className="mb-3 md:mb-[14px]">{b.name} · {l.season}</Label>
          <h1 className="mb-3 md:mb-[14px] text-[34px] md:text-[62px] font-bold leading-[.98] tracking-[-.045em]">{l.title}</h1>
          <p className="text-[15px] md:text-[16px] leading-[1.6] text-ink/60">{l.blurb}</p>
        </div>
        <div className="flex flex-none gap-[10px]"><Button size="lg" onClick={shopAll}>Shop all {shoppable}</Button><Link href={`/brand/${b.slug}`} className="grid h-12 w-12 place-items-center rounded-pill border border-ink/10 bg-white text-[16px]">↗</Link></div>
      </div>
      <div className="grid gap-3 md:gap-5 sm:grid-cols-2 lg:grid-cols-3 items-start">
        {l.frames.map((f, i) => {
          const p = f.product ? products.find((x) => x.slug === f.product) : undefined;
          const dark = f.bg === "#121A24";
          return (
            <div key={i} className={clsx("relative overflow-hidden rounded-2xl md:rounded-lg", !f.bg && !f.image && "stripes-wide")} style={{ height: f.h * (i % 2 ? 0.8 : 0.85), background: f.bg }}>
              {f.image ? <img src={f.image} alt={f.label ?? `Look ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" /> : <div className={clsx("mono absolute inset-0 grid place-items-center text-[10px] font-medium uppercase tracking-[.12em]", dark ? "text-paper/50" : "text-ink/32")}>{f.label ?? `Look ${String(i + 1).padStart(2, "0")}`}</div>}
              {p && <button onClick={() => setSpot(spot === i ? -1 : i)} className="glass-chip absolute grid h-[34px] w-[34px] place-items-center rounded-pill text-[12.5px] font-semibold" style={{ left: `${f.x ?? 50}%`, top: `${f.y ?? 50}%` }}>{l.frames.slice(0, i + 1).filter((x) => x.product).length}</button>}
              {p && spot === i && (
                <div className="glass absolute inset-x-4 bottom-4 md:inset-x-5 md:bottom-5 flex items-center gap-[14px] rounded-xl p-[14px]">
                  <Placeholder src={p.image} className="h-[66px] w-[58px] flex-none rounded-[9px]" />
                  <div className="min-w-0 flex-1"><div className="label mb-1 !text-[9.5px]">{b.name}</div><Link href={`/product/${p.slug}`} className="mb-1 block text-[13.5px] font-medium leading-[1.25]">{p.name}</Link><div className="text-[13px] font-medium">{money(priceOf(p).price)}</div></div>
                  <button onClick={() => { addToBag(p.slug, `${(p.sizes ?? ["M"])[0]} · ${(p.colors ?? ["Default"])[0]}`); openBag(); }} className="press grid h-10 w-10 flex-none place-items-center rounded-pill bg-ink text-[15px] text-white">+</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="glass fixed inset-x-4 bottom-[74px] z-30 flex items-center gap-3 rounded-pill p-3 md:hidden"><div className="px-[10px] text-[12.5px] font-medium text-ink/60">{shoppable} shoppable</div><Button className="flex-1" onClick={shopAll}>Shop the looks</Button></div>
      <div className="mt-10 flex items-center gap-3 rounded-lg bg-white p-4 border border-ink/5"><Avatar init={b.init} tint={b.tint} ink={b.ink} size={40} src={b.logo} /><div className="flex-1 text-[13.5px]"><span className="font-semibold">{b.name}</span> <span className="text-ink/50">· {b.city}, {b.country} · {looks} looks</span></div><Link href={`/brand/${b.slug}`} className="text-[12.5px] font-semibold text-navy">Visit brand →</Link></div>
    </Page>
  );
}
