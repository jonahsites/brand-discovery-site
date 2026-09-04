"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { CATEGORIES, money } from "@/lib/data";
import { dailyPick, searchCatalog } from "@/lib/catalog";
import { useApp } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import { BrandTile, FollowButton } from "@/components/BrandCard";
import Countdown, { useNow } from "@/components/Countdown";
import { Avatar, Button, Placeholder, SectionHead, Verified, Page } from "@/components/ui";

const FEEDS = ["For you", "Following", "Drops"];

export default function Home() { return <Suspense><HomeInner /></Suspense>; }

function HomeInner() {
  const sp = useSearchParams();
  const [feed, setFeed] = useState(sp.get("feed") ?? "For you");
  const now = useNow();
  const { brands, products, promos, drops, follows, styleTags, session, notify, toggleNotify, priceOf, posts, likePost, featured, recent } = useApp();
  const recentP = recent.map((s) => products.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => !!p).slice(0, 4);
  const week = Math.floor(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) / (7 * 864e5));
  const seedBrands = brands.filter((b) => !b.createdAt);
  const arva = brands.find((b) => b.slug === featured) ?? seedBrands[week % Math.max(1, seedBrands.length)] ?? brands[0];
  const onda = brands.find((b) => b.slug === "onda-studio") ?? brands[1];
  const pick = useMemo(() => dailyPick(products), [products]);
  const curated = useMemo(() => {
    const hits = searchCatalog(styleTags.join(" "), brands, products, promos).products.map((h) => h.item);
    const rest = products.filter((p) => !hits.includes(p));
    return [...hits, ...rest].slice(0, 4);
  }, [styleTags, brands, products, promos]);
  const followingProducts = products.filter((p) => follows.includes(p.brand)).slice(0, 8);
  const newBrands = [...brands].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "") || a.followers - b.followers).slice(0, 4);
  const upcoming = [...drops].filter((d) => new Date(d.at).getTime() > (now || 864e5) - 864e5).sort((a, b) => a.at.localeCompare(b.at));

  return (
    <Page className="pt-4 md:pt-6">
      <div className="flex gap-8">
        <aside className="hidden lg:block w-[216px] flex-none sticky top-[100px] self-start">
          <div className="label mb-3 mt-[6px]">Discover</div>
          <div className="mb-[26px] flex flex-col gap-[2px]">
            {["For you", "Following", "Drops"].map((l) => <button key={l} onClick={() => setFeed(l)} className={clsx("rounded-sm px-[14px] py-[10px] text-left text-[13.5px]", feed === l ? "bg-white font-semibold" : "font-medium text-black/62")}>{l === "Drops" ? "New drops" : l}</button>)}
            <Link href="/brands" className="rounded-sm px-[14px] py-[10px] text-left text-[13.5px] font-medium text-black/62">Trending brands</Link>
          </div>
          <div className="label mb-3">Categories</div>
          <div className="flex flex-col gap-[2px]">{CATEGORIES.map((c) => <Link key={c.name} href={`/explore?cat=${encodeURIComponent(c.name)}`} className="flex justify-between rounded-sm px-[14px] py-[9px] text-[13px] text-black/62"><span>{c.name}</span><span className="mono text-[11px] text-black/32">{products.filter((p) => p.category === c.name).length || c.n}</span></Link>)}</div>
          <div className="mt-[26px] rounded-xl bg-peri p-5">
            {session.role === "brand" ? <><div className="mb-[6px] text-[15px] font-semibold leading-[1.25] tracking-[-.02em]">Hi, {session.name}.</div><div className="mb-[14px] text-[12px] leading-[1.5] text-black/62">Manage products, promos and drops.</div><Link href="/dashboard"><Button size="sm" className="!px-[18px] !py-[9px]">Open dashboard</Button></Link></>
              : <><div className="mb-[6px] text-[15px] font-semibold leading-[1.25] tracking-[-.02em]">Are you a brand?</div><div className="mb-[14px] text-[12px] leading-[1.5] text-black/62">Apply in five minutes. No listing fee for your first 90 days.</div><Link href="/sell"><Button size="sm" className="!px-[18px] !py-[9px]">Apply</Button></Link></>}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between">
            <div className="glass flex gap-1 rounded-pill p-1">{FEEDS.map((f) => <button key={f} onClick={() => setFeed(f)} className={clsx("press rounded-pill px-4 md:px-[22px] py-[9px] md:py-[10px] text-[12.5px] md:text-[13px] font-semibold", feed === f ? "bg-black text-white" : "text-black/55")}>{f}</button>)}</div>
            <div className="mono hidden sm:block text-[12px] text-black/40">{brands.length} brands live · {products.length} pieces</div>
          </div>

          <div className="lg:hidden mb-6 grid grid-cols-2 gap-3">
            <Link href="/brands" className="relative h-[158px] rounded-xl bg-sky p-[18px]"><div className="text-[16px] font-semibold leading-[1.2] tracking-[-.02em]">Explore all brands</div><span className="absolute bottom-[14px] right-[14px] grid h-[38px] w-[38px] place-items-center rounded-pill bg-white/80 text-[15px]">↗</span></Link>
            <button onClick={() => setFeed("Drops")} className="card relative h-[158px] rounded-xl p-[18px] text-left"><div className="text-[16px] font-semibold leading-[1.2] tracking-[-.02em]">This week&apos;s drops</div><span className="absolute bottom-[14px] right-[14px] grid h-[38px] w-[38px] place-items-center rounded-pill bg-offwhite text-[15px]">↗</span></button>
          </div>

          {feed === "Drops" && (
            <div className="mb-6 flex flex-col gap-4">
              {upcoming.map((d, i) => { const b = brands.find((x) => x.slug === d.brand); if (!b) return null; const on = notify.includes(d.id); const dark = i % 2 === 0; return (
                <div key={d.id} className={clsx("rounded-lg p-6 md:p-[34px]", dark ? "bg-navy text-offwhite" : "bg-sky")}>
                  <div className="mb-3 flex items-center gap-3"><Avatar init={b.init} tint={b.tint} ink={b.ink} size={36} /><Link href={`/brand/${b.slug}`} className="text-[14px] font-semibold">{b.name}</Link><span suppressHydrationWarning className={clsx("mono text-[11px]", dark ? "text-offwhite/60" : "text-black/50")}>{new Date(d.at).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })}</span></div>
                  <h2 className="mb-2 text-[28px] md:text-[36px] font-bold leading-[1.02] tracking-[-.04em]">{d.title}</h2>
                  <p className={clsx("mb-5 max-w-[420px] text-[14px] leading-[1.55]", dark ? "text-offwhite/72" : "text-black/65")}>{d.pieces} pieces. {d.blurb}</p>
                  {d.products.length > 0 && <div className="mb-4 flex flex-wrap gap-2">{d.products.map((s) => { const p = products.find((x) => x.slug === s); return p ? <Link key={s} href={`/product/${s}`} className={clsx("rounded-pill px-3 py-[6px] text-[12px] font-medium", dark ? "bg-offwhite/12 text-offwhite" : "bg-white")}>{p.name} · {money(priceOf(p).price)}</Link> : null; })}</div>}
                  <div className="flex flex-wrap items-center gap-4"><Countdown at={d.at} dark={dark} /><button onClick={() => toggleNotify(d.id)} className={clsx("press rounded-pill px-5 py-3 text-[13px] font-semibold", on ? (dark ? "bg-peri text-ink" : "bg-black text-white") : dark ? "bg-offwhite/12 text-offwhite border border-offwhite/20" : "bg-white border border-black/10")}>{on ? "✓ You'll be notified" : "Notify me"}</button></div>
                </div>); })}
              {upcoming.length === 0 && <div className="card rounded-lg p-10 text-center text-[14px] text-black/55">No drops scheduled. Follow brands to see theirs first.</div>}
            </div>
          )}

          {feed === "Following" && (
            <div className="mb-6">
              {posts.filter((x) => follows.includes(x.brand)).map((x) => { const b = brands.find((y) => y.slug === x.brand); if (!b) return null; return (
                <div key={x.id} className="card mb-4 rounded-lg p-4 md:p-6">
                  <div className="mb-4 flex items-center gap-3"><Avatar init={b.init} tint={b.tint} ink={b.ink} size={40} src={b.logo} /><div className="flex-1"><Link href={`/brand/${b.slug}`} className="text-[14px] font-semibold">{b.name}</Link><div className="text-[12px] text-black/45" suppressHydrationWarning>{new Date(x.at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</div></div><FollowButton slug={b.slug} size="sm" /></div>
                  <Placeholder src={x.image} label="Post" className="mb-4 h-[260px] md:h-[380px] rounded-md" />
                  <p className="mb-3 text-[14px] leading-[1.6] text-black/72">{x.caption}</p>
                  <div className="flex flex-wrap items-center gap-2">{x.products.map((s) => { const p = products.find((y) => y.slug === s); return p ? <Link key={s} href={`/product/${s}`} className="rounded-pill bg-offwhite px-3 py-[6px] text-[12px] font-medium">{p.name} · {money(priceOf(p).price)}</Link> : null; })}<button onClick={() => likePost(x.id)} className="ml-auto text-[13px] font-medium text-black/55">♡ {x.likes}</button></div>
                </div>); })}
              {followingProducts.length ? <><SectionHead title="New from brands you follow" /><div className="mb-8 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">{followingProducts.map((p) => <ProductCard key={p.slug} p={p} />)}</div></>
                : <div className="card mb-6 rounded-lg p-10 text-center text-[14px] text-black/55">You aren&apos;t following anyone yet. <Link href="/onboarding" className="font-semibold text-navy">Pick five brands →</Link></div>}
            </div>
          )}

          {feed === "For you" && (
            <>
              <div className="relative mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-6 md:gap-[34px] overflow-hidden rounded-lg bg-sky p-6 md:p-[38px]">
                <div className="flex-1">
                  <div className="label mb-[14px] !text-black/48">Brand of the week</div>
                  <h2 className="mb-3 text-[34px] md:text-[46px] leading-[1.02]">{arva.slug === "studio-arva" ? <>Minimalism for the <em>messy.</em></> : arva.tagline}</h2>
                  <p className="mb-[22px] max-w-[390px] text-[14.5px] leading-[1.55] text-black/66">{arva.slug === "studio-arva" ? `${arva.name} cuts heavyweight cotton in a two-person ${arva.city} workshop. ${products.filter((p) => p.brand === arva.slug).length} pieces, no seasons.` : `${arva.name}, ${arva.city}. ${(arva.story?.split(/(?<=\.)\s/)[0] ?? "").replace(/\.$/, "")}. ${products.filter((p) => p.brand === arva.slug).length} piece${products.filter((p) => p.brand === arva.slug).length === 1 ? "" : "s"}.`}</p>
                  <div className="flex flex-wrap items-center gap-[10px]"><Link href={`/brand/${arva.slug}`}><Button>Shop the drop</Button></Link><Link href={`/brand/${arva.slug}?tab=About`}><Button variant="ghost">Read the story</Button></Link></div>
                </div>
                <div className="relative h-[240px] w-full md:h-[300px] md:w-[320px] flex-none rounded-xl bg-white"><Placeholder src={products.find((p) => p.brand === arva.slug && p.image)?.image} label="Hero product shot" className="absolute inset-[22px] rounded-[9px]" /><Link href={`/product/${products.find((p) => p.brand === arva.slug)?.slug ?? "heavyweight-crew"}`} className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-pill bg-black text-[16px] text-white">↗</Link></div>
              </div>

              {pick && (
                <Link href={`/product/${pick.slug}`} className="card mb-6 flex items-center gap-5 rounded-lg p-4 md:p-5 lift">
                  <Placeholder src={pick.image} label="Today" className="h-[96px] w-[84px] flex-none rounded-[10px]" />
                  <div className="min-w-0 flex-1">
                    <div className="label mb-1" suppressHydrationWarning>Today&apos;s pick · {new Date().toLocaleDateString(undefined, { weekday: "long" })}</div>
                    <div className="text-[17px] font-semibold tracking-[-.02em]">{pick.name}</div>
                    <div className="text-[12.5px] text-black/50">{brands.find((b) => b.slug === pick.brand)?.name} · {money(priceOf(pick).price)}{priceOf(pick).promo ? ` · ${priceOf(pick).promo!.pct}% off today` : ""}</div>
                  </div>
                  <span className="grid h-11 w-11 flex-none place-items-center rounded-pill bg-peri text-[16px]">↗</span>
                </Link>
              )}

              <div className="card mb-6 rounded-lg p-4 md:p-6">
                <div className="mb-[18px] flex items-center gap-3">
                  <Avatar init={onda.init} tint={onda.tint} ink={onda.ink} size={44} />
                  <div className="flex-1"><div className="flex items-center gap-[6px]"><Link href={`/brand/${onda.slug}`} className="text-[14.5px] font-semibold">{onda.name}</Link>{onda.verified && <Verified />}</div><div className="text-[12px] text-black/45">{onda.city}, {onda.country} · 4h ago</div></div>
                  <FollowButton slug={onda.slug} />
                </div>
                <div className="mb-4 grid grid-cols-[2fr_1fr] gap-[10px]">
                  <Placeholder src="https://images.unsplash.com/photo-1554568218-0f1715e72254?w=1200&q=75&auto=format&fit=crop" label="Lookbook frame 01" className="h-[240px] md:h-[340px] rounded-md"><Link href="/product/sail-overshirt" className="glass-chip absolute bottom-4 left-4 flex items-center gap-[9px] rounded-pill py-2 pl-3 pr-2"><span className="text-[12px] font-medium">Sail Overshirt</span><span className="rounded-pill bg-black px-[10px] py-1 text-[12px] font-medium text-white">$186</span></Link></Placeholder>
                  <div className="grid grid-rows-2 gap-[10px]"><Placeholder src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=75&auto=format&fit=crop" label="Frame 02" className="rounded-md" /><Placeholder src="https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&q=75&auto=format&fit=crop" label="Frame 03" className="rounded-md" /></div>
                </div>
                <p className="mb-4 max-w-[620px] text-[14px] leading-[1.6] text-black/72">Salt-washed cotton, cut once and never restocked. Shot on the seawall at 6am — the whole run is 40 pieces.</p>
                <div className="flex items-center justify-between border-t border-black/7 pt-4"><div className="flex gap-[18px] text-[13px] font-medium text-black/55"><span>♡ 1,204</span><span>◇ Save</span><span>↗ Share</span></div><div className="mono text-[12px] text-black/35">3 products tagged</div></div>
              </div>

              {recentP.length > 0 && <><SectionHead title="Recently viewed" /><div className="mb-[34px] grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">{recentP.map((p) => <ProductCard key={p.slug} p={p} />)}</div></>}
              <SectionHead title="Curated for you" sub={`Based on ${styleTags.slice(0, 2).join(" and ") || "your style profile"}`} action="See all" href="/explore" />
              <div className="mb-[34px] grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">{curated.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
            </>
          )}

          <SectionHead title="New brands you might like" action="See all" href="/brands" />
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">{newBrands.map((b) => <BrandTile key={b.slug} b={b} />)}</div>
        </div>
      </div>
    </Page>
  );
}
