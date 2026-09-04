/* eslint-disable @next/next/no-img-element -- brand-supplied image URLs */
"use client";
import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { money } from "@/lib/data";
import { dailyPick, searchCatalog } from "@/lib/catalog";
import { useApp } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import { FollowButton } from "@/components/BrandCard";
import Countdown, { useNow } from "@/components/Countdown";
import { Avatar, Placeholder, Page } from "@/components/ui";

const FEEDS = ["Dashboard", "Following", "Matched", "Saved"] as const;
type Feed = (typeof FEEDS)[number];

export default function Home() { return <Suspense><HomeInner /></Suspense>; }

function HomeInner() {
  const sp = useSearchParams();
  const initial = (sp.get("feed") as Feed) ?? "Dashboard";
  const [feed, setFeed] = useState<Feed>(FEEDS.includes(initial) ? initial : "Dashboard");
  const now = useNow();
  const app = useApp();
  const { brands, products, promos, drops, follows, styleTags, session, notify, toggleNotify, priceOf, posts, likePost, featured, saved, bagGroups, bagCount, total, openBag, openSearch, sizes, recent } = app;
  const week = Math.floor(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) / (7 * 864e5));
  const seedBrands = brands.filter((b) => !b.createdAt);
  const featBrand = brands.find((b) => b.slug === featured) ?? seedBrands[week % Math.max(1, seedBrands.length)] ?? brands[0];
  const pick = useMemo(() => dailyPick(products), [products]);
  const matched = useMemo(() => { const hits = searchCatalog(styleTags.join(" "), brands, products, promos).products.map((h) => h.item); return [...hits, ...products.filter((p) => !hits.includes(p))]; }, [styleTags, brands, products, promos]);
  const followingP = products.filter((p) => follows.includes(p.brand));
  const savedP = products.filter((p) => saved.includes(p.slug));
  const upcoming = [...drops].filter((d) => new Date(d.at).getTime() > (now || 864e5) - 864e5).sort((a, b) => a.at.localeCompare(b.at));
  const promo = promos.find((p) => p.active);
  const promoBrand = promo && brands.find((b) => b.slug === promo.brand);
  const initials = session.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const hero = {
    Dashboard: { kicker: promo ? `${promo.label} · ${promoBrand?.name}` : "This week", t1: promo ? "Get up to" : "Find your next", t2: promo ? `${promo.pct}% off` : "favorite brand", cta: promo ? "Get discount" : "Start exploring", foot: promo?.ends ? `Valid until ${new Date(promo.ends).toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" })}` : `${brands.length} independent brands live`, href: promo ? `/brand/${promo.brand}` : "/explore", img: products.find((p) => p.brand === featBrand.slug && p.image)?.image },
    Following: { kicker: `Following · ${follows.length} brands`, t1: "New from", t2: "your makers", cta: "See what dropped", foot: `${followingP.length} pieces from brands you follow`, href: "/explore", img: followingP[0]?.image },
    Matched: { kicker: "Matched for you", t1: "Cut and fit", t2: "you buy in", cta: "Refine my match", foot: `Based on ${styleTags.slice(0, 3).join(", ")}`, href: "/onboarding", img: matched[0]?.image },
    Saved: { kicker: `Saved · ${savedP.length} pieces`, t1: "Back in stock", t2: "in your size", cta: "View saved", foot: `Size ${sizes.tops} · ${savedP.filter((p) => p.stock !== 0).length} available now`, href: "/account", img: savedP[0]?.image },
  }[feed];
  const gridM = (feed === "Following" ? followingP : feed === "Saved" ? savedP : matched).slice(0, 4);
  const recentP = recent.map((s) => products.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => !!p).slice(0, 8);
  const collections = [
    { title: "Men", meta: `${products.filter((p) => brands.find((b) => b.slug === p.brand)?.gender.some((g) => g === "Men" || g === "Unisex")).length} pieces`, tone: "#D6D9CE", href: "/explore?gender=Men", img: products.find((p) => p.slug === "panel-work-jacket")?.image },
    { title: "Women", meta: `${products.filter((p) => brands.find((b) => b.slug === p.brand)?.gender.some((g) => g === "Women" || g === "Unisex")).length} pieces`, tone: "#DCD5C7", href: "/explore?gender=Women", img: products.find((p) => p.slug === "boxy-poplin-shirt")?.image },
    { title: "Top collection", meta: "Curated rail", tone: "#CFC8B8", href: "/lookbooks", img: products.find((p) => p.slug === "cotton-chore-coat")?.image, pills: [{ label: "Clothes", meta: `${products.filter((p) => p.category !== "Accessories" && p.category !== "Footwear").length} pieces`, tone: "#DCD5C7" }, { label: "Accessories", meta: `${products.filter((p) => p.category === "Accessories").length} pieces`, tone: "#C9C2B2" }] },
  ];
  const rail = [["/", "⌗", "Discover"], ["/explore", "◎", "Explore"], ["/brands", "⌂", "Brands"], ["/account", "♡", "Saved"], ["/messages", "✉", "Messages"], ["/lookbooks", "◫", "Lookbooks"]] as const;

  return (
    <div className="mx-auto flex max-w-[1440px]">
      {/* icon rail */}
      <aside className="hidden lg:flex w-[82px] flex-none flex-col items-center gap-6 border-r border-ink/7 py-6 sticky top-[64px] h-[calc(100vh-64px)]">
        <Link href="/" className="grid h-[30px] w-[30px] place-items-center rounded-[10px] bg-sage text-[13px] font-bold text-paper">k</Link>
        <button onClick={() => openSearch()} className="grid h-11 w-11 place-items-center rounded-pill bg-ink text-[15px] text-paper" aria-label="Search">⌕</button>
        <div className="flex flex-col items-center gap-4">{rail.map(([href, icon, label]) => <Link key={href} href={href} title={label} className={clsx("grid h-[38px] w-[38px] place-items-center rounded-pill text-[15px] shadow-[inset_0_0_0_1px_rgba(18,26,36,.12)]", href === "/" ? "bg-white text-ink" : "text-ink/45 hover:text-ink")}>{icon}</Link>)}</div>
        <div className="flex-1" />
        <div className="flex flex-col items-center gap-4 text-[15px] text-ink/40"><Link href={session.role === "brand" ? "/dashboard" : "/sell"} title="Sell">⚙</Link><Link href="/account" title="Account">⏻</Link></div>
      </aside>

      <Page className="flex-1 pt-4 md:pt-6 !px-4 md:!px-8">
        {/* mobile greeting */}
        <div className="mb-4 flex items-center gap-3 md:hidden">
          <Link href="/account" className="grid h-[34px] w-[34px] place-items-center rounded-pill bg-sand text-[11px] font-semibold text-ink/60">{initials}</Link>
          <div className="flex-1"><div className="text-[10px] text-ink/45">{greet}</div><div className="text-[14px] font-bold tracking-[-.02em]">{session.name}</div></div>
          <button onClick={() => openBag()} className="relative grid h-[34px] w-[34px] place-items-center rounded-pill bg-white text-[12px] soft" aria-label="Bag">⛭{bagCount > 0 && <span className="absolute -right-[3px] -top-[3px] grid h-4 min-w-4 place-items-center rounded-pill bg-sage px-1 text-[9px] font-bold text-paper">{bagCount}</span>}</button>
        </div>

        {/* feed pills (desktop) */}
        <div className="mb-6 hidden md:flex items-center gap-5">
          <div className="flex rounded-pill bg-cream p-[5px]">{FEEDS.map((f) => <button key={f} onClick={() => setFeed(f)} className={clsx("press rounded-pill px-5 py-[9px] text-[12px] font-semibold", feed === f ? "bg-white text-ink shadow-[0_10px_24px_-18px_rgba(18,26,36,.8)]" : "text-ink/50")}>{f}</button>)}</div>
          <div className="flex-1" />
          <div className="text-[12px] text-ink/50">{brands.length} brands · {products.length} pieces</div>
        </div>

        <div className="flex flex-col xl:flex-row gap-[22px] items-start">
          <div className="min-w-0 flex-1 w-full">
            {/* hero */}
            <div className="relative flex overflow-hidden rounded-[26px] bg-cream min-h-[250px] md:h-[330px]">
              <div className="flex w-full md:w-[44%] flex-col justify-center p-6 md:p-10">
                <div className="text-[11px] md:text-[12px] font-medium text-ink/55">{hero.kicker}</div>
                <h1 className="mt-2 md:mt-3 text-[30px] md:text-[46px] leading-[1.02]">{hero.t1}<br />{hero.t2}</h1>
                <Link href={hero.href} className="mt-4 md:mt-6 self-start rounded-pill bg-ink px-5 md:px-[26px] py-[11px] md:py-[14px] text-[11px] md:text-[12px] font-semibold text-paper">{hero.cta}</Link>
                <div className="mt-4 md:mt-6 text-[10px] text-ink/42">{hero.foot}</div>
              </div>
              <div className="absolute right-0 bottom-0 w-[52%] h-[132px] rounded-tl-[24px] md:static md:h-auto md:flex-1 md:rounded-none bg-sand overflow-hidden">
                {hero.img && <img src={hero.img} alt="" className="h-full w-full object-cover" />}
                <div className="label absolute left-5 bottom-4 hidden md:block !text-ink/40">Campaign · {featBrand.name}</div>
              </div>
            </div>

            {/* mobile feed pills */}
            <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto md:hidden">{FEEDS.map((f) => <button key={f} onClick={() => setFeed(f)} className={clsx("flex-none rounded-pill px-[15px] py-[9px] text-[11px] font-semibold", feed === f ? "bg-ink text-paper" : "bg-cream text-ink/55")}>{f}</button>)}</div>

            {feed === "Dashboard" && (
              <>
                <div className="mt-5 hidden md:grid grid-cols-3 gap-[18px]" style={{ gridTemplateColumns: "1fr 1fr 1.2fr" }}>
                  {collections.map((c) => (
                    <Link key={c.title} href={c.href} className="relative h-[280px] overflow-hidden rounded-[26px] shadow-[inset_0_0_0_1px_rgba(18,26,36,.06)]" style={{ background: c.tone }}>
                      {c.img && <img src={c.img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />}
                      <div className="absolute inset-0 bg-gradient-to-b from-paper/85 via-transparent to-transparent" />
                      <div className="absolute left-5 right-5 top-5"><div className="text-[20px] font-bold leading-[1.1] tracking-[-.03em]">{c.title}</div><div className="mt-1 text-[11px] text-ink/55">{c.meta}</div></div>
                      {c.pills && <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">{c.pills.map((p) => <span key={p.label} className="flex items-center gap-2 rounded-pill bg-white/92 py-[7px] pl-[7px] pr-3 shadow-[0_8px_20px_-14px_rgba(18,26,36,.7)]"><span className="h-6 w-6 rounded-pill" style={{ background: p.tone }} /><span><span className="block text-[10px] font-semibold">{p.label}</span><span className="block text-[9px] text-ink/45">{p.meta}</span></span></span>)}</div>}
                      <span className="absolute bottom-[14px] right-[14px] grid h-[30px] w-[30px] place-items-center rounded-pill bg-white/92 text-[12px]">↗</span>
                    </Link>
                  ))}
                </div>
                {upcoming.length > 0 && (
                  <div className="mt-5 hidden md:grid gap-[18px] md:grid-cols-2">
                    {upcoming.slice(0, 2).map((d) => { const b = brands.find((x) => x.slug === d.brand); if (!b) return null; const on = notify.includes(d.id); return (
                      <div key={d.id} className="flex items-center gap-4 rounded-[26px] bg-ink p-5 text-paper">
                        <Avatar init={b.init} tint={b.tint} ink={b.ink} size={40} src={b.logo} />
                        <div className="min-w-0 flex-1"><div className="text-[10px] text-paper/55">{b.name} · drop</div><div className="truncate text-[15px] font-bold tracking-[-.02em]">{d.title}</div><div className="mt-2"><Countdown at={d.at} dark compact /></div></div>
                        <button onClick={() => toggleNotify(d.id)} className={clsx("rounded-pill px-3 py-2 text-[10px] font-semibold", on ? "bg-sage text-paper" : "bg-paper/12 text-paper")}>{on ? "✓ Set" : "Notify"}</button>
                      </div>); })}
                  </div>
                )}
                {pick && (
                  <Link href={`/product/${pick.slug}`} className="card mt-5 hidden md:flex items-center gap-4 rounded-[24px] p-3 lift">
                    <Placeholder src={pick.image} className="h-[72px] w-[64px] flex-none rounded-[14px]" />
                    <div className="min-w-0 flex-1"><div className="label">Today&apos;s pick</div><div className="mt-1 text-[15px] font-bold tracking-[-.02em]">{pick.name}</div><div className="text-[11px] text-ink/45">{brands.find((b) => b.slug === pick.brand)?.name} · {money(priceOf(pick).price)}</div></div>
                    <span className="grid h-8 w-8 place-items-center rounded-pill bg-cream text-[12px]">↗</span>
                  </Link>
                )}
                {posts.length > 0 && (
                  <div className="mt-6 hidden md:block">
                    <div className="mb-3 flex items-baseline justify-between"><h3 className="text-[18px]">From the workshops</h3><Link href="/?feed=Following" className="text-[11px] font-semibold text-ink/55">Following →</Link></div>
                    <div className="grid gap-[18px] md:grid-cols-3">{posts.slice(0, 3).map((x) => { const b = brands.find((y) => y.slug === x.brand); if (!b) return null; return <div key={x.id} className="card overflow-hidden rounded-[24px] p-[10px]"><Placeholder src={x.image} className="aspect-[4/3] rounded-[18px]" /><div className="px-2 pt-3 pb-1"><div className="flex items-center gap-2"><Avatar init={b.init} tint={b.tint} ink={b.ink} size={22} src={b.logo} /><Link href={`/brand/${b.slug}`} className="text-[11px] font-semibold">{b.name}</Link><button onClick={() => likePost(x.id)} className="ml-auto text-[11px] text-ink/45">♡ {x.likes}</button></div><p className="mt-2 line-clamp-2 text-[12px] leading-[1.5] text-ink/70">{x.caption}</p></div></div>; })}</div>
                  </div>
                )}
              </>
            )}

            {feed === "Dashboard" && recentP.length > 0 && <div className="mt-5 md:mt-7"><div className="mb-3 flex items-baseline justify-between"><h3 className="text-[15px] md:text-[18px]">Recently viewed</h3><Link href="/explore" className="text-[12px] font-semibold text-ink/50">Keep browsing →</Link></div><div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:gap-[14px] md:px-0">{recentP.map((p) => <div key={p.slug} className="w-[150px] flex-none md:w-[200px]"><ProductCard p={p} /></div>)}</div></div>}
            {(feed !== "Dashboard" || true) && (
              <div className={clsx("mt-4 md:mt-6", feed === "Dashboard" && "md:hidden")}>
                <div className="mb-3 flex items-baseline justify-between"><h3 className="text-[15px] md:text-[18px]">{feed === "Following" ? "New from brands you follow" : feed === "Saved" ? "Your saved pieces" : feed === "Matched" ? "Matched to your profile" : "Popular now"}</h3><Link href={feed === "Saved" ? "/account" : "/explore"} className="text-[11px] font-semibold text-ink/55">See all →</Link></div>
                <div className="grid grid-cols-2 gap-[14px] md:grid-cols-4 md:gap-[18px]">{(feed === "Dashboard" ? matched.slice(0, 4) : feed === "Matched" ? matched.slice(0, 8) : gridM.length ? (feed === "Following" ? followingP.slice(0, 8) : savedP.slice(0, 8)) : []).map((p) => <ProductCard key={p.slug} p={p} compact />)}</div>
                {feed === "Following" && followingP.length === 0 && <div className="card rounded-[24px] p-8 text-center text-[13px] text-ink/55">You aren&apos;t following anyone yet. <Link href="/brands" className="font-semibold text-ink">Find brands →</Link></div>}
                {feed === "Saved" && savedP.length === 0 && <div className="card rounded-[24px] p-8 text-center text-[13px] text-ink/55">Nothing saved yet. Tap ♡ on anything.</div>}
                {feed === "Following" && posts.filter((x) => follows.includes(x.brand)).length > 0 && <div className="mt-6 grid gap-[18px] md:grid-cols-2">{posts.filter((x) => follows.includes(x.brand)).map((x) => { const b = brands.find((y) => y.slug === x.brand); if (!b) return null; return <div key={x.id} className="card overflow-hidden rounded-[24px] p-[10px]"><Placeholder src={x.image} className="aspect-[16/10] rounded-[18px]" /><div className="px-2 pt-3 pb-1"><div className="flex items-center gap-2"><Avatar init={b.init} tint={b.tint} ink={b.ink} size={22} src={b.logo} /><Link href={`/brand/${b.slug}`} className="text-[11px] font-semibold">{b.name}</Link><FollowButton slug={b.slug} size="sm" className="ml-auto" /></div><p className="mt-2 text-[12px] leading-[1.5] text-ink/70">{x.caption}</p><div className="mt-2 flex flex-wrap gap-1">{x.products.map((s) => { const p = products.find((y) => y.slug === s); return p ? <Link key={s} href={`/product/${s}`} className="rounded-pill bg-cream px-[10px] py-1 text-[10px] font-semibold">{p.name} · {money(priceOf(p).price)}</Link> : null; })}<button onClick={() => likePost(x.id)} className="ml-auto text-[11px] text-ink/45">♡ {x.likes}</button></div></div></div>; })}</div>}
              </div>
            )}
          </div>

          {/* bag panel */}
          <aside className="hidden xl:block w-[290px] flex-none rounded-[26px] bg-cream p-5 sticky top-[88px]">
            <div className="flex items-center justify-between"><div className="text-[17px] font-bold tracking-[-.02em]">Bag</div><button onClick={() => openBag()} className="grid h-7 w-7 place-items-center rounded-pill bg-white/80 text-[11px]">↗</button></div>
            <div className="mt-4 flex flex-col gap-2">
              {bagGroups.flatMap((g) => g.items).slice(0, 4).map((it, i) => (
                <Link key={it.key} href={`/product/${it.p.slug}`} className={clsx("flex items-center gap-[11px] rounded-[18px] p-[10px]", i === 1 ? "bg-white shadow-[0_10px_24px_-18px_rgba(18,26,36,.8)]" : "bg-white/55")}>
                  <Placeholder src={it.p.image} className="h-[38px] w-[38px] flex-none rounded-pill" />
                  <div className="min-w-0 flex-1"><div className="truncate text-[12px] font-semibold tracking-[-.01em]">{it.p.name}</div><div className="mt-[2px] text-[10px] text-ink/45">{brands.find((b) => b.slug === it.p.brand)?.name} · {it.variant.split(" · ")[0]} · ×{it.qty}</div></div>
                  <span className="text-[13px] text-ink/35">›</span>
                </Link>
              ))}
              {bagCount === 0 && <div className="rounded-[18px] bg-white/55 p-4 text-[12px] text-ink/55">Your bag is empty.</div>}
            </div>
            <Link href="/checkout" className="mt-4 block rounded-pill bg-ink py-[15px] text-center text-[12px] font-semibold text-paper">({bagCount} items) Check out · {money(total)}</Link>
            <div className="mt-[18px] border-t border-ink/10 pt-4">
              <div className="label">Matched to you</div>
              <div className="mt-3 flex flex-col gap-3">
                {matched.filter((p) => !follows.includes(p.brand)).slice(0, 2).map((p) => { const b = brands.find((x) => x.slug === p.brand); if (!b) return null; return (
                  <div key={p.slug} className="flex items-center gap-[11px]">
                    <Placeholder src={p.image} className="h-[52px] w-[44px] flex-none rounded-[14px]" />
                    <div className="min-w-0 flex-1"><Link href={`/product/${p.slug}`} className="block truncate text-[12px] font-semibold tracking-[-.01em]">{p.name}</Link><div className="mt-[2px] text-[10px] text-ink/45">{b.name} · {money(priceOf(p).price)}</div></div>
                    <FollowButton slug={b.slug} size="sm" />
                  </div>); })}
              </div>
            </div>
          </aside>
        </div>
      </Page>
    </div>
  );
}
