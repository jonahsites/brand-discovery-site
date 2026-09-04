"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { useApp } from "@/lib/store";
import { IconSearch, IconBell, IconBag } from "@/components/Icon";

export default function TopNav() {
  const { bagCount, openBag, openSearch, session, notifications } = useApp();
  const [notif, setNotif] = useState(false);
  const path = usePathname();
  if (path.startsWith("/dashboard") || path.startsWith("/onboarding") || path.startsWith("/sell") || path === "/login" || path === "/signup" || path === "/verify-email" || path === "/forgot-password" || path === "/reset-password" || path === "/feed") return null;
  const initials = session.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const links = [["/", "Discover"], ["/brands", "Brands"], ["/explore", "Explore"], ["/feed", "Feed"], ["/lookbooks", "Lookbooks"], session.role === "brand" ? ["/dashboard", "Dashboard"] : ["/sell", "Sell on Kindred"]];
  return (
    <header className="glass-bar sticky top-0 z-40 h-[56px] md:h-[64px]">
      <div className="mx-auto flex h-full max-w-[1440px] items-center gap-3 md:gap-5 px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-[26px] w-[26px] place-items-center rounded-[7px] bg-ink text-[12px] font-bold text-paper">k</span>
          <span className="text-[15px] font-extrabold tracking-[-.03em]">Kindred</span>
        </Link>
        <nav className="hidden lg:flex items-center rounded-pill bg-cream p-1 ml-2">
          {links.map(([href, label]) => <Link key={href} href={href} className={clsx("rounded-pill px-4 py-[7px] text-[11px] font-semibold", path === href ? "bg-white text-ink shadow-[0_4px_12px_-8px_rgba(18,26,36,.5)]" : "text-ink/50 hover:text-ink")}>{label}</Link>)}
        </nav>
        <button onClick={() => openSearch()} className="hidden md:flex flex-1 max-w-[380px] items-center justify-between rounded-pill bg-white px-4 py-[9px] text-left soft">
          <span className="text-[12px] font-medium text-ink/40">Search brands, pieces, cities</span>
          <span className="hidden md:inline rounded-sm bg-cream px-[6px] py-[2px] text-[10px] font-semibold text-ink/45 tracking-[.06em]">⌘K</span>
        </button>
        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <button onClick={() => openSearch()} aria-label="Search" className="press grid h-9 w-9 md:hidden place-items-center rounded-md bg-white text-ink/70 soft"><IconSearch size={16} /></button>
          <div className="relative hidden md:block">
            <button onClick={() => setNotif(!notif)} aria-label="Notifications" className="press relative grid h-10 w-10 place-items-center rounded-md bg-white text-ink/70 soft"><IconBell size={16} />{notifications.length > 0 && <span className="absolute -right-[3px] -top-[3px] grid h-[17px] min-w-[17px] place-items-center rounded-pill bg-rust px-1 text-[9px] font-bold text-paper">{notifications.length}</span>}</button>
            {notif && (
              <div className="card absolute right-0 top-[48px] z-50 w-[340px] rounded-lg p-2" onMouseLeave={() => setNotif(false)}>
                <div className="label px-3 pb-2 pt-2">Activity</div>
                {notifications.slice(0, 8).map((n) => <Link key={n.id} href={n.href} onClick={() => setNotif(false)} className="flex items-start gap-3 rounded-md px-3 py-[10px] hover:bg-cream"><span className="mt-[2px] grid h-7 w-7 flex-none place-items-center rounded-pill bg-cream text-[11px]">{n.kind === "drop" ? "◐" : n.kind === "price" ? "↓" : n.kind === "order" ? "→" : "✉"}</span><span className="min-w-0"><span className="block truncate text-[12px] font-semibold">{n.title}</span><span className="block truncate text-[11px] text-ink/50">{n.body}</span></span></Link>)}
                {notifications.length === 0 && <div className="px-3 pb-3 text-[12px] text-ink/50">Quiet for now. Follow a drop or set a price alert.</div>}
              </div>
            )}
          </div>
          <button onClick={() => openBag()} aria-label="Bag" className="press relative grid h-9 w-9 md:h-10 md:w-10 place-items-center rounded-md bg-white text-ink/70 soft"><IconBag size={16} />{bagCount > 0 && <span className="absolute -right-[3px] -top-[3px] grid h-[17px] min-w-[17px] place-items-center rounded-pill bg-rust px-1 text-[9px] font-bold text-paper">{bagCount}</span>}</button>
          <Link href="/account" className="hidden md:grid h-10 w-10 place-items-center rounded-md bg-ink text-[10.5px] font-semibold text-paper">{initials}</Link>
        </div>
      </div>
    </header>
  );
}
