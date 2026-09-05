/* eslint-disable @next/next/no-img-element -- brand-supplied covers come from any host */
"use client";
import Link from "next/link";
import clsx from "clsx";
import { type Brand } from "@/lib/data";
import { useApp } from "@/lib/store";
import { FollowButton } from "@/components/BrandCard";
import { styleOverlap } from "@/lib/looks";
import { IconArrow, IconChat } from "@/components/Icon";
import { useRouter } from "next/navigation";

/**
 * The tile format the /brands page uses: big centered square avatar, status dot + city up
 * top, brand name in serif, tagline, two side-by-side actions (Follow + Message), and a
 * coloured glow underneath with a caption row. Adapted from a glassmorphism-profile-card
 * concept — same anatomy, Kindred palette, no glass. If the brand has set a personal
 * accent (Dashboard → Settings → Make it yours) the glow, dot and hover shift pick it up.
 */
export default function BrandTile({ b, hero }: { b: Brand; hero?: string }) {
  const { follows, styleTags, sendMessage, toast } = useApp();
  const router = useRouter();
  const followers = b.followers + (follows.includes(b.slug) && b.followers === 0 ? 1 : 0);
  const accent = b.accent ?? "var(--sage)";
  const match = styleOverlap(b.styles, styleTags);
  const message = () => {
    const id = sendMessage(b.slug, `Hi ${b.name} — quick question about sizing.`, "shopper");
    toast(`Message opened with ${b.name}`);
    router.push(`/messages?t=${id}`);
  };
  return (
    <div className="relative pb-14" style={{ ["--brand-accent" as string]: accent }}>
      {/* Coloured glow sits behind the card and bleeds down as the caption ground */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 -bottom-1 top-[85%] rounded-[26px]"
        style={{ background: accent, opacity: 0.85, filter: "blur(0px)", boxShadow: `0 30px 60px -18px ${accent}70` }}
      />
      {/* Caption row that reads across the glow */}
      <div className="absolute inset-x-0 bottom-2 z-0 text-center text-[11px] font-semibold text-paper tracking-[.14em] uppercase">
        {match > 0 ? `For you · ${match} shared style${match === 1 ? "" : "s"}` : b.styles.slice(0, 2).join(" · ") || "Independent"}
      </div>

      <article className="card lift relative z-10 flex flex-col overflow-hidden rounded-lg p-5">
        {/* Top row */}
        <div className="mb-4 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-[7px] text-ink/60">
            <span className="grid h-[10px] w-[10px] place-items-center rounded-pill" style={{ background: accent }}>
              <span className="h-[6px] w-[6px] animate-pulse rounded-pill" style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
            </span>
            <span className="font-semibold">{b.verified ? "Verified brand" : "Independent brand"}</span>
          </div>
          <div className="mono flex items-center gap-1 text-ink/45 tabular-nums">
            {b.city}, {b.country}
          </div>
        </div>

        {/* Big square avatar */}
        <Link href={`/brand/${b.slug}`} className="mx-auto mb-4 block h-[188px] w-[188px] overflow-hidden rounded-md" style={{ background: b.tint }}>
          {hero || b.cover || b.logo ? (
            <img loading="lazy" decoding="async" src={hero ?? b.cover ?? b.logo} alt={b.name} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-[46px] font-extrabold tracking-[-.04em]" style={{ color: b.ink ?? "var(--ink)" }}>{b.init}</div>
          )}
        </Link>

        {/* Name + role */}
        <div className="min-w-0 text-center">
          <Link href={`/brand/${b.slug}`} className="block truncate text-[26px] leading-none tracking-[-.015em]" style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}>{b.name}</Link>
          <div className="mt-1 text-[12px] text-ink/50 line-clamp-1">{b.tagline}</div>
          <div className="mono mt-2 text-[10.5px] text-ink/40">{followers.toLocaleString()} followers · {b.batch} batch</div>
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <FollowButton slug={b.slug} size="md" className={clsx("!h-11 !justify-center !rounded-md !px-3", follows.includes(b.slug) ? "" : "")} />
          <button
            type="button"
            onClick={message}
            className="press flex h-11 items-center justify-center gap-2 rounded-md bg-white text-[12.5px] font-semibold text-ink soft"
          >
            <IconChat size={16} /> Message
          </button>
        </div>

        {/* Visit arrow anchored top-right of the whole card for a big tap target */}
        <Link href={`/brand/${b.slug}`} aria-label={`Visit ${b.name}`} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-pill bg-ink text-paper">
          <IconArrow size={14} />
        </Link>
      </article>
    </div>
  );
}
