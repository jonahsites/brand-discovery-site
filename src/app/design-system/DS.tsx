"use client";
import { useState } from "react";
import { Button, Chip, IconCircle, QtyStepper, Placeholder } from "@/components/ui";

const SW = [["Paper", "#F6F4EF"], ["Cream", "#EDE8DE"], ["Sand", "#DCD5C7"], ["Ink", "#121A24"], ["Sage", "#7C8C6F"], ["Card", "#FFFFFF"]];
const Card = ({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) => (
  <section className={`rounded-[28px] bg-paper p-8 shadow-[0_26px_60px_-34px_rgba(18,26,36,.45)] ${wide ? "lg:col-span-2" : ""}`}><div className="label mb-[18px]">{title}</div>{children}</section>
);

export default function DS() {
  const [q, setQ] = useState(1);
  return (
    <div className="grid gap-[22px] lg:grid-cols-2">
      <Card title="Type — Plus Jakarta Sans" wide>
        <h1 className="text-[62px] leading-none">Get up to<br />50% off</h1>
        <p className="mt-4 max-w-[430px] text-[15px] leading-[1.7] text-ink/62">Headlines run tight and heavy at −4.5% tracking. Body sits at 400 with generous leading. Labels are 10px, 600, uppercase, wide.</p>
        <div className="mt-6 flex flex-wrap gap-[38px] border-t border-ink/10 pt-[22px]"><span className="text-[30px] font-extrabold tracking-[-.035em]">Display 30/800</span><span className="text-[18px] font-bold tracking-[-.02em]">Title 18/700</span><span className="text-[13px] font-medium">Body 13/500</span><span className="label self-center">Label</span></div>
      </Card>
      <Card title="Palette"><div className="grid grid-cols-3 gap-3">{SW.map(([n, h]) => <div key={h}><div className="h-[74px] rounded-[16px] shadow-[inset_0_0_0_1px_rgba(18,26,36,.08)]" style={{ background: h }} /><div className="mt-2 text-[11px] font-semibold">{n}</div><div className="text-[10px] text-ink/42">{h}</div></div>)}</div></Card>
      <Card title="Controls">
        <div className="flex flex-wrap items-center gap-[10px]"><Button>Get discount</Button><Button variant="secondary">View all</Button><span className="rounded-pill border border-ink/16 px-[22px] py-3 text-[12px] font-semibold text-ink/50">Disabled</span><IconCircle size={38} variant="white">↗</IconCircle></div>
        <div className="mt-6 flex items-center gap-[14px]"><QtyStepper value={q} onChange={setQ} /><div className="flex rounded-pill bg-cream p-1"><span className="rounded-pill bg-white px-4 py-2 text-[11px] font-semibold shadow-[0_4px_12px_-8px_rgba(18,26,36,.5)]">Dashboard</span><span className="px-4 py-2 text-[11px] font-semibold text-ink/50">Women</span></div></div>
        <div className="mt-[22px] flex items-center justify-between rounded-[16px] bg-white px-4 py-[14px] shadow-[inset_0_0_0_1px_rgba(18,26,36,.07)]"><span className="text-[13px] text-ink/38">Search brands, pieces, cities</span><span className="text-[13px] text-ink/40">⌕</span></div>
        <div className="mt-4 flex flex-wrap gap-2"><Chip active>All</Chip><Chip>Outerwear</Chip><Chip>Knitwear</Chip><Chip>Sustainable</Chip></div>
      </Card>
      <Card title="Cards & imagery — 24px radius, tone placeholders" wide>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[["Men Collection", "250+ product", "#DCD5C7", "#121A24"], ["Women Collection", "250+ product", "#D6D9CE", "#121A24"], ["Top Collation", "Editorial rail", "#121A24", "#F6F4EF"], ["Sale", "Up to 50% off", "#7C8C6F", "#F6F4EF"]].map(([t, m, bg, ink]) => (
            <div key={t} className="relative aspect-[4/3] overflow-hidden rounded-[24px] shadow-[inset_0_0_0_1px_rgba(18,26,36,.07)]" style={{ background: bg, color: ink }}><div className="absolute left-[18px] top-4 text-[15px] font-bold tracking-[-.02em]">{t}</div><div className="absolute left-[18px] top-[38px] text-[11px] opacity-60">{m}</div><span className="absolute bottom-[14px] right-[14px] grid h-8 w-8 place-items-center rounded-pill bg-white/90 text-[12px] text-ink">↗</span></div>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4"><Placeholder className="aspect-square rounded-[18px]" /><Placeholder wide className="aspect-square rounded-[18px]" /><div className="aspect-square rounded-[18px] bg-moss" /><div className="aspect-square rounded-[18px] bg-sand-3" /></div>
      </Card>
    </div>
  );
}
