"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase, supabaseEnabled } from "@/lib/supabase";
import { AuthShell, authInput } from "@/components/AuthShell";
import { Label } from "@/components/ui";

/**
 * Supabase's password-reset email links back here with a recovery token in the URL fragment.
 * `@supabase/ssr` parses that automatically on `getSession`; we just need to give the user a
 * form to set the new password once that session is active.
 */
export default function ClientReset() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => setReady(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return setErr("Use at least 6 characters.");
    if (password !== confirm) return setErr("Those don't match.");
    const sb = getSupabase();
    if (!sb) return setErr("Supabase is not configured on this device.");
    setBusy(true); setErr("");
    const { error } = await sb.auth.updateUser({ password });
    setBusy(false);
    if (error) return setErr(error.message);
    router.replace("/");
  };

  return (
    <AuthShell>
      <h1 className="mb-3 text-[26px] font-normal leading-[1.1] tracking-[-.01em]" style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}>Set a new password</h1>
      {!supabaseEnabled ? (
        <p className="text-[13px] text-ink/60">Supabase is not configured on this device.</p>
      ) : !ready ? (
        <p className="text-[13px] text-ink/60">Waiting for the reset link… If you got here without clicking a reset email, <Link href="/forgot-password" className="font-semibold text-ink underline">request one</Link>.</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div><Label className="mb-[6px] !text-[9.5px]">New password</Label><input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={authInput} /></div>
          <div><Label className="mb-[6px] !text-[9.5px]">Confirm</Label><input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={authInput} /></div>
          {err && <div className="text-[12px] text-rust">{err}</div>}
          <button type="submit" disabled={busy} className="press mt-1 w-full rounded-sm bg-ink py-[11px] text-[12.5px] font-semibold text-paper disabled:opacity-50">{busy ? "Saving…" : "Save new password"}</button>
        </form>
      )}
    </AuthShell>
  );
}
