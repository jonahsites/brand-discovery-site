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

function Pills({ opts, v, set, label }: { opts: string[]; v: string; set: (s: string) => void; label: string }) {
  return (
    <div><Label className="mb-3">{label}</Label><FobRow>{opts.map((o) => <Fob key={o} active={v === o} onClick={() => set(o)} className="min-w-[56px]">{o}</Fob>)}</FobRow></div>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const { follows, toggleFollow, styleTags, setStyleTags, sizes, setSizes, completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [styles, setStyles] = useState(() => styleTags.filter((t) => STYLE_CHOICES.includes(t)));
  const [top, setTop] = useState(sizes.tops);
  const [waist, setWaist] = useState(sizes.waist);
  const [shoe, setShoe] = useState(sizes.shoe);
  const [title, body, hintDefault] = STEP_COPY[step];
  const hint = step === 0 ? (styles.length < 3 ? `${styles.length} of 3 chosen · pick ${3 - styles.length} more` : `${styles.length} chosen`) : step === 2 ? (follows.length < 5 ? `${follows.length} of 5 chosen` : `${follows.length} brands followed`) : hintDefault;
  const apply = () => { setStyleTags([...styles, ...styleTags.filter((t) => !STYLE_CHOICES.includes(t))]); setSizes({ tops: top, waist, shoe }); };
  const finish = async () => { apply(); await completeOnboarding(); router.push("/"); };
  const next = () => { if (step === 0 && styles.length < 3) return; if (step === 2) void finish(); else setStep(step + 1); };
  const skip = async () => { if (styles.length) apply(); await completeOnboarding(); router.push("/"); };
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
            {step === 0 && <FobRow>{STYLE_CHOICES.map((c) => { const on = styles.includes(c); return <Fob key={c} active={on} onClick={() => setStyles((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])}>{c}</Fob>; })}</FobRow>}
            {step === 1 && <div className="flex flex-col gap-5"><Pills label="Tops" opts={TOPS} v={top} set={setTop} /><Pills label="Trousers · waist" opts={["30", "32", "34", "36"]} v={waist} set={setWaist} /><Pills label="Shoes · EU" opts={["41", "42", "43", "44"]} v={shoe} set={setShoe} /></div>}
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
