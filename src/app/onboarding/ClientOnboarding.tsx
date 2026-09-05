"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { BRANDS, STEP_COPY, STYLE_CHOICES, brandMeta } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Avatar, Label } from "@/components/ui";
import { Fob, FobRow } from "@/components/Fob";

const STEPS = ["Style", "Sizes", "Brands"];
const TOPS = ["XS", "S", "M", "L", "XL", "XXL"];
const WAIST = ["28", "30", "32", "34", "36", "38"];
const SHOE_US = ["7", "8", "9", "10", "11", "12"];

function Pills({ opts, v, set, label }: { opts: string[]; v: string; set: (s: string) => void; label: string }) {
  return (
    <div><Label className="mb-3">{label}</Label><FobRow>{opts.map((o) => <Fob key={o} active={v === o} onClick={() => set(o)} className="min-w-[56px]">{o}</Fob>)}</FobRow></div>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const { follows, toggleFollow, styleTags, setStyleTags, sizes, setSizes, completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  // Keep every previously-saved tag, whether from the known list or the user's own "Other".
  const [styles, setStyles] = useState(() => styleTags.filter((t) => t.length > 0));
  const [other, setOther] = useState("");
  const [top, setTop] = useState(sizes.tops || "M");
  const [waist, setWaist] = useState(sizes.waist || "32");
  const [shoe, setShoe] = useState(sizes.shoe || "10");
  const [title, body, hintDefault] = STEP_COPY[step];
  const hint = step === 0 ? (styles.length < 3 ? `${styles.length} of 3 chosen · pick ${3 - styles.length} more` : `${styles.length} chosen`) : step === 2 ? (follows.length < 5 ? `${follows.length} of 5 chosen` : `${follows.length} brands followed`) : hintDefault;
  const addOther = () => {
    const clean = other.trim();
    if (!clean || styles.includes(clean)) { setOther(""); return; }
    setStyles((prev) => [...prev, clean]);
    setOther("");
  };
  const apply = () => { setStyleTags(styles); setSizes({ tops: top, waist, shoe }); };
  const finish = async () => { apply(); await completeOnboarding(); router.push("/"); };
  const next = () => { if (step === 0 && styles.length < 3) return; if (step === 2) void finish(); else setStep(step + 1); };
  const skip = async () => { if (styles.length) apply(); await completeOnboarding(); router.push("/"); };

  const customPicks = styles.filter((s) => !STYLE_CHOICES.includes(s));

  return (
    <div className="relative min-h-screen bg-paper">
      <header className="flex items-center justify-between px-5 py-5 text-[12px] font-semibold md:px-10 md:py-7">
        <span className="text-ink/50">Setup</span>
        <span className="flex items-center gap-2"><span className="grid h-[24px] w-[24px] place-items-center rounded-[8px] bg-ink text-[11px] font-extrabold text-paper">k</span><span className="text-[15px] font-extrabold tracking-[-.03em]">Kindred</span></span>
        <button onClick={skip} className="text-ink/50 hover:text-ink">Skip for now</button>
      </header>
      <div className="grid place-items-center px-4 pb-20 md:pb-16">
        <div className="card flex w-full max-w-[520px] flex-col rounded-md p-6 md:p-8">
          <div className="mb-6 flex items-center gap-2">
            {STEPS.map((s, i) => <button key={s} onClick={() => i <= step && setStep(i)} className="flex-1 text-left" type="button"><div className={clsx("mb-[8px] h-[3px] rounded-sm", i <= step ? "bg-ink" : "bg-ink/12")} /><div className={clsx("text-[9.5px] font-semibold uppercase tracking-[.14em]", i <= step ? "text-ink" : "text-ink/38")}>{s}</div></button>)}
          </div>
          <h1 className="mb-2 text-[26px] leading-[1.05] tracking-[-.015em]" style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}>{title}</h1>
          <p className="mb-6 text-[13px] leading-[1.55] text-ink/60">{body}</p>
          <div className="mb-6 flex-1">
            {step === 0 && (
              <div className="flex flex-col gap-4">
                <FobRow>
                  {STYLE_CHOICES.map((c) => { const on = styles.includes(c); return <Fob key={c} active={on} onClick={() => setStyles((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])}>{c}</Fob>; })}
                  {customPicks.map((c) => <Fob key={c} active onClick={() => setStyles((prev) => prev.filter((x) => x !== c))}>{c} ×</Fob>)}
                </FobRow>
                <div className="rounded-sm bg-cream p-3">
                  <Label className="mb-2">Other</Label>
                  <form onSubmit={(e) => { e.preventDefault(); addOther(); }} className="flex gap-2">
                    <input value={other} onChange={(e) => setOther(e.target.value)} placeholder="Type your own — e.g. Gorpcore, Y2K, Farmcore" className="min-w-0 flex-1 rounded-sm bg-white px-3 py-[9px] text-[13px] outline-none shadow-[inset_0_0_0_1px_rgba(var(--ink-rgb),.12)] focus:shadow-[inset_0_0_0_1.5px_rgba(var(--ink-rgb),.55)] placeholder:text-ink/35" maxLength={30} />
                    <button type="submit" disabled={!other.trim()} className="press rounded-sm bg-ink px-4 py-[9px] text-[11.5px] font-semibold text-paper disabled:opacity-40">Add</button>
                  </form>
                  <div className="mt-2 text-[10.5px] text-ink/45">Adds a personal tag; still counts toward your three.</div>
                </div>
              </div>
            )}
            {step === 1 && <div className="flex flex-col gap-5"><Pills label="Tops" opts={TOPS} v={top} set={setTop} /><Pills label="Pants · waist (in)" opts={WAIST} v={waist} set={setWaist} /><Pills label="Shoes · US" opts={SHOE_US} v={shoe} set={setShoe} /></div>}
            {step === 2 && <div className="flex flex-col gap-2">{BRANDS.map((b) => { const on = follows.includes(b.slug); return (
              <button key={b.slug} onClick={() => toggleFollow(b.slug)} className={clsx("press flex items-center gap-3 rounded-sm p-3 text-left", on ? "bg-ink text-paper" : "bg-cream")} type="button">
                <Avatar init={b.init} tint={b.tint} ink={b.ink} size={38} />
                <div className="min-w-0 flex-1"><div className="text-[13px] font-semibold">{b.name}</div><div className="mono text-[10.5px] opacity-55">{b.city} · {brandMeta(b).split(" · ")[0]}</div></div>
                <span className={clsx("grid h-[22px] w-[22px] flex-none place-items-center rounded-pill text-[11px] font-semibold", on ? "bg-paper text-ink" : "bg-ink/10 text-ink/50")}>{on ? "✓" : ""}</span>
              </button>); })}</div>}
          </div>
          <button type="button" onClick={next} disabled={step === 0 && styles.length < 3} className="press w-full rounded-sm bg-ink py-[11px] text-[12.5px] font-semibold text-paper disabled:opacity-40">{step === 2 ? "Start browsing" : "Continue"}</button>
          <div className="mt-3 text-center text-[11.5px] text-ink/45">{hint}</div>
        </div>
      </div>
    </div>
  );
}
