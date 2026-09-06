/* eslint-disable @next/next/no-img-element -- brand-supplied image URLs come from any host; next/image needs allow-listed remotePatterns */
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { POSTS, brandTier, lookCount, planOf, type Brand } from "@/lib/data";
import { useApp } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import { FollowButton } from "@/components/BrandCard";
import { Button, Label, Placeholder, Verified, Page } from "@/components/ui";
import ShareBrand from "@/components/ShareBrand";
import Countdown, { useNow } from "@/components/Countdown";
import { styleOverlap } from "@/lib/looks";
import { OwnerEditLayer } from "@/components/OwnerEditLayer";
import InlineEdit from "@/components/InlineEdit";
import CoverMedia from "@/components/CoverMedia";
import { patternStyle } from "@/lib/patterns";
import BrandRail from "@/components/BrandRail";
import { relatedBrands, toSignal } from "@/lib/rank";
import { useMemo } from "react";

const TABS = ["Shop", "Lookbooks", "About", "Posts"];

export default function BrandView({ slug }: { slug: string }) {
  const { brands, products, hydrated, drops, promos, session, follows, posts, likePost, openThreadWith, allLookbooks, recordView, views, styleTags, reviews, upsertBrand, sizes, saved, recent, waitlist, alerts, orders } = useApp();
  const router = useRouter();
  const counted = useRef<string | null>(null);
  useEffect(() => { if (hydrated && counted.current !== slug) { counted.current = slug; recordView(slug); } }, [slug, hydrated, recordView]);
  const search = useSearchParams();
  const initialTab = search?.get("tab") ?? "Shop";
  const [tab, setTab] = useState(TABS.includes(initialTab) ? initialTab : "Shop");
  const now = useNow();
  const b = brands.find((x) => x.slug === slug);
  // Save a single-field patch to the brand row. Every InlineEdit funnels through here.
  // Declared before any early return so hook order stays stable.
  const save = useCallback(async (patch: Partial<Brand>) => {
    if (!b) return { ok: false as const, error: "brand not loaded" };
    return await upsertBrand({ ...(b as Brand), ...patch });
  }, [upsertBrand, b]);
  const signal = useMemo(() => toSignal({ styleTags, sizes, follows, saved, recent, waitlist, alerts, orders, views }), [styleTags, sizes, follows, saved, recent, waitlist, alerts, orders, views]);
  const related = useMemo(() => (b ? relatedBrands(b, brands, signal, 6) : []), [b, brands, signal]);
  const productFor = useMemo(() => (s: string) => products.find((p) => p.brand === s && !!p.image), [products]);
  if (!b) return <Page className="pt-20 text-center"><h1 className="mb-2 text-[28px] font-extrabold tracking-[-.03em]">{hydrated ? "No brand here yet." : "Loading…"}</h1>{hydrated && <p className="text-[14px] text-ink/55">Nothing lives at /brand/{slug}. <Link href="/explore" className="font-semibold text-ink">Browse brands →</Link></p>}</Page>;
  const own = products.filter((p) => p.brand === b.slug);
  const ownSlugs = new Set(own.map((p) => p.slug));
  const brandReviews = reviews.filter((r) => ownSlugs.has(r.product));
  const avgRating = brandReviews.length ? (brandReviews.reduce((s, r) => s + r.stars, 0) / brandReviews.length).toFixed(1) : undefined;
  const books = allLookbooks.filter((l) => l.brand === b.slug);
  const drop = drops.find((d) => d.brand === b.slug && new Date(d.at).getTime() > (now || 0));
  const promo = promos.find((p) => p.active && p.brand === b.slug);
  const isOwner = session.role === "brand" && session.brand === b.slug;
  const followers = b.followers + (follows.includes(b.slug) && b.followers === 0 ? 1 : 0);
  return (
    <OwnerEditLayer enabled={isOwner}>
    <Page className="pt-4 md:pt-6" style={{ ["--sage" as string]: b.accent ?? "var(--sage)", ["--accent2" as string]: b.accent2 ?? b.accent ?? "var(--sage)", background: b.bg ?? "transparent" }}>
      {/* Story-first hero: motto or story leads in giant serif. Cover moves below the grid. */}
      {(b.heroStyle ?? "cover") === "story-first" && (b.motto || b.story || isOwner) && (
        <section className="relative mb-4 overflow-hidden rounded-lg p-8 md:p-12" style={{ background: "var(--paper-warm, var(--paper))" }}>
          <div className="absolute inset-0 pointer-events-none" style={patternStyle(b.pattern, b.accent ?? "var(--ink)", 0.08)} aria-hidden="true" />
          <div className="relative">
            {b.motto && <p className="mb-4 max-w-[820px] text-[36px] md:text-[64px] leading-[.98] tracking-[-.02em] text-ink" style={{fontFamily:"var(--font-instrument), Georgia, serif"}}>{b.motto}</p>}
            {b.story && <p className="max-w-[640px] text-[15px] md:text-[17px] leading-[1.55] text-ink/70">{(b.story ?? "").split(/\n+/)[0]}</p>}
          </div>
        </section>
      )}
      <div className={clsx(
        "relative gap-4 md:gap-5 items-stretch",
        (b.heroStyle ?? "cover") === "cover" && "grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]",
        (b.heroStyle ?? "cover") === "portrait" && "flex flex-col-reverse lg:flex-col-reverse",
        (b.heroStyle ?? "cover") === "split" && "grid md:grid-cols-2",
        (b.heroStyle ?? "cover") === "story-first" && "grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]",
      )}>
        {/* Pattern backing: sits under the hero grid, tinted with the accent color. */}
        {(b.pattern ?? "none") !== "none" && (b.heroStyle ?? "cover") !== "story-first" && (
          <div className="pointer-events-none absolute inset-0 -z-[1] rounded-lg" style={patternStyle(b.pattern, b.accent ?? "var(--ink)", 0.06)} aria-hidden="true" />
        )}
        <div
          className={clsx(
            "order-2 flex flex-col rounded-lg p-6 md:p-8 lg:order-1",
            (b.heroStyle ?? "cover") === "split"
              ? "text-paper"
              : "card",
          )}
          style={(b.heroStyle ?? "cover") === "split" ? { background: b.accent2 ? `linear-gradient(135deg, ${b.accent ?? "#7C8C6F"}, ${b.accent2})` : (b.accent ?? "var(--sage)") } : undefined}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-12 w-12 flex-none place-items-center overflow-hidden rounded-[16px] text-[15px] font-extrabold tracking-[-.04em]" style={{ background: b.tint, color: b.ink }}>{b.logo ? <img loading="lazy" decoding="async" src={b.logo} alt={b.name} className="h-full w-full object-cover" /> : b.init}</div>
            <div className="min-w-0"><InlineEdit kind="text" label="Location" placeholder="City, CC" value={`${b.city}, ${b.country}`} onSave={async (next) => { const [city, country] = (next ?? "").split(",").map((s) => s.trim()); return await save({ city: city ?? b.city, country: (country ?? b.country).toUpperCase().slice(0, 2) }); }}><div className="label">{b.city}, {b.country}{b.founded ? ` · since ${b.founded}` : ""}</div></InlineEdit><div className="mt-[3px] truncate text-[12px] text-ink/50">{brandTier(followers)} · {b.batch} batch · ships from {b.shipsFrom}</div></div>
            <div className="ml-auto flex flex-none gap-2">
              {isOwner && <Link href="/dashboard" className="rounded-pill bg-ink px-4 py-2 text-[11px] font-semibold text-paper">Dashboard</Link>}
              <ShareBrand b={b} className="press grid h-[38px] w-[38px] place-items-center rounded-md bg-cream text-ink/70" />
            </div>
          </div>
          <div className="mb-2 flex flex-wrap items-center gap-[9px]"><InlineEdit kind="text" label="Brand name" value={b.name} onSave={async (next) => await save({ name: (next ?? b.name).trim() || b.name })}><h1 className="text-[36px] md:text-[52px] leading-[.95]" style={{fontFamily: b.headlineFont === "sans" ? "var(--font-jakarta), system-ui, sans-serif" : "var(--font-instrument), Georgia, serif", fontWeight: b.headlineFont === "sans" ? 800 : 400, letterSpacing: b.headlineFont === "sans" ? "-.03em" : "-.015em"}}>{b.name}</h1></InlineEdit>{b.verified && <Verified size={20} />}{(b.plan === "premium" || b.plan === "signature") && <span className="rounded-pill px-3 py-1 text-[10px] font-semibold uppercase tracking-[.14em] text-paper" style={{ background: planOf(b.plan).badgeBg }}>{planOf(b.plan).badge}</span>}</div>
          {(b.motto || isOwner) && (
            <InlineEdit kind="text" label="Motto" clearable placeholder="A short manifesto." value={b.motto} onSave={async (next) => await save({ motto: next })}>
              {b.motto ? <p className="mb-3 max-w-[520px] text-[24px] md:text-[30px] leading-[1.05] tracking-[-.015em] text-ink" style={{fontFamily:"var(--font-instrument), Georgia, serif"}}>{b.motto}</p> : <p className="mb-3 text-[13px] italic text-ink/40">Add a motto — one line in big serif.</p>}
            </InlineEdit>
          )}
          <InlineEdit kind="textarea" label="Tagline" value={b.tagline} onSave={async (next) => await save({ tagline: (next ?? b.tagline).trim() || b.tagline })}>
            <p className="mb-5 max-w-[460px] text-[14px] md:text-[15px] leading-[1.55] text-ink/60">{b.tagline}</p>
          </InlineEdit>
          <div className="mb-6 flex flex-wrap gap-2">
            {styleOverlap(b.styles, styleTags) > 0 && (
              <span
                className="rounded-pill px-[14px] py-2 text-[11px] font-semibold text-paper"
                style={b.accent2 ? { background: `linear-gradient(135deg, ${b.accent ?? "#7C8C6F"}, ${b.accent2})` } : { background: b.accent ?? "var(--sage)" }}
              >For you · {styleOverlap(b.styles, styleTags)} shared style{styleOverlap(b.styles, styleTags) === 1 ? "" : "s"}</span>
            )}
            {[...b.styles.map((s) => [s, `/brands?style=${encodeURIComponent(s)}`]), ...b.values.slice(0, 3).map((v) => [v, `/explore?q=${encodeURIComponent(v)}`]), [`Made in ${b.madeIn}`, `/brands`], [`$${b.priceBand[0]}–$${b.priceBand[1]}`, `/explore?q=${encodeURIComponent("under $" + b.priceBand[1])}`], [`${b.sizeRange[0]}–${b.sizeRange[1]}`, "/explore"]].map(([t, href]) => <Link key={t} href={href} className="rounded-pill bg-cream px-[14px] py-2 text-[11px] font-semibold text-ink/72">{t}</Link>)}
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-3">
            <FollowButton slug={b.slug} size="lg" className="flex-1 sm:flex-none" />
            <Button variant="secondary" size="lg" className="flex-1 sm:flex-none" onClick={() => { const id = openThreadWith(b.slug); router.push(id ? `/messages?t=${id}` : `/messages?to=${b.slug}`); }}>Message</Button>
            <div className="ml-auto hidden gap-5 sm:flex">
              {([[own.length, "Items"] as [React.ReactNode, string], [followers.toLocaleString(), "Followers"], ...(avgRating ? [[avgRating, "Rating"] as [React.ReactNode, string]] : []), ...(isOwner ? [[(views[b.slug] ?? 0).toLocaleString(), "Views"] as [React.ReactNode, string]] : [])]).map(([v, l]) => <div key={l} className="text-right"><div className="text-[18px] font-bold tracking-[-.03em]">{v}</div><div className="label !text-[9.5px]">{l}</div></div>)}
            </div>
          </div>
        </div>
        <div className={clsx(
          "order-1 lg:order-2",
          (b.heroStyle ?? "cover") === "portrait" && "w-full",
        )}>
          <InlineEdit kind="image" label="Cover image URL" clearable placeholder="https://…" value={b.cover} onSave={async (next) => await save({ cover: next })} className="block w-full">
            <CoverMedia
              cover={b.cover}
              coverVideo={b.coverVideo}
              alt={`${b.name} cover`}
              className={clsx(
                "block w-full overflow-hidden rounded-lg",
                (b.heroStyle ?? "cover") === "portrait" ? "h-[300px] md:h-[520px]" : "h-[220px] md:h-[300px] lg:h-auto lg:min-h-[400px]",
              )}
            />
          </InlineEdit>
          {isOwner && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <InlineEdit kind="image" label="Cover video URL" clearable placeholder="MP4 or YouTube/Vimeo…" value={b.coverVideo} onSave={async (next) => await save({ coverVideo: next })}>
                <span className="mono block truncate rounded-sm bg-cream px-2 py-[6px] text-[10.5px] text-ink/60">{b.coverVideo ?? "+ Cover video"}</span>
              </InlineEdit>
              <InlineEdit
                kind="select" label="Hero layout" value={b.heroStyle ?? "cover"}
                options={[{value:"cover",label:"Cover · storefront + image"},{value:"portrait",label:"Portrait · full-bleed on top"},{value:"split",label:"Split · 50/50"},{value:"story-first",label:"Story first · giant serif"}]}
                onSave={async (next) => await save({ heroStyle: (next as Brand["heroStyle"]) ?? "cover" })}
              >
                <span className="mono block truncate rounded-sm bg-cream px-2 py-[6px] text-[10.5px] text-ink/60">Layout · {b.heroStyle ?? "cover"}</span>
              </InlineEdit>
              <InlineEdit
                kind="select" label="Pattern" value={b.pattern ?? "none"}
                options={[{value:"none",label:"None"},{value:"grid",label:"Grid"},{value:"dot",label:"Dot"},{value:"arch",label:"Arch"},{value:"wave",label:"Wave"},{value:"grain",label:"Grain"}]}
                onSave={async (next) => await save({ pattern: (next as Brand["pattern"]) ?? "none" })}
              >
                <span className="mono block truncate rounded-sm bg-cream px-2 py-[6px] text-[10.5px] text-ink/60">Pattern · {b.pattern ?? "none"}</span>
              </InlineEdit>
              <InlineEdit
                kind="select" label="Headline font" value={b.headlineFont ?? "serif"}
                options={[{value:"serif",label:"Serif · Instrument"},{value:"sans",label:"Sans · Jakarta"}]}
                onSave={async (next) => await save({ headlineFont: (next as "serif" | "sans") ?? "serif" })}
              >
                <span className="mono block truncate rounded-sm bg-cream px-2 py-[6px] text-[10.5px] text-ink/60">Font · {b.headlineFont ?? "serif"}</span>
              </InlineEdit>
              <InlineEdit kind="color" label="Accent" value={b.accent ?? ""} onSave={async (next) => await save({ accent: next })} clearable>
                <span className="flex items-center gap-2 rounded-sm bg-cream px-2 py-[6px] text-[10.5px] text-ink/60"><span className="inline-block h-4 w-4 rounded-sm" style={{ background: b.accent ?? "var(--sage)" }} />Accent</span>
              </InlineEdit>
              <InlineEdit kind="color" label="Accent 2" value={b.accent2 ?? ""} onSave={async (next) => await save({ accent2: next })} clearable>
                <span className="flex items-center gap-2 rounded-sm bg-cream px-2 py-[6px] text-[10.5px] text-ink/60"><span className="inline-block h-4 w-4 rounded-sm" style={{ background: b.accent2 ?? "transparent", boxShadow: b.accent2 ? "none" : "inset 0 0 0 1px rgba(18,26,36,.2)" }} />{b.accent2 ? "Accent 2" : "+ Accent 2"}</span>
              </InlineEdit>
            </div>
          )}
        </div>
      </div>

      <div className="card mt-4 flex gap-5 rounded-lg px-[18px] py-[14px] sm:hidden">
        {([[own.length, "Items"] as [React.ReactNode, string], [followers.toLocaleString(), "Followers"], ...(avgRating ? [[avgRating, "Rating"] as [React.ReactNode, string]] : [])]).map(([v, l]) => <div key={l}><div className="text-[16px] font-bold tracking-[-.03em]">{v}</div><div className="label !text-[9.5px]">{l}</div></div>)}
      </div>

      {(b.intro || b.quote || isOwner) && (
        <section className="mt-8 grid gap-4 md:grid-cols-[1.5fr_1fr] items-start">
          <InlineEdit kind="textarea" label="Intro paragraph" clearable placeholder="A longer intro that lives at the top of your brand page." value={b.intro} onSave={async (next) => await save({ intro: next })}>
            {b.intro
              ? <div className="card rounded-lg p-6 md:p-8 text-[15px] leading-[1.65] text-ink/75" style={{whiteSpace:"pre-wrap"}}>{b.intro}</div>
              : isOwner
                ? <div className="card rounded-lg p-6 md:p-8 text-[13px] italic text-ink/40">Add an intro paragraph.</div>
                : null}
          </InlineEdit>
          <div className="flex flex-col gap-3">
            <InlineEdit kind="textarea" label="Pull quote" clearable placeholder='"A short quote from press or a customer."' value={b.quote} onSave={async (next) => await save({ quote: next })}>
              {b.quote ? (
                <div
                  className="rounded-lg p-6 md:p-8 text-paper"
                  style={{ background: b.accent2 ? `linear-gradient(135deg, ${b.accent ?? "#7C8C6F"}, ${b.accent2})` : (b.accent ?? "var(--sage)") }}
                >
                  <div className="mb-3 text-[10px] font-semibold uppercase tracking-[.14em] text-paper/70">In their own words</div>
                  <blockquote className="text-[22px] md:text-[26px] leading-[1.2] tracking-[-.015em]" style={{fontFamily:"var(--font-instrument), Georgia, serif"}}>&ldquo;{b.quote}&rdquo;</blockquote>
                </div>
              ) : isOwner ? (
                <div className="rounded-lg border border-dashed border-ink/25 p-6 text-[13px] italic text-ink/40">Add a pull quote.</div>
              ) : null}
            </InlineEdit>
            {b.quote && (
              <InlineEdit kind="text" label="Attribution" clearable placeholder="— Their name / Where it ran" value={b.quoteBy} onSave={async (next) => await save({ quoteBy: next })}>
                {b.quoteBy ? <div className="text-[12px] text-ink/60">— {b.quoteBy}</div> : isOwner ? <div className="text-[12px] italic text-ink/40">Add attribution.</div> : null}
              </InlineEdit>
            )}
          </div>
        </section>
      )}
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
              <Placeholder src={x.image} label="Post" className="h-[300px]">
                {x.products.length > 0 && <span className="glass-chip absolute bottom-[14px] left-[14px] rounded-pill px-[14px] py-[7px] text-[11.5px] font-medium">{x.products.length} tagged</span>}
                {(x.source === "instagram" || x.source === "tiktok") && (
                  x.externalUrl ? (
                    <a href={x.externalUrl} target="_blank" rel="noreferrer noopener" className="glass-chip absolute right-[14px] top-[14px] rounded-pill px-[10px] py-[5px] text-[10.5px] font-semibold uppercase tracking-[.08em]">{x.source === "instagram" ? "IG ↗" : "TT ↗"}</a>
                  ) : (
                    <span className="glass-chip absolute right-[14px] top-[14px] rounded-pill px-[10px] py-[5px] text-[10.5px] font-semibold uppercase tracking-[.08em]">{x.source === "instagram" ? "IG" : "TT"}</span>
                  )
                )}
              </Placeholder>
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
            <InlineEdit kind="textarea" label="Full story" value={b.story ?? ""} onSave={async (next) => await save({ story: (next ?? "").trim() })}>
              <div>{(b.story ?? "").split(/\n+/).map((para, i) => <p key={i} className="mb-[14px] text-[14.5px] leading-[1.7] text-ink/68">{para}</p>)}</div>
            </InlineEdit>
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
                <div className="flex justify-between"><span>Returns</span><span className="font-medium text-ink">Handled by brand</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "You might also like" — cross-brand recs. Only render when we have 3+ candidates. */}
      {related.length >= 3 && (
        <section className="mt-10 md:mt-14">
          <BrandRail
            eyebrow="You might also like"
            title={`If you like ${b.name}`}
            href="/brands"
            linkLabel="All brands"
            brands={related}
            variant="cover"
            productFor={productFor}
          />
        </section>
      )}
    </Page>
    </OwnerEditLayer>
  );
}
