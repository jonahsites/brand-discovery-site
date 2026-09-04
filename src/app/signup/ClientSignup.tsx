"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";
import { AuthShell, Or, SocialRow, authInput } from "@/components/AuthShell";
import { Label } from "@/components/ui";

export default function Signup() { return <Suspense><SignupInner /></Suspense>; }

function SignupInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const { account, signUp, hydrated } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const next = sp.get("next");
  const create = (provider: "email" | "x" | "apple" | "google") => {
    if (!hydrated) return;
    if (name.trim().length < 2) return setErr("Add your name first; brands see it when you message them.");
    if (provider === "email") {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setErr("That email doesn't look right.");
      if (password.length < 6) return setErr("Use at least 6 characters for the password.");
    }
    signUp({ name: name.trim(), email: provider === "email" ? email.trim().toLowerCase() : `${name.trim().toLowerCase().replace(/\s+/g, ".")}@${provider}.kindred`, provider });
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
        <button type="submit" className="press mt-1 w-full rounded-sm bg-ink py-[11px] text-[12.5px] font-semibold text-paper">Create account</button>
      </form>
      <div className="mt-4 text-center text-[11.5px] text-ink/55">{account ? <>This device already has an account. <Link href="/login" className="font-semibold text-ink">Log in</Link></> : <>Already have an account? <Link href="/login" className="font-semibold text-ink">Log in</Link></>}</div>
      <div className="mt-3 text-center text-[10.5px] leading-[1.5] text-ink/40">Demo sign-up: the account lives on this device. No email is sent.</div>
    </AuthShell>
  );
}
