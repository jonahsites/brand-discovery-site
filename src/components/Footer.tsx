"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { track } from "@/lib/analytics";

export default function Footer() {
  const path = usePathname();
  if (path.startsWith("/dashboard") || path.startsWith("/onboarding") || path.startsWith("/sell") || path === "/login" || path === "/signup" || path === "/verify-email" || path === "/forgot-password" || path === "/reset-password" || path === "/feed") return null;
  const cols = [
    ["Platform", [["About Kindred", "/about"], ["Sell on Kindred", "/sell"], ["Brand dashboard", "/dashboard"], ["Design system", "/design-system"]]],
    ["Shop", [["Brands", "/brands"], ["Explore", "/explore"], ["Lookbooks", "/lookbooks"], ["Your bag", "/bag"], ["Gift cards", "/gift"], ["Style profile", "/onboarding"]]],
    ["Support", [["Shipping & returns", "/shipping-and-returns"], ["Contact", "/contact"], ["Privacy", "/privacy"], ["Terms", "/terms"]]],
  ] as const;
  return (
    <footer className="mt-16 rounded-t-[30px] bg-cream">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-10">
        <div>
          <div className="mb-3 flex items-center gap-[9px]"><span className="grid h-[26px] w-[26px] place-items-center rounded-[9px] bg-ink text-[13px] font-extrabold text-paper">k</span><span className="text-[20px] font-extrabold tracking-[-.04em]">Kindred</span></div>
          <p className="mb-6 max-w-[300px] text-[13px] leading-[1.6] text-ink/55">Find your next favorite clothing brand. Independent labels, their own words, one bag, one checkout.</p>
          <NewsletterForm />
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

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setErr("That email doesn't look right.");
    // Client-side capture only for now; the backend hook goes here later.
    try { const raw = localStorage.getItem("kindred.newsletter") ?? "[]"; const list: string[] = JSON.parse(raw); if (!list.includes(email)) list.push(email); localStorage.setItem("kindred.newsletter", JSON.stringify(list)); } catch {}
    track("newsletter_signup", { email });
    setSent(true); setErr("");
  };
  return (
    <div>
      <div className="label mb-3">Kindred Weekly</div>
      {sent ? (
        <div className="text-[12.5px] leading-[1.5] text-ink/60">You&apos;re on the list. First Friday of every month, one letter from a brand plus five new pieces.</div>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@name.com" className="min-w-0 flex-1 rounded-sm bg-paper px-3 py-[10px] text-[12.5px] outline-none shadow-[inset_0_0_0_1px_rgba(var(--ink-rgb),.1)] focus:shadow-[inset_0_0_0_1.5px_rgba(var(--ink-rgb),.5)] placeholder:text-ink/35" />
            <button type="submit" className="press rounded-sm bg-ink px-4 py-[10px] text-[11.5px] font-semibold text-paper">Join</button>
          </div>
          {err && <div className="text-[11.5px] text-rust">{err}</div>}
          <div className="text-[10.5px] text-ink/45">First Friday of every month. No spam.</div>
        </form>
      )}
    </div>
  );
}
