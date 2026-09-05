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

export { inputCls as authInput } from "@/components/ui";
