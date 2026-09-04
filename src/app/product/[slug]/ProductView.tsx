"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ACCORDIONS, COLORS, REVIEWS, SIZES, money } from "@/lib/data";
import { searchCatalog, sizesBetween } from "@/lib/catalog";
import { useApp } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import Accordion from "@/components/Accordion";
import { Avatar, Button, IconCircle, Label, Placeholder, QtyStepper, SectionHead, Tag, Verified, Page, inputCls } from "@/components/ui";

export default function ProductView({ slug }: { slug: string }) {
  const { brands, products, hydrated, priceOf, addToBag, openBag, toggleSaved, isSaved, reviews, addReview, alerts, toggleAlert, session, waitlist, toggleWaitlist, markViewed, promos, toast, boards, createBoard, toggleInBoard } = useApp();
  const [boardOpen, setBoardOpen] = useState(false);
  const [boardName, setBoardName] = useState("");
  useEffect(() => { markViewed(slug); }, [slug, markViewed]);
  const p = products.find((x) => x.slug === slug);
  const b = p ? brands.find((x) => x.slug === p.brand) : undefined;
  const sizes = p?.sizes?.length ? p.sizes : b ? sizesBetween(b.sizeRange) : SIZES;
  const colors: [string, string][] = p?.colors?.length ? p.colors.map((c) => [c, COLORS.find(([n]) => n === c)?.[1] ?? "#DBE1EF"]) : COLORS;
  const [size, setSize] = useState(() => sizes.includes("XL") ? "XL" : sizes[Math.min(2, sizes.length - 1)]);
  const [color, setColor] = useState(0);
  const [qty, setQty] = useState(1);
  const [thumb, setThumb] = useState(0);
  const [added, setAdded] = useState(false);
  const [rev, setRev] = useState({ stars: 5, fit: 2 as 1 | 2 | 3, body: "", open: false });
  const own = p ? [...reviews.filter((r) => r.product === p.slug), ...(p.createdAt ? [] : REVIEWS.map((r, i) => ({ ...r, id: "seed" + i, product: p.slug, stars: r.stars === "★ 5.0" ? 5 : 4, fit: 2 as const, size: r.meta.split(" ")[2] ?? "L", at: "" })))] : [];
  if (!p || !b) return <Page className="pt-20 text-center"><h1 className="mb-2 text-[28px] font-bold tracking-[-.03em]">{hydrated ? "That piece isn't here." : "Loading…"}</h1>{hydrated && <p className="text-[14px] text-black/55"><Link href="/explore" className="font-semibold text-navy">Back to Explore →</Link></p>}</Page>;
  const { price, compareAt, promo } = priceOf(p);
  const gallery = [p.image, ...(p.images ?? [])].filter((x): x is string => !!x);
  const more = products.filter((x) => x.brand === b.slug && x.slug !== p.slug).slice(0, 4);
  const similar = searchCatalog([p.category, ...(p.tags ?? []), ...b.styles.slice(0, 2), ...b.moods.slice(0, 3)].join(" "), brands, products.filter((x) => x.brand !== b.slug), promos).products.map((h) => h.item).slice(0, 4);
  const soldOut = p.stock === 0;
  const add = () => { if (soldOut) return; addToBag(p.slug, `${size} · ${colors[color][0]}`, qty); setAdded(true); openBag(); toast(`${p.name} added to bag`); };
  const saved = isSaved(p.slug);
  const alertOn = alerts.includes(p.slug);
  const avg = own.length ? (own.reduce((s, r) => s + r.stars, 0) / own.length).toFixed(1) : "—";
  const fitAvg = own.length ? own.reduce((s, r) => s + r.fit, 0) / own.length : 2;
  const submitReview = () => { if (rev.body.trim().length < 10) return; addReview({ product: p.slug, name: session.name, init: session.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(), tint: "#C7DCEF", stars: rev.stars, fit: rev.fit, body: rev.body.trim(), size }); setRev({ stars: 5, fit: 2, body: "", open: false }); };
  return (
    <Page className="pt-4 md:pt-7">
      <div className="mono mb-4 md:mb-[22px] text-[12px] text-black/40"><Link href="/explore">Explore</Link> / <Link href={`/explore?cat=${encodeURIComponent(p.category)}`}>{p.category}</Link> / <Link href={`/brand/${b.slug}`}>{b.name}</Link></div>
      <div className="mb-10 md:mb-14 grid gap-6 md:gap-10 lg:grid-cols-[minmax(0,660px)_1fr] items-start">
        <div>
          <div className="card relative h-[340px] md:h-[660px] rounded-2xl md:rounded-lg p-3 md:p-[34px]">
            <Placeholder src={gallery[thumb]} alt={p.name} label={`${["Front", "Back", "Detail", "On body"][thumb]} · 4:5`} className={clsx("absolute inset-3 md:inset-[34px] rounded-md", soldOut && "opacity-60")} />
            {soldOut ? <div className="absolute left-[22px] top-[22px]"><Tag bg="#121212" fg="#fff">Sold out</Tag></div> : p.stock !== undefined && p.stock <= 6 ? <div className="absolute left-[22px] top-[22px]"><Tag bg="#456F94" fg="#fff">Final {p.stock} pieces</Tag></div> : null}
          </div>
          <div className="mt-3 md:mt-[14px] flex gap-[9px] md:gap-3">
            {["Front", "Back", "Detail", "On body"].map((t, i) => <button key={t} onClick={() => setThumb(i)} className={clsx("flex-1 rounded-[10px] md:rounded-md border-2", thumb === i ? "border-ink" : "border-transparent")}><Placeholder src={gallery[i]} alt={`${p.name} ${t}`} label={t} className="h-[74px] md:h-[130px] rounded-[8px] md:rounded-[10px]" /></button>)}
          </div>
        </div>
        <div className="md:pt-[6px]">
          <Link href={`/brand/${b.slug}`} className="mb-4 md:mb-5 inline-flex items-center gap-[10px] rounded-pill border border-black/7 bg-white py-[7px] pl-[7px] pr-4">
            <Avatar init={b.init} tint={b.tint} ink={b.ink} size={32} /><span className="text-[13px] font-semibold">{b.name}</span>{b.verified && <Verified />}<span className="mono text-[11.5px] text-black/40">{b.city}</span>
          </Link>
          <h1 className="mb-3 md:mb-[14px] text-[28px] md:text-[38px] font-bold leading-[1.05] tracking-[-.038em]">{p.name}</h1>
          <div className="mb-6 md:mb-[30px] flex flex-wrap items-baseline gap-3">
            <span className="text-[24px] md:text-[26px] font-medium">{money(price)}</span>
            {compareAt && <><span className="text-[17px] text-black/35 line-through">{money(compareAt)}</span><Tag>{Math.round((1 - price / compareAt) * 100)}% off{promo ? ` · ${promo.label}` : ""}</Tag></>}
          </div>
          {p.description && <p className="mb-6 max-w-[520px] text-[14px] leading-[1.6] text-black/65">{p.description}</p>}
          <div className="mb-3 flex items-center justify-between"><Label>Size</Label><span className="text-[12px] font-medium text-navy">Size guide</span></div>
          <div className="mb-6 md:mb-7 flex flex-wrap gap-2 md:gap-[9px]">
            {sizes.map((s) => <button key={s} onClick={() => { setSize(s); setAdded(false); }} className={clsx("press flex-1 md:flex-none md:min-w-[62px] rounded-pill border py-[13px] md:py-[14px] text-[13px] md:text-[14px] font-medium", size === s ? "bg-sky border-sky" : "bg-white border-black/11")}>{s}</button>)}
          </div>
          <Label className="mb-3">Colour · {colors[color][0]}</Label>
          <div className="mb-6 md:mb-[30px] flex gap-3">
            {colors.map(([n, hex], i) => <button key={n} aria-label={n} onClick={() => setColor(i)} className="h-[34px] w-[34px] rounded-pill" style={{ background: hex, boxShadow: color === i ? "0 0 0 2px #F6F7F9, 0 0 0 3.5px #1A1A1A" : "inset 0 0 0 1px rgba(0,0,0,.1)" }} />)}
          </div>
          <div className="mb-4 flex items-center gap-3">
            <QtyStepper value={qty} onChange={setQty} className="!bg-white border border-black/8 !p-[6px]" />
            <Button size="lg" className={clsx("flex-1", soldOut && "!bg-black/8 !text-black/32 cursor-not-allowed")} onClick={add}>{soldOut ? "Sold out" : added ? "Added to bag ✓" : "Add to bag"}</Button>
            <IconCircle size={52} variant={saved ? "black" : "white"} onClick={() => { toggleSaved(p.slug); toast(saved ? "Removed from saved" : "Saved to your profile", "/account"); }} className="hidden sm:grid text-[17px]">{saved ? "♥" : "♡"}</IconCircle>
            <IconCircle size={52} variant="white" onClick={() => setBoardOpen(!boardOpen)} className="hidden sm:grid text-[15px]" aria-label="Add to board">◇</IconCircle>
            <IconCircle size={52} variant="white" className="hidden sm:grid text-[16px]" onClick={() => { if (navigator.share) navigator.share({ title: p.name, url: location.href }).catch(() => {}); else { navigator.clipboard?.writeText(location.href); toast("Link copied"); } }}>↗</IconCircle>
          </div>
          {boardOpen && (
            <div className="card mb-3 rounded-md p-3">
              <Label className="mb-2">Add to a board</Label>
              <div className="mb-2 flex flex-wrap gap-2">{boards.map((bd) => { const on = bd.products.includes(p.slug); return <button key={bd.id} onClick={() => { toggleInBoard(bd.id, p.slug); toast(on ? `Removed from ${bd.name}` : `Added to ${bd.name}`, "/account"); }} className={clsx("rounded-pill border px-3 py-[6px] text-[12px] font-medium", on ? "bg-black text-white border-black" : "bg-white border-black/10")}>{on ? "✓ " : ""}{bd.name}</button>; })}</div>
              <form onSubmit={(e) => { e.preventDefault(); if (!boardName.trim()) return; createBoard(boardName, p.slug); toast(`Board “${boardName.trim()}” created`, "/account"); setBoardName(""); setBoardOpen(false); }} className="flex gap-2"><input value={boardName} onChange={(e) => setBoardName(e.target.value)} placeholder="New board name" className={clsx(inputCls, "!py-2 !text-[13px]")} /><Button size="sm" type="submit">Create</Button></form>
            </div>
          )}
          <div className="mb-2 flex flex-wrap gap-2"><button onClick={() => toggleAlert(p.slug)} className={clsx("rounded-pill px-4 py-2 text-[12px] font-semibold", alertOn ? "bg-sky" : "bg-offwhite")}>{alertOn ? "◔ Price alert on" : "◔ Alert me if the price drops"}</button>{soldOut && <button onClick={() => toggleWaitlist(p.slug)} className={clsx("rounded-pill px-4 py-2 text-[12px] font-semibold", waitlist.includes(p.slug) ? "bg-navy text-offwhite" : "bg-offwhite")}>{waitlist.includes(p.slug) ? "✓ On the waitlist" : "Join the waitlist"}</button>}</div>
          <div className="mb-6 md:mb-[30px] text-[12.5px] text-black/50">Ships from {b.shipsFrom} in 2–4 days · free returns for 30 days</div>
          <Accordion items={ACCORDIONS} />
        </div>
      </div>

      <SectionHead title={`More from ${b.name}`} action="Visit brand" href={`/brand/${b.slug}`} />
      <div className="mb-10 md:mb-11 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">{more.map((x) => <ProductCard key={x.slug} p={x} showBrand={false} />)}{more.length === 0 && <div className="col-span-full text-[13px] text-black/50">This is {b.name}&apos;s only piece so far.</div>}</div>
      {similar.length > 0 && <><SectionHead title="Similar from other brands" sub={`Matched on ${p.category.toLowerCase()} and ${b.moods.slice(0, 2).join(", ")}`} action="Explore" href={`/explore?q=${encodeURIComponent(p.category + " " + b.moods.slice(0, 2).join(" "))}`} /><div className="mb-10 md:mb-11 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">{similar.map((x) => <ProductCard key={x.slug} p={x} />)}</div></>}

      <div className="grid gap-5 md:gap-8 lg:grid-cols-[340px_1fr] items-start">
        <div className="rounded-lg bg-navy p-7 md:p-[30px] text-offwhite">
          <Label light className="mb-4">Reviews</Label>
          <div className="mb-[6px] text-[52px] font-bold leading-none tracking-[-.04em]">{avg}</div>
          <div className="mb-[26px] text-[12.5px] text-offwhite/70">from {own.length} verified buyer{own.length === 1 ? "" : "s"}</div>
          <Label light className="mb-[14px]">Fit</Label>
          <div className="relative mb-3 h-[5px] rounded-pill bg-offwhite/20"><div className="absolute top-[-6px] h-[17px] w-[17px] -ml-2 rounded-pill bg-peri" style={{ left: `${((fitAvg - 1) / 2) * 100}%` }} /></div>
          <div className="mono mb-6 flex justify-between text-[11px] text-offwhite/65"><span>Runs small</span><span>True</span><span>Runs large</span></div>
          <button onClick={() => setRev((r) => ({ ...r, open: !r.open }))} className="rounded-pill bg-peri px-4 py-2 text-[12px] font-semibold text-ink">{rev.open ? "Close" : "Write a review"}</button>
        </div>
        <div className="flex flex-col gap-[14px]">
          {rev.open && (
            <div className="card rounded-2xl p-5 md:p-6">
              <div className="mb-3 flex flex-wrap gap-4">
                <div><Label className="mb-2">Stars</Label><div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setRev((r) => ({ ...r, stars: n }))} className={clsx("text-[20px]", n <= rev.stars ? "text-ink" : "text-black/20")}>★</button>)}</div></div>
                <div><Label className="mb-2">Fit</Label><div className="flex gap-2">{(["Runs small", "True", "Runs large"] as const).map((f, i) => <button key={f} onClick={() => setRev((r) => ({ ...r, fit: (i + 1) as 1 | 2 | 3 }))} className={clsx("rounded-pill px-3 py-[6px] text-[12px] font-medium", rev.fit === i + 1 ? "bg-black text-white" : "bg-offwhite")}>{f}</button>)}</div></div>
              </div>
              <textarea value={rev.body} onChange={(e) => setRev((r) => ({ ...r, body: e.target.value }))} placeholder="How does it wear? Sizing, fabric, shipping…" className={clsx(inputCls, "mb-3 min-h-[90px] resize-y")} />
              <Button onClick={submitReview} disabled={rev.body.trim().length < 10} className={clsx(rev.body.trim().length < 10 && "opacity-40")}>Post review · size {size}</Button>
            </div>
          )}
          {own.map((r) => (
            <div key={r.id} className="card rounded-2xl p-5 md:p-6">
              <div className="mb-[14px] flex items-center gap-[11px]">
                <Avatar init={r.init} tint={r.tint} size={38} />
                <div className="flex-1"><div className="text-[13.5px] font-semibold">{r.name}</div><div className="mono text-[11.5px] text-black/40">Bought size {r.size}{r.at ? ` · ${new Date(r.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : " · 3 weeks ago"}</div></div>
                <span className="rounded-pill bg-offwhite px-[13px] py-[6px] text-[11.5px] font-semibold">★ {r.stars.toFixed(1)}</span>
              </div>
              <p className="text-[13.5px] leading-[1.6] text-black/70">{r.body}</p>
            </div>
          ))}
          {own.length === 0 && !rev.open && <div className="card rounded-2xl p-6 text-[13.5px] text-black/55">No reviews yet. Be the first.</div>}
        </div>
      </div>

      <div className="glass fixed inset-x-4 bottom-[100px] z-30 flex items-center gap-3 rounded-pill p-3 md:hidden">
        <div className="px-2 text-[15px] font-semibold">{money(price)}</div>
        <Button className="flex-1" onClick={add}>{soldOut ? "Sold out" : added ? "Added ✓" : "Add to bag"}</Button>
      </div>
    </Page>
  );
}
