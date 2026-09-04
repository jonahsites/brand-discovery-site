"use client";
import Link from "next/link";
import clsx from "clsx";
import { money, type Product } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Placeholder } from "./ui";

export default function ProductCard({ p, showBrand = true, compact, hoverAdd }: { p: Product; showBrand?: boolean; compact?: boolean; hoverAdd?: boolean; tall?: boolean }) {
  const { addToBag, openBag, toggleSaved, isSaved, brands, priceOf, toast } = useApp();
  const b = brands.find((x) => x.slug === p.brand);
  const saved = isSaved(p.slug);
  const { price, compareAt, promo } = priceOf(p);
  const tag = promo ? `${promo.pct}% off` : p.tag ?? (p.createdAt ? "New in" : undefined);
  const strong = !!promo || p.tag === "20% off";
  const soldOut = p.stock === 0;
  return (
    <div className={clsx("card group relative rounded-lg lift", compact ? "p-2" : "p-[10px]")}>
      <Link href={`/product/${p.slug}`} className="block">
        <Placeholder src={p.image} alt={p.name} label={soldOut ? "Sold out" : undefined} className={clsx("aspect-square", compact ? "rounded-[14px]" : "rounded-[18px]", soldOut && "opacity-60")}>
          {tag && <span className={clsx("absolute left-[10px] top-[10px] rounded-pill px-[10px] py-[5px] text-[9px] font-semibold uppercase tracking-[.06em]", strong ? "bg-sage text-paper" : "bg-white/92 text-ink")}>{tag}</span>}
        </Placeholder>
      </Link>
      <button aria-label={saved ? "Unsave" : "Save"} onClick={() => { toggleSaved(p.slug); toast(saved ? "Removed from saved" : "Saved", saved ? undefined : "/account"); }} className={clsx("press absolute grid place-items-center rounded-pill bg-white/92 text-[12px]", compact ? "right-[15px] top-[15px] h-6 w-6" : "right-[19px] top-[19px] h-[27px] w-[27px]", saved ? "text-sage" : "text-ink/50")}>{saved ? "♥" : "♡"}</button>
      {hoverAdd && !soldOut && (
        <button onClick={() => { addToBag(p.slug, `${(p.sizes ?? ["M"])[0]} · ${(p.colors ?? ["Default"])[0]}`); openBag(); toast(`${p.name} added to bag`); }} className="press absolute inset-x-5 bottom-[74px] rounded-pill bg-ink py-[10px] text-center text-[11px] font-semibold text-paper opacity-0 translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">Add to bag</button>
      )}
      <div className={clsx(compact ? "px-[6px] pt-[9px] pb-1" : "px-2 pt-[11px] pb-[6px]")}>
        <Link href={`/product/${p.slug}`} className={clsx("block font-semibold leading-[1.25] tracking-[-.015em]", compact ? "text-[12px]" : "text-[13px]")}>{p.name}</Link>
        <div className="mt-[5px] flex items-baseline justify-between gap-2">
          <span className={clsx("truncate text-ink/45", compact ? "text-[10px]" : "text-[11px]")}>{showBrand && b ? b.name : p.category}</span>
          <span className={clsx("flex flex-none items-baseline gap-[6px] font-bold", compact ? "text-[12px]" : "text-[13px]")}>{compareAt && <span className="text-[10px] font-medium text-ink/35 line-through">{money(compareAt)}</span>}{money(price)}</span>
        </div>
      </div>
    </div>
  );
}
