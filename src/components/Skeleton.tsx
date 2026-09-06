"use client";
/**
 * Shimmer skeleton placeholders. The `.skeleton` utility (globals.css) does the
 * heavy lifting — a sand-2 → cream slide. Use these while a rail is hydrating
 * so the page isn't a flash of empty rectangles.
 */
import clsx from "clsx";

export function BrandCardSkeleton({ variant = "portrait" }: { variant?: "portrait" | "cover" }) {
  if (variant === "cover") {
    return (
      <div className="skeleton h-[260px] w-[260px] flex-none rounded-[24px] md:h-[300px] md:w-[300px]" aria-hidden="true" />
    );
  }
  return (
    <div className="card flex h-[380px] w-[240px] flex-none flex-col overflow-hidden rounded-[22px] p-[10px] md:w-[260px]" aria-hidden="true">
      <div className="skeleton aspect-[3/4] rounded-[16px]" />
      <div className="mt-3 flex flex-col gap-2 px-1">
        <div className="skeleton h-[12px] w-2/3 rounded-sm" />
        <div className="skeleton h-[10px] w-1/2 rounded-sm" />
      </div>
    </div>
  );
}

export function ProductCardSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div className={clsx("card rounded-lg", compact ? "p-2" : "p-[10px]")} aria-hidden="true">
      <div className={clsx("skeleton aspect-square", compact ? "rounded-[14px]" : "rounded-[18px]")} />
      <div className={clsx("flex flex-col gap-2", compact ? "px-[6px] pt-[9px] pb-1" : "px-2 pt-[11px] pb-[6px]")}>
        <div className="skeleton h-[12px] w-3/4 rounded-sm" />
        <div className="skeleton h-[10px] w-1/2 rounded-sm" />
      </div>
    </div>
  );
}

export function RailSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="no-scrollbar flex gap-4 overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => <BrandCardSkeleton key={i} variant="portrait" />)}
    </div>
  );
}
