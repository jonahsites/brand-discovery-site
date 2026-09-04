"use client";
import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { BRANDS, PRODUCTS, LOOKBOOKS, RECENTS, TREND_TAGS, money, brandBySlug, brandMeta } from "@/lib/data";
import { Avatar, Placeholder, Label } from "./ui";
import { FollowButton } from "./BrandCard";

export default function SearchOverlay() {
  const { searchOpen } = useApp();
  if (!searchOpen) return null;
  return <SearchPanel />;
}

function SearchPanel() {
  const { openSearch } = useApp();
  const [q, setQ] = useState("");
  const typed = q.trim().length > 0;
  const ql = q.toLowerCase();
  const brands = typed ? BRANDS.filter((b) => (b.name + b.city + b.tagline).toLowerCase().includes(ql)).slice(0, 3) : [];
  const products = typed ? PRODUCTS.filter((p) => (p.name + p.category + brandBySlug(p.brand)!.name).toLowerCase().includes(ql)).slice(0, 5) : [];
  const looks = typed ? LOOKBOOKS.filter((l) => (l.title + brandBySlug(l.brand)!.name).toLowerCase().includes(ql)) : [];
  const close = () => openSearch(false);
  return (
    <div className="fixed inset-0 z-50">
      <div onClick={close} className="absolute inset-0 bg-offwhite/42 backdrop-blur-[3px]" />
      <div className="glass absolute inset-3 md:inset-5 overflow-auto rounded-lg md:rounded-[18px] p-[18px] md:p-[30px] md:pt-[26px]" style={{ backdropFilter: "blur(34px)" }}>
        <div className="mb-6 flex items-center gap-3">
          <label className="flex flex-1 items-center gap-3 rounded-pill border border-white/95 bg-white/85 px-5 py-[13px] md:px-6 md:py-[17px] shadow-[inset_0_1px_0_rgba(255,255,255,.9)]">
            <span className="text-[16px] text-black/40">⌕</span>
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brands, styles, lookbooks — or how you're feeling" className="w-full bg-transparent text-[14px] md:text-[16px] outline-none placeholder:text-black/40" />
          </label>
          <button onClick={close} className="press hidden md:grid h-12 w-12 place-items-center rounded-pill bg-white/85 text-[16px]">✕</button>
          <button onClick={close} className="md:hidden text-[13px] font-semibold text-black/55">Cancel</button>
        </div>

        {!typed && (
          <div className="grid gap-8 md:grid-cols-[340px_1fr] md:gap-10">
            <div>
              <Label className="mb-4">Recent</Label>
              <div className="flex flex-col gap-2">
                {RECENTS.map((r) => (
                  <button key={r} onClick={() => setQ(r)} className="flex items-center justify-between rounded-[9px] bg-white/60 px-[18px] py-[13px] text-left text-[13.5px]"><span>{r}</span><span className="text-[13px] text-black/30">✕</span></button>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-4">Trending brands this week</Label>
              <div className="mb-8 grid gap-[14px] sm:grid-cols-2 lg:grid-cols-3">
                {BRANDS.slice(0, 6).map((b) => (
                  <Link key={b.slug} href={`/brand/${b.slug}`} onClick={close} className="flex items-center gap-[13px] rounded-[12px] bg-white/72 p-4">
                    <Avatar init={b.init} tint={b.tint} ink={b.ink} size={44} />
                    <div className="min-w-0"><div className="text-[13.5px] font-semibold">{b.name}</div><div className="mono text-[10.5px] text-black/42">{brandMeta(b)}</div></div>
                  </Link>
                ))}
              </div>
              <Label className="mb-4">Popular right now</Label>
              <div className="flex flex-wrap gap-2">
                {TREND_TAGS.map((t) => <button key={t} onClick={() => setQ(t)} className="press rounded-pill border border-black/6 bg-white/75 px-5 py-[11px] text-[13px] font-medium">{t}</button>)}
              </div>
            </div>
          </div>
        )}

        {typed && (
          <div>
            <Label className="mb-[14px]">Brands · {brands.length}</Label>
            <div className="mb-[30px] grid gap-[14px] sm:grid-cols-2 lg:grid-cols-3">
              {brands.map((b) => (
                <Link key={b.slug} href={`/brand/${b.slug}`} onClick={close} className="flex items-center gap-[13px] rounded-[12px] bg-white/75 p-4">
                  <Avatar init={b.init} tint={b.tint} ink={b.ink} size={44} />
                  <div className="min-w-0 flex-1"><div className="text-[13.5px] font-semibold">{b.name}</div><div className="mono text-[10.5px] text-black/42">{brandMeta(b)}</div></div>
                  <FollowButton slug={b.slug} size="sm" />
                </Link>
              ))}
              {brands.length === 0 && <div className="text-[13px] text-black/45">No brands match “{q}”.</div>}
            </div>
            <Label className="mb-[14px]">Products · {products.length}</Label>
            <div className="mb-[30px] grid grid-cols-2 gap-[10px] md:grid-cols-3 lg:grid-cols-5 md:gap-[14px]">
              {products.map((p) => (
                <Link key={p.slug} href={`/product/${p.slug}`} onClick={close} className="rounded-[12px] bg-white/80 p-[11px]">
                  <Placeholder className="h-[120px] md:h-[150px] rounded-[9px]" />
                  <div className="px-[5px] pt-[11px] pb-[3px]">
                    <div className="label mb-1 !text-[9.5px]">{brandBySlug(p.brand)!.name}</div>
                    <div className="mb-[5px] text-[12.5px] font-medium leading-[1.25]">{p.name}</div>
                    <div className="text-[12.5px] font-medium">{money(p.price)}</div>
                  </div>
                </Link>
              ))}
              {products.length === 0 && <div className="col-span-full text-[13px] text-black/45">No products match “{q}”. AI search over brand onboarding data lands next.</div>}
            </div>
            <Label className="mb-[14px]">Lookbooks · {looks.length}</Label>
            <div className="grid gap-[14px] sm:grid-cols-3">
              {looks.map((l) => {
                const dark = l.bg === "#1C3247";
                return (
                  <Link key={l.slug} href={`/lookbook/${l.slug}`} onClick={close} className="flex h-[130px] flex-col justify-between rounded-[12px] p-5" style={{ background: l.bg, color: dark ? "#F6F7F9" : "#1A1A1A" }}>
                    <span className="text-[15px] font-semibold tracking-[-.02em]">{l.title}</span>
                    <span className="mono text-[11px]" style={{ opacity: 0.6 }}>{brandBySlug(l.brand)!.name} · {l.looks} looks</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
