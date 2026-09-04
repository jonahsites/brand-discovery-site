"use client";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { DASH } from "@/lib/data";
import { Avatar, Button, Label, Placeholder } from "@/components/ui";

export default function Dashboard() {
  const [nav, setNav] = useState("Overview");
  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-[252px] flex-none flex-col bg-navy p-5 pt-7 sticky top-0 h-screen">
        <div className="px-[10px] pb-[26px]">
          <div className="flex items-center gap-[11px]">
            <div className="grid h-9 w-9 place-items-center rounded-sm bg-peri text-[12px] font-extrabold">FV</div>
            <div><div className="text-[14px] font-bold tracking-[-.02em] text-offwhite">Form &amp; Void</div><div className="mono text-[9.5px] text-offwhite/45">Seller account</div></div>
          </div>
        </div>
        <div className="flex flex-col gap-[3px]">
          {DASH.nav.map((l) => <button key={l} onClick={() => setNav(l)} className={clsx("rounded-sm px-[14px] py-[11px] text-left text-[13px] font-medium", nav === l ? "bg-offwhite/14 text-offwhite" : "text-offwhite/55")}>{l}</button>)}
        </div>
        <div className="mt-auto rounded-md border border-offwhite/14 bg-offwhite/10 p-[18px]">
          <div className="mb-[6px] text-[12.5px] font-semibold text-offwhite">Payout Friday</div>
          <div className="mb-2 text-[24px] font-bold tracking-[-.03em] text-peri">$4,182</div>
          <div className="mono text-[10.5px] leading-[1.5] text-offwhite/50">Held until parcels scan</div>
        </div>
        <Link href="/" className="mt-4 px-[10px] text-[12px] font-medium text-offwhite/50">← Back to Kindred</Link>
      </aside>

      <div className="min-w-0 flex-1 bg-offwhite md:bg-offwhite">
        <div className="glass-navy md:hidden sticky top-0 z-30 px-[18px] pb-3 pt-4 !border-0">
          <div className="flex items-center gap-[10px]">
            <div className="grid h-[30px] w-[30px] place-items-center rounded-[10px] bg-peri text-[10.5px] font-extrabold">FV</div>
            <div className="flex-1 text-[13.5px] font-semibold text-offwhite">Form &amp; Void</div>
            <Link href="/" className="grid h-[34px] w-[34px] place-items-center rounded-pill bg-offwhite/14 text-[14px] text-offwhite">◔</Link>
          </div>
        </div>
        <div className="md:hidden bg-navy px-[18px] pb-6 pt-5 text-offwhite">
          <div className="mb-1 text-[26px] font-bold leading-[1.05] tracking-[-.038em]">Good morning, Wies.</div>
          <div className="mb-[22px] text-[12.5px] text-offwhite/60">6 orders to pack today</div>
          <div className="mb-4 grid grid-cols-2 gap-3">
            {DASH.stats.map((t, i) => <div key={t.label} className={clsx("rounded-xl p-[18px]", i === 0 ? "bg-peri text-ink" : "bg-offwhite/12 text-offwhite")}><div className="mb-[10px] text-[9px] font-semibold uppercase tracking-[.13em] opacity-60">{t.label}</div><div className="mb-[6px] text-[24px] font-bold leading-none tracking-[-.035em]">{t.value}</div><div className="mono text-[10px] opacity-60">{t.delta}</div></div>)}
          </div>
          <div className="mb-4 rounded-2xl border border-offwhite/14 bg-offwhite/10 p-5">
            <div className="mb-4 text-[10px] font-semibold uppercase tracking-[.13em] text-offwhite/55">Sales · 30 days</div>
            <div className="flex h-24 items-end gap-[3px]">{DASH.chart.slice(0, 18).map((h, i) => <div key={i} className="flex-1 rounded-t-[4px] bg-peri opacity-85" style={{ height: h * 0.85 }} />)}</div>
          </div>
          <Button full className="!bg-peri !text-ink">+ New post</Button>
        </div>

        <div className="p-4 md:p-[34px] pb-16">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div><h1 className="mb-[5px] text-[26px] md:text-[30px] font-bold leading-[1.05] tracking-[-.038em]">{nav}</h1><div className="text-[12.5px] text-black/50">Last 30 days · compared to the 30 before</div></div>
            <div className="flex gap-[10px]"><Button variant="secondary">Export</Button><Button>+ New product</Button></div>
          </div>
          <div className="mb-5 hidden md:grid grid-cols-2 xl:grid-cols-4 gap-4">
            {DASH.stats.map((t) => <div key={t.label} className="rounded-2xl p-6" style={{ background: t.bg, color: t.ink, border: t.bg === "#fff" ? "1px solid rgba(0,0,0,.05)" : undefined }}><div className="mb-[14px] text-[10px] font-semibold uppercase tracking-[.14em] opacity-62">{t.label}</div><div className="mb-2 text-[34px] font-bold leading-none tracking-[-.04em]">{t.value}</div><div className="mono text-[11.5px] opacity-62">{t.delta}</div></div>)}
          </div>
          <div className="mb-5 grid gap-5 xl:grid-cols-[1fr_380px] items-start">
            <div className="card hidden md:block rounded-lg p-[26px]">
              <div className="mb-6 flex items-baseline justify-between"><div className="text-[16px] font-semibold tracking-[-.02em]">Sales</div><div className="mono text-[11.5px] text-black/42">30 days · $12,408</div></div>
              <div className="flex h-[170px] items-end gap-[5px]">{DASH.chart.map((h, i) => <div key={i} className="flex-1 rounded-t-[6px] rounded-b-[3px]" style={{ height: h, background: i > 26 ? "#1C3247" : "rgba(28,50,71,.26)" }} />)}</div>
              <div className="mono mt-3 flex justify-between text-[10.5px] text-black/35"><span>Aug 4</span><span>Aug 18</span><span>Sep 2</span></div>
            </div>
            <div className="card rounded-lg p-6">
              <Label className="mb-4">New post</Label>
              <textarea placeholder="Say something about this drop…" className="mb-3 min-h-[84px] w-full resize-none rounded-md bg-offwhite p-4 text-[13.5px] leading-[1.6] outline-none placeholder:text-black/42" />
              <div className="mb-4 flex gap-[9px]"><Placeholder className="h-[74px] flex-1 rounded-[16px]" /><Placeholder className="h-[74px] flex-1 rounded-[16px]" /><div className="grid h-[74px] w-[74px] flex-none place-items-center rounded-[16px] border-[1.5px] border-dashed border-black/16 bg-offwhite text-[22px] font-light text-black/35">+</div></div>
              <div className="mb-[18px] flex flex-wrap gap-2"><span className="rounded-pill bg-offwhite px-[14px] py-2 text-[11.5px] font-medium">◇ Tag products · 2</span><span className="rounded-pill bg-offwhite px-[14px] py-2 text-[11.5px] font-medium">⌂ Add to lookbook</span></div>
              <div className="flex gap-[9px]"><Button className="flex-1">Publish</Button><Button variant="secondary">Schedule</Button></div>
            </div>
          </div>
          <div className="grid gap-5 xl:grid-cols-[1fr_380px] items-start">
            <div className="card rounded-lg p-5 md:p-[26px]">
              <div className="mb-[18px] flex items-center justify-between"><div className="text-[16px] font-semibold tracking-[-.02em]">Products · 22</div><span className="text-[12px] font-semibold text-navy">Manage all →</span></div>
              <div className="mb-3 hidden sm:grid grid-cols-[1fr_90px_90px_110px] gap-3 px-4 text-[9.5px] font-semibold uppercase tracking-[.12em] text-black/40"><span>Product</span><span>Price</span><span>Stock</span><span>30-day</span></div>
              <div className="flex flex-col gap-2">
                {DASH.prodRows.map((r) => (
                  <div key={r.name} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_90px_90px_110px] items-center gap-3 rounded-md bg-offwhite px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3"><Placeholder className="h-11 w-[38px] flex-none rounded-sm" /><span className="text-[13px] font-medium">{r.name}</span></div>
                    <span className="text-[13px] font-medium">{r.price}</span>
                    <span className={clsx("hidden sm:inline text-[12.5px] font-medium", r.warn ? "text-slate" : "text-black/60")}>{r.stock}</span>
                    <span className="hidden sm:inline text-[13px] font-medium">{r.rev}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card rounded-lg p-5 md:p-6">
              <div className="mb-[18px] flex items-center justify-between"><div className="text-[16px] font-semibold tracking-[-.02em]">Orders</div><span className="rounded-pill bg-slate px-[13px] py-[6px] text-[10.5px] font-semibold uppercase tracking-[.08em] text-white">6 to pack</span></div>
              <div className="flex flex-col gap-[10px]">
                {DASH.orderRows.map((o) => (
                  <div key={o.meta} className="flex items-center gap-3 rounded-md bg-offwhite px-[15px] py-[13px]">
                    <Avatar init={o.init} tint={o.tint} ink={o.ink} size={32} />
                    <div className="min-w-0 flex-1"><div className="text-[12.5px] font-medium">{o.name}</div><div className="mono text-[10px] text-black/42">{o.meta}</div></div>
                    <div className="text-[12.5px] font-medium">{o.total}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
