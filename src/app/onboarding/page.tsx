"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { BRANDS, STEP_COPY, STYLE_CHOICES, brandMeta } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Avatar, Button, Label } from "@/components/ui";

const STEPS = ["Style", "Sizes", "Brands"];
const TOPS = ["XS", "S", "M", "L", "XL", "XXL"];

function Pills({ opts, v, set, label }: { opts: string[]; v: string; set: (s: string) => void; label: string }) {
  return (
    <div><Label className="mb-3">{label}</Label><div className="flex flex-wrap gap-2 md:gap-[9px]">{opts.map((o) => <button key={o} onClick={() => set(o)} className={clsx("press min-w-[56px] md:min-w-[66px] rounded-pill border py-[13px] md:py-[15px] text-center text-[13px] md:text-[14px] font-medium", v === o ? "bg-sky border-sky" : "bg-white/80 border-ink/10")}>{o}</button>)}</div></div>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const { follows, toggleFollow, styleTags, setStyleTags, sizes, setSizes } = useApp();
  const [step, setStep] = useState(0);
  const [styles, setStyles] = useState(() => styleTags.filter((t) => STYLE_CHOICES.includes(t)).length ? styleTags.filter((t) => STYLE_CHOICES.includes(t)) : ["Japanese streetwear", "Workwear", "Minimalist"]);
  const [top, setTop] = useState(sizes.tops);
  const [waist, setWaist] = useState(sizes.waist);
  const [shoe, setShoe] = useState(sizes.shoe);
  const [title, body, hintDefault] = STEP_COPY[step];
  const hint = step === 0 ? `${styles.length} of 3 chosen` : step === 2 ? `${follows.length} of 5 chosen` : hintDefault;
  const finish = () => { setStyleTags([...styles, ...styleTags.filter((t) => !STYLE_CHOICES.includes(t))]); setSizes({ tops: top, waist, shoe }); router.push("/"); };
  const next = () => (step === 2 ? finish() : setStep(step + 1));
  return (
    <div className="relative min-h-screen overflow-hidden bg-offwhite">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[120px] -top-[80px] h-[520px] w-[520px] rounded-pill bg-sky opacity-55" />
        <div className="absolute -bottom-[120px] -right-[140px] h-[600px] w-[600px] rounded-pill bg-peri opacity-50" />
        <div className="absolute right-[280px] top-[100px] hidden md:block h-[280px] w-[280px] rounded-pill bg-slate opacity-28" />
      </div>
      <div className="relative grid min-h-screen place-items-center p-4 md:p-[60px]">
        <div className="glass flex w-full max-w-[820px] flex-col rounded-3xl md:rounded-lg p-6 md:p-11" style={{ backdropFilter: "blur(34px)" }}>
          <div className="mb-7 md:mb-8 flex items-center gap-2 md:gap-[10px]">
            {STEPS.map((s, i) => <button key={s} onClick={() => setStep(i)} className="flex-1 text-left"><div className={clsx("mb-[10px] h-1 rounded-pill", i <= step ? "bg-ink" : "bg-ink/13")} /><div className={clsx("hidden md:block text-[11px] font-semibold uppercase tracking-[.12em]", i <= step ? "text-ink" : "text-ink/38")}>{s}</div></button>)}
          </div>
          <h1 className="mb-[10px] md:mb-3 text-[27px] md:text-[40px] font-bold leading-[1.1] md:leading-[1.05] tracking-[-.042em]">{title}</h1>
          <p className="mb-6 md:mb-8 max-w-[520px] text-[13.5px] md:text-[15.5px] leading-[1.6] text-ink/60">{body}</p>
          <div className="mb-8 md:mb-9 flex-1">
            {step === 0 && <div className="flex flex-wrap gap-2 md:gap-[10px]">{STYLE_CHOICES.map((c) => { const on = styles.includes(c); return <button key={c} onClick={() => setStyles((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])} className={clsx("press rounded-pill border px-[19px] md:px-[26px] py-3 md:py-[15px] text-[13px] md:text-[14.5px] font-medium", on ? "bg-ink text-white border-black" : "bg-white/80 border-ink/10")}>{c}</button>; })}</div>}
            {step === 1 && <div className="flex flex-col gap-6"><Pills label="Tops" opts={TOPS} v={top} set={setTop} /><Pills label="Trousers · waist" opts={["30", "32", "34", "36"]} v={waist} set={setWaist} /><Pills label="Shoes · EU" opts={["41", "42", "43", "44"]} v={shoe} set={setShoe} /></div>}
            {step === 2 && <div className="grid gap-[10px] md:gap-[14px] md:grid-cols-2 lg:grid-cols-3">{BRANDS.map((b) => { const on = follows.includes(b.slug); return (
              <button key={b.slug} onClick={() => toggleFollow(b.slug)} className={clsx("flex items-center gap-[13px] rounded-md md:rounded-xl border-[1.5px] p-[13px] md:p-4 text-left", on ? "bg-white/92 border-black" : "bg-white/60 border-ink/8")}>
                <Avatar init={b.init} tint={b.tint} ink={b.ink} size={46} />
                <div className="min-w-0 flex-1"><div className="mb-[3px] text-[13.5px] font-semibold">{b.name}</div><div className="mono text-[10.5px] text-ink/45">{b.city} · {brandMeta(b).split(" · ")[0]}</div></div>
                <span className={clsx("grid h-[26px] w-[26px] flex-none place-items-center rounded-pill text-[12px] font-semibold text-white", on ? "bg-ink" : "bg-ink/12")}>{on ? "✓" : ""}</span>
              </button>); })}</div>}
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <Button size="lg" className="md:!px-10" onClick={next}>{step === 2 ? "Start browsing" : "Continue"}</Button>
            <span className="text-center md:text-left text-[12px] md:text-[13px] text-ink/45">{hint}</span>
            <button onClick={() => router.push("/")} className="md:ml-auto text-[13px] font-semibold text-ink/40">Skip for now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
