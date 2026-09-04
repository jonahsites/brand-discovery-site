"use client";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { SHIP_OPTS, money } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Avatar, Button, Label, Placeholder, Page } from "@/components/ui";

const Field = ({ v, span }: { v: string; span?: boolean }) => <div className={clsx("rounded-[16px] bg-offwhite px-[18px] py-[15px] text-[13.5px]", span && "sm:col-span-2")}>{v}</div>;
const Step = ({ n, t }: { n: number; t: string }) => <div className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-pill bg-black text-[12px] font-semibold text-white">{n}</span><span className="text-[18px] font-semibold tracking-[-.02em]">{t}</span></div>;

export default function Checkout() {
  const { bagGroups, bagCount, subtotal, shipTotal, total, ship, setShip } = useApp();
  const [paid, setPaid] = useState(false);
  if (paid) return (
    <Page narrow className="pt-16 text-center">
      <div className="mx-auto max-w-[560px] rounded-lg bg-sky p-10">
        <div className="label mb-4 !text-black/48">Order placed</div>
        <h1 className="mb-3 text-[34px] font-bold leading-[1.05] tracking-[-.04em]">Thanks, Jules.</h1>
        <p className="mb-6 text-[14.5px] leading-[1.55] text-black/66">{bagGroups.length} parcels from {bagGroups.length} workshops. Kindred holds payment until each brand scans your parcel.</p>
        <Link href="/"><Button>Back to Discover</Button></Link>
      </div>
    </Page>
  );
  return (
    <Page className="pt-6 md:pt-[34px]">
      <div className="mono mb-4 hidden md:block text-[12px] text-black/45">Secure checkout · {bagGroups.length} brands</div>
      <div className="grid gap-8 lg:grid-cols-[1fr_400px] items-start">
        <div>
          <h1 className="mb-5 text-[28px] md:text-[34px] font-bold leading-[1.05] tracking-[-.038em]">Checkout</h1>
          <div className="mb-6 flex gap-[10px]">
            <Button className="flex-1" size="lg"> Pay</Button>
            <Button className="flex-1" size="lg" variant="secondary">Google Pay</Button>
            <Button className="hidden sm:flex flex-1" size="lg" variant="secondary">Shop Pay</Button>
          </div>
          <div className="mono mb-6 flex items-center gap-[14px] text-[11.5px] text-black/38"><span className="h-px flex-1 bg-black/10" />or pay by card<span className="h-px flex-1 bg-black/10" /></div>

          <div className="card mb-4 rounded-lg p-5 md:p-[30px]">
            <div className="mb-[22px]"><Step n={1} t="Delivery address" /></div>
            <div className="grid gap-3 sm:grid-cols-2"><Field v="Jules Renard" /><Field v="jules@renard.co" /><Field v="41 Rue des Panoyaux" span /><Field v="Paris" /><Field v="75020" /><Field v="France ▾" span /></div>
          </div>
          <div className="card mb-4 rounded-lg p-5 md:p-[30px]">
            <div className="mb-2"><Step n={2} t="Shipping, per brand" /></div>
            <div className="mb-[22px] md:pl-10 text-[12.5px] text-black/50">Each brand ships from its own workshop, so each parcel arrives separately.</div>
            {bagGroups.map((g) => {
              const s = SHIP_OPTS[g.brand.slug]; const cur = ship[g.brand.slug] ?? 0;
              return (
                <div key={g.brand.slug} className="border-t border-black/7 py-[18px]">
                  <div className="mb-3 flex items-center gap-[10px]"><Avatar init={g.brand.init} tint={g.brand.tint} ink={g.brand.ink} size={30} /><span className="text-[13.5px] font-semibold">{g.brand.name}</span><span className="mono text-[11.5px] text-black/40">from {s.from}</span></div>
                  <div className="flex gap-[10px]">
                    {s.opts.map((o, oi) => <button key={o.label} onClick={() => setShip(g.brand.slug, oi)} className={clsx("flex-1 rounded-md border-[1.5px] px-[18px] py-[15px] text-left", cur === oi ? "bg-offwhite border-black" : "bg-white border-black/9")}><div className="mb-1 text-[13px] font-semibold">{o.label}</div><div className="mono text-[11.5px] text-black/50">{o.meta}</div></button>)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="card rounded-lg p-5 md:p-[30px]">
            <div className="mb-[22px]"><Step n={3} t="Payment" /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-[16px] bg-offwhite px-[18px] py-[15px] text-[13.5px] sm:col-span-2">•••• •••• •••• 4242<span className="mono text-[11px] text-black/40">VISA</span></div>
              <Field v="09 / 29" /><Field v="CVC" />
            </div>
            <div className="mt-[18px] flex items-center gap-[11px] text-[12.5px] text-black/55"><span className="grid h-5 w-5 place-items-center rounded-[6px] bg-black text-[11px] font-semibold text-white">✓</span>Save this card for one-tap checkout across all brands</div>
          </div>
        </div>
        <div className="glass rounded-lg p-6 md:p-7 lg:sticky lg:top-[100px]" style={{ backdropFilter: "blur(30px)" }}>
          <Label className="mb-5">Order · {bagCount} pieces</Label>
          <div className="mb-[22px] flex flex-col gap-3">
            {bagGroups.flatMap((g) => g.items).map((it) => (
              <div key={it.key} className="flex items-center gap-3">
                <Placeholder className="h-14 w-12 flex-none rounded-[14px]" />
                <div className="min-w-0 flex-1"><div className="text-[12.5px] font-medium leading-[1.3]">{it.p.name}</div><div className="mono text-[10.5px] text-black/42">{it.variant} · ×{it.qty}</div></div>
                <div className="text-[12.5px] font-medium">{money(it.total, true)}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-[11px] border-t border-black/9 pt-5 text-[13px] text-black/62">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-medium text-ink">{money(subtotal, true)}</span></div>
            <div className="flex justify-between"><span>Shipping · {bagGroups.length} parcels</span><span className="font-medium text-ink">{money(shipTotal, true)}</span></div>
            <div className="flex justify-between"><span>VAT included</span><span className="font-medium text-ink">—</span></div>
          </div>
          <div className="mb-5 mt-[18px] flex items-baseline justify-between border-t border-black/9 pt-[18px]"><span className="text-[15px] font-semibold">Total</span><span className="text-[28px] font-semibold tracking-[-.03em]">{money(total, true)}</span></div>
          <Button full size="lg" onClick={() => setPaid(true)}>Pay {money(total, true)}</Button>
          <div className="mt-[14px] text-center text-[11.5px] leading-[1.5] text-black/45">Kindred holds payment until each brand marks your parcel shipped.</div>
        </div>
      </div>
    </Page>
  );
}
