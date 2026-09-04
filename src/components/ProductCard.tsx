"use client";
import Link from "next/link";
import clsx from "clsx";
import { brandBySlug, money, type Product } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Placeholder, Tag } from "./ui";

export default function ProductCard({ p, showBrand = true, compact, hoverAdd, tall }: { p: Product; showBrand?: boolean; compact?: boolean; hoverAdd?: boolean; tall?: boolean }) {
  const { addToBag, openBag, toggleSaved, isSaved } = useApp();
  const b = brandBySlug(p.brand)!;
  const saved = isSaved(p.slug);
  return (
    <div className={clsx("card group relative lift", compact ? "rounded-xl p-[10px]" : "rounded-2xl p-3 md:p-[14px]")}>
      <Link href={`/product/${p.slug}`} className="block">
        <Placeholder label="Product shot" className={clsx(compact ? "h-[170px] rounded-[18px]" : tall ? "h-[220px] md:h-[280px] rounded-md" : "h-[200px] md:h-[210px] rounded-[16px]")}>
          {p.tag && <div className="absolute left-3 top-3"><Tag bg={p.tagBg} fg={p.tagFg}>{p.tag}</Tag></div>}
        </Placeholder>
      </Link>
      <button
        aria-label={saved ? "Unsave" : "Save"}
        onClick={() => toggleSaved(p.slug)}
        className={clsx("press absolute grid place-items-center rounded-pill text-[14px]", compact ? "right-[18px] top-[18px] h-[31px] w-[31px]" : "right-6 top-6 h-9 w-9", saved ? "bg-black text-white" : "glass-chip")}
      >
        {saved ? "♥" : "♡"}
      </button>
      {hoverAdd && (
        <button
          onClick={() => { addToBag(p.slug, "M · Default"); openBag(); }}
          className={clsx("press absolute left-6 right-6 rounded-pill bg-black py-3 text-center text-[12.5px] font-semibold text-white opacity-0 translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0", tall ? "top-[196px] md:top-[256px]" : "top-[176px] md:top-[186px]")}
        >
          Add to bag
        </button>
      )}
      <div className={clsx(compact ? "px-1 pt-[11px] pb-[3px]" : "px-[6px] pt-[13px] pb-1")}>
        {showBrand && <div className="label mb-[5px] !text-[10px]">{b.name}</div>}
        <div className="flex items-baseline justify-between gap-2">
          <Link href={`/product/${p.slug}`} className={clsx("font-medium leading-[1.3]", compact ? "text-[12.5px]" : "text-[13.5px] md:text-[14px]")}>{p.name}</Link>
          <div className={clsx("flex-none font-medium", compact ? "text-[13px]" : "text-[14px]")}>{money(p.price)}</div>
        </div>
      </div>
    </div>
  );
}
