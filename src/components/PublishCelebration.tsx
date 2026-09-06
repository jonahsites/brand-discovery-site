"use client";
/**
 * Full-viewport takeover shown once when a brand first publishes their page.
 * Owns the whole screen with the brand's accent wash, sparkles around the
 * name in huge serif, tagline, and three primary actions.
 *
 * Dismiss with Escape or "Get started"; a localStorage flag keyed to the
 * slug keeps this from firing twice on the same device. The dedicated
 * /brand/[slug]/celebrate route renders this for owner-only re-triggering.
 */
import { useEffect } from "react";
import Link from "next/link";
import type { Brand } from "@/lib/data";
import Sparkles from "@/components/Sparkles";
import ShareBrand from "@/components/ShareBrand";

const LS_KEY = "kindred.celebrated";

export function markCelebrated(slug: string) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const obj = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    obj[slug] = new Date().toISOString();
    localStorage.setItem(LS_KEY, JSON.stringify(obj));
  } catch { /* ignore quota / private mode */ }
}

export function hasCelebrated(slug: string): boolean {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return false;
    const obj = JSON.parse(raw) as Record<string, string>;
    return !!obj[slug];
  } catch { return false; }
}

type Props = {
  b: Brand;
  /** Where to send the visitor when they close the celebration. */
  onDismiss: () => void;
};

export default function PublishCelebration({ b, onDismiss }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { markCelebrated(b.slug); onDismiss(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss, b.slug]);

  const accent = b.accent ?? "var(--sage)";
  const accent2 = b.accent2 ?? accent;

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${accent}, ${accent2})`, color: "var(--paper)" }}
      role="dialog"
      aria-label={`${b.name} is live on Kindred`}
    >
      <div className="flex items-center justify-between px-5 py-5 md:px-8 md:py-6">
        <div className="flex items-center gap-2">
          <span className="grid h-[26px] w-[26px] place-items-center rounded-[9px] bg-paper text-[12px] font-extrabold text-ink">k</span>
          <span className="text-[13px] font-semibold tracking-[-.02em]">Kindred</span>
        </div>
        <button
          type="button"
          onClick={() => { markCelebrated(b.slug); onDismiss(); }}
          aria-label="Close"
          className="press rounded-pill bg-paper/15 px-3 py-[6px] text-[11px] font-semibold text-paper"
        >Close · Esc</button>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mb-6 text-[10.5px] font-semibold uppercase tracking-[.24em] text-paper/70">You&apos;re live on Kindred</div>
        <div className="relative">
          <Sparkles size={22} color="var(--paper)" className="absolute -left-8 -top-4" />
          <Sparkles size={16} color="var(--paper)" className="absolute -right-6 top-1" />
          <h1 className="max-w-[900px] text-[56px] md:text-[112px] leading-[.94] tracking-[-.02em]" style={{fontFamily:"var(--font-instrument), Georgia, serif"}}>
            {b.name}
          </h1>
          <Sparkles size={20} color="var(--paper)" className="absolute -bottom-4 right-8" />
        </div>
        {b.tagline && <p className="mt-6 max-w-[560px] text-[15px] md:text-[19px] leading-[1.45] text-paper/85">{b.tagline}</p>}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/brand/${b.slug}`}
            onClick={() => markCelebrated(b.slug)}
            className="press rounded-pill bg-paper px-6 py-[13px] text-[12.5px] font-semibold text-ink"
          >Visit your page →</Link>
          <ShareBrand
            b={b}
            label="Share to Instagram / TikTok"
            className="press inline-flex items-center gap-2 rounded-pill bg-ink/75 px-6 py-[13px] text-[12.5px] font-semibold text-paper"
          />
          <Link
            href="/dashboard?tab=Products&new=1"
            onClick={() => markCelebrated(b.slug)}
            className="press rounded-pill bg-paper/20 px-6 py-[13px] text-[12.5px] font-semibold text-paper soft"
          >Post your first piece →</Link>
        </div>

        <button
          type="button"
          onClick={() => { markCelebrated(b.slug); onDismiss(); }}
          className="press mt-8 text-[12px] font-semibold uppercase tracking-[.14em] text-paper/80 underline-offset-4 hover:underline"
        >Get started</button>
      </div>

      <div className="px-6 pb-6 text-center text-[10.5px] font-medium uppercase tracking-[.18em] text-paper/60">
        Your page — cover, colors, motto, story — all editable in place. Look for the pencil.
      </div>
    </div>
  );
}
