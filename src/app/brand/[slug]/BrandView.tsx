/* eslint-disable @next/next/no-img-element -- brand-supplied image URLs come from any host; next/image needs allow-listed remotePatterns */
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { POSTS, brandTier, lookCount } from "@/lib/data";
import { useApp } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import { FollowButton } from "@/components/BrandCard";
import { Button, Label, Placeholder, Verified, Page } from "@/components/ui";
import Countdown, { useNow } from "@/components/Countdown";
import { styleOverlap } from "@/lib/looks";

const TABS = ["Shop", "Lookbooks", "About", "Posts"];

export default function BrandView({ slug, initialTab }: { slug: string; initialTab: string }) {
  const { brands, products, hydrated, drops, promos, session, follows, posts, likePost, sendMessage, allLookbooks, recordView, toast, views, styleTags } = useApp();
  const router = useRouter();
  const counted = useRef<string | null>(null);
  useEffect(() => { if (hydrated && counted.current !== slug) { counted.current = slug; recordView(slug); } }, [slug, hydrated, recordView]);
  const [tab, setTab] = useState(TABS.includes(initialTab) ? initialTab : "Shop");
  const now = useNow();
  const b = brands.find((x) => x.slug === slug);
  if (!b) return <Page className="pt-20 text-center"><h1 className="mb-2 text-[28px] font-extrabold tracking-[-.03em]">{hydrated ? "No brand here yet." : "Loading…"}</h1>{hydrated && <p className="text-[14px] text-ink/55">Nothing lives at /brand/{slug}. <Link href="/explore" className="font-semibold text-ink">Browse brands →</Link></p>}</Page>;
  const own = products.filter((p) => p.brand === b.slug);
  const books = allLookbooks.filter((l) => l.brand === b.slug);
  const drop = drops.find((d) => d.brand === b.slug && new Date(d.at).getTime() > (now || 0));
  const promo = promos.find((p) => p.active && p.brand === b.slug);
  const isOwner = session.role === "brand" && session.brand === b.slug;
  const followers = b.followers + (follows.includes(b.slug) && b.followers === 0 ? 1 : 0);
  return (
    <Page className="pt-4 md:pt-6">
      <div className="grid gap-4 md:gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] items-stretch">
        <div className="card order-2 flex flex-col rounded-lg p-6 md:p-8 lg:order-1">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-12 w-12 flex-none place-items-center overflow-hidden rounded-[16px] text-[15px] font-extrabold tracking-[-.04em]" style={{ background: b.tint, color: b.ink }}>{b.logo ? <img loading="lazy" decoding="async" src={b.logo} alt={b.name} className="h-full w-full object-cover" /> : b.init}</div>
            <div className="min-w-0"><div className="label">{b.city}, {b.country}{b.founded ? ` · since ${b.founded}` : ""}</div><div className="mt-[3px] truncate text-[12px] text-ink/50">{brandTier(followers)} · {b.batch} batch · ships from {b.shipsFrom}</div></div>
            <div className="ml-auto flex flex-none gap-2">
              {isOwner && <Link href="/dashboard" className="rounded-pill bg-ink px-4 py-2 text-[11px] font-semibold text-paper">Edit in dashboard</Link>}
              <button onClick={() => { const url = typeof location !== "undefined" ? location.href : ""; if (navigator.share) navigator.share({ title: b.name, url }).catch(() => {}); else { navigator.clipboard?.writeText(url); toast("Brand link copied"); } }} className="press grid h-[38px] w-[38px] place-items-center rounded-pill bg-cream text-[14px]" aria-label="Share">↗</button>
            </div>
          </div>
          <div className="mb-2 flex flex-wrap items-center gap-[9px]"><h1 className="text-[36px] md:text-[52px] leading-[.95]" style={{fontFamily:"var(--font-instrument), Georgia, serif"}}>{b.name}</h1>{b.verified && <Verified size={20} />}</div>
          <p className="mb-5 max-w-[460px] text-[14px] md:text-[15px] leading-[1.55] text-ink/60">{b.tagline}</p>
          <div className="mb-6 flex flex-wrap gap-2">
            {styleOverlap(b.styles, styleTags) > 0 && <span className="rounded-pill bg-sage px-[14px] py-2 text-[11px] font-semibold text-paper">For you · {styleOverlap(b.styles, styleTags)} shared style{styleOverlap(b.styles, styleTags) === 1 ? "" : "s"}</span>}
            {[...b.styles.map((s) => [s, `/brands?style=${encodeURIComponent(s)}`]), ...b.values.slice(0, 3).map((v) => [v, `/explore?q=${encodeURIComponent(v)}`]), [`Made in ${b.madeIn}`, `/brands`], [`$${b.priceBand[0]}–$${b.priceBand[1]}`, `/explore?q=${encodeURIComponent("under $" + b.priceBand[1])}`], [`${b.sizeRange[0]}–${b.sizeRange[1]}`, "/explore"]].map(([t, href]) => <Link key={t} href={href} className="rounded-pill bg-cream px-[14px] py-2 text-[11px] font-semibold text-ink/72">{t}</Link>)}
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-3">
            <FollowButton slug={b.slug} size="lg" className="flex-1 sm:flex-none" />
            <Button variant="secondary" size="lg" className="flex-1 sm:flex-none" onClick={() => { const id = sendMessage(b.slug, `Hi ${b.name} — quick question about sizing.`, "shopper"); router.push(`/messages?t=${id}`); }}>Message</Button>
            <div className="ml-auto hidden gap-5 sm:flex">
              {[[own.length, "Items"], [followers.toLocaleString(), "Followers"], ["4.7", "Rating"], ...(isOwner ? [[(views[b.slug] ?? 0).toLocaleString(), "Views"]] : [])].map(([v, l]) => <div key={String(l)} className="text-right"><div className="text-[18px] font-bold tracking-[-.03em]">{v}</div><div className="label !text-[9.5px]">{l}</div></div>)}
            </div>
          </div>
        </div>
        <Placeholder src={b.cover} alt={`${b.name} cover`} label="Brand cover · 16:9" wide className="order-1 h-[220px] rounded-lg md:h-[300px] lg:order-2 lg:h-auto lg:min-h-[400px]" />
      </div>

      <div className="card mt-4 flex gap-5 rounded-lg px-[18px] py-[14px] sm:hidden">
        {[[own.length, "Items"], [followers.toLocaleString(), "Followers"], ["4.7", "Rating"]].map(([v, l]) => <div key={l}><div className="text-[16px] font-bold tracking-[-.03em]">{v}</div><div className="label !text-[9.5px]">{l}</div></div>)}
      </div>

      {(drop || promo) && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {drop && <div className="rounded-lg p-6 text-paper" style={{background:"var(--indigo)"}}><Label light className="mb-2">Next drop</Label><div className="mb-1 text-[22px] font-bold tracking-[-.03em]">{drop.title}</div><div className="mb-4 text-[13px] text-paper/70">{drop.pieces} pieces · {drop.blurb}</div><Countdown at={drop.at} dark /></div>}
          {promo && <div className="rounded-lg p-6" style={{background:"var(--clay)",color:"var(--ink)"}}><Label className="mb-2">Promo running</Label><div className="mb-1 text-[22px] font-bold tracking-[-.03em]">{promo.pct}% off · {promo.label}</div><div className="text-[13px] text-ink/60" suppressHydrationWarning>Use code <span className="mono font-semibold text-ink">{promo.code}</span> at checkout{promo.ends ? ` · ends ${new Date(promo.ends).toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : ""}</div></div>}
        </div>
      )}

      <div className="mb-6 mt-6 md:mt-8 inline-flex rounded-pill bg-cream p-[5px]">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={clsx("press rounded-pill px-4 md:px-5 py-[9px] text-[11px] md:text-[12px] font-semibold", tab === t ? "bg-white text-ink shadow-[0_10px_24px_-18px_rgba(18,26,36,.8)]" : "text-ink/50")}>{t}</button>)}
      </div>

      {tab === "Shop" && (own.length ? <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">{own.map((p) => <ProductCard key={p.slug} p={p} showBrand={false} tall />)}</div>
        : <div className="card rounded-lg p-10 text-center text-[14px] text-ink/55">{isOwner ? <>No products yet. <Link href="/dashboard?tab=Products" className="font-semibold text-ink">Add your first piece →</Link></> : "This brand hasn't listed anything yet. Follow to hear about the first drop."}</div>)}
      {tab === "Posts" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.filter((x) => x.brand === b.slug).map((x) => (
            <div key={x.id} className="card overflow-hidden rounded-lg">
              <Placeholder src={x.image} label="Post" className="h-[300px]">{x.products.length > 0 && <span className="glass-chip absolute bottom-[14px] left-[14px] rounded-pill px-[14px] py-[7px] text-[11.5px] font-medium">{x.products.length} tagged</span>}</Placeholder>
              <div className="flex items-center justify-between gap-3 px-[18px] py-4"><span className="text-[13px] text-ink/65">{x.caption}</span><button onClick={() => likePost(x.id)} className="flex-none text-[12.5px] font-medium text-ink/45">♡ {x.likes}</button></div>
            </div>
          ))}
          {(b.createdAt ? [] : POSTS).map((g) => (
            <div key={g.ph} className="card overflow-hidden rounded-lg">
              <Placeholder label={g.ph} className="h-[300px]"><span className="glass-chip absolute bottom-[14px] left-[14px] rounded-pill px-[14px] py-[7px] text-[11.5px] font-medium">{g.tag}</span></Placeholder>
              <div className="flex items-center justify-between px-[18px] py-4"><span className="text-[13px] text-ink/65">{g.caption}</span><span className="text-[12.5px] font-medium text-ink/45">♡ {g.likes}</span></div>
            </div>
          ))}
          {b.createdAt && posts.filter((x) => x.brand === b.slug).length === 0 && <div className="card col-span-full rounded-lg p-10 text-center text-[14px] text-ink/55">No posts yet.</div>}
        </div>
      )}
      {tab === "Lookbooks" && (
        <div className="grid gap-5 md:grid-cols-2">
          {books.map((l, i) => { const dark = i % 2 === 1; return (
            <Link key={l.slug} href={`/lookbook/${l.slug}`} className={clsx("flex h-[320px] md:h-[400px] flex-col justify-between rounded-lg p-7 md:p-[34px]", dark ? "bg-ink text-paper" : "bg-sand")}>
              <div><Label light={dark} className="mb-3">{l.season}</Label><h3 className="mb-[10px] text-[28px] md:text-[34px] font-bold leading-[1.05] tracking-[-.038em]">{l.title}</h3><p className={clsx("max-w-[300px] text-[14px] leading-[1.55]", dark ? "text-paper/72" : "text-ink/65")}>{l.blurb}</p></div>
              <div className="flex items-center justify-between"><span className={clsx("mono text-[12px]", dark ? "text-paper/60" : "text-ink/50")}>{lookCount(l).looks} looks · {lookCount(l).shoppable} shoppable</span><span className={clsx("grid h-12 w-12 place-items-center rounded-pill text-[17px]", dark ? "bg-paper text-ink" : "bg-ink text-paper")}>↗</span></div>
            </Link>); })}
          {books.length === 0 && <div className="card col-span-full rounded-lg p-10 text-center text-[14px] text-ink/55">No lookbooks yet.{isOwner && <> <Link href="/dashboard?tab=Lookbooks" className="font-semibold text-ink">Build one →</Link></>}</div>}
        </div>
      )}
      {tab === "About" && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] items-start">
          <div className="card rounded-lg p-6 md:p-[38px]">
            <Label className="mb-[18px]">The story</Label>
            <h3 className="mb-4 text-[26px] md:text-[32px] leading-[1.1] tracking-[-.015em]" style={{fontFamily:"var(--font-instrument), Georgia, serif"}}>{b.tagline}</h3>
            {(b.story ?? "").split(/\n+/).map((para, i) => <p key={i} className="mb-[14px] text-[14.5px] leading-[1.7] text-ink/68">{para}</p>)}
            <div className="mt-3 flex flex-wrap gap-2">
              {b.values.map((t, i) => <span key={t} className={`rounded-pill px-[18px] py-[10px] text-[12px] font-semibold ${i === 0 ? "bg-moss" : i === 1 ? "bg-sand" : "bg-cream"}`}>{t}</span>)}
            </div>
          </div>
          <div className="flex flex-col gap-[18px]">
            <div className="card rounded-lg p-7">
              <Label className="mb-4">Facts</Label>
              <div className="flex flex-col gap-[11px] text-[13.5px] text-ink/68">
                {[["Founded", b.founded ?? "—"], ["Made in", b.madeIn], ["Batch size", b.batch], ["Materials", b.materials.join(", ")], ["For", b.gender.join(", ")], ["Sizes", `${b.sizeRange[0]}–${b.sizeRange[1]}`], ["Website", b.website ?? "—"]].map(([k, v]) => <div key={String(k)} className="flex justify-between gap-4"><span>{k}</span><span className="text-right font-medium text-ink">{String(v)}</span></div>)}
              </div>
            </div>
            <div className="card rounded-lg p-7">
              <Label className="mb-4">Shipping</Label>
              <div className="flex flex-col gap-[11px] text-[13.5px] text-ink/68">
                <div className="flex justify-between"><span>Ships from</span><span className="font-medium text-ink">{b.shipsFrom}</span></div>
                {b.shipsTo.map((r) => <div key={r} className="flex justify-between"><span>{r}</span><span className="font-medium text-ink">Yes</span></div>)}
                <div className="flex justify-between"><span>Returns</span><span className="font-medium text-ink">30 days, free</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
