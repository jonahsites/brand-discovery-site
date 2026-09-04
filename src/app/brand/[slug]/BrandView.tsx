/* eslint-disable @next/next/no-img-element -- brand-supplied image URLs come from any host; next/image needs allow-listed remotePatterns */
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { POSTS, brandTier, lookCount } from "@/lib/data";
import { useApp } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import { FollowButton } from "@/components/BrandCard";
import { Button, Label, Placeholder, Verified, Page } from "@/components/ui";
import Countdown, { useNow } from "@/components/Countdown";

const TABS = ["Shop", "Lookbooks", "About", "Posts"];

export default function BrandView({ slug, initialTab }: { slug: string; initialTab: string }) {
  const { brands, products, hydrated, drops, promos, session, follows, posts, likePost, sendMessage, allLookbooks } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState(TABS.includes(initialTab) ? initialTab : "Shop");
  const now = useNow();
  const b = brands.find((x) => x.slug === slug);
  if (!b) return <Page className="pt-20 text-center"><h1 className="mb-2 text-[28px] font-bold tracking-[-.03em]">{hydrated ? "No brand here yet." : "Loading…"}</h1>{hydrated && <p className="text-[14px] text-black/55">Nothing lives at /brand/{slug}. <Link href="/explore" className="font-semibold text-navy">Browse brands →</Link></p>}</Page>;
  const own = products.filter((p) => p.brand === b.slug);
  const books = allLookbooks.filter((l) => l.brand === b.slug);
  const drop = drops.find((d) => d.brand === b.slug && new Date(d.at).getTime() > now);
  const promo = promos.find((p) => p.active && p.brand === b.slug);
  const isOwner = session.role === "brand" && session.brand === b.slug;
  const followers = b.followers + (follows.includes(b.slug) && b.followers === 0 ? 1 : 0);
  return (
    <Page className="pt-0 md:pt-6">
      <Placeholder src={b.cover} alt={`${b.name} cover`} label="Brand cover · lifestyle 16:5" wide className="relative -mx-4 md:mx-0 h-[206px] md:h-[300px] rounded-none md:rounded-lg">
        {isOwner && <Link href="/dashboard" className="absolute right-5 top-5 rounded-pill bg-black px-4 py-2 text-[12px] font-semibold text-white">Edit in dashboard</Link>}
      </Placeholder>

      <div className="relative -mt-[38px] md:-mt-[52px] flex flex-col md:flex-row md:items-end gap-4 md:gap-6 md:px-2">
        <div className="grid h-[78px] w-[78px] md:h-[132px] md:w-[132px] flex-none place-items-center overflow-hidden rounded-[14px] md:rounded-[20px] border-4 md:border-[5px] border-offwhite text-[21px] md:text-[34px] font-extrabold tracking-[-.04em]" style={{ background: b.tint, color: b.ink }}>{b.logo ? <img src={b.logo} alt={b.name} className="h-full w-full object-cover" /> : b.init}</div>
        <div className="flex-1 md:pb-2">
          <div className="mb-[7px] flex items-center gap-[9px]"><h1 className="text-[24px] md:text-[34px] font-bold leading-none tracking-[-.038em]">{b.name}</h1>{b.verified && <Verified size={20} />}<span className="rounded-pill bg-offwhite px-[10px] py-1 text-[10px] font-semibold uppercase tracking-[.08em] text-black/55">{brandTier(followers)}</span></div>
          <div className="text-[13px] md:text-[14px] text-black/58">{b.city}, {b.country} · {b.tagline}</div>
        </div>
        <div className="flex flex-none items-center gap-3 md:gap-[22px] md:pb-3">
          <div className="hidden md:block text-right"><div className="text-[20px] font-semibold tracking-[-.02em]">{own.length}</div><div className="label !text-[10px]">Items</div></div>
          <div className="hidden md:block text-right"><div className="text-[20px] font-semibold tracking-[-.02em]">{followers.toLocaleString()}</div><div className="label !text-[10px]">Followers</div></div>
          <FollowButton slug={b.slug} size="lg" className="flex-1 md:flex-none" />
          <Button variant="secondary" className="flex-1 md:flex-none" onClick={() => { const id = sendMessage(b.slug, `Hi ${b.name} — quick question about sizing.`, "shopper"); router.push(`/messages?t=${id}`); }}>Message</Button>
        </div>
      </div>

      <div className="card mt-5 flex gap-5 rounded-md px-[18px] py-[14px] md:hidden">
        {[[own.length, "Items"], [followers.toLocaleString(), "Followers"], ["4.7", "Rating"]].map(([v, l]) => <div key={l}><div className="text-[16px] font-semibold">{v}</div><div className="label !text-[9.5px]">{l}</div></div>)}
      </div>

      {/* Facts strip: onboarding data as filterable chips */}
      <div className="mt-6 flex flex-wrap gap-2">
        {[...b.styles.map((s) => [s, `/brands?style=${encodeURIComponent(s)}`]), ...b.values.slice(0, 3).map((v) => [v, `/explore?q=${encodeURIComponent(v)}`]), [`Made in ${b.madeIn}`, `/brands`], [`$${b.priceBand[0]}–$${b.priceBand[1]}`, `/explore?q=${encodeURIComponent("under $" + b.priceBand[1])}`], [`${b.sizeRange[0]}–${b.sizeRange[1]}`, "/explore"]].map(([t, href]) => <Link key={t} href={href} className="rounded-pill border border-black/7 bg-white px-[14px] py-2 text-[12px] font-medium">{t}</Link>)}
      </div>

      {(drop || promo) && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {drop && <div className="rounded-lg bg-navy p-6 text-offwhite"><Label light className="mb-2">Next drop</Label><div className="mb-1 text-[22px] font-bold tracking-[-.03em]">{drop.title}</div><div className="mb-4 text-[13px] text-offwhite/70">{drop.pieces} pieces · {drop.blurb}</div><Countdown at={drop.at} dark /></div>}
          {promo && <div className="rounded-lg bg-peri p-6"><Label className="mb-2">Promo running</Label><div className="mb-1 text-[22px] font-bold tracking-[-.03em]">{promo.pct}% off · {promo.label}</div><div className="text-[13px] text-black/60">Use code <span className="mono font-semibold text-ink">{promo.code}</span> at checkout{promo.ends ? ` · ends ${new Date(promo.ends).toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : ""}</div></div>}
        </div>
      )}

      <div className="mb-6 mt-6 md:mt-8 flex gap-1 border-b border-black/9">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={clsx("mr-5 md:mr-[26px] border-b-2 px-1 pb-3 md:pb-4 text-[13px] md:text-[14.5px] font-semibold", tab === t ? "border-black text-ink" : "border-transparent text-black/45")}>{t}</button>)}
      </div>

      {tab === "Shop" && (own.length ? <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">{own.map((p) => <ProductCard key={p.slug} p={p} showBrand={false} tall />)}</div>
        : <div className="card rounded-lg p-10 text-center text-[14px] text-black/55">{isOwner ? <>No products yet. <Link href="/dashboard?tab=Products" className="font-semibold text-navy">Add your first piece →</Link></> : "This brand hasn't listed anything yet. Follow to hear about the first drop."}</div>)}
      {tab === "Posts" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.filter((x) => x.brand === b.slug).map((x) => (
            <div key={x.id} className="card overflow-hidden rounded-2xl">
              <Placeholder src={x.image} label="Post" className="h-[300px]">{x.products.length > 0 && <span className="glass-chip absolute bottom-[14px] left-[14px] rounded-pill px-[14px] py-[7px] text-[11.5px] font-medium">{x.products.length} tagged</span>}</Placeholder>
              <div className="flex items-center justify-between gap-3 px-[18px] py-4"><span className="text-[13px] text-black/65">{x.caption}</span><button onClick={() => likePost(x.id)} className="flex-none text-[12.5px] font-medium text-black/45">♡ {x.likes}</button></div>
            </div>
          ))}
          {(b.createdAt ? [] : POSTS).map((g) => (
            <div key={g.ph} className="card overflow-hidden rounded-2xl">
              <Placeholder label={g.ph} className="h-[300px]"><span className="glass-chip absolute bottom-[14px] left-[14px] rounded-pill px-[14px] py-[7px] text-[11.5px] font-medium">{g.tag}</span></Placeholder>
              <div className="flex items-center justify-between px-[18px] py-4"><span className="text-[13px] text-black/65">{g.caption}</span><span className="text-[12.5px] font-medium text-black/45">♡ {g.likes}</span></div>
            </div>
          ))}
          {b.createdAt && posts.filter((x) => x.brand === b.slug).length === 0 && <div className="card col-span-full rounded-lg p-10 text-center text-[14px] text-black/55">No posts yet.</div>}
        </div>
      )}
      {tab === "Lookbooks" && (
        <div className="grid gap-5 md:grid-cols-2">
          {books.map((l, i) => { const dark = i % 2 === 1; return (
            <Link key={l.slug} href={`/lookbook/${l.slug}`} className={clsx("flex h-[320px] md:h-[400px] flex-col justify-between rounded-lg p-7 md:p-[34px]", dark ? "bg-navy text-offwhite" : "bg-sky")}>
              <div><Label light={dark} className="mb-3">{l.season}</Label><h3 className="mb-[10px] text-[28px] md:text-[34px] font-bold leading-[1.05] tracking-[-.038em]">{l.title}</h3><p className={clsx("max-w-[300px] text-[14px] leading-[1.55]", dark ? "text-offwhite/72" : "text-black/65")}>{l.blurb}</p></div>
              <div className="flex items-center justify-between"><span className={clsx("mono text-[12px]", dark ? "text-offwhite/60" : "text-black/50")}>{lookCount(l).looks} looks · {lookCount(l).shoppable} shoppable</span><span className={clsx("grid h-12 w-12 place-items-center rounded-pill text-[17px]", dark ? "bg-peri text-ink" : "bg-black text-white")}>↗</span></div>
            </Link>); })}
          {books.length === 0 && <div className="card col-span-full rounded-lg p-10 text-center text-[14px] text-black/55">No lookbooks yet.{isOwner && <> <Link href="/dashboard?tab=Lookbooks" className="font-semibold text-navy">Build one →</Link></>}</div>}
        </div>
      )}
      {tab === "About" && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] items-start">
          <div className="card rounded-lg p-6 md:p-[38px]">
            <Label className="mb-[18px]">The story</Label>
            <h3 className="mb-4 text-[24px] md:text-[28px] font-bold leading-[1.15] tracking-[-.035em]">{b.tagline}</h3>
            {(b.story ?? "").split(/\n+/).map((para, i) => <p key={i} className="mb-[14px] text-[14.5px] leading-[1.7] text-black/68">{para}</p>)}
            <div className="mt-3 flex flex-wrap gap-2">
              {b.values.map((t, i) => <span key={t} className={`rounded-pill px-[18px] py-[10px] text-[12px] font-semibold ${i === 0 ? "bg-peri" : i === 1 ? "bg-sky" : "bg-offwhite border border-black/7"}`}>{t}</span>)}
            </div>
          </div>
          <div className="flex flex-col gap-[18px]">
            <div className="card rounded-lg p-7">
              <Label className="mb-4">Facts</Label>
              <div className="flex flex-col gap-[11px] text-[13.5px] text-black/68">
                {[["Founded", b.founded ?? "—"], ["Made in", b.madeIn], ["Batch size", b.batch], ["Materials", b.materials.join(", ")], ["For", b.gender.join(", ")], ["Sizes", `${b.sizeRange[0]}–${b.sizeRange[1]}`], ["Website", b.website ?? "—"]].map(([k, v]) => <div key={String(k)} className="flex justify-between gap-4"><span>{k}</span><span className="text-right font-medium text-ink">{String(v)}</span></div>)}
              </div>
            </div>
            <div className="card rounded-lg p-7">
              <Label className="mb-4">Shipping</Label>
              <div className="flex flex-col gap-[11px] text-[13.5px] text-black/68">
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
