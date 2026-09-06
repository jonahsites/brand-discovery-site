"use client";
/**
 * Kindred home — the real marketplace feed. Structure top to bottom:
 *  1. HeroSpotlight — rotates featured brands with per-brand color takeover
 *  2. Marquee ticker — live activity or a static "small brands, real people" cycle
 *  3. CategoryTiles — 8 colorful category hero tiles
 *  4. NewThisWeek — brands added in the last 14 days (hides if none)
 *  5. BrandRail "For you" — from rankBrands algorithm
 *  6. Product carousel "Recently added pieces" — latest 12 products
 *  7. BrandRail "Editor's picks" — state.featured (hides if empty)
 *  8. LiveActivity — compact rolling feed near the bottom
 *
 * Every rail respects its own empty state and hides rather than showing a
 * hollow grid. Personalisation still flows through toSignal / rankBrands so
 * the onboarding answers steer the feed.
 */
import { Suspense, useMemo } from "react";
import Link from "next/link";
import clsx from "clsx";
import { useApp } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import { Page } from "@/components/ui";
import { rankBrands, rankProducts, toSignal } from "@/lib/rank";
import HeroSpotlight from "@/components/HeroSpotlight";
import Marquee from "@/components/Marquee";
import CategoryTiles from "@/components/CategoryTiles";
import BrandRail from "@/components/BrandRail";
import NewThisWeek from "@/components/NewThisWeek";
import LiveActivity from "@/components/LiveActivity";
import SectionHeader from "@/components/SectionHeader";
import Sparkles from "@/components/Sparkles";
import { useNow } from "@/components/Countdown";

export default function Home() { return <Suspense><HomeInner /></Suspense>; }

