"use client";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { BRANDS, ORDERS, PRODUCTS, STYLE_TAGS, brandMeta } from "@/lib/data";
import { useApp } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import { Avatar, Button, Label, Placeholder, Page } from "@/components/ui";

export default function Account() {
  const { saved, follows, toggleFollow } = useApp();
  const [tab, setTab] = useState("Saved");
  const [tags, setTags] = useState(STYLE_TAGS);
  const savedP = PRODUCTS.filter((p) => saved.includes(p.slug));
  const following = BRANDS.filter((b) => follows.includes(b.slug));
  return (
    <Page className="pt-6 md:pt-9">
      <div className="mb-6 md:mb-[34px] flex items-center gap-4 md:gap-[22px]">
        <div className="grid h-[66px] w-[66px] md:h-[104px] md:w-[104px] flex-none place-items-center rounded-[22px] md:rounded-lg bg-sky text-[20px] md:text-[30px] font-extrabold tracking-[-.04em]">JR</div>
        <div className="flex-1">
          <h1 className="mb-[6px] text-[20px] md:text-[32px] font-bold leading-[1.05] tracking-[-.038em]">Jules Renard</h1>
          <div className="hidden md:block text-[13.5px] text-black/55">Paris, FR · joined March 2025 · {following.length} brands followed</div>
          <div className="mono md:hidden text-[11.5px] text-black/45">{following.length} following · {savedP.length} saved</div>
        </div>
        <div className="hidden md:flex gap-[10px]"><Button variant="secondary">Edit profile</Button><button className="grid h-[46px] w-[46px] place-items-center rounded-pill border border-black/10 bg-white text-[15px]">◔</button></div>
      </div>
      <div className="mb-[22px] flex gap-2 md:hidden">
        {["Saved", "Orders", "Profile"].map((t) => <button key={t} onClick={() => setTab(t)} className={clsx("flex-1 rounded-pill py-3 text-center text-[12.5px] font-semibold", tab === t ? "bg-black text-white" : "bg-white border border-black/10")}>{t}</button>)}
      </div>
      <div className="grid gap-7 lg:grid-cols-[1fr_400px] items-start">
        <div>
          <div className={clsx(tab !== "Saved" && "hidden md:block")}>
            <div className="mb-4 flex items-baseline justify-between"><h3 className="text-[20px] font-semibold tracking-[-.025em]">Saved · {savedP.length} pieces</h3><span className="text-[12.5px] font-semibold text-navy">Create a board →</span></div>
            <div className="mb-9 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">{savedP.map((p) => <ProductCard key={p.slug} p={p} />)}{savedP.length === 0 && <div className="col-span-full rounded-lg bg-white p-8 text-center text-[13.5px] text-black/55">Nothing saved yet. Tap ♡ on anything.</div>}</div>
          </div>
          <div className={clsx(tab !== "Orders" && "hidden md:block")}>
            <h3 className="mb-4 text-[20px] font-semibold tracking-[-.025em]">Order history</h3>
            <div className="flex flex-col gap-3">
              {ORDERS.map((o) => (
                <div key={o.meta} className="card flex items-center gap-4 md:gap-[18px] rounded-2xl px-5 py-4 md:px-6 md:py-5">
                  <Placeholder className="h-[52px] w-[52px] flex-none rounded-[16px]" />
                  <div className="min-w-0 flex-1"><div className="mb-1 text-[14px] font-semibold">{o.title}</div><div className="mono text-[11.5px] text-black/42">{o.meta}</div></div>
                  <span className="hidden sm:inline rounded-pill px-4 py-2 text-[11px] font-semibold uppercase tracking-[.08em]" style={{ background: o.tint, color: o.ink }}>{o.status}</span>
                  <span className="text-[14px] font-medium">{o.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={clsx("flex flex-col gap-4", tab !== "Profile" && "hidden md:flex")}>
          <div className="rounded-lg bg-navy p-6 md:p-7 text-offwhite">
            <Label light className="mb-4">Style profile</Label>
            <p className="mb-[18px] text-[13px] leading-[1.6] text-offwhite/72">These tags decide what shows up in For You. Remove any that stopped feeling like you.</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => <button key={t} onClick={() => setTags(tags.filter((x) => x !== t))} className="flex items-center gap-2 rounded-pill border border-offwhite/20 bg-offwhite/14 px-[15px] py-[9px] text-[12px] font-medium">{t}<span className="opacity-50">✕</span></button>)}
              <Link href="/onboarding" className="rounded-pill bg-peri px-[15px] py-[9px] text-[12px] font-semibold text-ink">+ Add</Link>
            </div>
          </div>
          <div className="card rounded-lg p-6 md:p-7">
            <Label className="mb-[18px]">Size profile</Label>
            <div className="flex flex-col gap-[14px]">
              {[["Tops", ["L", "XL"], 0], ["Trousers", ["32", "33"], 0], ["Shoes · EU", ["43"], 0]].map(([k, vs, on]) => (
                <div key={k as string}><div className="mb-2 text-[12px] text-black/50">{k as string}</div><div className="flex gap-[7px]">{(vs as string[]).map((v, i) => <span key={v} className={clsx("rounded-pill px-[17px] py-[9px] text-[12.5px] font-medium", i === on ? "bg-sky" : "bg-offwhite")}>{v}</span>)}</div></div>
              ))}
            </div>
            <div className="mt-[18px] rounded-[18px] bg-offwhite px-[18px] py-[14px] text-[12px] leading-[1.5] text-black/55">We hide anything sold out in your sizes.</div>
          </div>
          <div className="card rounded-lg p-6 md:p-7">
            <Label className="mb-[18px]">Following · {following.length}</Label>
            <div className="flex flex-col gap-3">
              {following.map((b) => (
                <div key={b.slug} className="flex items-center gap-3">
                  <Avatar init={b.init} tint={b.tint} ink={b.ink} size={40} />
                  <Link href={`/brand/${b.slug}`} className="min-w-0 flex-1"><div className="text-[13px] font-semibold">{b.name}</div><div className="mono text-[10.5px] text-black/42">{brandMeta(b)}</div></Link>
                  <button onClick={() => toggleFollow(b.slug)} className="rounded-pill bg-offwhite px-[14px] py-[7px] text-[11.5px] font-semibold">Following</button>
                </div>
              ))}
              {following.length === 0 && <div className="text-[13px] text-black/50">Follow a few brands to fill your feed.</div>}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
