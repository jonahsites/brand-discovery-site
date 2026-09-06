"use client";
/**
 * Home / explore section header — tiny uppercase eyebrow, Instrument Serif
 * headline, optional "See all →" link. Sits inside the max-width container.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import clsx from "clsx";

export default function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel = "See all",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={clsx("mb-4 flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && <div className="mb-1 text-[10px] font-semibold uppercase tracking-[.16em] text-ink/45">{eyebrow}</div>}
        <h3
          className="text-[22px] md:text-[28px] leading-[1.05]"
          style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}
        >
          {title}
        </h3>
      </div>
      {href && (
        <Link href={href} className="press whitespace-nowrap text-[12px] font-semibold text-ink/70 hover:text-ink">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
