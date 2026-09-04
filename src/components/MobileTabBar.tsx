"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useApp } from "@/lib/store";
import { IconDiscover, IconExplore, IconSearch, IconHeart } from "@/components/Icon";

export default function MobileTabBar() {
  const path = usePathname();
  const { openSearch, session } = useApp();
  if (path.startsWith("/dashboard") || path.startsWith("/onboarding") || path.startsWith("/checkout") || path.startsWith("/sell") || path === "/login" || path === "/signup" || path === "/verify-email" || path === "/forgot-password" || path === "/reset-password" || path === "/feed") return null;
  const initials = session.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const on = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  const c = (h: string) => clsx("grid h-11 w-11 place-items-center rounded-md", on(h) ? "text-ink" : "text-ink/40");
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-ink/10 bg-paper/95 px-6 pb-[max(10px,env(safe-area-inset-bottom))] pt-[10px] backdrop-blur md:hidden">
      <Link href="/" className={c("/")} aria-label="Discover"><IconDiscover /></Link>
      <Link href="/explore" className={c("/explore")} aria-label="Explore"><IconExplore /></Link>
      <button onClick={() => openSearch()} className="grid h-11 w-11 place-items-center rounded-md text-ink/40" aria-label="Search"><IconSearch /></button>
      <Link href="/account" className={c("/account")} aria-label="Saved"><IconHeart /></Link>
      <Link href="/account" className="grid h-9 w-9 place-items-center rounded-md bg-ink text-[10px] font-semibold text-paper">{initials}</Link>
    </nav>
  );
}
