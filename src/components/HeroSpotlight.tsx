/* eslint-disable @next/next/no-img-element -- brand-supplied covers come from any host */
"use client";
/**
 * Full-bleed hero that rotates through featured brands. Each beat lasts
 * ~7 seconds and the section's ground tints toward the brand's accent so the
 * whole above-the-fold reads that brand for that beat. Pause on hover;
 * keyboard prev/next via ← →. Motion respects prefers-reduced-motion (via
 * a JS check that then stops the interval).
 */
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import clsx from "clsx";
import type { Brand, Product } from "@/lib/data";
import { Placeholder } from "@/components/ui";
import Sparkles from "@/components/Sparkles";

export default function HeroSpotlight({
  brands,
  productFor,
  intervalMs = 7000,
}: {
  brands: Brand[];
  productFor?: (slug: string) => Product | undefined;
  intervalMs?: number;
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (brands.length <= 1 || paused) return;
    const prefersReduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    timer.current = setInterval(() => setI((prev) => (prev + 1) % brands.length), intervalMs);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [brands.length, paused, intervalMs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setI((p) => (p - 1 + brands.length) % brands.length);
      if (e.key === "ArrowRight") setI((p) => (p + 1) % brands.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [brands.length]);

  if (brands.length === 0) return null;
  const b = brands[i % brands.length];
  const accent = b.accent ?? "var(--sage)";
  const hero = productFor?.(b.slug);
  const style: CSSProperties = { ["--brand-accent" as string]: accent };

  return (
    <section
      className="relative overflow-hidden rounded-[26px] grad-brand"
      style={style}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured brands"
    >
      <div className="relative flex min-h-[380px] flex-col md:min-h-[440px] md:flex-row">
        {/* Text side */}
        <div key={`text-${b.slug}`} className="relative z-10 flex flex-1 flex-col justify-center gap-4 p-6 md:p-12" style={{ animation: "rise .6s ease-out both" }}>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-ink/60">
            <Sparkles size={12} /> Featured brand
          </div>
          <h1
            className="text-[44px] leading-[0.96] tracking-[-.02em] md:text-[72px]"
            style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}
          >
            {b.name}
          </h1>
          <p className="max-w-[440px] text-[14px] leading-[1.55] text-ink/70 md:text-[15.5px]">{b.tagline}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Link
              href={`/brand/${b.slug}`}
              className="press rounded-pill px-5 py-[12px] text-[12px] font-semibold text-paper"
              style={{ background: accent }}
            >
              Visit brand →
            </Link>
            <Link
              href={`/brand/${b.slug}?tab=Posts`}
              className="press rounded-pill bg-white/90 px-5 py-[12px] text-[12px] font-semibold text-ink soft"
            >
              See the story
            </Link>
          </div>
          <div className="mt-2 text-[11px] text-ink/50">
            {b.city}, {b.country} · {b.styles.slice(0, 3).join(" · ") || "Independent"}
          </div>
        </div>

        {/* Image side */}
        <div className="relative w-full flex-1 overflow-hidden md:w-[48%]">
          <div key={`img-${b.slug}`} className="absolute inset-0" style={{ animation: "rise .8s ease-out both" }}>
            <Placeholder src={hero?.image} className="absolute inset-0 h-full w-full" />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: `linear-gradient(90deg, ${accent}22 0%, transparent 40%)` }}
            />
          </div>
          {hero && (
            <Link
              href={`/product/${hero.slug}`}
              className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-pill bg-white/95 px-3 py-[8px] text-[11px] font-semibold text-ink soft"
            >
              <span className="truncate max-w-[160px]">{hero.name}</span>
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </div>

      {/* Dots + arrows */}
      {brands.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-2 md:bottom-6">
          {brands.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setI(idx)}
              className={clsx(
                "pointer-events-auto h-[6px] rounded-pill transition-all duration-200",
                idx === i ? "w-6 bg-ink" : "w-[6px] bg-ink/25 hover:bg-ink/45",
              )}
              aria-label={`Feature ${idx + 1} of ${brands.length}`}
              aria-current={idx === i}
            />
          ))}
        </div>
      )}
    </section>
  );
}
