"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";
import { AuthShell, Or, SocialRow, authInput } from "@/components/AuthShell";
import { Label } from "@/components/ui";
import { supabaseEnabled } from "@/lib/supabase";

export default function ClientSignup() { return <Suspense><SignupInner /></Suspense>; }

function SignupInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const { account, signUp, hydrated } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const next = sp.get("next");

  const create = async (provider: "email" | "x" | "apple" | "google") => {
    if (!hydrated || busy) return;
    if (name.trim().length < 2) return setErr("Add your name first; brands see it when you message them.");
    if (provider === "email") {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setErr("That email doesn't look right.");
      if (password.length < 6) return setErr("Use at least 6 characters for the password.");
    } else if (!supabaseEnabled) {
      return setErr("Social sign-in needs Supabase; see docs/supabase-setup.md. Use email instead.");
    }
    setBusy(true); setErr("");
    const localEmail = provider === "email" ? email.trim().toLowerCase() : `${name.trim().toLowerCase().replace(/\s+/g, ".")}@${provider}.kindred`;
    const r = await signUp({ name: name.trim(), email: localEmail, password: provider === "email" ? password : undefined, provider });
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    if (r.needsConfirmation) { router.replace("/verify-email"); return; }
    router.replace(`/onboarding${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  };

  return (
    <AuthShell>
      <h1 className="mb-1 text-[26px] font-normal leading-[1.1] tracking-[-.01em]" style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}>Join Kindred</h1>
      <div className="mb-5 text-[12px] text-ink/50">Three questions and the whole place is dressed for you</div>
      <SocialRow onPick={create} />
      <Or />
      <form onSubmit={(e) => { e.preventDefault(); create("email"); }} className="flex flex-col gap-3">
        <div><Label className="mb-[6px] !text-[9.5px]">Your name</Label><input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jules Renard" className={authInput} /></div>
        <div><Label className="mb-[6px] !text-[9.5px]">Email address</Label><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={authInput} /></div>
        <div><Label className="mb-[6px] !text-[9.5px]">Password</Label><input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={authInput} /></div>
        {err && <div className="text-[12px] text-sage">{err}</div>}
        <button type="submit" disabled={busy} className="press mt-1 w-full rounded-sm bg-ink py-[11px] text-[12.5px] font-semibold text-paper disabled:opacity-50">{busy ? "Creating…" : "Create account"}</button>
      </form>
      <div className="mt-4 text-center text-[11.5px] text-ink/55">{account ? <>This device already has an account. <Link href="/login" className="font-semibold text-ink">Log in</Link></> : <>Already have an account? <Link href="/login" className="font-semibold text-ink">Log in</Link></>}</div>
      {!supabaseEnabled && <div className="mt-3 text-center text-[10.5px] leading-[1.5] text-ink/40">Local mode: the account lives on this device. Add Supabase env vars to make it real (docs/supabase-setup.md).</div>}
    </AuthShell>
  );
}
