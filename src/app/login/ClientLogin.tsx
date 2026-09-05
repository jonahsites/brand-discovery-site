"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";
import { AuthShell, authInput } from "@/components/AuthShell";
import { Label } from "@/components/ui";
import { supabaseEnabled } from "@/lib/supabase";

export default function ClientLogin() { return <Suspense><LoginInner /></Suspense>; }

function LoginInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const { account, logIn, hydrated, onboarded } = useApp();
  const [email, setEmail] = useState(account?.email ?? "");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const next = sp.get("next") || (onboarded ? "/" : "/onboarding");

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!hydrated || busy) return;
    if (supabaseEnabled && password.length < 6) return setErr("Password looks too short.");
    setBusy(true); setErr("");
    const r = await logIn(email, password || undefined);
    setBusy(false);
    if (r.ok) router.replace(next); else setErr(r.error);
  };

  return (
    <AuthShell>
      <h1 className="mb-1 text-[26px] font-normal leading-[1.1] tracking-[-.01em]" style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}>Log in to Kindred</h1>
      <div className="mb-5 text-[12px] text-ink/50">Your next favorite brand starts here</div>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div><Label className="mb-[6px] !text-[9.5px]">Email address</Label><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={authInput} /></div>
        <div><div className="mb-[6px] flex items-baseline justify-between"><Label className="!text-[9.5px]">Password</Label><Link href="/forgot-password" className="text-[10.5px] font-semibold text-ink/50 hover:text-ink">Forgot?</Link></div><input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={authInput} /></div>
        {err && <div className="text-[12px] text-sage">{err}</div>}
        <button type="submit" disabled={busy} className="press mt-1 w-full rounded-sm bg-ink py-[11px] text-[12.5px] font-semibold text-paper disabled:opacity-50">{busy ? "Signing in…" : "Continue with Email"}</button>
      </form>
      <div className="mt-4 text-center text-[11.5px] text-ink/55">Don&apos;t have an account? <Link href={`/signup${sp.get("next") ? `?next=${encodeURIComponent(sp.get("next")!)}` : ""}`} className="font-semibold text-ink">Sign up</Link></div>
      {!supabaseEnabled && <div className="mt-3 text-center text-[10.5px] leading-[1.5] text-ink/40">Local mode: enter the email you signed up with on this device.</div>}
    </AuthShell>
  );
}
