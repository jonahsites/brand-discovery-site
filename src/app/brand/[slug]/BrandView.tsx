"use client";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { LOOKBOOKS, POSTS, PRODUCTS, productsForBrand, type Brand } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { FollowButton } from "@/components/BrandCard";
import { Button, Label, Placeholder, Verified, Page } from "@/components/ui";

const TABS = ["Shop", "Posts", "Lookbooks", "About"];

export default function BrandView({ b, initialTab }: { b: Brand; initialTab: string }) {
  const [tab, setTab] = useState(TABS.includes(initialTab) ? initialTab : "Shop");
  const own = productsForBrand(b.slug);
  const grid = own.length >= 4 ? own : [...own, ...PRODUCTS.filter((p) => p.brand !== b.slug)].slice(0, 8);
  const books = LOOKBOOKS.filter((l) => l.brand === b.slug).concat(LOOKBOOKS.filter((l) => l.brand !== b.slug)).slice(0, 2);
  return (
    <Page className="pt-0 md:pt-6">
      <Placeholder label="Brand cover · lifestyle 16:5" wide className="relative -mx-4 md:mx-0 h-[206px] md:h-[300px] rounded-none md:rounded-lg">
        <div className="absolute right-5 top-5 hidden md:flex gap-[9px]">
          <button className="glass-chip grid h-[42px] w-[42px] place-items-center rounded-pill text-[15px]">↗</button>
          <button className="glass-chip grid h-[42px] w-[42px] place-items-center rounded-pill text-[15px]">⋯</button>
        </div>
      </Placeholder>

      <div className="relative -mt-[38px] md:-mt-[52px] flex flex-col md:flex-row md:items-end gap-4 md:gap-6 md:px-2">
        <div className="grid h-[78px] w-[78px] md:h-[132px] md:w-[132px] flex-none place-items-center rounded-[24px] md:rounded-[36px] border-4 md:border-[5px] border-offwhite text-[21px] md:text-[34px] font-extrabold tracking-[-.04em]" style={{ background: b.tint, color: b.ink }}>{b.init}</div>
        <div className="flex-1 md:pb-2">
          <div className="mb-[7px] flex items-center gap-[9px]"><h1 className="text-[24px] md:text-[34px] font-bold leading-none tracking-[-.038em]">{b.name}</h1>{b.verified && <Verified size={20} />}</div>
          <div className="text-[13px] md:text-[14px] text-black/58">{b.city}, {b.country} · {b.tagline}</div>
        </div>
        <div className="flex flex-none items-center gap-3 md:gap-[22px] md:pb-3">
          <div className="hidden md:block text-right"><div className="text-[20px] font-semibold tracking-[-.02em]">{b.items}</div><div className="label !text-[10px]">Items</div></div>
          <div className="hidden md:block text-right"><div className="text-[20px] font-semibold tracking-[-.02em]">{b.followers.toLocaleString()}</div><div className="label !text-[10px]">Followers</div></div>
          <FollowButton slug={b.slug} size="lg" className="flex-1 md:flex-none" />
          <Button variant="secondary" className="flex-1 md:flex-none">Message</Button>
        </div>
      </div>

      <div className="card mt-5 flex gap-5 rounded-md px-[18px] py-[14px] md:hidden">
        {[[b.items, "Items"], [b.followers.toLocaleString(), "Followers"], ["4.7", "Rating"]].map(([v, l]) => <div key={l}><div className="text-[16px] font-semibold">{v}</div><div className="label !text-[9.5px]">{l}</div></div>)}
      </div>

      <div className="mb-6 mt-6 md:mt-8 flex gap-1 border-b border-black/9">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={clsx("mr-5 md:mr-[26px] border-b-2 px-1 pb-3 md:pb-4 text-[13px] md:text-[14.5px] font-semibold", tab === t ? "border-black text-ink" : "border-transparent text-black/45")}>{t}</button>)}
      </div>

      {tab === "Shop" && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
          {grid.map((p) => <ProductCard key={p.slug} p={p} showBrand={false} tall />)}
        </div>
      )}
      {tab === "Posts" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((g) => (
            <div key={g.ph} className="card overflow-hidden rounded-2xl">
              <Placeholder label={g.ph} className="h-[300px]"><span className="glass-chip absolute bottom-[14px] left-[14px] rounded-pill px-[14px] py-[7px] text-[11.5px] font-medium">{g.tag}</span></Placeholder>
              <div className="flex items-center justify-between px-[18px] py-4"><span className="text-[13px] text-black/65">{g.caption}</span><span className="text-[12.5px] font-medium text-black/45">♡ {g.likes}</span></div>
            </div>
          ))}
        </div>
      )}
      {tab === "Lookbooks" && (
        <div className="grid gap-5 md:grid-cols-2">
          {books.map((l, i) => {
            const dark = i === 1;
            return (
              <Link key={l.slug} href={`/lookbook/${l.slug}`} className={clsx("flex h-[320px] md:h-[400px] flex-col justify-between rounded-lg p-7 md:p-[34px]", dark ? "bg-navy text-offwhite" : "bg-sky")}>
                <div>
                  <Label light={dark} className="mb-3">{l.season}</Label>
                  <h3 className="mb-[10px] text-[28px] md:text-[34px] font-bold leading-[1.05] tracking-[-.038em]">{l.title}</h3>
                  <p className={clsx("max-w-[300px] text-[14px] leading-[1.55]", dark ? "text-offwhite/72" : "text-black/65")}>{l.blurb}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className={clsx("mono text-[12px]", dark ? "text-offwhite/60" : "text-black/50")}>{l.looks} looks · {l.shoppable} shoppable</span>
                  <span className={clsx("grid h-12 w-12 place-items-center rounded-pill text-[17px]", dark ? "bg-peri text-ink" : "bg-black text-white")}>↗</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      {tab === "About" && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] items-start">
          <div className="card rounded-lg p-6 md:p-[38px]">
            <Label className="mb-[18px]">The story</Label>
            <h3 className="mb-4 text-[24px] md:text-[28px] font-bold leading-[1.15] tracking-[-.035em]">Two people, one bolt of canvas, no seasons.</h3>
            <p className="mb-[14px] text-[14.5px] leading-[1.7] text-black/68">{b.name} started in 2021 when Wies and Tomas bought a roll of deadstock cotton duck from a shuttered sailmaker two streets over. They cut six jackets, sold them to friends, and never wrote a business plan.</p>
            <p className="mb-[26px] text-[14.5px] leading-[1.7] text-black/68">Everything is still made in the same room above a bike shop. When a fabric runs out, the piece is gone — there are no restocks and no forecasting spreadsheets.</p>
            <div className="flex flex-wrap gap-2">
              {[["Small batch", "bg-peri"], [`Made in ${b.city}`, "bg-sky"], ["Deadstock fabric", "bg-offwhite border border-black/7"], ["Repairs for life", "bg-offwhite border border-black/7"]].map(([t, c]) => <span key={t} className={`rounded-pill px-[18px] py-[10px] text-[12px] font-semibold ${c}`}>{t}</span>)}
            </div>
          </div>
          <div className="flex flex-col gap-[18px]">
            <div className="card rounded-lg p-[14px]">
              <Placeholder label="Founder photo" className="h-[280px] rounded-[22px]" />
              <div className="px-[10px] pt-4 pb-[6px] text-[13px] leading-[1.5] text-black/55">Wies Doorn and Tomas Reijn in the workroom, 2025.</div>
            </div>
            <div className="card rounded-lg p-7">
              <Label className="mb-4">Shipping</Label>
              <div className="flex flex-col gap-[11px] text-[13.5px] text-black/68">
                {[["Netherlands", "Free · 1–2 days"], ["EU", "$8 · 2–4 days"], ["US & Canada", "$18 · 5–8 days"], ["Returns", "30 days, free"]].map(([k, v]) => <div key={k} className="flex justify-between"><span>{k}</span><span className="font-medium text-ink">{v}</span></div>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
