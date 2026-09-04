"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { BRANDS, STEP_COPY, STYLE_CHOICES, brandMeta } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Avatar, Button, Label } from "@/components/ui";
import { deriveLook, lookByKey, LOOKS } from "@/lib/looks";

const STEPS = ["Style", "Sizes", "Brands", "Your look"];
const TOPS = ["XS", "S", "M", "L", "XL", "XXL"];

function Pills({ opts, v, set, label }: { opts: string[]; v: string; set: (s: string) => void; label: string }) {
  return (
    <div><Label className="mb-3">{label}</Label><div className="flex flex-wrap gap-2 md:gap-[9px]">{opts.map((o) => <button key={o} onClick={() => set(o)} className={clsx("press min-w-[56px] md:min-w-[66px] rounded-pill py-[13px] md:py-[15px] text-center text-[13px] md:text-[14px] font-medium", v === o ? "bg-ink text-paper" : "bg-white soft")}>{o}</button>)}</div></div>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const { follows, toggleFollow, styleTags, setStyleTags, sizes, setSizes, completeOnboarding, account } = useApp();
  const [step, setStep] = useState(0);
  const [styles, setStyles] = useState(() => styleTags.filter((t) => STYLE_CHOICES.includes(t)));
  const [top, setTop] = useState(sizes.tops);
  const [waist, setWaist] = useState(sizes.waist);
  const [shoe, setShoe] = useState(sizes.shoe);
  const look = lookByKey(deriveLook(styles));
  const [title, body, hintDefault] = step === 3 ? [`Your look is ${look.name}.`, `${look.tagline} Kindred now dresses itself in it: every page, every card. Change it any time from your account.`, ""] : STEP_COPY[step];
  const hint = step === 0 ? (styles.length < 3 ? `${styles.length} of 3 chosen · pick ${3 - styles.length} more` : `${styles.length} chosen`) : step === 2 ? (follows.length < 5 ? `${follows.length} of 5 chosen` : `${follows.length} brands followed`) : hintDefault;
  const apply = () => { setStyleTags([...styles, ...styleTags.filter((t) => !STYLE_CHOICES.includes(t))]); setSizes({ tops: top, waist, shoe }); };
  const finish = () => { apply(); completeOnboarding(); router.push("/"); };
  const next = () => { if (step === 0 && styles.length < 3) return; if (step === 2) apply(); if (step === 3) { finish(); } else { setStep(step + 1); } };
  const skip = () => { if (styles.length) apply(); completeOnboarding(); router.push("/"); };
  return (
    <div className="relative min-h-screen bg-paper">
      <div className="relative grid min-h-screen place-items-center p-4 md:p-[60px]">
        <div className="card flex w-full max-w-[820px] flex-col rounded-lg p-6 md:p-11">
          <div className="mb-7 md:mb-8 flex items-center gap-2 md:gap-[10px]">
            {STEPS.map((s, i) => <button key={s} onClick={() => i <= step && setStep(i)} className="flex-1 text-left"><div className={clsx("mb-[10px] h-1 rounded-pill", i <= step ? "bg-ink" : "bg-ink/13")} /><div className={clsx("hidden md:block text-[11px] font-semibold uppercase tracking-[.12em]", i <= step ? "text-ink" : "text-ink/38")}>{s}</div></button>)}
          </div>
          <h1 className="mb-[10px] md:mb-3 text-[27px] md:text-[40px] font-extrabold leading-[1.1] md:leading-[1.05] tracking-[-.042em]">{title}</h1>
          <p className="mb-6 md:mb-8 max-w-[520px] text-[13.5px] md:text-[15.5px] leading-[1.6] text-ink/60">{body}</p>
          <div className="mb-8 md:mb-9 flex-1">
            {step === 0 && <div className="flex flex-wrap gap-2 md:gap-[10px]">{STYLE_CHOICES.map((c) => { const on = styles.includes(c); return <button key={c} onClick={() => setStyles((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])} className={clsx("press rounded-pill px-[19px] md:px-[26px] py-3 md:py-[15px] text-[13px] md:text-[14.5px] font-medium", on ? "bg-ink text-paper" : "bg-cream")}>{c}</button>; })}</div>}
            {step === 1 && <div className="flex flex-col gap-6"><Pills label="Tops" opts={TOPS} v={top} set={setTop} /><Pills label="Trousers · waist" opts={["30", "32", "34", "36"]} v={waist} set={setWaist} /><Pills label="Shoes · EU" opts={["41", "42", "43", "44"]} v={shoe} set={setShoe} /></div>}
            {step === 3 && (
              <div className="grid gap-4 md:grid-cols-[1fr_1fr] items-start">
                <div className="rounded-lg p-6 md:p-8" style={{ background: look.swatch[0], color: look.swatch[1], boxShadow: `inset 0 0 0 1px ${look.swatch[1]}22` }}>
                  <div className="mb-3 text-[10px] font-semibold uppercase tracking-[.14em] opacity-60">Preview</div>
                  <div className="mb-2 text-[30px] font-extrabold leading-none tracking-[-.04em]">{account?.name.split(" ")[0] ?? "You"}, in {look.name}</div>
                  <div className="mb-5 text-[13px] opacity-70">{look.ui}</div>
                  <div className="flex gap-2"><span className="rounded-pill px-4 py-2 text-[11px] font-semibold" style={{ background: look.swatch[1], color: look.swatch[0] }}>Add to bag</span><span className="rounded-pill px-4 py-2 text-[11px] font-semibold" style={{ background: look.swatch[2], color: look.swatch[0] }}>{styles[0] ?? "Your pick"}</span></div>
                </div>
                <div className="flex flex-col gap-2">
                  {LOOKS.map((l) => { const on = l.key === look.key; const votes = styles.filter((s) => l.styles.includes(s)).length; return <div key={l.key} className={clsx("flex items-center gap-3 rounded-md px-4 py-3", on ? "bg-ink text-paper" : "bg-cream")}><span className="flex gap-1">{l.swatch.map((c) => <span key={c} className="h-4 w-4 rounded-pill" style={{ background: c, boxShadow: "0 0 0 1px rgba(0,0,0,.1)" }} />)}</span><span className="flex-1 text-[13px] font-semibold">{l.name}<span className="ml-2 text-[11px] font-medium opacity-60">{l.styles.join(" · ")}</span></span><span className="mono text-[10.5px] opacity-60">{votes ? `${votes} pick${votes === 1 ? "" : "s"}` : ""}</span></div>; })}
                </div>
              </div>
            )}
            {step === 2 && <div className="grid gap-[10px] md:gap-[14px] md:grid-cols-2 lg:grid-cols-3">{BRANDS.map((b) => { const on = follows.includes(b.slug); return (
              <button key={b.slug} onClick={() => toggleFollow(b.slug)} className={clsx("press flex items-center gap-[13px] rounded-md p-[13px] md:p-4 text-left", on ? "bg-ink text-paper" : "bg-cream")}>
                <Avatar init={b.init} tint={b.tint} ink={b.ink} size={46} />
                <div className="min-w-0 flex-1"><div className="mb-[3px] text-[13.5px] font-semibold">{b.name}</div><div className="mono text-[10.5px] opacity-50">{b.city} · {brandMeta(b).split(" · ")[0]}</div></div>
                <span className={clsx("grid h-[26px] w-[26px] flex-none place-items-center rounded-pill text-[12px] font-semibold", on ? "bg-paper text-ink" : "bg-ink/10 text-ink")}>{on ? "✓" : ""}</span>
              </button>); })}</div>}
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <Button size="lg" className={clsx("md:!px-10", step === 0 && styles.length < 3 && "opacity-40")} onClick={next}>{step === 3 ? "Start browsing" : step === 2 ? "See my look" : "Continue"}</Button>
            <span className="text-center md:text-left text-[12px] md:text-[13px] text-ink/45">{hint}</span>
            {step < 3 && <button onClick={skip} className="md:ml-auto text-[13px] font-semibold text-ink/40">Skip for now</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
