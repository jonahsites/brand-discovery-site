"use client";
import { useState } from "react";
import Link from "next/link";
import { money, shipEstimate } from "@/lib/data";
import { useApp } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import { Avatar, Button, Label, Placeholder, QtyStepper, SectionHead, Page } from "@/components/ui";

export default function BagPage() {
  const { bagGroups, bagCount, subtotal, discount, total, setQty, removeItem, products, promoCode, applyPromoCode, clearPromoCode, promos } = useApp();
  const [code, setCode] = useState(""); const [err, setErr] = useState("");
  const also = products.filter((p) => !bagGroups.some((g) => g.items.some((i) => i.product === p.slug))).slice(0, 4);
  const hint = promos.find((p) => p.active && bagGroups.some((g) => g.brand.slug === p.brand) && p.code !== promoCode);
  return (
    <Page className="pt-6 md:pt-[34px]">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px] items-start">
        <div>
          <h1 className="mb-[6px] text-[28px] md:text-[34px] font-bold leading-[1.05] tracking-[-.038em]">Your bag</h1>
          <div className="mb-6 text-[13px] text-black/50">{bagCount} pieces from {bagGroups.length} brands</div>
          {bagGroups.length === 0 && <div className="card rounded-lg p-10 text-center text-[14px] text-black/55">Nothing here yet. <Link href="/explore" className="font-semibold text-navy">Explore brands →</Link></div>}
          {bagGroups.map((g) => (
            <div key={g.brand.slug} className="card mb-4 rounded-lg p-4 md:p-[22px]">
              <div className="mb-[6px] flex items-center gap-[11px] border-b border-black/7 pb-[18px]">
                <Avatar init={g.brand.init} tint={g.brand.tint} ink={g.brand.ink} size={36} />
                <div className="flex-1"><Link href={`/brand/${g.brand.slug}`} className="text-[14px] font-semibold">{g.brand.name}</Link><div className="mono text-[11.5px] text-black/42">{shipEstimate(g.brand.slug, g.brand.shipsFrom)}</div></div>
                <span className="rounded-pill bg-offwhite px-[14px] py-[7px] text-[12px] font-medium">{g.shipCost === 0 ? "Free" : money(g.shipCost, true)}</span>
              </div>
              {g.items.map((it) => (
                <div key={it.key} className="flex flex-wrap items-center gap-3 md:gap-4 py-4">
                  <Placeholder className="h-[70px] w-[62px] md:h-[100px] md:w-[88px] flex-none rounded-[9px]" />
                  <div className="min-w-0 flex-1"><Link href={`/product/${it.p.slug}`} className="mb-[5px] block text-[14px] md:text-[15px] font-medium">{it.p.name}</Link><div className="text-[12.5px] text-black/50">{it.variant}{it.unit < it.p.price && <span className="ml-2 rounded-pill bg-peri px-2 py-[1px] text-[10.5px] font-semibold text-ink">promo</span>}</div><div className="mt-[7px] text-[13px] font-medium md:hidden">{money(it.total, true)}</div></div>
                  <QtyStepper value={it.qty} onChange={(v) => setQty(it.key, v)} />
                  <span className="hidden md:inline rounded-pill border border-black/8 bg-white px-4 py-[9px] text-[13.5px] font-medium">{money(it.total, true)}</span>
                  <button onClick={() => removeItem(it.key)} aria-label="Remove" className="text-[15px] text-black/32">✕</button>
                </div>
              ))}
            </div>
          ))}
          {also.length > 0 && <div className="mt-8"><SectionHead title="You might also want" /><div className="grid grid-cols-2 gap-3 md:gap-[14px] lg:grid-cols-4">{also.map((p) => <ProductCard key={p.slug} p={p} showBrand={false} />)}</div></div>}
        </div>
        <div className="flex flex-col gap-[14px] lg:sticky lg:top-[100px]">
          <div className="card rounded-lg p-6 md:p-7">
            <Label className="mb-5">Summary</Label>
            <div className="flex flex-col gap-[13px] text-[13.5px] text-black/65">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-medium text-ink">{money(subtotal, true)}</span></div>
              {bagGroups.map((g) => <div key={g.brand.slug} className="flex justify-between"><span>{g.brand.name} shipping</span><span className="font-medium text-ink">{g.shipCost === 0 ? "Free" : money(g.shipCost, true)}</span></div>)}
              {discount > 0 && <div className="flex justify-between text-navy"><span>Code {promoCode}</span><span className="font-medium">−{money(discount, true)}</span></div>}
            </div>
            <div className="my-5 h-px bg-black/8" />
            <div className="mb-[22px] flex items-baseline justify-between"><span className="text-[15px] font-semibold">Total</span><span className="text-[26px] font-semibold tracking-[-.025em]">{money(total, true)}</span></div>
            <Link href="/checkout"><Button full size="lg" className="mb-3">Checkout</Button></Link>
            {promoCode ? <div className="flex items-center justify-between rounded-pill bg-peri px-4 py-[11px] text-[13px]"><span className="mono font-semibold">{promoCode} applied</span><button onClick={clearPromoCode} className="text-[12px] font-semibold text-black/55">Remove</button></div>
              : <form onSubmit={(e) => { e.preventDefault(); if (applyPromoCode(code)) { setErr(""); setCode(""); } else setErr("That code isn't active."); }} className="flex gap-2"><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Promo code" className="min-w-0 flex-1 rounded-pill bg-offwhite px-4 py-[13px] text-[13px] outline-none placeholder:text-black/45" /><Button variant="secondary" type="submit">Apply</Button></form>}
            {err && <div className="mt-2 text-[12px] text-slate">{err}</div>}
          </div>
          <div className="rounded-lg bg-peri p-6">
            {hint ? <><div className="mb-[7px] text-[14.5px] font-semibold leading-[1.35]">{hint.pct}% off {bagGroups.find((g) => g.brand.slug === hint.brand)?.brand.name}</div><div className="text-[12.5px] leading-[1.5] text-black/60">Code <button onClick={() => { applyPromoCode(hint.code); }} className="mono font-semibold text-ink underline">{hint.code}</button> is running until {hint.ends ? new Date(hint.ends).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "further notice"}.</div></>
              : <><div className="mb-[7px] text-[14.5px] font-semibold leading-[1.35]">{money(Math.max(0, 500 - subtotal))} from free EU shipping</div><div className="text-[12.5px] leading-[1.5] text-black/60">Add anything from Studio Arva and we cover the label.</div></>}
          </div>
        </div>
      </div>
      <div className="glass fixed inset-x-4 bottom-[100px] z-30 rounded-lg p-[14px] lg:hidden"><div className="flex justify-between px-[6px] pb-3 text-[13px] font-medium"><span className="text-black/55">Total</span><span className="font-semibold">{money(total, true)}</span></div><Link href="/checkout"><Button full size="lg">Checkout</Button></Link></div>
      <div className="h-24 lg:hidden" />
    </Page>
  );
}