function HomeInner() {
  const app = useApp();
  const now = useNow();
  const {
    brands, products, promos, drops, follows, styleTags, session,
    featured, saved, bagCount, openBag, openSearch, sizes, recent,
    waitlist, alerts, orders, views,
  } = app;

  // Personal signal — mirror of the old home page so onboarding answers still steer everything.
  const signal = useMemo(
    () => toSignal({ styleTags, sizes, follows, saved, recent, waitlist, alerts, orders, views }),
    [styleTags, sizes, follows, saved, recent, waitlist, alerts, orders, views],
  );
  const rankedBrands = useMemo(() => rankBrands(brands, signal, products), [brands, products, signal]);
  const rankedProducts = useMemo(() => rankProducts(products, brands, signal), [products, brands, signal]);
  const productFor = useMemo(() => (slug: string) => products.find((p) => p.brand === slug && !!p.image), [products]);

  // The hero rotates through: the currently featured brand (from dashboard) + top personal picks.
  const spotlight = useMemo(() => {
    const feat = brands.find((b) => b.slug === featured);
    const top = rankedBrands.filter((b) => b.slug !== featured).slice(0, 4);
    return [feat, ...top].filter((b): b is NonNullable<typeof b> => !!b);
  }, [brands, featured, rankedBrands]);

  // Recently added pieces — latest products with a real image.
  const freshProducts = useMemo(() => {
    const withImg = products.filter((p) => !!p.image);
    return withImg
      .slice()
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      .slice(0, 12);
  }, [products]);

  const editorPicks = useMemo(() => {
    const feat = brands.find((b) => b.slug === featured);
    if (!feat) return [];
    return [feat, ...rankedBrands.filter((b) => b.plan === "premium" || b.plan === "signature").filter((b) => b.slug !== feat.slug)].slice(0, 8);
  }, [brands, featured, rankedBrands]);

  // Marquee content — pull the newest activity, fall back to the brand mantra when quiet.
  const tickerItems = useMemo(() => {
    const recentBrand = brands.filter((b) => b.createdAt).sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")).slice(0, 4);
    const cutoff = (now || 0) - 3 * 864e5;
    const upcoming = drops.filter((d) => Date.parse(d.at) > cutoff).slice(0, 3);
    const active = promos.filter((p) => p.active).slice(0, 3);
    const items: React.ReactNode[] = [];
    for (const b of recentBrand) {
      items.push(<span key={`nb-${b.slug}`}><span className="font-semibold">{b.name}</span> just landed on Kindred</span>);
    }
    for (const d of upcoming) {
      const b = brands.find((x) => x.slug === d.brand);
      if (b) items.push(<span key={`d-${d.id}`}><span className="font-semibold">{b.name}</span> drops {d.title} · {new Date(d.at).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}</span>);
    }
    for (const p of active) {
      const b = brands.find((x) => x.slug === p.brand);
      if (b) items.push(<span key={`p-${p.id}`}>{p.pct}% off at <span className="font-semibold">{b.name}</span></span>);
    }
    if (items.length === 0) {
      const mantra = ["small brands · real people · made in real places", "buy once · wear for years", "every founder answers their own DMs", "one bag, many labels", "no big-box, no dropship"];
      return mantra.map((m, i) => <span key={`m-${i}`}>{m}</span>);
    }
    return items;
  }, [brands, drops, promos, now]);

  const initials = session.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const rail = [["/", "⌗", "Discover"], ["/explore", "◎", "Explore"], ["/brands", "⌂", "Brands"], ["/account", "♡", "Saved"], ["/messages", "✉", "Messages"], ["/lookbooks", "◫", "Lookbooks"]] as const;

  return (
    <div className="mx-auto flex max-w-[1440px]">
      {/* Icon rail (unchanged from prior home) */}
      <aside className="hidden lg:flex w-[82px] flex-none flex-col items-center gap-6 border-r border-ink/7 py-6 sticky top-[64px] h-[calc(100vh-64px)]">
        <Link href="/" className="grid h-[30px] w-[30px] place-items-center rounded-[10px] bg-sage text-[13px] font-bold text-paper">k</Link>
        <button onClick={() => openSearch()} className="grid h-11 w-11 place-items-center rounded-pill bg-ink text-[15px] text-paper" aria-label="Search">⌕</button>
        <div className="flex flex-col items-center gap-4">
          {rail.map(([href, icon, label]) => (
            <Link
              key={href}
              href={href}
              title={label}
              className={clsx(
                "grid h-[38px] w-[38px] place-items-center rounded-pill text-[15px] shadow-[inset_0_0_0_1px_rgba(18,26,36,.12)]",
                href === "/" ? "bg-white text-ink" : "text-ink/45 hover:text-ink",
              )}
            >
              {icon}
            </Link>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex flex-col items-center gap-4 text-[15px] text-ink/40">
          <Link href={session.role === "brand" ? "/dashboard" : "/sell"} title="Sell">⚙</Link>
          <Link href="/account" title="Account">⏻</Link>
        </div>
      </aside>

      <Page className="flex-1 pt-4 md:pt-6 !px-4 md:!px-8">
        {/* Mobile greeting */}
        <div className="mb-4 flex items-center gap-3 md:hidden">
          <Link href="/account" className="grid h-[34px] w-[34px] place-items-center rounded-pill bg-sand text-[11px] font-semibold text-ink/60">{initials}</Link>
          <div className="flex-1">
            <div className="text-[10px] text-ink/45">{greet}</div>
            <div className="text-[14px] font-bold tracking-[-.02em]">{session.name}</div>
          </div>
          <button onClick={() => openBag()} className="relative grid h-[34px] w-[34px] place-items-center rounded-pill bg-white text-[12px] soft" aria-label="Bag">
            ⛭{bagCount > 0 && <span className="absolute -right-[3px] -top-[3px] grid h-4 min-w-4 place-items-center rounded-pill bg-sage px-1 text-[9px] font-bold text-paper">{bagCount}</span>}
          </button>
        </div>

        {/* Section 1 · HeroSpotlight — falls back to a plain welcome card if we have zero brands yet. */}
        <div className="rise">
          {spotlight.length > 0 ? (
            <HeroSpotlight brands={spotlight} productFor={productFor} />
          ) : (
            <EmptyDayOneHero name={session.name} />
          )}
        </div>

        {/* Section 2 · Marquee ticker */}
        <div className="mt-4 md:mt-5 rise">
          <div className="relative overflow-hidden rounded-pill bg-ink text-paper">
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-ink to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-ink to-transparent" />
            <Marquee speed={65} gap={48} className="py-[10px]">
              {tickerItems.map((item, i) => (
                <span key={i} className="mono flex items-center gap-3 whitespace-nowrap text-[11.5px] uppercase tracking-[.14em]">
                  <span className="inline-block h-[6px] w-[6px] flex-none rounded-pill bg-paper/60" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </Marquee>
          </div>
        </div>

        {/* Section 3 · Category tiles */}
        <div className="mt-8 rise">
          <SectionHeader eyebrow="Shop the racks" title="Every category, one bag" href="/explore" linkLabel="All of Explore" />
          <CategoryTiles />
        </div>

        {/* Section 4 · New this week */}
        <div className="mt-10 rise">
          <NewThisWeek brands={brands} products={products} />
        </div>

        {/* Section 5 · Brands you'll like */}
        {rankedBrands.length > 0 && (
          <div className="mt-10 rise">
            <BrandRail
              eyebrow="For you"
              title={styleTags.length > 0 ? "Brands you'll like" : "Brands to start with"}
              href="/brands"
              linkLabel="All brands"
              brands={rankedBrands.slice(0, 10)}
              variant="cover"
              productFor={productFor}
            />
          </div>
        )}

        {/* Section 6 · Recently added pieces */}
        {freshProducts.length > 0 && (
          <div className="mt-10 rise">
            <SectionHeader eyebrow="Just in" title="Recently added pieces" href="/explore" linkLabel="See more" />
            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:gap-4 md:px-0 stagger">
              {freshProducts.map((p) => {
                const b = brands.find((x) => x.slug === p.brand);
                const accent = b?.accent ?? "var(--sage)";
                return (
                  <div
                    key={p.slug}
                    className="w-[180px] flex-none snap-start md:w-[220px]"
                    style={{ ["--brand-accent" as string]: accent }}
                  >
                    <ProductCard p={p} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 7 · Editor's picks */}
        {editorPicks.length > 0 && (
          <div className="mt-10 rise">
            <BrandRail
              eyebrow="Editor's picks"
              title="Featured this week"
              href="/brands?sort=Trending"
              linkLabel="See all"
              brands={editorPicks}
              variant="portrait"
              productFor={productFor}
            />
          </div>
        )}

        {/* Following highlights: keep the "matched to your saved sizes" shortcut for logged-in shoppers */}
        {follows.length > 0 && (
          <div className="mt-10 rise">
            <SectionHeader eyebrow={`Following · ${follows.length}`} title="New from your makers" href="/?feed=Following" linkLabel="Following feed" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {rankedProducts.filter((p) => follows.includes(p.brand)).slice(0, 4).map((p) => (
                <ProductCard key={p.slug} p={p} compact />
              ))}
            </div>
          </div>
        )}

        {/* Section 8 · Live activity + tiny CTA row */}
        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-[1fr_1fr] rise">
          <LiveActivity />
          <Link
            href="/sell"
            className="grad-warm lift-color group flex items-center gap-4 rounded-[22px] p-5 md:p-6"
          >
            <span className="grid h-10 w-10 flex-none place-items-center rounded-pill bg-ink text-[16px] text-paper">
              <Sparkles size={14} color="var(--paper)" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-[.14em] text-ink/50">Your label</div>
              <div className="mt-[2px] text-[15px] font-semibold tracking-[-.015em]">Open a brand page on Kindred</div>
              <div className="mt-[2px] text-[11.5px] text-ink/55">Onboarding takes five minutes. Every answer becomes a filter.</div>
            </div>
            <span className="hidden md:grid h-8 w-8 flex-none place-items-center rounded-pill bg-white text-[13px] transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Bottom money band — the total quiet count. */}
        <div className="mt-14 pb-6 text-center text-[10.5px] font-medium uppercase tracking-[.16em] text-ink/40">
          {brands.length > 0 ? `${brands.length} independent brand${brands.length === 1 ? "" : "s"} · ${products.length} piece${products.length === 1 ? "" : "s"}` : "Kindred, day one"}
        </div>
      </Page>
    </div>
  );
}

function EmptyDayOneHero({ name }: { name: string }) {
  return (
    <section className="grad-hero relative overflow-hidden rounded-[26px]">
      <div className="relative flex min-h-[380px] flex-col justify-center gap-4 p-6 md:p-12">
        <div className="text-[10px] font-semibold uppercase tracking-[.18em] text-ink/60">Welcome{name ? `, ${name.split(" ")[0]}` : ""}</div>
        <h1 className="text-[44px] leading-[0.98] tracking-[-.02em] md:text-[68px]" style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}>
          Small labels.<br />Big wardrobes.
        </h1>
        <p className="max-w-[440px] text-[14px] leading-[1.55] text-ink/70">
          Kindred is a marketplace for clothing you buy once and wear for years. Independent labels, their own words, one bag.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/explore" className="press rounded-pill bg-ink px-5 py-[12px] text-[12px] font-semibold text-paper">Start exploring</Link>
          <Link href="/sell" className="press rounded-pill bg-white/90 px-5 py-[12px] text-[12px] font-semibold text-ink soft">Sell your brand</Link>
        </div>
      </div>
    </section>
  );
}

