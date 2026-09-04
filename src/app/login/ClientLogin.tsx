"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";
import { AuthShell, Or, SocialRow, authInput } from "@/components/AuthShell";
import { Label } from "@/components/ui";

export default function Login() { return <Suspense><LoginInner /></Suspense>; }

function LoginInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const { account, logIn, hydrated, onboarded } = useApp();
  const [email, setEmail] = useState(account?.email ?? "");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const next = sp.get("next") || (onboarded ? "/" : "/onboarding");
  const go = (ok: boolean) => { if (ok) router.replace(next); else setErr(account ? "That email does not match the account on this device." : "No account on this device yet. Sign up to start."); };
  return (
    <AuthShell>
      <h1 className="mb-1 text-[26px] font-normal leading-[1.1] tracking-[-.01em]" style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}>Log in to Kindred</h1>
      <div className="mb-5 text-[12px] text-ink/50">Your next favourite brand starts here</div>
      <SocialRow onPick={() => go(logIn(account?.email ?? ""))} />
      <Or />
      <form onSubmit={(e) => { e.preventDefault(); if (!hydrated) return; go(logIn(email)); }} className="flex flex-col gap-3">
        <div><Label className="mb-[6px] !text-[9.5px]">Email address</Label><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={authInput} /></div>
        <div><Label className="mb-[6px] !text-[9.5px]">Password</Label><input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={authInput} /></div>
        {err && <div className="text-[12px] text-sage">{err}</div>}
        <button type="submit" className="press mt-1 w-full rounded-sm bg-ink py-[11px] text-[12.5px] font-semibold text-paper">Continue with Email</button>
      </form>
      <div className="mt-4 text-center text-[11.5px] text-ink/55">Don&apos;t have an account? <Link href={`/signup${sp.get("next") ? `?next=${encodeURIComponent(sp.get("next")!)}` : ""}`} className="font-semibold text-ink">Sign up</Link></div>
    </AuthShell>
  );
}
