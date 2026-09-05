"use client";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { money } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Button, Label, Page, inputCls } from "@/components/ui";

const AMOUNTS = [25, 50, 100, 150, 200];

export default function Gift() {
  const { brands, giftCards, buyGiftCard, applyGiftCode, giftCode, session, toast, hydrated } = useApp();
  const [amount, setAmount] = useState(100);
  const [custom, setCustom] = useState("");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState(session.name);
  const [note, setNote] = useState("");
  const [issued, setIssued] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [redeem, setRedeem] = useState("");
  const [redeemErr, setRedeemErr] = useState("");
  const value = custom ? Number(custom) : amount;
  const valid = value >= 10 && value <= 1000 && !!to.trim() && !!from.trim();
  const buy = async () => {
    if (!valid || busy) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    const code = buyGiftCard({ amount: value, to: to.trim(), from: from.trim(), note: note.trim() || undefined });
    setBusy(false); setIssued(code); setTo(""); setNote("");
  };
  if (!hydrated) return null;
  return (
    <Page className="pt-6 md:pt-[34px]">
      <div className="grid gap-8 lg:grid-cols-[1fr_400px] items-start">
        <div>
          <div className="label mb-3">Gift cards</div>
          <h1 className="mb-2 max-w-[640px] text-[30px] md:text-[40px]">Give someone their next favorite brand.</h1>
          <p className="mb-7 max-w-[520px] text-[14px] leading-[1.6] text-ink/60">A Kindred gift card spends at any of the {brands.length} workshops here, in one bag and one checkout. The balance never expires.</p>
          <div className="card rounded-lg p-5 md:p-7">
            <Label className="mb-3">Amount</Label>
            <div className="mb-5 flex flex-wrap gap-2">
              {AMOUNTS.map((a) => <button key={a} onClick={() => { setAmount(a); setCustom(""); }} className={clsx("press rounded-pill px-5 py-[11px] text-[13px] font-semibold", !custom && amount === a ? "bg-ink text-paper" : "bg-cream")}>${a}</button>)}
              <input value={custom} onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, "").slice(0, 4))} placeholder="Custom" inputMode="numeric" className={clsx("w-[110px] rounded-pill px-5 py-[11px] text-[13px] font-semibold outline-none", custom ? "bg-ink text-paper placeholder:text-paper/50" : "bg-cream placeholder:text-ink/40")} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label className="mb-2">To</Label><input className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} placeholder="Their name" /></div>
              <div><Label className="mb-2">From</Label><input className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} /></div>
              <div className="sm:col-span-2"><Label className="mb-2">Note · optional</Label><textarea className={clsx(inputCls, "min-h-[80px] resize-y")} value={note} onChange={(e) => setNote(e.target.value)} placeholder="For the jacket you keep screenshotting." /></div>
            </div>
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
              <Button size="lg" onClick={buy} disabled={!valid || busy} className={clsx((!valid || busy) && "opacity-40")}>{busy ? "Issuing…" : `Pay ${money(value || 0, true)}`}</Button>
              <span className="text-[12px] text-ink/45">{custom && (value < 10 || value > 1000) ? "Custom amounts run from $10 to $1,000." : "Demo purchase. The code appears here and in your account; nothing is charged."}</span>
            </div>
          </div>
          {issued && (
            <div className="mt-4 rounded-lg bg-ink p-6 text-paper">
              <div className="label mb-2 !text-paper/55">Gift card issued</div>
              <div className="mono mb-2 text-[26px] font-bold tracking-[.06em]">{issued}</div>
              <div className="text-[13px] text-paper/70">Share this code. It applies in the bag under “Promo or gift card code”.</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => { navigator.clipboard?.writeText(issued); toast("Code copied"); }} className="rounded-pill bg-paper px-4 py-2 text-[12px] font-semibold text-ink">Copy code</button>
                <button onClick={() => { if (applyGiftCode(issued)) toast("Applied to your bag", "/bag"); }} className="rounded-pill bg-paper/15 px-4 py-2 text-[12px] font-semibold text-paper">Use it myself</button>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="card rounded-lg p-6">
            <Label className="mb-3">Redeem a code</Label>
            <form onSubmit={(e) => { e.preventDefault(); if (applyGiftCode(redeem)) { setRedeemErr(""); setRedeem(""); toast("Gift card applied to your bag", "/bag"); } else setRedeemErr("No balance on that code."); }} className="flex gap-2">
              <input value={redeem} onChange={(e) => setRedeem(e.target.value)} placeholder="KIND-XXXX-XXXX" className={clsx(inputCls, "mono uppercase")} />
              <Button variant="secondary" type="submit">Apply</Button>
            </form>
            {redeemErr && <div className="mt-2 text-[12px] text-sage">{redeemErr}</div>}
            {giftCode && <div className="mt-3 text-[12.5px] text-ink/55">Card ····{giftCode.slice(-4)} is on your bag. <Link href="/bag" className="font-semibold text-ink">Open bag →</Link></div>}
          </div>
          <div className="card rounded-lg p-6">
            <Label className="mb-3">Your gift cards · {giftCards.length}</Label>
            {giftCards.length === 0 && <div className="text-[13px] text-ink/50">Cards you buy show up here with their balance.</div>}
            <div className="flex flex-col gap-2">
              {giftCards.map((g) => (
                <div key={g.code} className="flex items-center justify-between gap-3 rounded-md bg-cream px-4 py-3">
                  <div className="min-w-0"><div className="mono text-[12.5px] font-semibold">{g.code}</div><div className="truncate text-[11.5px] text-ink/50">to {g.to} · from {g.from}</div></div>
                  <div className="text-right"><div className="text-[14px] font-bold">{money(g.balance, true)}</div><div className="mono text-[10px] text-ink/40">of {money(g.amount, true)}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-cream p-6 text-[13px] leading-[1.55] text-ink/60"><div className="mb-1 text-[14.5px] font-semibold text-ink">How it works</div>Kindred holds the balance and pays each brand in full when the parcel scans, the same as any order. Cards stack with promo codes and points.</div>
        </div>
      </div>
    </Page>
  );
}
