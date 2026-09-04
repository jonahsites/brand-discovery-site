"use client";
import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { AuthShell, authInput } from "@/components/AuthShell";
import { Label } from "@/components/ui";

export default function ClientForgot() {
  const { requestPasswordReset } = useApp();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setErr("That email doesn't look right.");
    setBusy(true); setErr("");
    const r = await requestPasswordReset(email);
    setBusy(false);
    if (r.ok) setSent(true); else setErr(r.error);
  };
  return (
    <AuthShell>
      <h1 className="mb-3 text-[26px] font-normal leading-[1.1] tracking-[-.01em]" style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}>{sent ? "Check your email" : "Forgot your password?"}</h1>
      {sent ? (
        <>
          <p className="mb-5 text-[13px] leading-[1.55] text-ink/65">We sent a reset link to <span className="font-semibold text-ink">{email}</span>. Open it to set a new password.</p>
          <Link href="/login" className="text-[12px] font-semibold text-ink">← Back to log in</Link>
        </>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <p className="text-[13px] leading-[1.55] text-ink/60">Enter the email you signed up with. We&apos;ll send a link to set a new one.</p>
          <div><Label className="mb-[6px] !text-[9.5px]">Email address</Label><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={authInput} /></div>
          {err && <div className="text-[12px] text-rust">{err}</div>}
          <button type="submit" disabled={busy} className="press mt-1 w-full rounded-sm bg-ink py-[11px] text-[12.5px] font-semibold text-paper disabled:opacity-50">{busy ? "Sending…" : "Send reset link"}</button>
          <Link href="/login" className="mt-2 text-center text-[12px] font-semibold text-ink">← Back to log in</Link>
        </form>
      )}
    </AuthShell>
  );
}
