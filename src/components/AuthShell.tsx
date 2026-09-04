/* eslint-disable @next/next/no-img-element -- illustration comes from an arbitrary host */
"use client";
import Link from "next/link";
import type { ReactNode } from "react";

const ART = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1800&q=70&auto=format&fit=crop";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-paper">
      <header className="relative z-10 flex items-center justify-between px-5 py-5 text-[12px] font-semibold md:px-10 md:py-7">
        <Link href="/" className="text-ink/70 hover:text-ink">← Back</Link>
        <Link href="/" className="flex items-center gap-2"><span className="grid h-[24px] w-[24px] place-items-center rounded-[8px] bg-ink text-[11px] font-extrabold text-paper">k</span><span className="text-[15px] font-extrabold tracking-[-.03em]">Kindred</span></Link>
        <a href="mailto:hello@kindred.shop" className="text-ink/70 hover:text-ink">Contact support</a>
      </header>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%]">
        <img src={ART} alt="" className="h-full w-full object-cover opacity-90" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, var(--paper) 0%, color-mix(in srgb, var(--paper) 55%, transparent) 45%, transparent 100%)" }} />
      </div>
      <main className="relative z-10 grid place-items-center px-4 pb-24 pt-6 md:pt-14">
        <div className="card w-full max-w-[400px] rounded-lg p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}

export function SocialRow({ onPick }: { onPick: (provider: "x" | "apple" | "google") => void }) {
  const cls = "press grid h-[38px] flex-1 place-items-center rounded-sm bg-white soft";
  return (
    <div className="flex gap-2">
      <button type="button" aria-label="Continue with X" onClick={() => onPick("x")} className={cls}><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-6.8 7.8L23 22h-6.3l-4.9-6.4L6.2 22H3l7.3-8.3L2.4 2h6.4l4.5 5.9L18.9 2zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20z" /></svg></button>
      <button type="button" aria-label="Continue with Apple" onClick={() => onPick("apple")} className={cls}><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.8 1.3 10.3.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.4-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.8-1.1-2.8-4.2zM13.9 5c.7-.9 1.2-2 1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.4-.6 3.1-1.5z" /></svg></button>
      <button type="button" aria-label="Continue with Google" onClick={() => onPick("google")} className={cls}><svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z" /><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.2v3.1C3.2 21.3 7.3 24 12 24z" /><path fill="#FBBC05" d="M5.3 14.3c-.3-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.6H1.2C.4 8.2 0 10.1 0 12s.4 3.8 1.2 5.4l4.1-3.1z" /><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C18 1.2 15.2 0 12 0 7.3 0 3.2 2.7 1.2 6.6l4.1 3.1c.9-2.9 3.6-4.9 6.7-4.9z" /></svg></button>
    </div>
  );
}

export function Or() {
  return <div className="my-4 flex items-center gap-3 text-[10.5px] font-semibold uppercase tracking-[.12em] text-ink/35"><span className="h-px flex-1 bg-ink/10" />or<span className="h-px flex-1 bg-ink/10" /></div>;
}

export { inputCls as authInput } from "@/components/ui";
