"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useApp } from "@/lib/store";

export default function MobileTabBar() {
  const path = usePathname();
  const { openSearch, session } = useApp();
  if (path.startsWith("/dashboard") || path.startsWith("/onboarding") || path.startsWith("/checkout") || path.startsWith("/sell") || path === "/login" || path === "/signup") return null;
  const initials = session.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const on = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  const c = (h: string) => clsx("grid h-10 w-10 place-items-center rounded-pill text-[15px]", on(h) ? "text-ink" : "text-ink/40");
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-ink/8 bg-paper/95 px-8 pb-[max(10px,env(safe-area-inset-bottom))] pt-[10px] backdrop-blur md:hidden">
      <Link href="/" className={c("/")} aria-label="Discover">⌗</Link>
      <Link href="/explore" className={c("/explore")} aria-label="Explore">◎</Link>
      <button onClick={() => openSearch()} className="grid h-10 w-10 place-items-center rounded-pill text-[15px] text-ink/40" aria-label="Search">⌕</button>
      <Link href="/account" className={c("/account")} aria-label="Saved">♡</Link>
      <Link href="/account" className={clsx("grid h-8 w-8 place-items-center rounded-pill bg-sand text-[10px] font-semibold text-ink/60")}>{initials}</Link>
    </nav>
  );
}
