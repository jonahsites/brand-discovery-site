"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { readEvents, clearEvents } from "@/lib/analytics";
import { Button, Label, Page } from "@/components/ui";

/**
 * Kindred's internal admin. Client-only; no server data. Two tabs:
 * - Verification: brands that requested the verified badge — approve or reject.
 * - Analytics: the last 500 events from the local analytics hook, useful in dev.
 */
export default function ClientAdmin() {
  const { brands, upsertBrand, hydrated } = useApp();
  const [tab, setTab] = useState<"Verification" | "Analytics">("Verification");
  const events = useMemo(() => (hydrated && tab === "Analytics" ? readEvents().slice().reverse() : []), [hydrated, tab]);
  if (!hydrated) return null;
  const pending = brands.filter((b) => b.verification === "pending" && !b.verified);
  const verified = brands.filter((b) => b.verified);
  return (
    <Page className="pt-6 md:pt-9">
      <div className="mb-6">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[.14em] text-ink/50">Kindred internal</div>
        <h1 className="text-[36px] md:text-[46px] leading-[.98] tracking-[-.015em]" style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}>Admin</h1>
        <p className="mt-1 text-[13px] text-ink/55">Brand verification and a peek at what people are doing. Client-side; not wired to a real backend.</p>
      </div>
      <div className="mb-6 inline-flex rounded-sm bg-cream p-1">
        {(["Verification", "Analytics"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={"press rounded-sm px-4 py-[9px] text-[12px] font-semibold " + (tab === t ? "bg-ink text-paper" : "text-ink/55")}>{t}</button>)}
      </div>
      {tab === "Verification" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <Label className="mb-3">Pending · {pending.length}</Label>
            {pending.length === 0 && <div className="card rounded-lg p-6 text-[13px] text-ink/50">No pending applications. Brands apply from Dashboard → Settings.</div>}
            <div className="flex flex-col gap-2">
              {pending.map((b) => (
                <div key={b.slug} className="card flex items-center gap-3 rounded-md p-3">
                  <div className="grid h-10 w-10 flex-none place-items-center rounded-sm text-[11px] font-extrabold" style={{ background: b.tint, color: b.ink }}>{b.init}</div>
                  <div className="min-w-0 flex-1"><Link href={`/brand/${b.slug}`} className="block text-[13px] font-semibold">{b.name}</Link><div className="mono text-[10.5px] text-ink/45">{b.city}, {b.country} · {b.batch} batch</div></div>
                  <Button size="sm" onClick={() => upsertBrand({ ...b, verified: true, verification: undefined })}>Approve</Button>
                  <Button size="sm" variant="secondary" onClick={() => upsertBrand({ ...b, verification: undefined })}>Reject</Button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-3">Verified · {verified.length}</Label>
            <div className="flex flex-col gap-2">
              {verified.map((b) => (
                <div key={b.slug} className="card flex items-center gap-3 rounded-md p-3">
                  <div className="grid h-10 w-10 flex-none place-items-center rounded-sm text-[11px] font-extrabold" style={{ background: b.tint, color: b.ink }}>{b.init}</div>
                  <div className="min-w-0 flex-1"><Link href={`/brand/${b.slug}`} className="block text-[13px] font-semibold">{b.name}</Link><div className="mono text-[10.5px] text-ink/45">{b.followers.toLocaleString()} followers · {b.city}</div></div>
                  <span className="rounded-pill bg-sage px-[10px] py-[4px] text-[10px] font-semibold text-paper">✓ verified</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {tab === "Analytics" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[12px] text-ink/55">{events.length} events on this device</div>
            <Button size="sm" variant="secondary" onClick={() => { clearEvents(); location.reload(); }}>Clear</Button>
          </div>
          <div className="card rounded-lg p-0">
            <table className="w-full text-[12px]">
              <thead><tr className="text-left text-[10px] font-semibold uppercase tracking-[.12em] text-ink/45"><th className="px-4 py-3">When</th><th>Event</th><th>Path / props</th></tr></thead>
              <tbody>
                {events.slice(0, 200).map((e, i) => (
                  <tr key={i} className={"border-t border-ink/6 " + (i % 2 ? "bg-cream/40" : "")}>
                    <td className="px-4 py-2 mono text-[10.5px] text-ink/55">{new Date(e.ts).toLocaleTimeString()}</td>
                    <td className="px-4 py-2 font-semibold">{e.k}</td>
                    <td className="px-4 py-2 mono text-[10.5px] text-ink/60">{Object.entries(e.p ?? {}).map(([k, v]) => `${k}=${v}`).join(" · ")}</td>
                  </tr>
                ))}
                {events.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-[12px] text-ink/45">No events yet. Browse for a minute and reload.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Page>
  );
}
