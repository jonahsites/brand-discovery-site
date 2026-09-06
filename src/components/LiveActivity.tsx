"use client";
/**
 * Compact rolling activity feed. Reads live-ish signals from the app store —
 * drops going up, new brands landing, posts published — and rolls through
 * them one at a time. Hides itself when nothing is happening so we never show
 * an empty spinner card. Not a WebSocket yet: the app store hydrates from
 * Supabase on load and refreshes on user actions, and this component reacts
 * to changes in that shared client state (which is what the whole app does).
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Brand } from "@/lib/data";
import { useApp } from "@/lib/store";
import { useNow } from "@/components/Countdown";

type Item = { key: string; who: string; slug: string; verb: string; when: number };

function ago(now: number, when: number): string {
  const s = Math.max(1, Math.round((now - when) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export default function LiveActivity({ limit = 3 }: { limit?: number }) {
  const { brands, drops, posts, promos } = useApp();
  const now = useNow();
  const [idx, setIdx] = useState(0);

  const items = useMemo<Item[]>(() => {
    const byBrand = new Map<string, Brand>();
    brands.forEach((b) => byBrand.set(b.slug, b));
    const feed: Item[] = [];
    for (const b of brands) {
      if (!b.createdAt) continue;
      const when = Date.parse(b.createdAt);
      if (Number.isFinite(when)) feed.push({ key: `brand-${b.slug}`, who: b.name, slug: b.slug, verb: "just landed on Kindred", when });
    }
    for (const d of drops) {
      const b = byBrand.get(d.brand);
      if (!b) continue;
      const when = Date.parse(d.at);
      if (!Number.isFinite(when)) continue;
      feed.push({ key: `drop-${d.id}`, who: b.name, slug: b.slug, verb: when > now ? `dropping ${d.title}` : `dropped ${d.title}`, when });
    }
    for (const p of posts) {
      const b = byBrand.get(p.brand);
      if (!b) continue;
      const when = Date.parse(p.at);
      if (!Number.isFinite(when)) continue;
      feed.push({ key: `post-${p.id}`, who: b.name, slug: b.slug, verb: "posted an update", when });
    }
    for (const pr of promos.filter((x) => x.active)) {
      const b = byBrand.get(pr.brand);
      if (!b) continue;
      feed.push({ key: `promo-${pr.id}`, who: b.name, slug: b.slug, verb: `is running ${pr.pct}% off`, when: now });
    }
    return feed.sort((a, b) => b.when - a.when).slice(0, 12);
  }, [brands, drops, posts, promos, now]);

  useEffect(() => {
    if (items.length <= 1) return;
    const prefersReduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 4200);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;

  const window_ = items.slice(idx, idx + limit).length === limit ? items.slice(idx, idx + limit) : [...items.slice(idx), ...items.slice(0, limit - (items.length - idx))];

  return (
    <div className="card rounded-[22px] p-4 md:p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="relative grid h-[10px] w-[10px] place-items-center">
          <span className="absolute inset-0 rounded-pill bg-tone-hot/60" style={{ animation: "glow 1.6s ease-in-out infinite" }} />
          <span className="relative h-[6px] w-[6px] rounded-pill bg-rust" />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[.16em] text-ink/60">Live on Kindred</span>
      </div>
      <ul className="flex flex-col gap-2">
        {window_.map((it) => (
          <li key={it.key} className="flex items-center justify-between gap-3 text-[12.5px]">
            <span className="min-w-0 truncate">
              <Link href={`/brand/${it.slug}`} className="font-semibold text-ink hover:underline">{it.who}</Link>
              <span className="text-ink/60"> · {it.verb}</span>
            </span>
            <span className="mono flex-none text-[10.5px] text-ink/40">{now > 0 ? ago(now, it.when) : ""}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
