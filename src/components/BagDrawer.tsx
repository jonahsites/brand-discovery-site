"use client";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { money, shipEstimate } from "@/lib/data";
import { Avatar, Placeholder, QtyStepper, Button } from "./ui";
import { IconClose } from "./Icon";

export default function BagDrawer() {
  const { bagOpen, openBag, bagGroups, bagCount, subtotal, shipTotal, total, setQty } = useApp();
  if (!bagOpen) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div onClick={() => openBag(false)} className="absolute inset-0 bg-ink/20 backdrop-blur-[2px]" />
      <div className="glass absolute bottom-3 right-3 top-3 left-3 md:left-auto md:w-[436px] overflow-auto rounded-lg p-5 md:p-[26px]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-[22px] font-bold tracking-[-.03em]">Your bag</div>
            <div className="mono mt-[3px] text-[11.5px] text-ink/45">{bagCount} pieces · {bagGroups.length} brands</div>
          </div>
          <button onClick={() => openBag(false)} aria-label="Close" className="press grid h-[38px] w-[38px] place-items-center rounded-md bg-white soft text-ink/70"><IconClose size={16} /></button>
        </div>
        {bagGroups.length === 0 && <div className="rounded-md bg-white p-6 text-center soft text-[13.5px] text-ink/55">Your bag is empty. <Link href="/explore" className="font-semibold text-ink" onClick={() => openBag(false)}>Explore brands →</Link></div>}
        {bagGroups.map((g) => (
          <div key={g.brand.slug} className="mb-3 rounded-md bg-white p-4 soft">
            <div className="mb-[10px] flex items-center gap-[9px]">
              <Avatar init={g.brand.init} tint={g.brand.tint} ink={g.brand.ink} size={28} />
              <span className="flex-1 text-[12.5px] font-semibold">{g.brand.name}</span>
              <span className="mono text-[10.5px] text-ink/45">{shipEstimate(g.brand.slug, g.brand.shipsFrom)}</span>
            </div>
            {g.items.map((it) => (
              <div key={it.key} className="flex items-center gap-3 py-2">
                <Placeholder src={it.p.image} className="h-16 w-14 flex-none rounded-sm" />
                <div className="min-w-0 flex-1">
                  <div className="mb-[3px] text-[13px] font-medium leading-[1.3]">{it.p.name}</div>
                  <div className="text-[11px] text-ink/48">{it.variant}</div>
                </div>
                <QtyStepper size="sm" value={it.qty} onChange={(v) => setQty(it.key, v)} className="!bg-cream !shadow-none" />
                <div className="flex-none text-[12.5px] font-medium">{money(it.total, true)}</div>
              </div>
            ))}
          </div>
        ))}
        {bagGroups.length > 0 && (
          <div className="mt-[6px] rounded-md bg-white p-5 soft">
            <div className="mb-[9px] flex justify-between text-[13px] text-ink/60"><span>Subtotal</span><span className="font-medium text-ink">{money(subtotal, true)}</span></div>
            <div className="mb-[14px] flex justify-between text-[13px] text-ink/60"><span>Shipping · {bagGroups.length} brands</span><span className="font-medium text-ink">{money(shipTotal, true)}</span></div>
            <div className="mb-[18px] flex items-baseline justify-between border-t border-ink/8 pt-[14px]"><span className="text-[14px] font-semibold">Total</span><span className="text-[23px] font-semibold tracking-[-.025em]">{money(total, true)}</span></div>
            <Link href="/checkout" onClick={() => openBag(false)}><Button full size="lg">Checkout</Button></Link>
            <Link href="/bag" onClick={() => openBag(false)} className="mt-3 block text-center text-[12.5px] font-semibold text-ink">View full bag →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
