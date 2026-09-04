"use client";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ACCORDIONS, COLORS, PRODUCTS, REVIEWS, SIZES, brandBySlug, money, productsForBrand, type Product } from "@/lib/data";
import { useApp } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import Accordion from "@/components/Accordion";
import { Avatar, Button, IconCircle as IconCircleBtn, Label, Placeholder, QtyStepper, SectionHead, Tag, Verified, Page } from "@/components/ui";

export default function ProductView({ p }: { p: Product }) {
  const b = brandBySlug(p.brand)!;
  const { addToBag, openBag, toggleSaved, isSaved } = useApp();
  const [size, setSize] = useState("XL");
  const [color, setColor] = useState(0);
  const [qty, setQty] = useState(1);
  const [thumb, setThumb] = useState(0);
  const [added, setAdded] = useState(false);
  const more = productsForBrand(b.slug).filter((x) => x.slug !== p.slug).concat(PRODUCTS.filter((x) => x.brand !== b.slug)).slice(0, 4);
  const add = () => { addToBag(p.slug, `${size} · ${COLORS[color][0]}`, qty); setAdded(true); openBag(); };
  const saved = isSaved(p.slug);
  return (
    <Page className="pt-4 md:pt-7">
      <div className="mono mb-4 md:mb-[22px] text-[12px] text-black/40"><Link href="/explore">Explore</Link> / <Link href="/explore">{p.category}</Link> / <Link href={`/brand/${b.slug}`}>{b.name}</Link></div>
      <div className="mb-10 md:mb-14 grid gap-6 md:gap-10 lg:grid-cols-[minmax(0,660px)_1fr] items-start">
        <div>
          <div className="card relative h-[340px] md:h-[660px] rounded-2xl md:rounded-lg p-3 md:p-[34px]">
            <Placeholder label={`${["Front", "Back", "Detail", "On body"][thumb]} · 4:5`} className="absolute inset-3 md:inset-[34px] rounded-md" />
            {p.tag === "Last 3" || p.slug === "panel-work-jacket" ? <div className="absolute left-[22px] top-[22px]"><Tag bg="#456F94" fg="#fff">Final 6 pieces</Tag></div> : null}
          </div>
          <div className="mt-3 md:mt-[14px] flex gap-[9px] md:gap-3">
            {["Front", "Back", "Detail", "On body"].map((t, i) => <button key={t} onClick={() => setThumb(i)} className={clsx("flex-1 rounded-[9px] md:rounded-md border-2", thumb === i ? "border-ink" : "border-transparent")}><Placeholder label={t} className="h-[74px] md:h-[130px] rounded-[8px] md:rounded-[10px]" /></button>)}
          </div>
        </div>
        <div className="md:pt-[6px]">
          <Link href={`/brand/${b.slug}`} className="mb-4 md:mb-5 inline-flex items-center gap-[10px] rounded-pill border border-black/7 bg-white py-[7px] pl-[7px] pr-4">
            <Avatar init={b.init} tint={b.tint} ink={b.ink} size={32} />
            <span className="text-[13px] font-semibold">{b.name}</span>{b.verified && <Verified />}
            <span className="mono text-[11.5px] text-black/40">{(b.followers / 1000).toFixed(1)}k</span>
          </Link>
          <h1 className="mb-3 md:mb-[14px] text-[28px] md:text-[38px] font-bold leading-[1.05] tracking-[-.038em]">{p.name}</h1>
          <div className="mb-6 md:mb-[30px] flex items-baseline gap-3">
            <span className="text-[24px] md:text-[26px] font-medium">{money(p.price)}</span>
            {p.compareAt && <><span className="text-[17px] text-black/35 line-through">{money(p.compareAt)}</span><Tag>{Math.round((1 - p.price / p.compareAt) * 100)}% off</Tag></>}
          </div>
          <div className="mb-3 flex items-center justify-between"><Label>Size</Label><span className="text-[12px] font-medium text-navy">Size guide</span></div>
          <div className="mb-6 md:mb-7 flex gap-2 md:gap-[9px]">
            {SIZES.map((s) => <button key={s} onClick={() => { setSize(s); setAdded(false); }} className={clsx("press flex-1 md:flex-none md:min-w-[62px] rounded-pill border py-[13px] md:py-[14px] text-[13px] md:text-[14px] font-medium", size === s ? "bg-sky border-sky" : "bg-white border-black/11")}>{s}</button>)}
          </div>
          <Label className="mb-3">Colour · {COLORS[color][0]}</Label>
          <div className="mb-6 md:mb-[30px] flex gap-3">
            {COLORS.map(([n, hex], i) => <button key={n} aria-label={n} onClick={() => setColor(i)} className="h-[34px] w-[34px] rounded-pill" style={{ background: hex, boxShadow: color === i ? "0 0 0 2px #F6F7F9, 0 0 0 3.5px #1A1A1A" : "inset 0 0 0 1px rgba(0,0,0,.1)" }} />)}
          </div>
          <div className="mb-4 flex items-center gap-3">
            <QtyStepper value={qty} onChange={setQty} className="!bg-white border border-black/8 !p-[6px]" />
            <Button size="lg" className="flex-1" onClick={add}>{added ? "Added to bag ✓" : "Add to bag"}</Button>
            <IconCircleBtn size={52} variant={saved ? "black" : "white"} onClick={() => toggleSaved(p.slug)} className="hidden sm:grid text-[17px]">{saved ? "♥" : "♡"}</IconCircleBtn>
            <IconCircleBtn size={52} variant="white" className="hidden sm:grid text-[16px]">↗</IconCircleBtn>
          </div>
          <div className="mb-6 md:mb-[30px] text-[12.5px] text-black/50">Ships from {b.city} in 2–4 days · free returns for 30 days</div>
          <Accordion items={ACCORDIONS} />
        </div>
      </div>

      <SectionHead title={`More from ${b.name}`} action="Visit brand" href={`/brand/${b.slug}`} />
      <div className="mb-10 md:mb-11 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">{more.map((x) => <ProductCard key={x.slug} p={x} showBrand={false} />)}</div>

      <div className="grid gap-5 md:gap-8 lg:grid-cols-[340px_1fr] items-start">
        <div className="rounded-lg bg-navy p-7 md:p-[30px] text-offwhite">
          <Label light className="mb-4">Reviews</Label>
          <div className="mb-[6px] text-[52px] font-bold leading-none tracking-[-.04em]">4.7</div>
          <div className="mb-[26px] text-[12.5px] text-offwhite/70">from 84 verified buyers</div>
          <Label light className="mb-[14px]">Fit</Label>
          <div className="relative mb-3 h-[5px] rounded-pill bg-offwhite/20"><div className="absolute left-[52%] top-[-6px] h-[17px] w-[17px] -ml-2 rounded-pill bg-peri" /></div>
          <div className="mono flex justify-between text-[11px] text-offwhite/65"><span>Runs small</span><span>True</span><span>Runs large</span></div>
        </div>
        <div className="flex flex-col gap-[14px]">
          {REVIEWS.map((r) => (
            <div key={r.name} className="card rounded-2xl p-5 md:p-6">
              <div className="mb-[14px] flex items-center gap-[11px]">
                <Avatar init={r.init} tint={r.tint} size={38} />
                <div className="flex-1"><div className="text-[13.5px] font-semibold">{r.name}</div><div className="mono text-[11.5px] text-black/40">{r.meta}</div></div>
                <span className="rounded-pill bg-offwhite px-[13px] py-[6px] text-[11.5px] font-semibold">{r.stars}</span>
              </div>
              <p className="mb-[14px] text-[13.5px] leading-[1.6] text-black/70">{r.body}</p>
              <div className="flex gap-[9px]"><Placeholder className="h-[72px] w-[72px] rounded-[8px]" /><Placeholder className="h-[72px] w-[72px] rounded-[8px]" /><div className="mono grid h-[72px] w-[72px] place-items-center rounded-[8px] bg-offwhite text-[10px] text-black/40">+3</div></div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass fixed inset-x-4 bottom-[100px] z-30 flex items-center gap-3 rounded-pill p-3 md:hidden">
        <div className="px-2 text-[15px] font-semibold">{money(p.price)}</div>
        <Button className="flex-1" onClick={add}>{added ? "Added ✓" : "Add to bag"}</Button>
      </div>
    </Page>
  );
}
