/* eslint-disable @next/next/no-img-element -- brand-supplied covers come from any host */
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { FollowButton } from "@/components/BrandCard";
import { IconArrow, IconHeart, IconBag, IconClose } from "@/components/Icon";
import { money } from "@/lib/data";
import { styleOverlap } from "@/lib/looks";

/**
 * A TikTok-style vertical discovery feed. One brand + one hero piece per screen; scroll snap
 * moves cleanly card-to-card. Right-side rail: Follow, Save, Bag. Left-side rail: brand name
 * (tap → brand page), tagline, price, tap-to-shop. Everything the shopper needs to decide
 * "yes/no" on a brand without leaving the feed.
 *
 * The feed is ordered by style overlap with the shopper's onboarding picks, so the first
 * couple of cards are the strongest matches and the tail fills with quality brands to widen
 * their taste.
 */
export default function ClientFeed() {
  const { brands, products, styleTags, follows, saved, toggleSaved, addToBag, openBag, priceOf, hydrated, toast } = useApp();
  const [i, setI] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const cards = useMemo(() => {
    // One card per brand — the hero product is the brand's first product with an image.
    const rows = brands
      .map((b) => ({ b, hero: products.find((p) => p.brand === b.slug && !!p.image), match: styleOverlap(b.styles, styleTags) }))
      .filter((r) => r.hero);
    return rows.sort((a, x) => x.match - a.match);
  }, [brands, products, styleTags]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollTop / el.clientHeight);
      if (idx !== i) setI(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [i]);

  if (!hydrated) return null;

  return (
    <div className="fixed inset-0 z-40 bg-ink text-paper">
      <div ref={scroller} className="h-full snap-y snap-mandatory overflow-y-scroll no-scrollbar">
        {cards.map(({ b, hero, match }, idx) => hero && (
          <section key={b.slug} className="relative h-[100dvh] w-full snap-start snap-always overflow-hidden">
            <img src={hero.image} alt={hero.name} loading={idx <= i + 1 ? "eager" : "lazy"} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,.85) 100%)" }} />

            {/* Chrome */}
            <div className="absolute inset-x-0 top-0 flex items-start justify-between px-5 pt-[max(20px,env(safe-area-inset-top))]">
              <div className="flex items-center gap-2 rounded-md bg-black/40 px-3 py-[7px] text-[11px] font-semibold uppercase tracking-[.14em] backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-pill" style={{ background: "var(--rust)" }} />
                Discover · {idx + 1} of {cards.length}
              </div>
              <Link href="/" aria-label="Close" className="press grid h-10 w-10 place-items-center rounded-md bg-black/40 text-paper backdrop-blur-sm"><IconClose size={18} /></Link>
            </div>

            {/* Left card */}
            <div className="absolute bottom-[calc(28px+env(safe-area-inset-bottom))] left-5 right-[76px] max-w-[520px]">
              <Link href={`/brand/${b.slug}`} className="mb-3 inline-flex items-center gap-2 rounded-md bg-black/40 px-3 py-[8px] backdrop-blur-sm">
                <div className="grid h-7 w-7 flex-none place-items-center overflow-hidden rounded-[6px] text-[10px] font-extrabold" style={{ background: b.tint, color: b.ink }}>{b.logo ? <img src={b.logo} alt="" className="h-full w-full object-cover" /> : b.init}</div>
                <span className="text-[13px] font-semibold">{b.name}</span>
                <span className="text-[10.5px] opacity-70">{b.city}, {b.country}</span>
                {match > 0 && <span className="ml-1 rounded-pill bg-sage px-2 py-[2px] text-[9.5px] font-semibold">Your look</span>}
              </Link>
              <div className="text-[36px] leading-[.98] tracking-[-.015em]" style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}>{b.tagline}</div>
              <div className="mt-4 flex items-center gap-3">
                <Link href={`/product/${hero.slug}`} className="press inline-flex items-center gap-2 rounded-md bg-paper px-4 py-[10px] text-[12.5px] font-semibold text-ink">Shop {hero.name} · {money(priceOf(hero).price)}<IconArrow size={14} /></Link>
                <FollowButton slug={b.slug} size="md" className={follows.includes(b.slug) ? "!bg-paper !text-ink" : "!bg-transparent !text-paper shadow-[inset_0_0_0_1.5px_rgba(246,244,239,.9)]"} />
              </div>
            </div>

            {/* Right rail */}
            <div className="absolute bottom-[calc(28px+env(safe-area-inset-bottom))] right-4 flex flex-col items-center gap-4">
              <button onClick={() => { toggleSaved(hero.slug); toast(saved.includes(hero.slug) ? "Removed from saved" : "Saved to your profile", "/account"); }} className="press grid h-11 w-11 place-items-center rounded-pill bg-black/40 text-paper backdrop-blur-sm" aria-label="Save"><IconHeart filled={saved.includes(hero.slug)} size={18} /></button>
              <button onClick={() => { addToBag(hero.slug, `${(hero.sizes ?? ["M"])[0]} · ${(hero.colors ?? ["Default"])[0]}`); openBag(); }} className="press grid h-11 w-11 place-items-center rounded-pill bg-paper text-ink" aria-label="Add to bag"><IconBag size={18} /></button>
            </div>

            {/* Scroll hint */}
            {idx === 0 && (
              <div className="pointer-events-none absolute inset-x-0 top-[54%] -translate-y-1/2 text-center text-[11px] font-semibold uppercase tracking-[.14em] text-paper/70">Scroll ↓ for the next brand</div>
            )}
          </section>
        ))}
        {cards.length === 0 && (
          <section className="relative grid h-[100dvh] w-full snap-start place-items-center bg-ink text-paper">
            <div className="text-center">
              <h1 className="mb-3 text-[36px] tracking-[-.015em]" style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}>No brands yet.</h1>
              <Link href="/brands" className="text-[13px] font-semibold underline">Browse the directory →</Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
