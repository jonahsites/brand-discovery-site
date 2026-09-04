"use client";
import { useState } from "react";
import { Button, Chip, IconCircle, Label, QtyStepper, Tag } from "@/components/ui";

const PALETTE = [["Off-white", "#F6F7F9"], ["Sky", "#C7DCEF"], ["Periwinkle", "#DBE1EF"], ["Slate blue", "#456F94"], ["Deep navy", "#1C3247"], ["Near-black", "#121212"]];
const Card = ({ title, children, wide, dark }: { title: string; children: React.ReactNode; wide?: boolean; dark?: boolean }) => (
  <section className={`rounded-lg p-6 md:p-8 border ${dark ? "bg-navy border-transparent text-offwhite" : "bg-white border-black/5"} ${wide ? "lg:col-span-2" : ""}`}><div className={`mono mb-5 text-[10px] font-medium uppercase tracking-[.14em] ${dark ? "text-offwhite/55" : "text-black/42"}`}>{title}</div>{children}</section>
);

export default function DS() {
  const [q, setQ] = useState(1);
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card title="Palette" wide><div className="grid grid-cols-3 gap-[14px]">{PALETTE.map(([n, h]) => <div key={h}><div className="h-24 rounded-md" style={{ background: h, border: h === "#F6F7F9" ? "1px solid rgba(0,0,0,.08)" : undefined }} /><div className="mt-[9px] text-[12px] font-semibold">{n}</div><div className="mono text-[10.5px] text-black/45">{h}</div></div>)}</div></Card>
      <Card title="Type scale"><div className="flex flex-col gap-4">
        <div><div className="text-[44px] font-bold leading-none tracking-[-.04em]">Minimalism for the messy.</div><div className="mono mt-[6px] text-[10.5px] text-black/45">Display / 44 / 700 / -4%</div></div>
        <div><div className="text-[24px] font-semibold leading-[1.1] tracking-[-.025em]">Brand of the week</div><div className="mono mt-[6px] text-[10.5px] text-black/45">Heading / 24 / 600 / -2.5%</div></div>
        <div><div className="text-[15px] leading-[1.55] text-black/68">Body copy sits at fifteen over twenty-three, generous and quiet.</div><div className="mono mt-[6px] text-[10.5px] text-black/45">Body / 15 / 400</div></div>
        <div><Label>Small batch · Made in Lisbon</Label><div className="mono mt-[6px] text-[10.5px] text-black/45">Label / 11 / 600 / +14%</div></div>
        <div><div className="text-[17px] font-medium">$248.00</div><div className="mono mt-[6px] text-[10.5px] text-black/45">Price / 17 / 500</div></div>
      </div></Card>
      <Card title="Radii & spacing" wide>
        <div className="mb-[26px] flex flex-wrap items-end gap-[14px]">{[[76, 8, "8 sm"], [96, 12, "12 md"], [124, 18, "18 lg"]].map(([s, r, l]) => <div key={l} className="text-center"><div className="border border-black/8 bg-offwhite" style={{ width: s, height: s, borderRadius: r }} /><div className="mono mt-2 text-[10.5px] text-black/50">{l}</div></div>)}<div className="text-center"><div className="h-11 w-[124px] rounded-pill border border-black/8 bg-offwhite" /><div className="mono mt-2 text-[10.5px] text-black/50">full pill</div></div></div>
        <div className="flex items-end gap-[10px]">{[4, 8, 12, 16, 24, 32, 48].map((v) => <div key={v} className="text-center"><div className="w-[34px] rounded-t-[6px] bg-navy" style={{ height: v * 2.2 }} /><div className="mono mt-[7px] text-[10px] text-black/50">{v}</div></div>)}<div className="ml-[14px] max-w-[230px] text-[12.5px] leading-[1.5] text-black/50">4px base step. Card padding 24–32. Section gap 40–56. Grid gutter 20–24.</div></div>
      </Card>
      <Card title="Buttons & icon circles">
        <div className="mb-5 flex flex-wrap items-center gap-3"><Button>Add to bag</Button><Button variant="secondary">Follow</Button><Button variant="navy">Checkout</Button><button disabled className="cursor-not-allowed rounded-pill bg-black/8 px-[26px] py-[13px] text-[13.5px] font-semibold text-black/32">Sold out</button></div>
        <div className="mb-[22px] flex items-center gap-3"><IconCircle size={44}>♡</IconCircle><IconCircle size={44} variant="sky">↗</IconCircle><IconCircle size={44} variant="black">↗</IconCircle><IconCircle size={44} variant="glass" className="">↗</IconCircle><span className="mono text-[11px] leading-[1.4] text-black/45">white · sky<br />black · glass</span></div>
        <div className="mono mb-3 text-[10px] font-medium uppercase tracking-[.14em] text-black/42">Chip row</div>
        <div className="flex flex-wrap gap-2"><Chip active>All</Chip><Chip>Outerwear</Chip><Chip>Knitwear</Chip><Chip>Sustainable</Chip></div>
      </Card>
      <Card title="Liquid glass spec" wide dark>
        <div className="flex flex-col md:flex-row gap-5 items-start">
          <div className="glass w-full md:w-[300px] flex-none rounded-xl p-5 text-ink"><div className="-mt-2 mb-[14px] h-[3px] rounded-pill" style={{ background: "linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.95),rgba(255,255,255,0))" }} /><div className="mb-[6px] text-[14px] font-semibold">Floating surface</div><div className="text-[12px] leading-[1.5] text-black/60">Nav, tab bar, drawers, sticky bars, toasts, popovers.</div></div>
          <div className="mono text-[12px] leading-[1.9] text-offwhite/80">fill · rgba(255,255,255,.62)<br />blur · 20–30px<br />border · 1px rgba(0,0,0,.07)<br />shadow · none, hairline only<br />specular · 1px top highlight<br />press · scale(.985)</div>
        </div>
      </Card>
      <Card title="Controls">
        <div className="mb-5 flex gap-2">{["L", "M", "XL", "XXL", "3XL"].map((s) => <span key={s} className={`min-w-12 rounded-pill border py-[11px] text-center text-[13px] font-medium ${s === "XL" ? "bg-sky border-sky" : "bg-white border-black/10"}`}>{s}</span>)}</div>
        <div className="mb-[22px] flex items-center gap-[10px]">{["#1A1A1A", "#C7DCEF", "#DBE1EF", "#456F94", "#EDF1F4"].map((c, i) => <span key={c} className="h-[30px] w-[30px] rounded-pill" style={{ background: c, boxShadow: i === 0 ? "0 0 0 2px #F6F7F9,0 0 0 3.5px #1A1A1A" : c === "#EDF1F4" ? "inset 0 0 0 1px rgba(0,0,0,.1)" : undefined }} />)}</div>
        <div className="mb-[22px] flex flex-wrap items-center gap-[14px]"><QtyStepper value={q} onChange={setQ} className="!bg-white border border-black/8" /><span className="rounded-pill border border-black/8 bg-white px-[15px] py-2 text-[13px] font-medium">$519</span><Tag bg="#1C3247" fg="#F6F7F9" className="!py-[7px] !px-[13px] !text-[10.5px] !tracking-[.08em]">✓ Verified</Tag></div>
        <div className="flex flex-col gap-[9px]"><div className="h-[14px] w-3/5 rounded-pill bg-black/7" /><div className="h-[14px] w-[88%] rounded-pill bg-black/7" /><div className="h-[130px] rounded-md bg-black/5" /><div className="mono text-[10.5px] text-black/42">Skeleton loader · no shimmer, just calm</div></div>
      </Card>
    </div>
  );
}
