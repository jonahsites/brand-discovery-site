"use client";
/**
 * Horizontal scroll rail of brand cards with snap. Two visual variants:
 * "cover" — landscape cover card with brand name overlaid (feels like a
 * magazine feature); "portrait" — tall product-lead card with brand row
 * underneath.
 *
 * Arrow buttons control scroll on desktop. On touch devices the native swipe
 * takes over. The rail respects the current --brand-accent scope so each card
 * can tint its own hover ground.
 */
import Link from "next/link";
import { useCallback, useRef, useState, type ReactNode, type CSSProperties } from "react";
import clsx from "clsx";
import type { Brand, Product } from "@/lib/data";
import { fmtFollowers } from "@/lib/data";
import { Placeholder } from "@/components/ui";
import { FollowButton } from "@/components/BrandCard";
import SectionHeader from "@/components/SectionHeader";
import Sparkles from "@/components/Sparkles";

type Variant = "cover" | "portrait";

export default function BrandRail({
  title,
  eyebrow,
  href = "/brands",
  linkLabel,
  brands,
  variant = "cover",
  productFor,
  newBadgeFor,
  emptyLabel,
}: {
  title: ReactNode;
  eyebrow?: string;
  href?: string;
  linkLabel?: string;
  brands: Brand[];
  variant?: Variant;
  /** Optional resolver from brand slug → hero product (for cover art). */
  productFor?: (slug: string) => Product | undefined;
  /** Optional predicate to show a "NEW" pistachio pill. */
  newBadgeFor?: (b: Brand) => boolean;
  emptyLabel?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.7), behavior: "smooth" });
  };

  if (brands.length === 0) {
    if (!emptyLabel) return null;
    return (
      <div>
        <SectionHeader eyebrow={eyebrow} title={title} />
        <div className="card rounded-[22px] p-8 text-center text-[13px] text-ink/55">{emptyLabel}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <SectionHeader eyebrow={eyebrow} title={title} href={href} linkLabel={linkLabel} className="flex-1 mb-3" />
        <div className="hidden md:flex items-center gap-2 mb-3">
          <RailArrow dir="prev" enabled={canPrev} onClick={() => scrollBy(-1)} />
          <RailArrow dir="next" enabled={canNext} onClick={() => scrollBy(1)} />
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={updateArrows}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:gap-4 md:px-0"
      >
        {brands.map((b) =>
          variant === "cover" ? (
            <CoverCard key={b.slug} b={b} hero={productFor?.(b.slug)} isNew={!!newBadgeFor?.(b)} />
          ) : (
            <PortraitCard key={b.slug} b={b} hero={productFor?.(b.slug)} isNew={!!newBadgeFor?.(b)} />
          ),
        )}
      </div>
    </div>
  );
}

function CoverCard({ b, hero, isNew }: { b: Brand; hero?: Product; isNew: boolean }) {
  const accent = b.accent ?? "var(--sage)";
  const style: CSSProperties = { ["--brand-accent" as string]: accent };
  return (
    <Link
      href={`/brand/${b.slug}`}
      className="lift-color relative flex h-[260px] w-[260px] flex-none snap-start flex-col overflow-hidden rounded-[24px] bg-cream md:h-[300px] md:w-[300px]"
      style={style}
    >
      <div className="absolute inset-0">
        <Placeholder src={hero?.image} className="absolute inset-0 h-full w-full" />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, transparent 30%, ${accent}44 55%, ${accent}dd 100%)` }}
        />
      </div>
      <div className="relative z-10 flex flex-1 flex-col justify-end p-5 text-paper">
        <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.14em] opacity-90">
          {isNew && <Sparkles size={11} color="var(--paper)" />}
          {isNew ? "New brand" : b.city}
        </div>
        <div
          className="text-[24px] leading-[1.02] md:text-[28px]"
          style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}
        >
          {b.name}
        </div>
        <div className="mt-1 line-clamp-2 text-[12px] text-paper/85">{b.tagline}</div>
        <div className="mt-3 flex items-center justify-between text-[11px]">
          <span className="text-paper/75">{fmtFollowers(b.followers)} followers</span>
          <FollowButton slug={b.slug} size="sm" />
        </div>
      </div>
    </Link>
  );
}

function PortraitCard({ b, hero, isNew }: { b: Brand; hero?: Product; isNew: boolean }) {
  const accent = b.accent ?? "var(--sage)";
  const style: CSSProperties = { ["--brand-accent" as string]: accent };
  return (
    <Link
      href={`/brand/${b.slug}`}
      className="lift-color card flex h-[380px] w-[240px] flex-none snap-start flex-col overflow-hidden rounded-[22px] p-[10px] md:w-[260px]"
      style={style}
    >
      <div className="relative overflow-hidden rounded-[16px]">
        <Placeholder src={hero?.image} className="aspect-[3/4]" />
        {isNew && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-pill bg-pistachio px-[9px] py-[3px] text-[9px] font-semibold uppercase tracking-[.14em] text-ink">
            <Sparkles size={9} color="var(--ink)" /> New
          </span>
        )}
      </div>
      <div className="mt-3 px-1 pb-1">
        <div className="text-[14px] font-semibold tracking-[-.015em]">{b.name}</div>
        <div className="mt-[2px] line-clamp-1 text-[11px] text-ink/50">{b.tagline}</div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10.5px] text-ink/45">{fmtFollowers(b.followers)} followers</span>
          <FollowButton slug={b.slug} size="sm" />
        </div>
      </div>
    </Link>
  );
}

function RailArrow({ dir, enabled, onClick }: { dir: "prev" | "next"; enabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir === "prev" ? "Scroll left" : "Scroll right"}
      onClick={onClick}
      disabled={!enabled}
      className={clsx(
        "press grid h-9 w-9 place-items-center rounded-pill bg-white text-[15px] transition-opacity soft",
        !enabled && "opacity-30 pointer-events-none",
      )}
    >
      {dir === "prev" ? "‹" : "›"}
    </button>
  );
}
