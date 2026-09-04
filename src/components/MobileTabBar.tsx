"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useApp } from "@/lib/store";

export default function MobileTabBar() {
  const path = usePathname();
  const { openBag, openSearch } = useApp();
  if (path.startsWith("/dashboard") || path.startsWith("/onboarding") || path.startsWith("/checkout")) return null;
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <div className="glass fixed inset-x-5 bottom-[22px] z-40 flex h-[66px] items-center justify-between rounded-pill px-[14px] md:hidden">
      <Tab href="/" icon="⌂" label="Home" on={active("/")} />
      <Tab href="/explore" icon="⌕" label="Explore" on={active("/explore")} />
      <button onClick={() => openSearch()} aria-label="Search" className="press grid h-[52px] w-[52px] -translate-y-2 place-items-center rounded-pill bg-black text-[24px] font-light text-white shadow-[0_8px_20px_rgba(0,0,0,.22)]">+</button>
      <button onClick={() => openBag()} aria-label="Bag" className="grid h-[42px] w-[42px] place-items-center rounded-pill text-[16px] text-black/55">⌂</button>
      <Tab href="/account" icon="☺" label="You" on={active("/account")} />
    </div>
  );
  function Tab({ href, icon, label, on }: { href: string; icon: string; label: string; on: boolean }) {
    return (
      <Link href={href} className={clsx("flex items-center gap-[7px] rounded-pill", on ? "bg-white px-4 py-[9px] text-[12.5px] font-semibold shadow-[0_2px_8px_rgba(0,0,0,.06)]" : "grid h-[42px] w-[42px] place-items-center text-[16px] text-black/55")}>
        <span>{icon}</span>{on && <span>{label}</span>}
      </Link>
    );
  }
}
