"use client";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { SHIP_OPTS, money, type Order } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Avatar, Button, Label, Placeholder, Page, inputCls } from "@/components/ui";

type Addr = { name: string; email: string; line: string; city: string; zip: string; country: string };
function AddrField({ k, addr, setAddr, span, placeholder }: { k: keyof Addr; addr: Addr; setAddr: (fn: (a: Addr) => Addr) => void; span?: boolean; placeholder?: string }) {
  return <input value={addr[k]} onChange={(e) => setAddr((a) => ({ ...a, [k]: e.target.value }))} placeholder={placeholder} className={clsx(inputCls, "!bg-cream", span && "sm:col-span-2")} />;
}
const Step = ({ n, t }: { n: number; t: string }) => <div className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-pill bg-ink text-[12px] font-semibold text-paper">{n}</span><span className="text-[18px] font-semibold tracking-[-.02em]">{t}</span></div>;

export default function Checkout() {
  const { bagGroups, bagCount, subtotal, shipTotal, promoDiscount, credit, giftCredit, giftCode, total, ship, setShip, placeOrder, session, promoCode, points, redeem, setRedeem } = useApp();
  const [addr, setAddr] = useState<Addr>({ name: session.name, email: "jules@renard.co", line: "41 Rue des Panoyaux", city: "Paris", zip: "75020", country: "France" });
  const [card, setCard] = useState({ number: "4242 4242 4242 4242", exp: "09 / 29", cvc: "123" });
  const [done, setDone] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const valid = Object.values(addr).every((v) => v.trim()) && card.number.replace(/\s/g, "").length >= 15 && card.exp.trim() && card.cvc.trim().length >= 3;
  const pay = async () => { if (!valid || busy) return; setBusy(true); await new Promise((r) => setTimeout(r, 900)); const o = placeOrder(); setBusy(false); if (o) setDone(o); };
  if (done) return (
    <Page narrow className="pt-16 text-center">
      <div className="mx-auto max-w-[560px] rounded-lg bg-cream p-10">
        <div className="label mb-4 !text-ink/48">Order #{done.id} placed</div>
        <h1 className="mb-3 text-[34px] font-extrabold leading-[1.05] tracking-[-.04em]">Thanks, {addr.name.split(" ")[0]}.</h1>
        <p className="mb-6 text-[14.5px] leading-[1.55] text-ink/66">{new Set(done.items.map((i) => i.brand)).size} parcels from {new Set(done.items.map((i) => i.brand)).size} workshops, {money(done.total, true)} total. Kindred holds payment until each brand scans your parcel.</p>
        <div className="flex justify-center gap-3"><Link href="/account?tab=Orders"><Button>Track order</Button></Link><Link href="/"><Button variant="ghost">Back to Discover</Button></Link></div>
      </div>
    </Page>
  );
  if (bagGroups.length === 0) return <Page narrow className="pt-16 text-center"><h1 className="mb-2 text-[28px] font-extrabold tracking-[-.03em]">Your bag is empty.</h1><Link href="/explore" className="font-semibold text-navy">Explore brands →</Link></Page>;
  return (
    <Page className="pt-6 md:pt-[34px]">
      <div className="mono mb-4 hidden md:block text-[12px] text-ink/45">Secure checkout · {bagGroups.length} brands</div>
      <div className="grid gap-8 lg:grid-cols-[1fr_400px] items-start">
        <div>
          <h1 className="mb-5 text-[28px] md:text-[34px] font-extrabold leading-[1.05] tracking-[-.038em]">Checkout</h1>
          <div className="mb-6 grid grid-cols-2 gap-[10px] sm:grid-cols-3"><Button size="lg" onClick={pay}>Apple Pay</Button><Button size="lg" variant="secondary" onClick={pay}>Google Pay</Button><div className="hidden sm:block"><Button full size="lg" variant="secondary" onClick={pay}>Shop Pay</Button></div></div>
          <div className="mono mb-6 flex items-center gap-[14px] text-[11.5px] text-ink/38"><span className="h-px flex-1 bg-ink/10" />or pay by card<span className="h-px flex-1 bg-ink/10" /></div>
          <div className="card mb-4 rounded-lg p-5 md:p-[30px]"><div className="mb-[22px]"><Step n={1} t="Delivery address" /></div><div className="grid gap-3 sm:grid-cols-2"><AddrField k="name" addr={addr} setAddr={setAddr} placeholder="Full name" /><AddrField k="email" addr={addr} setAddr={setAddr} placeholder="Email" /><AddrField k="line" addr={addr} setAddr={setAddr} span placeholder="Street address" /><AddrField k="city" addr={addr} setAddr={setAddr} placeholder="City" /><AddrField k="zip" addr={addr} setAddr={setAddr} placeholder="Postcode" /><AddrField k="country" addr={addr} setAddr={setAddr} span placeholder="Country" /></div></div>
          <div className="card mb-4 rounded-lg p-5 md:p-[30px]">
            <div className="mb-2"><Step n={2} t="Shipping, per brand" /></div>
            <div className="mb-[22px] md:pl-10 text-[12.5px] text-ink/50">Each brand ships from its own workshop, so each parcel arrives separately.</div>
            {bagGroups.map((g) => { const s = SHIP_OPTS[g.brand.slug] ?? { from: g.brand.shipsFrom, opts: [{ label: "Standard", meta: "5–8 days · $9.00", cost: 9 }] }; const cur = ship[g.brand.slug] ?? 0; return (
              <div key={g.brand.slug} className="border-t border-ink/7 py-[18px]">
                <div className="mb-3 flex items-center gap-[10px]"><Avatar init={g.brand.init} tint={g.brand.tint} ink={g.brand.ink} size={30} /><span className="text-[13.5px] font-semibold">{g.brand.name}</span><span className="mono text-[11.5px] text-ink/40">from {s.from}</span></div>
                <div className="flex gap-[10px]">{s.opts.map((o, oi) => <button key={o.label} onClick={() => setShip(g.brand.slug, oi)} className={clsx("flex-1 rounded-md px-[18px] py-[15px] text-left", cur === oi ? "bg-ink text-paper" : "bg-cream")}><div className="mb-1 text-[13px] font-semibold">{o.label}</div><div className="mono text-[11.5px] opacity-55">{o.meta}</div></button>)}</div>
              </div>); })}
          </div>
          <div className="card rounded-lg p-5 md:p-[30px]">
            <div className="mb-[22px]"><Step n={3} t="Payment" /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative sm:col-span-2"><input value={card.number} onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))} placeholder="Card number" className={clsx(inputCls, "!bg-cream pr-16")} /><span className="mono absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-ink/40">VISA</span></div>
              <input value={card.exp} onChange={(e) => setCard((c) => ({ ...c, exp: e.target.value }))} placeholder="MM / YY" className={clsx(inputCls, "!bg-cream")} />
              <input value={card.cvc} onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value }))} placeholder="CVC" className={clsx(inputCls, "!bg-cream")} />
            </div>
            <div className="mt-[18px] flex items-center gap-[11px] text-[12.5px] text-ink/55"><span className="grid h-5 w-5 place-items-center rounded-[7px] bg-ink text-[11px] font-semibold text-paper">✓</span>Save this card for one-tap checkout across all brands</div>
            <div className="mt-3 text-[11.5px] text-ink/40">Demo checkout. No card is charged; Stripe Connect lands with the backend.</div>
          </div>
        </div>
        <div className="card rounded-lg p-6 md:p-7 lg:sticky lg:top-[100px]">
          <Label className="mb-5">Order · {bagCount} pieces</Label>
          <div className="mb-[22px] flex flex-col gap-3">{bagGroups.flatMap((g) => g.items).map((it) => <div key={it.key} className="flex items-center gap-3"><Placeholder className="h-14 w-12 flex-none rounded-sm" /><div className="min-w-0 flex-1"><div className="text-[12.5px] font-medium leading-[1.3]">{it.p.name}</div><div className="mono text-[10.5px] text-ink/42">{it.variant} · ×{it.qty}</div></div><div className="text-[12.5px] font-medium">{money(it.total, true)}</div></div>)}</div>
          <div className="flex flex-col gap-[11px] border-t border-ink/9 pt-5 text-[13px] text-ink/62">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-medium text-ink">{money(subtotal, true)}</span></div>
            <div className="flex justify-between"><span>Shipping · {bagGroups.length} parcels</span><span className="font-medium text-ink">{money(shipTotal, true)}</span></div>
            {promoDiscount > 0 && <div className="flex justify-between text-navy"><span>Code {promoCode}</span><span className="font-medium">−{money(promoDiscount, true)}</span></div>}
            {credit > 0 && <div className="flex justify-between text-navy"><span>Kindred points</span><span className="font-medium">−{money(credit, true)}</span></div>}
            {giftCredit > 0 && <div className="flex justify-between text-navy"><span>Gift card ····{giftCode?.slice(-4)}</span><span className="font-medium">−{money(giftCredit, true)}</span></div>}
            <div className="flex justify-between"><span>VAT included</span><span className="font-medium text-ink">—</span></div>
          </div>
          {points >= 100 && <div className="mt-4 rounded-md bg-cream p-3"><div className="mb-2 flex justify-between text-[12.5px]"><span className="font-semibold">Spend points</span><span className="text-ink/55">{points.toLocaleString()} available · 100 = $1</span></div><input type="range" min={0} max={Math.min(points, Math.floor((subtotal + shipTotal - promoDiscount) * 100))} step={100} value={redeem} onChange={(e) => setRedeem(Number(e.target.value))} className="w-full accent-ink" /><div className="mono mt-1 text-[11px] text-ink/55">Using {redeem.toLocaleString()} points = {money(redeem / 100, true)}</div></div>}
          <div className="mb-5 mt-[18px] flex items-baseline justify-between border-t border-ink/9 pt-[18px]"><span className="text-[15px] font-semibold">Total</span><span className="text-[28px] font-semibold tracking-[-.03em]">{money(total, true)}</span></div>
          <Button full size="lg" onClick={pay} disabled={!valid || busy} className={clsx((!valid || busy) && "opacity-50")}>{busy ? "Placing order…" : `Pay ${money(total, true)}`}</Button>
          <div className="mt-[14px] text-center text-[11.5px] leading-[1.5] text-ink/45">Kindred holds payment until each brand marks your parcel shipped.</div>
        </div>
      </div>
    </Page>
  );
}
