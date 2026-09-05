"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { CATEGORY_OPTIONS, GENDER_OPTIONS, MATERIAL_OPTIONS, MOOD_OPTIONS, PLANS, REGION_OPTIONS, SIZE_LADDER, STYLE_OPTIONS, VALUE_OPTIONS, type Batch, type Brand, type PlanKey } from "@/lib/data";
import { TINTS, initials, slugify } from "@/lib/catalog";
import { useApp } from "@/lib/store";
import { Button, Label, inputCls } from "@/components/ui";

const STEPS = ["Basics", "Aesthetic", "Catalogue", "Production", "Shipping", "Story", "Review", "Plan"];

function Pill({ on, children, onClick, small }: { on: boolean; children: React.ReactNode; onClick: () => void; small?: boolean }) {
  return <button type="button" onClick={onClick} className={clsx("press rounded-pill font-medium", small ? "px-[14px] py-[9px] text-[12.5px]" : "px-[18px] py-[12px] text-[13.5px]", on ? "bg-ink text-paper" : "bg-cream")}>{children}</button>;
}
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <div><Label className="mb-2">{label}</Label>{children}{hint && <div className="mt-2 text-[12px] text-ink/45">{hint}</div>}</div>;
}
const input = inputCls;

export default function Sell() {
  const router = useRouter();
  const { upsertBrand, setSession, brands } = useApp();
  const [step, setStep] = useState(-1);
  const [f, setF] = useState({
    name: "", city: "", country: "", founded: String(new Date().getFullYear()), website: "", tagline: "",
    styles: [] as string[], moods: [] as string[], gender: ["Unisex"] as string[],
    categories: [] as string[], priceMin: "60", priceMax: "240", sizeMin: "S", sizeMax: "XL",
    materials: [] as string[], values: [] as string[], madeIn: "", batch: "small" as Batch,
    shipsFrom: "", shipsTo: [] as string[], story: "", tint: 0, plan: "basic" as import("@/lib/data").PlanKey,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const tog = (k: "styles" | "moods" | "gender" | "categories" | "materials" | "values" | "shipsTo", v: string) => setF((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));
  const slug = useMemo(() => slugify(f.name), [f.name]);
  const taken = brands.some((b) => b.slug === slug);

  const valid = [
    !!(f.name.trim().length > 1 && f.city.trim() && f.country.trim() && !taken),
    f.styles.length >= 2 && f.moods.length >= 3,
    f.categories.length >= 1 && Number(f.priceMin) > 0 && Number(f.priceMax) >= Number(f.priceMin),
    !!(f.materials.length >= 1 && f.values.length >= 1 && f.madeIn.trim()),
    !!(f.shipsFrom.trim() && f.shipsTo.length >= 1),
    f.story.trim().length >= 40 && f.tagline.trim().length >= 6,
    true,   // review
    !!f.plan, // plan (default basic is set)
  ];
  const completeness = Math.round((valid.slice(0, 7).filter(Boolean).length / 7) * 100);

  const launch = () => {
    const [tint, ink] = TINTS[f.tint % TINTS.length];
    const b: Brand = {
      slug, name: f.name.trim(), init: initials(f.name), city: f.city.trim(), country: f.country.trim().toUpperCase().slice(0, 2), tagline: f.tagline.trim(),
      items: 0, followers: 0, verified: false, tint, ink, founded: Number(f.founded) || undefined, website: f.website.trim() || undefined, story: f.story.trim(),
      styles: f.styles, moods: f.moods, categories: f.categories, materials: f.materials, values: f.values, madeIn: f.madeIn.trim(), batch: f.batch, gender: f.gender,
      priceBand: [Number(f.priceMin), Number(f.priceMax)], sizeRange: [f.sizeMin, f.sizeMax], shipsTo: f.shipsTo, shipsFrom: f.shipsFrom.trim(), createdAt: new Date().toISOString(), plan: f.plan,
    };
    upsertBrand(b);
    setSession({ role: "brand", name: f.name.trim(), brand: slug });
    router.push("/dashboard?welcome=1");
  };

  return (
    <div className="relative min-h-screen bg-paper">
      <div className="relative mx-auto max-w-[960px] px-4 py-6 pb-16 md:py-12">
        <div className="mb-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-[9px]"><span className="grid h-[28px] w-[28px] place-items-center rounded-[10px] bg-ink text-[14px] font-extrabold text-paper">k</span><span className="text-[19px] font-extrabold tracking-[-.04em]">Kindred</span></Link>
          <div className="mono text-[11px] text-ink/45">Brand account · {completeness}% complete</div>
        </div>
        {step === -1 ? (
          <div className="card rounded-lg p-6 md:p-12">
            <div className="label mb-4">Sell on Kindred</div>
            <h1 className="mb-4 max-w-[640px] text-[32px] md:text-[48px] font-extrabold leading-[1.02] tracking-[-.045em]">Shoppers here come to find brands like yours. Not to compare you to Zara.</h1>
            <p className="mb-8 max-w-[560px] text-[15px] md:text-[16px] leading-[1.6] text-ink/62">Kindred is a marketplace for independent clothing labels. You answer one honest onboarding about what you make and who it&apos;s for; we turn that into filters, search results, and a page shoppers actually read. You keep your own shipping and your own customers.</p>
            <div className="mb-8 grid gap-3 sm:grid-cols-3">
              {[["No listing fee", "for your first 90 days, then 8% per order. No monthly plan."], ["Paid every Friday", "held only until each parcel scans. You ship from your workshop."], ["Found by feeling", "shoppers type “cozy for a rainy weekend”; your onboarding answers are what we match."]].map(([t, b]) => <div key={t} className="rounded-md bg-cream p-5"><div className="mb-1 text-[15px] font-semibold tracking-[-.02em]">{t}</div><div className="text-[13px] leading-[1.55] text-ink/60">{b}</div></div>)}
            </div>
            <div className="flex flex-wrap items-center gap-4"><Button size="lg" onClick={() => setStep(0)}>Start · takes 5 minutes</Button><span className="text-[13px] text-ink/50">{brands.length} brands live · {brands.filter((b) => b.followers < 1000).length} of them under 1k followers</span></div>
          </div>
        ) : (
        <div className="card rounded-lg p-5 md:p-10">
          <div className="mb-7 flex gap-[6px]">
            {STEPS.map((s, i) => <button key={s} onClick={() => i <= step && setStep(i)} className="flex-1 text-left"><div className={clsx("mb-2 h-1 rounded-pill", i <= step ? "bg-ink" : "bg-ink/12")} /><div className={clsx("hidden md:block text-[10.5px] font-semibold uppercase tracking-[.12em]", i === step ? "text-ink" : i < step ? "text-ink/55" : "text-ink/30")}>{s}</div></button>)}
          </div>

          {step === 0 && <Section title="Tell us who you are." body="This is the public header on your brand page. Everything else you answer stays on the page as facts shoppers can filter by.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Brand name" hint={f.name ? (taken ? "That name is already on Kindred." : `kindred.shop/brand/${slug}`) : undefined}><input className={input} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Form & Void" /></Field>
              <Field label="One-line tagline"><input className={input} value={f.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Workwear cut from one bolt at a time" /></Field>
              <Field label="City"><input className={input} value={f.city} onChange={(e) => set("city", e.target.value)} placeholder="Rotterdam" /></Field>
              <Field label="Country code"><input className={input} value={f.country} onChange={(e) => set("country", e.target.value)} placeholder="NL" maxLength={2} /></Field>
              <Field label="Founded"><input className={input} value={f.founded} onChange={(e) => set("founded", e.target.value)} inputMode="numeric" /></Field>
              <Field label="Website (optional)"><input className={input} value={f.website} onChange={(e) => set("website", e.target.value)} placeholder="formandvoid.nl" /></Field>
              <Field label="Avatar color"><div className="flex gap-2">{TINTS.map(([t], i) => <button key={t} onClick={() => set("tint", i)} className="h-9 w-9 rounded-pill" style={{ background: t, boxShadow: f.tint === i ? "0 0 0 2px #F6F4EF,0 0 0 3.5px #121A24" : "inset 0 0 0 1px rgba(18,26,36,.1)" }} />)}</div></Field>
            </div>
          </Section>}

          {step === 1 && <Section title="What does it feel like to wear?" body="Shoppers search by mood, not by SKU. These tags are what our search reads when someone types “something for a rainy weekend”.">
            <Field label="Aesthetic · pick at least 2"><div className="flex flex-wrap gap-2">{STYLE_OPTIONS.map((s) => <Pill key={s} on={f.styles.includes(s)} onClick={() => tog("styles", s)}>{s}</Pill>)}</div></Field>
            <Field label="Moods and moments · pick at least 3"><div className="flex flex-wrap gap-2">{MOOD_OPTIONS.map((s) => <Pill key={s} small on={f.moods.includes(s)} onClick={() => tog("moods", s)}>{s}</Pill>)}</div></Field>
            <Field label="Who is it for"><div className="flex flex-wrap gap-2">{GENDER_OPTIONS.map((s) => <Pill key={s} small on={f.gender.includes(s)} onClick={() => tog("gender", s)}>{s}</Pill>)}</div></Field>
          </Section>}

          {step === 2 && <Section title="What do you make?" body="Categories, price band and the sizes you actually cut. We hide you from shoppers whose size you don't make instead of disappointing them.">
            <Field label="Categories"><div className="flex flex-wrap gap-2">{CATEGORY_OPTIONS.map((s) => <Pill key={s} on={f.categories.includes(s)} onClick={() => tog("categories", s)}>{s}</Pill>)}</div></Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Price band · USD"><div className="flex items-center gap-2"><input className={input} value={f.priceMin} onChange={(e) => set("priceMin", e.target.value)} inputMode="numeric" /><span className="text-ink/40">to</span><input className={input} value={f.priceMax} onChange={(e) => set("priceMax", e.target.value)} inputMode="numeric" /></div></Field>
              <Field label="Size range"><div className="flex items-center gap-2"><select className={input} value={f.sizeMin} onChange={(e) => set("sizeMin", e.target.value)}>{SIZE_LADDER.map((s) => <option key={s}>{s}</option>)}</select><span className="text-ink/40">to</span><select className={input} value={f.sizeMax} onChange={(e) => set("sizeMax", e.target.value)}>{SIZE_LADDER.map((s) => <option key={s}>{s}</option>)}</select></div></Field>
            </div>
          </Section>}

          {step === 3 && <Section title="How is it made?" body="Materials and values become filters. Batch size decides whether you show up under Indie.">
            <Field label="Materials"><div className="flex flex-wrap gap-2">{MATERIAL_OPTIONS.map((s) => <Pill key={s} small on={f.materials.includes(s)} onClick={() => tog("materials", s)}>{s}</Pill>)}</div></Field>
            <Field label="Values you can stand behind"><div className="flex flex-wrap gap-2">{VALUE_OPTIONS.map((s) => <Pill key={s} small on={f.values.includes(s)} onClick={() => tog("values", s)}>{s}</Pill>)}</div></Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Made in"><input className={input} value={f.madeIn} onChange={(e) => set("madeIn", e.target.value)} placeholder="Rotterdam, NL" /></Field>
              <Field label="Batch size"><div className="flex flex-wrap gap-2">{(["one-off", "small", "medium", "large"] as Batch[]).map((b) => <Pill key={b} small on={f.batch === b} onClick={() => set("batch", b)}>{b}</Pill>)}</div></Field>
            </div>
          </Section>}

          {step === 4 && <Section title="Where do parcels come from?" body="Each brand ships its own parcels. Shoppers see the estimate before they add to bag.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Ships from (city)"><input className={input} value={f.shipsFrom} onChange={(e) => set("shipsFrom", e.target.value)} placeholder="Rotterdam" /></Field>
            </div>
            <Field label="Ships to"><div className="flex flex-wrap gap-2">{REGION_OPTIONS.map((s) => <Pill key={s} small on={f.shipsTo.includes(s)} onClick={() => tog("shipsTo", s)}>{s}</Pill>)}</div></Field>
          </Section>}

          {step === 5 && <Section title="Tell the story once." body="This is the About tab. Two or three honest paragraphs beat a mission statement.">
            <Field label="Your story · at least 40 characters"><textarea className={clsx(input, "min-h-[180px] resize-y leading-[1.6]")} value={f.story} onChange={(e) => set("story", e.target.value)} placeholder="Started in 2021 when we bought a roll of deadstock cotton duck from a shuttered sailmaker two streets over…" /></Field>
          </Section>}

          {step === 6 && <Section title="Ready to go live." body="Here is what shoppers can filter and search you by. You can edit any of it from the dashboard.">
            <div className="grid gap-3 md:grid-cols-2 text-[13px]">
              {[["Name", f.name], ["Where", `${f.city}, ${f.country}`], ["Aesthetic", f.styles.join(", ")], ["Moods", f.moods.join(", ")], ["Categories", f.categories.join(", ")], ["Price", `$${f.priceMin}–$${f.priceMax}`], ["Sizes", `${f.sizeMin}–${f.sizeMax}`], ["Materials", f.materials.join(", ")], ["Values", f.values.join(", ")], ["Made in", f.madeIn], ["Ships", `${f.shipsFrom} → ${f.shipsTo.join(", ")}`], ["For", f.gender.join(", ")]].map(([k, v]) => (
                <div key={k} className="rounded-sm bg-cream px-4 py-3"><div className="label mb-1 !text-[9.5px]">{k}</div><div className="font-medium">{v || <span className="text-ink/35">—</span>}</div></div>
              ))}
            </div>
          </Section>}

          {step === 7 && <Section title="Pick your placement." body="One-time fee to be on Kindred — no monthly subscription, no per-order cut. Same fee whether you sell one piece or ten thousand.">
            <div className="grid gap-3 md:grid-cols-3">
              {PLANS.map((pl) => { const on = f.plan === pl.key; return (
                <button key={pl.key} type="button" onClick={() => set("plan", pl.key)} className={clsx("press flex h-full flex-col rounded-md p-5 text-left transition-colors", on ? "bg-ink text-paper" : "bg-cream")}>
                  {pl.badge && <span className="mb-2 inline-flex items-center gap-1.5 self-start rounded-pill px-[10px] py-[3px] text-[9.5px] font-semibold uppercase tracking-[.14em]" style={{ background: on ? "var(--paper)" : pl.badgeBg, color: on ? "var(--ink)" : "var(--paper)" }}>{pl.badge}</span>}
                  <div className="mb-1 text-[15px] font-semibold">{pl.name}</div>
                  <div className="mb-4 text-[24px] font-normal leading-none tracking-[-.015em]" style={{fontFamily:"var(--font-instrument), Georgia, serif"}}>${pl.price}<span className="ml-1 text-[11px] font-medium tracking-normal" style={{fontFamily:"inherit"}}>one-time</span></div>
                  <div className={clsx("mb-3 text-[12px]", on ? "text-paper/70" : "text-ink/55")}>{pl.tagline}</div>
                  <ul className={clsx("mt-auto flex flex-col gap-[6px] text-[11.5px]", on ? "text-paper/85" : "text-ink/65")}>
                    {pl.features.map((f) => <li key={f} className="flex items-start gap-2"><span className={clsx("mt-[6px] h-[3px] w-[3px] flex-none rounded-pill", on ? "bg-paper" : "bg-ink")} />{f}</li>)}
                  </ul>
                </button>
              ); })}
            </div>
            <div className="mt-4 rounded-md bg-cream p-5 text-[13px] leading-[1.6] text-ink/70">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[.14em] text-ink/50">Why one fee</div>
              Running Instagram ads that put your name in front of ~10,000 people costs about $80–$200 a week and stops the day you stop paying. A single placement on Kindred is a one-time fee to sit inside a marketplace built entirely around shoppers looking for labels like yours — no algorithm to game, no bid to top up. In practical terms, one month of ads pays for Signature; a busy month of ads pays for Premium, and neither charges you again.
            </div>
            <div className="mt-3 text-[11.5px] text-ink/45">Demo checkout — nothing is actually charged today. Stripe Connect drops in with the backend.</div>
          </Section>}

          <div className="mt-8 flex flex-col md:flex-row md:items-center gap-3">
            {step < 7 ? <Button size="lg" onClick={() => setStep(step + 1)} disabled={!valid[step]} className={clsx(!valid[step] && "opacity-40")}>{step === 6 ? "Continue to plan" : "Continue"}</Button> : <Button size="lg" onClick={launch} disabled={completeness < 100} className={clsx(completeness < 100 && "opacity-40")}>{`Pay $${(PLANS.find((p) => p.key === f.plan) ?? PLANS[0]).price} · Launch brand page`}</Button>}
            {step >= 0 && <button onClick={() => setStep(step - 1)} className="text-[13px] font-semibold text-ink/50">Back</button>}
            <span className="text-[12.5px] text-ink/45 md:ml-auto">{step === 7 ? "One-time fee — no monthly, no per-order." : (!valid[step] && step < 6 ? "Fill in the required bits to continue" : "")}</span>
          </div>
        </div>
        )}
        <p className="mt-5 text-center text-[12px] text-ink/45">No listing fee for your first 90 days · Kindred keeps 8% per order after that.</p>
      </div>
    </div>
  );
}

function Section({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="mb-2 text-[26px] md:text-[34px] font-extrabold leading-[1.08] tracking-[-.04em]">{title}</h1>
      <p className="mb-7 max-w-[560px] text-[14px] md:text-[15px] leading-[1.6] text-ink/60">{body}</p>
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}
