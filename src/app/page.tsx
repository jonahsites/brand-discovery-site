"use client";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { BRANDS, CATEGORIES, PRODUCTS, brandBySlug } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { BrandTile, FollowButton } from "@/components/BrandCard";
import { Avatar, Button, Placeholder, SectionHead, Verified, Page } from "@/components/ui";

const FEEDS = ["For you", "Following", "Drops"];

export default function Home() {
  const [feed, setFeed] = useState("For you");
  const arva = brandBySlug("studio-arva")!;
  const onda = brandBySlug("onda-studio")!;
  const curated = ["panel-work-jacket", "merino-half-zip", "ripstop-cargo", "boxy-poplin-shirt"].map((s) => PRODUCTS.find((p) => p.slug === s)!);
  return (
    <Page className="pt-4 md:pt-6">
      <div className="flex gap-8">
        <aside className="hidden lg:block w-[216px] flex-none sticky top-[100px] self-start">
          <div className="label mb-3 mt-[6px]">Discover</div>
          <div className="mb-[26px] flex flex-col gap-[2px]">
            {["For you", "Following", "New drops", "Trending brands"].map((l, i) => (
              <button key={l} onClick={() => setFeed(i < 2 ? l : i === 2 ? "Drops" : "For you")} className={clsx("rounded-sm px-[14px] py-[10px] text-left text-[13.5px]", (feed === l || (l === "New drops" && feed === "Drops")) ? "bg-white font-semibold shadow-[0_2px_8px_rgba(0,0,0,.04)]" : "font-medium text-black/62")}>{l}</button>
            ))}
          </div>
          <div className="label mb-3">Categories</div>
          <div className="flex flex-col gap-[2px]">
            {CATEGORIES.map((c) => (
              <Link key={c.name} href="/explore" className="flex justify-between rounded-sm px-[14px] py-[9px] text-[13px] text-black/62"><span>{c.name}</span><span className="mono text-[11px] text-black/32">{c.n}</span></Link>
            ))}
          </div>
          <div className="mt-[26px] rounded-xl bg-peri p-5">
            <div className="mb-[6px] text-[15px] font-semibold leading-[1.25] tracking-[-.02em]">Are you a brand?</div>
            <div className="mb-[14px] text-[12px] leading-[1.5] text-black/62">Apply in five minutes. No listing fee for your first 90 days.</div>
            <Link href="/dashboard"><Button size="sm" className="!px-[18px] !py-[9px]">Apply</Button></Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between">
            <div className="glass flex gap-1 rounded-pill p-1 !shadow-[0_6px_20px_rgba(0,0,0,.06)]">
              {FEEDS.map((f) => (
                <button key={f} onClick={() => setFeed(f)} className={clsx("press rounded-pill px-4 md:px-[22px] py-[9px] md:py-[10px] text-[12.5px] md:text-[13px] font-semibold", feed === f ? "bg-black text-white" : "text-black/55")}>{f}</button>
              ))}
            </div>
            <div className="mono hidden sm:block text-[12px] text-black/40">142 brands live today</div>
          </div>

          <div className="lg:hidden mb-6 grid grid-cols-2 gap-3">
            <Link href="/explore" className="relative h-[158px] rounded-xl bg-sky p-[18px]">
              <div className="text-[16px] font-semibold leading-[1.2] tracking-[-.02em]">Explore all brands</div>
              <span className="absolute bottom-[14px] right-[14px] grid h-[38px] w-[38px] place-items-center rounded-pill bg-white/80 text-[15px]">↗</span>
            </Link>
            <button onClick={() => setFeed("Drops")} className="card relative h-[158px] rounded-xl p-[18px] text-left">
              <div className="text-[16px] font-semibold leading-[1.2] tracking-[-.02em]">This week&apos;s drops</div>
              <span className="absolute bottom-[14px] right-[14px] grid h-[38px] w-[38px] place-items-center rounded-pill bg-offwhite text-[15px]">↗</span>
            </button>
          </div>

          {feed === "Drops" ? (
            <div className="mb-6 rounded-lg bg-navy p-7 md:p-[38px] text-offwhite">
              <div className="label mb-[14px] !text-offwhite/60">Dropping Friday · 09:00 CET</div>
              <h2 className="mb-3 text-[30px] md:text-[40px] font-bold leading-[1.02] tracking-[-.04em]">Form &amp; Void, bone colourway.</h2>
              <p className="mb-[22px] max-w-[390px] text-[14.5px] leading-[1.55] text-offwhite/72">Forty pieces cut from the last of the sailmaker&apos;s roll. Followers get the link an hour early.</p>
              <div className="flex gap-[10px]"><Button variant="secondary" className="!bg-peri !border-peri">Notify me</Button><Link href="/brand/form-and-void"><Button variant="ghost" className="!bg-white/12 !border-white/20 !text-offwhite">Visit brand</Button></Link></div>
            </div>
          ) : (
            <div className="relative mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-6 md:gap-[34px] overflow-hidden rounded-lg bg-sky p-6 md:p-[38px]">
              <div className="flex-1">
                <div className="label mb-[14px] !text-black/48">Brand of the week</div>
                <h2 className="mb-3 text-[30px] md:text-[40px] font-bold leading-[1.02] tracking-[-.04em]">Minimalism for the messy.</h2>
                <p className="mb-[22px] max-w-[390px] text-[14.5px] leading-[1.55] text-black/66">Studio Arva cuts heavyweight cotton in a two-person Lisbon workshop. Fourteen pieces, no seasons.</p>
                <div className="flex flex-wrap items-center gap-[10px]">
                  <Link href={`/brand/${arva.slug}`}><Button>Shop the drop</Button></Link>
                  <Link href={`/brand/${arva.slug}?tab=About`}><Button variant="ghost">Read the story</Button></Link>
                </div>
              </div>
              <div className="relative h-[240px] w-full md:h-[300px] md:w-[320px] flex-none rounded-xl bg-white shadow-[0_18px_44px_rgba(0,0,0,.1)]">
                <Placeholder label="Hero product shot" className="absolute inset-[22px] rounded-[16px]" />
                <Link href="/product/heavyweight-crew" className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-pill bg-black text-[16px] text-white">↗</Link>
              </div>
            </div>
          )}

          {feed !== "Drops" && (
            <div className="card mb-6 rounded-lg p-4 md:p-6">
              <div className="mb-[18px] flex items-center gap-3">
                <Avatar init={onda.init} tint={onda.tint} ink={onda.ink} size={44} />
                <div className="flex-1">
                  <div className="flex items-center gap-[6px]"><Link href={`/brand/${onda.slug}`} className="text-[14.5px] font-semibold">{onda.name}</Link><Verified /></div>
                  <div className="text-[12px] text-black/45">Porto, PT · 4h ago</div>
                </div>
                <FollowButton slug={onda.slug} />
              </div>
              <div className="mb-4 grid grid-cols-[2fr_1fr] gap-[10px]">
                <Placeholder label="Lookbook frame 01" className="h-[240px] md:h-[340px] rounded-md">
                  <Link href="/product/sail-overshirt" className="glass-chip absolute bottom-4 left-4 flex items-center gap-[9px] rounded-pill py-2 pl-3 pr-2 shadow-[0_8px_24px_rgba(0,0,0,.1)]">
                    <span className="text-[12px] font-medium">Sail Overshirt</span><span className="rounded-pill bg-black px-[10px] py-1 text-[12px] font-medium text-white">$186</span>
                  </Link>
                </Placeholder>
                <div className="grid grid-rows-2 gap-[10px]"><Placeholder label="Frame 02" className="rounded-md" /><Placeholder label="Frame 03" className="rounded-md" /></div>
              </div>
              <p className="mb-4 max-w-[620px] text-[14px] leading-[1.6] text-black/72">Salt-washed cotton, cut once and never restocked. Shot on the seawall at 6am — the whole run is 40 pieces.</p>
              <div className="flex items-center justify-between border-t border-black/7 pt-4">
                <div className="flex gap-[18px] text-[13px] font-medium text-black/55"><span>♡ 1,204</span><span>◇ Save</span><span>↗ Share</span></div>
                <div className="mono text-[12px] text-black/35">3 products tagged</div>
              </div>
            </div>
          )}

          <SectionHead title="Curated for you" sub="Based on your interest in Japanese streetwear" action="See all" href="/explore" />
          <div className="mb-[34px] grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {curated.map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>

          <SectionHead title="New brands you might like" action="See all" href="/explore" />
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {BRANDS.slice(0, 4).map((b) => <BrandTile key={b.slug} b={b} />)}
          </div>
        </div>
      </div>
    </Page>
  );
}
