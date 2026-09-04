"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";

export default function TopNav() {
  const { bagCount, openBag, openSearch, session } = useApp();
  const path = usePathname();
  if (path.startsWith("/dashboard") || path.startsWith("/onboarding") || path.startsWith("/sell")) return null;
  return (
    <header className="glass-bar sticky top-0 z-40 h-[64px] md:h-[76px]">
      <div className="mx-auto flex h-full max-w-[1440px] items-center gap-3 md:gap-5 px-4 md:px-10">
        <Link href="/" className="text-[17px] md:text-[19px] font-extrabold tracking-[-.035em] leading-none">Kindred</Link>
        <nav className="hidden lg:flex items-center gap-1 ml-2">
          {[["/", "Discover"], ["/brands", "Brands"], ["/explore", "Explore"], ["/lookbooks", "Lookbooks"], session.role === "brand" ? ["/dashboard", "Dashboard"] : ["/sell", "Sell on Kindred"]].map(([href, label]) => (
            <Link key={href} href={href} className={`rounded-pill px-3 py-2 text-[13px] font-medium ${path === href ? "bg-white/70 text-ink" : "text-black/60 hover:text-ink"}`}>{label}</Link>
          ))}
        </nav>
        <button onClick={() => openSearch()} className="hidden md:flex flex-1 max-w-[440px] items-center gap-[10px] rounded-pill border border-white/90 bg-white/70 px-[18px] py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,.9)]">
          <span className="text-[13px] text-black/40">⌕</span>
          <span className="text-[13.5px] text-black/42">Search brands, styles, lookbooks</span>
        </button>
        <div className="ml-auto flex items-center gap-2 md:gap-[10px]">
          <button onClick={() => openSearch()} aria-label="Search" className="press grid h-9 w-9 md:hidden place-items-center rounded-pill bg-white/80 text-[14px]">⌕</button>
          <Link href="/account" aria-label="Notifications" className="press hidden md:grid h-[42px] w-[42px] place-items-center rounded-pill border border-white/90 bg-white/66 text-[15px]">◔</Link>
          <button onClick={() => openBag()} aria-label="Bag" className="press relative grid h-9 w-9 md:h-[42px] md:w-[42px] place-items-center rounded-pill border border-white/90 bg-white/66 text-[15px]">
            ⌂
            {bagCount > 0 && <span className="absolute -right-[2px] -top-[2px] grid h-[18px] min-w-[18px] place-items-center rounded-pill bg-slate px-[5px] text-[10px] font-semibold text-white">{bagCount}</span>}
          </button>
          <Link href="/account" className="hidden md:grid h-[42px] w-[42px] place-items-center rounded-pill bg-sky text-[13px] font-bold">{session.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</Link>
        </div>
      </div>
    </header>
  );
}
