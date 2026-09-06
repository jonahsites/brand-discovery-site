"use client";
/**
 * Colorful category hero tiles. Each tile is a rich color from the v2.1
 * secondary palette, big Instrument Serif label, links to /explore?cat=…
 * The whole row scrolls horizontally on mobile and grids out on desktop.
 */
import Link from "next/link";
import clsx from "clsx";
import type { CSSProperties } from "react";

export type Tile = {
  label: string;
  href: string;
  /** CSS value for the ground — a token like var(--ember) or a hex. */
  bg: string;
  /** CSS value for the type — usually paper or ink. */
  fg?: string;
  /** Optional small subtitle. */
  meta?: string;
};

export const DEFAULT_CATEGORY_TILES: Tile[] = [
  { label: "Outerwear",    href: "/explore?cat=Outerwear",    bg: "var(--ember)",       fg: "var(--paper)" },
  { label: "Knitwear",     href: "/explore?cat=Knitwear",     bg: "var(--butter)",      fg: "var(--ink)"   },
  { label: "Shirting",     href: "/explore?cat=Shirting",     bg: "var(--paper-warm)",  fg: "var(--ink)"   },
  { label: "Denim",        href: "/explore?cat=Denim",        bg: "var(--dusk)",        fg: "var(--paper)" },
  { label: "Accessories",  href: "/explore?cat=Accessories",  bg: "var(--pistachio)",   fg: "var(--ink)"   },
  { label: "Footwear",     href: "/explore?cat=Footwear",     bg: "var(--clay)",        fg: "var(--ink)"   },
  { label: "Trousers",     href: "/explore?cat=Trousers",     bg: "var(--sage)",        fg: "var(--paper)" },
  { label: "Archive",      href: "/explore?cat=Archive",      bg: "var(--sand-3)",      fg: "var(--ink)"   },
];

export default function CategoryTiles({
  tiles = DEFAULT_CATEGORY_TILES,
  className,
}: {
  tiles?: Tile[];
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "no-scrollbar stagger -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:px-0 lg:grid-cols-8",
        className,
      )}
      role="list"
    >
      {tiles.map((t) => {
        const style: CSSProperties = { background: t.bg, color: t.fg ?? "var(--ink)" };
        return (
          <Link
            key={t.label}
            href={t.href}
            role="listitem"
            className="lift-color relative flex h-[128px] w-[164px] flex-none snap-start flex-col justify-between overflow-hidden rounded-[22px] p-4 md:h-[168px] md:w-auto"
            style={style}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[.16em] opacity-70">Shop</span>
            <span className="flex items-end justify-between gap-2">
              <span
                className="block leading-[1.02] text-[26px] md:text-[32px]"
                style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}
              >
                {t.label}
              </span>
              <span
                className="grid h-7 w-7 flex-none place-items-center rounded-pill text-[12px]"
                style={{ background: "rgba(255,255,255,.22)" }}
                aria-hidden="true"
              >
                →
              </span>
            </span>
            {t.meta && <span className="absolute left-4 top-4 mt-4 text-[11px] opacity-70">{t.meta}</span>}
          </Link>
        );
      })}
    </div>
  );
}
