"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const path = usePathname();
  if (path.startsWith("/dashboard") || path.startsWith("/onboarding") || path.startsWith("/sell") || path === "/login" || path === "/signup") return null;
  const cols = [
    ["Platform", [["About Kindred", "/design-system"], ["Sell on Kindred", "/sell"], ["Brand dashboard", "/dashboard"], ["Design system", "/design-system"]]],
    ["Shop", [["Brands", "/brands"], ["Explore", "/explore"], ["Lookbooks", "/lookbooks"], ["Your bag", "/bag"], ["Gift cards", "/gift"], ["Style profile", "/onboarding"]]],
    ["Support", [["Shipping & returns", "/product/panel-work-jacket"], ["Size guide", "/account"], ["Contact", "mailto:hello@kindred.shop"], ["Privacy", "/"]]],
  ] as const;
  return (
    <footer className="mt-16 rounded-t-[30px] bg-cream">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-10">
        <div>
          <div className="mb-3 flex items-center gap-[9px]"><span className="grid h-[26px] w-[26px] place-items-center rounded-[9px] bg-ink text-[13px] font-extrabold text-paper">k</span><span className="text-[20px] font-extrabold tracking-[-.04em]">Kindred</span></div>
          <p className="max-w-[300px] text-[13px] leading-[1.6] text-ink/55">Find your next favorite clothing brand. Independent labels, their own words, one bag, one checkout.</p>
        </div>
        {cols.map(([title, links]) => (
          <div key={title}>
            <div className="label mb-4">{title}</div>
            <div className="flex flex-col gap-2">{links.map(([l, href]) => <Link key={l} href={href} className="text-[13.5px] text-ink/70 hover:text-ink">{l}</Link>)}</div>
          </div>
        ))}
      </div>
      <div className="mono mx-auto flex max-w-[1440px] items-center justify-between px-4 pb-8 text-[10.5px] text-ink/40 md:px-10"><span suppressHydrationWarning>© {new Date().getFullYear()} Kindred</span><span>Made for small brands</span></div>
    </footer>
  );
}
