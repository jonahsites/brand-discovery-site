"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { LOOKBOOKS, RECENTS, TREND_TAGS, money, brandMeta, type Brand, type Product } from "@/lib/data";
import { searchCatalog } from "@/lib/catalog";
import { Avatar, Placeholder, Label } from "./ui";
import { FollowButton } from "./BrandCard";

const FEELINGS = ["something cozy for a rainy weekend", "clean shirt for the office", "beach trip, under $120", "rugged jacket that ages well", "a gift for someone who hikes"];

export default function SearchOverlay() {
  const { searchOpen } = useApp();
  if (!searchOpen) return null;
  return <SearchPanel />;
}

type Intent = { summary: string; brandSlugs: string[]; productSlugs: string[]; moods: string[] };
type AI = { q: string; intent: Intent } | null;

function SearchPanel() {
  const { openSearch, brands, products, promos, priceOf } = useApp();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [aiRes, setAiRes] = useState<AI>(null);
  const [aiState, setAiState] = useState<"idle" | "loading" | "off">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typed = q.trim().length > 0;
  const local = useMemo(() => searchCatalog(q, brands, products, promos), [q, brands, products, promos]);

  const wantAi = typed && q.trim().split(/\s+/).length >= 3 && aiState !== "off";
  useEffect(() => {
    if (!wantAi) return;
    if (timer.current) clearTimeout(timer.current);
    const asked = q;
    timer.current = setTimeout(async () => {
      setAiState("loading");
      try {
        const r = await fetch("/api/search", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ q: asked, brands, products }) });
        const j = await r.json();
        if (j.ok) { setAiRes({ q: asked, intent: j.intent }); setAiState("idle"); } else { setAiState(j.reason === "no-key" ? "off" : "idle"); }
      } catch { setAiState("idle"); }
    }, 550);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [q, wantAi, brands, products]);
  const ai = aiRes && aiRes.q === q ? aiRes.intent : null;

  const bmap = new Map(brands.map((b) => [b.slug, b]));
  const pmap = new Map(products.map((p) => [p.slug, p]));
  const hitBrands: Brand[] = ai ? ai.brandSlugs.map((s) => bmap.get(s)).filter((x): x is Brand => !!x) : local.brands.map((h) => h.item);
  const hitProducts: Product[] = ai ? ai.productSlugs.map((s) => pmap.get(s)).filter((x): x is Product => !!x) : local.products.map((h) => h.item);
  const why = ai ? ai.moods : local.terms;
  const looks = typed ? LOOKBOOKS.filter((l) => (l.title + (bmap.get(l.brand)?.name ?? "")).toLowerCase().includes(q.toLowerCase())) : [];
  const close = () => openSearch(false);
  const goExplore = () => { router.push(`/explore?q=${encodeURIComponent(q)}`); close(); };

  return (
    <div className="fixed inset-0 z-50">
      <div onClick={close} className="absolute inset-0 bg-offwhite/42 backdrop-blur-[3px]" />
      <div className="glass absolute inset-3 md:inset-5 overflow-auto rounded-lg p-[18px] md:p-[30px] md:pt-[26px]" style={{ backdropFilter: "blur(34px)" }}>
        <form onSubmit={(e) => { e.preventDefault(); if (typed) goExplore(); }} className="mb-5 flex items-center gap-3">
          <label className="flex flex-1 items-center gap-3 rounded-pill border border-black/8 bg-white/85 px-5 py-[13px] md:px-6 md:py-[17px]">
            <span className="text-[16px] text-black/40">⌕</span>
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type how you feel: “cozy for a rainy weekend”, “office shirt under $150”…" className="w-full bg-transparent text-[14px] md:text-[16px] outline-none placeholder:text-black/40" />
            {aiState === "loading" && <span className="mono text-[10px] text-black/40">thinking…</span>}
          </label>
          <button type="button" onClick={close} className="press hidden md:grid h-12 w-12 place-items-center rounded-pill bg-white/85 text-[16px]">✕</button>
          <button type="button" onClick={close} className="md:hidden text-[13px] font-semibold text-black/55">Cancel</button>
        </form>

        {!typed && (
          <div className="grid gap-8 md:grid-cols-[340px_1fr] md:gap-10">
            <div>
              <Label className="mb-4">Try a feeling</Label>
              <div className="mb-6 flex flex-col gap-2">{FEELINGS.map((r) => <button key={r} onClick={() => setQ(r)} className="rounded-[10px] bg-sky/60 px-[18px] py-[13px] text-left text-[13.5px]">“{r}”</button>)}</div>
              <Label className="mb-4">Recent</Label>
              <div className="flex flex-col gap-2">{RECENTS.map((r) => <button key={r} onClick={() => setQ(r)} className="flex items-center justify-between rounded-[10px] bg-white/60 px-[18px] py-[13px] text-left text-[13.5px]"><span>{r}</span><span className="text-[13px] text-black/30">✕</span></button>)}</div>
            </div>
            <div>
              <Label className="mb-4">Trending brands this week</Label>
              <div className="mb-8 grid gap-[14px] sm:grid-cols-2 lg:grid-cols-3">
                {[...brands].sort((a, b) => b.followers - a.followers).slice(0, 6).map((b) => (
                  <Link key={b.slug} href={`/brand/${b.slug}`} onClick={close} className="flex items-center gap-[13px] rounded-[12px] bg-white/72 p-4"><Avatar init={b.init} tint={b.tint} ink={b.ink} size={44} /><div className="min-w-0"><div className="text-[13.5px] font-semibold">{b.name}</div><div className="mono text-[10.5px] text-black/42">{brandMeta(b)}</div></div></Link>
                ))}
              </div>
              <Label className="mb-4">Popular right now</Label>
              <div className="flex flex-wrap gap-2">{TREND_TAGS.map((t) => <button key={t} onClick={() => setQ(t)} className="press rounded-pill border border-black/6 bg-white/75 px-5 py-[11px] text-[13px] font-medium">{t}</button>)}</div>
            </div>
          </div>
        )}

        {typed && (
          <div>
            {(ai?.summary || why.length > 0) && (
              <div className="mb-5 flex flex-wrap items-center gap-2 text-[13px]">
                <span className="text-black/55">{ai?.summary ?? "Reading it as"}</span>
                {why.slice(0, 8).map((w) => <span key={w} className="rounded-pill bg-peri px-[10px] py-1 text-[11.5px] font-medium">{w}</span>)}
                {local.maxPrice && <span className="rounded-pill bg-sky px-[10px] py-1 text-[11.5px] font-medium">under ${local.maxPrice}</span>}
                <span className="mono ml-auto text-[10px] text-black/40">{ai ? "Claude" : aiState === "off" ? "local search · add ANTHROPIC_API_KEY for AI" : "local search"}</span>
              </div>
            )}
            <Label className="mb-[14px]">Brands · {hitBrands.length}</Label>
            <div className="mb-[30px] grid gap-[14px] sm:grid-cols-2 lg:grid-cols-3">
              {hitBrands.map((b) => (
                <Link key={b.slug} href={`/brand/${b.slug}`} onClick={close} className="flex items-center gap-[13px] rounded-[12px] bg-white/75 p-4"><Avatar init={b.init} tint={b.tint} ink={b.ink} size={44} /><div className="min-w-0 flex-1"><div className="text-[13.5px] font-semibold">{b.name}</div><div className="mono text-[10.5px] text-black/42">{b.city} · {b.styles.slice(0, 2).join(", ")}</div></div><FollowButton slug={b.slug} size="sm" /></Link>
              ))}
              {hitBrands.length === 0 && <div className="text-[13px] text-black/45">No brands match “{q}” yet.</div>}
            </div>
            <div className="mb-[14px] flex items-center justify-between"><Label>Products · {hitProducts.length}</Label>{hitProducts.length > 0 && <button onClick={goExplore} className="text-[12.5px] font-semibold text-navy">See all in Explore →</button>}</div>
            <div className="mb-[30px] grid grid-cols-2 gap-[10px] md:grid-cols-3 lg:grid-cols-5 md:gap-[14px]">
              {hitProducts.slice(0, 10).map((p) => (
                <Link key={p.slug} href={`/product/${p.slug}`} onClick={close} className="rounded-[12px] bg-white/80 p-[11px]"><Placeholder className="h-[120px] md:h-[150px] rounded-[9px]" /><div className="px-[5px] pt-[11px] pb-[3px]"><div className="label mb-1 !text-[9.5px]">{bmap.get(p.brand)?.name}</div><div className="mb-[5px] text-[12.5px] font-medium leading-[1.25]">{p.name}</div><div className="text-[12.5px] font-medium">{money(priceOf(p).price)}</div></div></Link>
              ))}
              {hitProducts.length === 0 && <div className="col-span-full text-[13px] text-black/45">No products match. Try describing the moment instead of the item.</div>}
            </div>
            {looks.length > 0 && <><Label className="mb-[14px]">Lookbooks · {looks.length}</Label><div className="grid gap-[14px] sm:grid-cols-3">{looks.map((l) => { const dark = l.bg === "#1C3247"; return <Link key={l.slug} href={`/lookbook/${l.slug}`} onClick={close} className="flex h-[130px] flex-col justify-between rounded-[12px] p-5" style={{ background: l.bg, color: dark ? "#F6F7F9" : "#1A1A1A" }}><span className="text-[15px] font-semibold tracking-[-.02em]">{l.title}</span><span className="mono text-[11px]" style={{ opacity: 0.6 }}>{bmap.get(l.brand)?.name} · {l.looks} looks</span></Link>; })}</div></>}
          </div>
        )}
      </div>
    </div>
  );
}
