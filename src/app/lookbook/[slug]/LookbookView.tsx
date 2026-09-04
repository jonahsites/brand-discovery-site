"use client";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { LOOKS, LOOKBOOKS, brandBySlug, money, productBySlug } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Avatar, Button, Label, Placeholder, Page } from "@/components/ui";

export default function LookbookView({ l }: { l: (typeof LOOKBOOKS)[number] }) {
  const b = brandBySlug(l.brand)!;
  const { addToBag, openBag } = useApp();
  const [spot, setSpot] = useState(0);
  return (
    <Page className="pt-6 md:pt-10">
      <div className="mb-6 md:mb-[34px] flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div className="max-w-[620px]">
          <Label className="mb-3 md:mb-[14px]">{b.name} · {l.season}</Label>
          <h1 className="mb-3 md:mb-[14px] text-[34px] md:text-[62px] font-bold leading-[.98] tracking-[-.045em]">{l.title}</h1>
          <p className="text-[15px] md:text-[16px] leading-[1.6] text-black/60">{l.blurb}</p>
        </div>
        <div className="flex flex-none gap-[10px]">
          <Button size="lg">Shop all {l.shoppable}</Button>
          <Link href={`/brand/${b.slug}`} className="grid h-12 w-12 place-items-center rounded-pill border border-black/10 bg-white text-[16px]">↗</Link>
        </div>
      </div>
      <div className="grid gap-3 md:gap-5 sm:grid-cols-2 lg:grid-cols-3 items-start">
        {LOOKS.map((lk, i) => {
          const p = productBySlug(lk.product)!;
          const isColor = lk.bg.startsWith("#");
          const dark = lk.bg === "#1C3247";
          return (
            <div key={lk.n} className={clsx("relative overflow-hidden rounded-2xl md:rounded-lg", !isColor && "stripes-wide")} style={{ height: lk.h * (i % 2 ? 0.8 : 0.85), background: isColor ? lk.bg : undefined }}>
              <div className={clsx("mono absolute inset-0 grid place-items-center text-[10px] font-medium uppercase tracking-[.12em]", dark ? "text-offwhite/50" : "text-black/32")}>{lk.ph}</div>
              <button onClick={() => setSpot(spot === i ? -1 : i)} className="glass-chip absolute grid h-[34px] w-[34px] place-items-center rounded-pill text-[12.5px] font-semibold shadow-[0_6px_20px_rgba(0,0,0,.16)]" style={{ left: `${lk.x}%`, top: `${lk.y}%` }}>{lk.n}</button>
              {spot === i && (
                <div className="glass absolute inset-x-4 bottom-4 md:inset-x-5 md:bottom-5 flex items-center gap-[14px] rounded-xl p-[14px] !shadow-[0_16px_44px_rgba(0,0,0,.18)]">
                  <Placeholder className="h-[66px] w-[58px] flex-none rounded-[16px]" />
                  <div className="min-w-0 flex-1">
                    <div className="label mb-1 !text-[9.5px]">{b.name}</div>
                    <Link href={`/product/${p.slug}`} className="mb-1 block text-[13.5px] font-medium leading-[1.25]">{p.name}</Link>
                    <div className="text-[13px] font-medium">{money(p.price)}</div>
                  </div>
                  <button onClick={() => { addToBag(p.slug, "M · Default"); openBag(); }} className="press grid h-10 w-10 flex-none place-items-center rounded-pill bg-black text-[15px] text-white">+</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="glass fixed inset-x-4 bottom-[100px] z-30 flex items-center gap-3 rounded-pill p-3 md:hidden">
        <div className="px-[10px] text-[12.5px] font-medium text-black/60">{l.shoppable} shoppable</div>
        <Button className="flex-1">Shop the looks</Button>
      </div>
      <div className="mt-10 flex items-center gap-3 rounded-lg bg-white p-4 border border-black/5">
        <Avatar init={b.init} tint={b.tint} ink={b.ink} size={40} />
        <div className="flex-1 text-[13.5px]"><span className="font-semibold">{b.name}</span> <span className="text-black/50">· {b.city}, {b.country}</span></div>
        <Link href={`/brand/${b.slug}`} className="text-[12.5px] font-semibold text-navy">Visit brand →</Link>
      </div>
    </Page>
  );
}
