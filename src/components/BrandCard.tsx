"use client";
import Link from "next/link";
import clsx from "clsx";
import { brandMeta, type Brand } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Avatar } from "./ui";

export function FollowButton({ slug, size = "md", className }: { slug: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const { toggleFollow, isFollowing, toast, brands } = useApp();
  const on = isFollowing(slug);
  const name = brands.find((b) => b.slug === slug)?.name ?? "brand";
  return (
    <button
      onClick={(e) => { e.preventDefault(); toggleFollow(slug); toast(on ? `Unfollowed ${name}` : `Following ${name}`, on ? undefined : "/?feed=Following"); }}
      className={clsx(
        "press rounded-pill font-semibold border whitespace-nowrap",
        size === "sm" && "px-4 py-2 text-[11.5px]",
        size === "md" && "px-[22px] py-[10px] text-[12.5px]",
        size === "lg" && "px-[30px] py-[13px] text-[13.5px]",
        on ? "bg-offwhite text-ink border-black/12" : "bg-black text-white border-black",
        className,
      )}
    >
      {on ? "Following" : "Follow"}
    </button>
  );
}

export function BrandTile({ b }: { b: Brand }) {
  return (
    <Link href={`/brand/${b.slug}`} className="card block rounded-xl p-5 text-center lift">
      <Avatar init={b.init} tint={b.tint} ink={b.ink} size={56} className="mx-auto mb-3" />
      <div className="mb-1 text-[14px] font-semibold">{b.name}</div>
      <div className="mono mb-[14px] text-[11.5px] text-black/42">{brandMeta(b)}</div>
      <FollowButton slug={b.slug} size="sm" className="w-full !py-[9px] !text-[12.5px]" />
    </Link>
  );
}

export function BrandRow({ b, action = true, className }: { b: Brand; action?: boolean; className?: string }) {
  return (
    <Link href={`/brand/${b.slug}`} className={clsx("flex items-center gap-[13px] rounded-[12px] bg-white/75 p-4", className)}>
      <Avatar init={b.init} tint={b.tint} ink={b.ink} size={44} />
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-semibold">{b.name}</div>
        <div className="mono text-[10.5px] text-black/42">{brandMeta(b)}</div>
      </div>
      {action && <FollowButton slug={b.slug} size="sm" />}
    </Link>
  );
}
