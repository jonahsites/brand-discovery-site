"use client";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { AuthShell } from "@/components/AuthShell";

export default function ClientVerify() {
  const { account, hydrated } = useApp();
  if (!hydrated) return null;
  return (
    <AuthShell>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[.14em] text-ink/45">One more step</div>
      <h1 className="mb-3 text-[26px] font-normal leading-[1.1] tracking-[-.01em]" style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}>Check your email</h1>
      <p className="mb-5 text-[13px] leading-[1.55] text-ink/65">We sent a confirmation link to <span className="font-semibold text-ink">{account?.email ?? "your inbox"}</span>. Click it and you&apos;re in — no password prompt second time around.</p>
      <div className="rounded-sm bg-cream px-4 py-3 text-[12px] leading-[1.5] text-ink/60">Didn&apos;t get one? Check spam, or wait a minute; the free tier caps confirmation emails at ~2 per hour.</div>
      <div className="mt-6 flex items-center justify-between text-[12px]">
        <Link href="/login" className="font-semibold text-ink">← Back to log in</Link>
        <Link href="/signup" className="text-ink/50 hover:text-ink">Try a different email</Link>
      </div>
    </AuthShell>
  );
}
