"use client";
import { useState } from "react";
import Link from "next/link";
import { money, shipEstimate } from "@/lib/data";
import { useApp } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import { Avatar, Button, Label, Placeholder, QtyStepper, SectionHead, Page } from "@/components/ui";

export default function BagPage() {
  const { bagGroups, bagCount, subtotal, promoDiscount, credit, giftCredit, giftCode, total, setQty, removeItem, products, promoCode, applyPromoCode, clearPromoCode, applyGiftCode, clearGiftCode, promos } = useApp();
  const [code, setCode] = useState(""); const [err, setErr] = useState("");
  const also = products.filter((p) => !bagGroups.some((g) => g.items.some((i) => i.product === p.slug))).slice(0, 4);
  const hint = promos.find((p) => p.active && bagGroups.some((g) => g.brand.slug === p.brand) && p.code !== promoCode);
  return (
    <Page className="pt-6 md:pt-[34px]">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px] items-start">
        <div>
          <h1 className="mb-[6px] text-[42px] md:text-[52px] leading-[.95] tracking-[-.015em]" style={{fontFamily:"var(--font-instrument), Georgia, serif"}}>Your bag</h1>
          <div className="mb-6 text-[13px] text-ink/50">{bagCount} pieces from {bagGroups.length} brands</div>
          {bagGroups.length === 0 && (
            <div className="card rounded-lg p-10 md:p-14 text-center">
              <div className="mb-4 mx-auto grid h-16 w-16 place-items-center rounded-pill" style={{background:"var(--clay)"}}>
                <span className="text-[24px]">⛭</span>
              </div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[.14em] text-ink/50">Empty</div>
              <h2 className="mb-2 text-[26px] md:text-[32px] leading-[1] tracking-[-.015em]" style={{fontFamily:"var(--font-instrument), Georgia, serif"}}>Nothing in your bag yet.</h2>
              <p className="mx-auto mb-6 max-w-[380px] text-[13.5px] text-ink/60">Try the drops on Discover, or filter Explore by what you&apos;re feeling right now.</p>
              <div className="flex justify-center gap-2">
                <Link href="/explore"><span className="press inline-flex rounded-sm bg-ink px-5 py-[11px] text-[12px] font-semibold text-paper">Explore brands</span></Link>
                <Link href="/"><span className="press inline-flex rounded-sm bg-white soft px-5 py-[11px] text-[12px] font-semibold text-ink">Back to Discover</span></Link>
              </div>
            </div>
          )}
          {bagGroups.map((g) => (
            <div key={g.brand.slug} className="card mb-4 rounded-lg p-4 md:p-[22px]">
              <div className="mb-[6px] flex items-center gap-[11px] border-b border-ink/7 pb-[18px]">
                <Avatar init={g.brand.init} tint={g.brand.tint} ink={g.brand.ink} size={36} />
                <div className="flex-1"><Link href={`/brand/${g.brand.slug}`} className="text-[14px] font-semibold">{g.brand.name}</Link><div className="mono text-[11.5px] text-ink/42">{shipEstimate(g.brand.slug, g.brand.shipsFrom)}</div></div>
                <span className="rounded-pill bg-cream px-[14px] py-[7px] text-[12px] font-medium">{g.shipCost === 0 ? "Free" : money(g.shipCost, true)}</span>
              </div>
              {g.items.map((it) => (
                <div key={it.key} className="flex flex-wrap items-center gap-3 md:gap-4 py-4">
                  <Placeholder className="h-[70px] w-[62px] md:h-[100px] md:w-[88px] flex-none rounded-sm" />
                  <div className="min-w-0 flex-1"><Link href={`/product/${it.p.slug}`} className="mb-[5px] block text-[14px] md:text-[15px] font-medium">{it.p.name}</Link><div className="text-[12.5px] text-ink/50">{it.variant}{it.p.preorder && <span className="ml-2 rounded-pill bg-cream px-2 py-[1px] text-[10.5px] font-semibold text-ink/70" suppressHydrationWarning>ships {new Date(it.p.preorder).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>}{it.unit < it.p.price && <span className="ml-2 rounded-pill bg-sand-2 px-2 py-[1px] text-[10.5px] font-semibold text-ink">promo</span>}</div><div className="mt-[7px] text-[13px] font-medium md:hidden">{money(it.total, true)}</div></div>
                  <QtyStepper value={it.qty} onChange={(v) => setQty(it.key, v)} />
                  <span className="hidden md:inline rounded-pill bg-cream px-4 py-[9px] text-[13.5px] font-semibold">{money(it.total, true)}</span>
                  <button onClick={() => removeItem(it.key)} aria-label="Remove" className="text-[15px] text-ink/32">✕</button>
                </div>
              ))}
            </div>
          ))}
          {also.length > 0 && <div className="mt-8"><SectionHead title="You might also want" /><div className="grid grid-cols-2 gap-3 md:gap-[14px] lg:grid-cols-4">{also.map((p) => <ProductCard key={p.slug} p={p} showBrand={false} />)}</div></div>}
        </div>
        <div className="flex flex-col gap-[14px] lg:sticky lg:top-[100px]">
          <div className="card rounded-lg p-6 md:p-7">
            <Label className="mb-5">Summary</Label>
            <div className="flex flex-col gap-[13px] text-[13.5px] text-ink/65">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-medium text-ink">{money(subtotal, true)}</span></div>
              {bagGroups.map((g) => <div key={g.brand.slug} className="flex justify-between"><span>{g.brand.name} shipping</span><span className="font-medium text-ink">{g.shipCost === 0 ? "Free" : money(g.shipCost, true)}</span></div>)}
              {promoDiscount > 0 && <div className="flex justify-between text-rust"><span>Code {promoCode}</span><span className="font-medium">−{money(promoDiscount, true)}</span></div>}
              {credit > 0 && <div className="flex justify-between text-rust"><span>Kindred points</span><span className="font-medium">−{money(credit, true)}</span></div>}
              {giftCredit > 0 && <div className="flex justify-between text-rust"><span>Gift card ····{giftCode?.slice(-4)}</span><span className="font-medium">−{money(giftCredit, true)}</span></div>}
            </div>
            <div className="my-5 h-px bg-ink/8" />
            <div className="mb-[22px] flex items-baseline justify-between"><span className="text-[15px] font-semibold">Total</span><span className="text-[26px] font-semibold tracking-[-.025em]">{money(total, true)}</span></div>
            <Link href="/checkout"><Button full size="lg" className="mb-3">Checkout</Button></Link>
            {promoCode && <div className="mb-2 flex items-center justify-between rounded-pill bg-cream px-4 py-[11px] text-[13px]"><span className="mono font-semibold">{promoCode} applied</span><button onClick={clearPromoCode} className="text-[12px] font-semibold text-ink/55">Remove</button></div>}
            {giftCode && <div className="mb-2 flex items-center justify-between rounded-pill bg-moss px-4 py-[11px] text-[13px]"><span className="mono font-semibold">Gift card ····{giftCode.slice(-4)}</span><button onClick={clearGiftCode} className="text-[12px] font-semibold text-ink/55">Remove</button></div>}
            {(!promoCode || !giftCode) && <form onSubmit={(e) => { e.preventDefault(); const c = code.trim(); if (!c) return; if ((!promoCode && applyPromoCode(c)) || (!giftCode && applyGiftCode(c))) { setErr(""); setCode(""); } else setErr("That code isn't active."); }} className="flex gap-2"><input value={code} onChange={(e) => setCode(e.target.value)} placeholder={promoCode ? "Gift card code" : giftCode ? "Promo code" : "Promo or gift card code"} className="min-w-0 flex-1 rounded-pill bg-cream px-4 py-[13px] text-[13px] outline-none placeholder:text-ink/45" /><Button variant="secondary" type="submit">Apply</Button></form>}
            {err && <div className="mt-2 text-[12px] text-sage">{err}</div>}
          </div>
          <div className="rounded-lg bg-cream p-6">
            {hint ? <><div className="mb-[7px] text-[14.5px] font-semibold leading-[1.35]">{hint.pct}% off {bagGroups.find((g) => g.brand.slug === hint.brand)?.brand.name}</div><div className="text-[12.5px] leading-[1.5] text-ink/60">Code <button onClick={() => { applyPromoCode(hint.code); }} className="mono font-semibold text-ink underline">{hint.code}</button> is running until {hint.ends ? new Date(hint.ends).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "further notice"}.</div></>
              : <><div className="mb-[7px] text-[14.5px] font-semibold leading-[1.35]">{money(Math.max(0, 500 - subtotal))} from free EU shipping</div><div className="text-[12.5px] leading-[1.5] text-ink/60">Add anything from Studio Arva and we cover the label.</div></>}
          </div>
        </div>
      </div>
      {bagGroups.length > 0 && <div className="card fixed inset-x-4 bottom-[74px] z-30 rounded-lg p-[14px] lg:hidden"><div className="flex justify-between px-[6px] pb-3 text-[13px] font-medium"><span className="text-ink/55">Total</span><span className="font-semibold">{money(total, true)}</span></div><Link href="/checkout"><Button full size="lg">Checkout</Button></Link></div>}
      <div className="h-24 lg:hidden" />
    </Page>
  );
}
