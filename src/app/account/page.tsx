"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { ORDERS, STYLE_OPTIONS, SIZE_LADDER, brandMeta, money } from "@/lib/data";
import { useApp } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import { Avatar, Button, Label, Placeholder, Page, inputCls } from "@/components/ui";

export default function Account() { return <Suspense><AccountInner /></Suspense>; }

function AccountInner() {
  const sp = useSearchParams();
  const { saved, follows, toggleFollow, products, brands, orders, styleTags, setStyleTags, sizes, setSizes, session, setSession, alerts, notify, drops, points, threads, renameShopper, boards, deleteBoard, createBoard, resetDemo } = useApp();
  const [newBoard, setNewBoard] = useState("");
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const STEPS = ["Placed", "Packed", "In transit", "Delivered"] as const;
  const [tab, setTab] = useState(sp.get("tab") ?? "Saved");
  const [addTag, setAddTag] = useState(false);
  const [editName, setEditName] = useState(false);
  const [nameDraft, setNameDraft] = useState(session.name);
  const savedP = products.filter((p) => saved.includes(p.slug));
  const following = brands.filter((b) => follows.includes(b.slug));
  const initials = session.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const allOrders = [...orders.map((o) => ({ key: o.id, title: `${[...new Set(o.items.map((i) => brands.find((b) => b.slug === i.brand)?.name))].join(" + ")} · ${o.items.reduce((s, i) => s + i.qty, 0)} piece${o.items.reduce((s, i) => s + i.qty, 0) === 1 ? "" : "s"}`, meta: `#${o.id} · placed ${new Date(o.placedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`, status: o.status, tint: o.status === "Delivered" ? "#F6F4EF" : "#DCD5C7", ink: o.status === "Delivered" ? "rgba(18,26,36,.6)" : "#121A24", total: money(o.total, true) })), ...ORDERS.map((o) => ({ key: o.meta, ...o }))];
  return (
    <Page className="pt-6 md:pt-9">
      <div className="mb-6 md:mb-[34px] flex items-center gap-4 md:gap-[22px]">
        <div className="grid h-[66px] w-[66px] md:h-[104px] md:w-[104px] flex-none place-items-center rounded-md md:rounded-lg bg-sand text-[20px] md:text-[30px] font-extrabold tracking-[-.04em]">{initials}</div>
        <div className="flex-1">
          {editName ? <form onSubmit={(e) => { e.preventDefault(); renameShopper(nameDraft); setEditName(false); }} className="mb-[6px] flex gap-2"><input autoFocus value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} className={clsx(inputCls, "!w-auto !py-2")} /><Button size="sm" type="submit">Save</Button></form> : <h1 className="mb-[6px] text-[20px] md:text-[32px] font-extrabold leading-[1.05] tracking-[-.038em]">{session.name}</h1>}
          <div className="hidden md:block text-[13.5px] text-ink/55">Paris, FR · joined March 2025 · {following.length} brands followed · {alerts.length} price alerts · {notify.length} drop reminders</div>
          <div className="mono md:hidden text-[11.5px] text-ink/45">{following.length} following · {savedP.length} saved</div>
        </div>
        <div className="hidden md:flex gap-[10px]">
          <Button variant="secondary" onClick={() => { setNameDraft(session.name); setEditName(true); }}>Edit profile</Button>
          {session.role === "brand" ? <Link href="/dashboard"><Button variant="navy">Brand dashboard</Button></Link> : <Link href="/sell"><Button variant="secondary">Open a brand account</Button></Link>}
          {session.role === "brand" && <Button variant="secondary" onClick={() => setSession({ role: "shopper", name: "Jules Renard" })}>Switch to shopper</Button>}
        </div>
      </div>
      <div className="mb-[22px] flex gap-2 md:hidden">{["Saved", "Orders", "Profile"].map((t) => <button key={t} onClick={() => setTab(t)} className={clsx("flex-1 rounded-pill py-3 text-center text-[12.5px] font-semibold", tab === t ? "bg-ink text-paper" : "bg-white soft")}>{t}</button>)}</div>
      <div className="grid gap-7 lg:grid-cols-[1fr_400px] items-start">
        <div>
          <div className={clsx(tab !== "Saved" && "hidden md:block")}>
            <h3 className="mb-4 text-[20px] font-semibold tracking-[-.025em]">Boards · {boards.length}</h3>
            <div className="mb-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {boards.map((bd) => { const ps = bd.products.map((s) => products.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => !!p); return (
                <div key={bd.id} className="card rounded-lg p-3">
                  <div className="mb-3 grid grid-cols-3 gap-1">{[0, 1, 2].map((i) => <Placeholder key={i} src={ps[i]?.image} className="h-[74px] rounded-sm" />)}</div>
                  <div className="flex items-center justify-between px-1"><div><div className="text-[14px] font-semibold tracking-[-.02em]">{bd.name}</div><div className="mono text-[10.5px] text-ink/45">{ps.length} piece{ps.length === 1 ? "" : "s"}</div></div><button onClick={() => deleteBoard(bd.id)} className="text-[12px] text-ink/40">✕</button></div>
                  {ps.length > 0 && <div className="mt-2 flex flex-wrap gap-1 px-1">{ps.slice(0, 3).map((p) => <Link key={p.slug} href={`/product/${p.slug}`} className="rounded-pill bg-cream px-2 py-[3px] text-[11px]">{p.name}</Link>)}</div>}
                </div>); })}
              <form onSubmit={(e) => { e.preventDefault(); if (!newBoard.trim()) return; createBoard(newBoard); setNewBoard(""); }} className="flex flex-col justify-center gap-2 rounded-lg bg-cream p-4"><Label>New board</Label><input value={newBoard} onChange={(e) => setNewBoard(e.target.value)} placeholder="Winter capsule" className={clsx(inputCls, "!py-2 !text-[13px]")} /><Button size="sm" type="submit" className="self-start">Create</Button></form>
            </div>
            <div className="mb-4 flex items-baseline justify-between"><h3 className="text-[20px] font-semibold tracking-[-.025em]">Saved · {savedP.length} piece{savedP.length === 1 ? "" : "s"}</h3></div>
            <div className="mb-9 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">{savedP.map((p) => <ProductCard key={p.slug} p={p} />)}{savedP.length === 0 && <div className="col-span-full rounded-lg bg-white p-8 text-center text-[13.5px] text-ink/55">Nothing saved yet. Tap ♡ on anything.</div>}</div>
          </div>
          <div className={clsx(tab !== "Orders" && "hidden md:block")}>
            <h3 className="mb-4 text-[20px] font-semibold tracking-[-.025em]">Order history</h3>
            <div className="mb-9 flex flex-col gap-3">
              {allOrders.map((o) => { const real = orders.find((x) => x.id === o.key); const idx = Math.max(0, STEPS.indexOf(o.status as (typeof STEPS)[number])); return (
                <div key={o.key} className="card rounded-lg">
                  <button onClick={() => setOpenOrder(openOrder === o.key ? null : o.key)} className="flex w-full items-center gap-4 md:gap-[18px] px-5 py-4 md:px-6 md:py-5 text-left">
                    <Placeholder src={real ? products.find((p) => p.slug === real.items[0]?.product)?.image : undefined} className="h-[52px] w-[52px] flex-none rounded-sm" />
                    <div className="min-w-0 flex-1"><div className="mb-1 text-[14px] font-semibold">{o.title}</div><div className="mono text-[11.5px] text-ink/42">{o.meta}</div></div>
                    <span className="hidden sm:inline rounded-pill px-4 py-2 text-[11px] font-semibold uppercase tracking-[.08em]" style={{ background: o.tint, color: o.ink }}>{o.status}</span>
                    <span className="text-[14px] font-medium">{o.total}</span>
                  </button>
                  {openOrder === o.key && (
                    <div className="border-t border-ink/6 px-5 py-4 md:px-6">
                      <div className="mb-4 flex items-center gap-2">{STEPS.map((s, i) => <div key={s} className="flex flex-1 items-center gap-2"><div className={clsx("h-[6px] flex-1 rounded-pill", i <= idx ? "bg-sage" : "bg-ink/10")} /></div>)}</div>
                      <div className="mb-4 flex justify-between text-[10.5px] font-semibold uppercase tracking-[.1em]">{STEPS.map((s, i) => <span key={s} className={i <= idx ? "text-ink" : "text-ink/35"}>{s}</span>)}</div>
                      {real ? <div className="flex flex-col gap-2">{real.items.map((it, i) => <Link key={i} href={`/product/${it.product}`} className="flex items-center justify-between rounded-md bg-cream px-4 py-[10px] text-[13px]"><span><span className="font-medium">{it.name}</span> <span className="text-ink/50">· {it.variant} · ×{it.qty}</span></span><span className="font-medium">{money(it.unit * it.qty, true)}</span></Link>)}<div className="mono mt-1 text-[11px] text-ink/45">Shipping {money(real.shipping, true)}{real.credit ? ` · points −${money(real.credit, true)}` : ""}{real.gift ? ` · gift card −${money(real.gift, true)}` : ""}{real.promo ? ` · code ${real.promo}` : ""} · Kindred holds payment until each parcel scans.</div></div>
                        : <div className="text-[12.5px] text-ink/50">Demo order. Real orders you place show their pieces here.</div>}
                    </div>
                  )}
                </div>); })}
            </div>
            {(alerts.length > 0 || notify.length > 0) && (
              <div className="mb-9"><h3 className="mb-4 text-[20px] font-semibold tracking-[-.025em]">Watching</h3><div className="flex flex-col gap-2">
                {alerts.map((s) => { const p = products.find((x) => x.slug === s); return p ? <Link key={s} href={`/product/${s}`} className="card flex items-center justify-between rounded-md px-4 py-3 text-[13px]"><span>◔ Price alert · {p.name}</span><span className="text-ink/45">{money(p.price)}</span></Link> : null; })}
                {notify.map((id) => { const d = drops.find((x) => x.id === id); return d ? <div key={id} className="card flex items-center justify-between rounded-md px-4 py-3 text-[13px]"><span>◔ Drop reminder · {d.title}</span><span className="text-ink/45">{new Date(d.at).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}</span></div> : null; })}
              </div></div>
            )}
          </div>
        </div>
        <div className={clsx("flex flex-col gap-4", tab !== "Profile" && "hidden md:flex")}>
          <div className="rounded-lg bg-cream p-6 md:p-7">
            <Label className="mb-2 !text-ink/48">Kindred points</Label>
            <div className="mb-1 text-[34px] font-bold leading-none tracking-[-.04em]">{points.toLocaleString()}</div>
            <div className="mb-4 text-[12.5px] text-ink/60">{points >= 2000 ? "Regular · free EU shipping on every order" : `${(2000 - points).toLocaleString()} points to Regular tier`} · 1 point per $1, spendable at any brand</div>
            <div className="h-[6px] rounded-pill bg-white"><div className="h-full rounded-pill bg-sage" style={{ width: `${Math.min(100, (points / 2000) * 100)}%` }} /></div>
            <div className="mt-4 flex gap-2"><Link href="/messages" className="rounded-pill bg-white px-4 py-2 text-[12px] font-semibold">Messages · {threads.length}</Link><button onClick={() => navigator.clipboard?.writeText("kindred.shop/r/jules")} className="rounded-pill bg-white px-4 py-2 text-[12px] font-semibold">Copy referral link</button><Link href="/gift" className="rounded-pill bg-white px-4 py-2 text-[12px] font-semibold">Gift cards</Link></div>
          </div>
          <div className="rounded-lg bg-ink p-6 md:p-7 text-paper">
            <Label light className="mb-4">Style profile</Label>
            <p className="mb-[18px] text-[13px] leading-[1.6] text-paper/72">These tags decide what shows up in For You. Remove any that stopped feeling like you.</p>
            <div className="flex flex-wrap gap-2">
              {styleTags.map((t) => <button key={t} onClick={() => setStyleTags(styleTags.filter((x) => x !== t))} className="flex items-center gap-2 rounded-pill bg-paper/14 px-[15px] py-[9px] text-[12px] font-medium">{t}<span className="opacity-50">✕</span></button>)}
              <button onClick={() => setAddTag(!addTag)} className="rounded-pill bg-paper px-[15px] py-[9px] text-[12px] font-semibold text-ink">{addTag ? "Done" : "+ Add"}</button>
            </div>
            {addTag && <div className="mt-3 flex flex-wrap gap-2 border-t border-paper/15 pt-3">{STYLE_OPTIONS.filter((s) => !styleTags.includes(s)).map((s) => <button key={s} onClick={() => setStyleTags([...styleTags, s])} className="rounded-pill bg-cream/8 px-3 py-[7px] text-[11.5px] text-paper/80">+ {s}</button>)}</div>}
          </div>
          <div className="card rounded-lg p-6 md:p-7">
            <Label className="mb-[18px]">Size profile</Label>
            <div className="flex flex-col gap-[14px]">
              {([["Tops", "tops", SIZE_LADDER.slice(1, 7)], ["Trousers · waist", "waist", ["28", "30", "32", "33", "34", "36"]], ["Shoes · EU", "shoe", ["40", "41", "42", "43", "44", "45"]]] as const).map(([label, key, opts]) => (
                <div key={key}><div className="mb-2 text-[12px] text-ink/50">{label}</div><div className="flex flex-wrap gap-[7px]">{opts.map((v) => <button key={v} onClick={() => setSizes({ ...sizes, [key]: v })} className={clsx("rounded-pill px-[13px] py-[8px] text-[12.5px] font-medium", sizes[key] === v ? "bg-ink text-paper" : "bg-cream")}>{v}</button>)}</div></div>
              ))}
            </div>
            <div className="mt-[18px] rounded-sm bg-cream px-[18px] py-[14px] text-[12px] leading-[1.5] text-ink/55">We hide anything sold out in your sizes.</div>
          </div>
          <div className="card rounded-lg p-6 md:p-7">
            <Label className="mb-[18px]">Following · {following.length}</Label>
            <div className="flex flex-col gap-3">
              {following.map((b) => <div key={b.slug} className="flex items-center gap-3"><Avatar init={b.init} tint={b.tint} ink={b.ink} size={40} /><Link href={`/brand/${b.slug}`} className="min-w-0 flex-1"><div className="text-[13px] font-semibold">{b.name}</div><div className="mono text-[10.5px] text-ink/42">{brandMeta(b)}</div></Link><button onClick={() => toggleFollow(b.slug)} className="rounded-pill bg-cream px-[14px] py-[7px] text-[11.5px] font-semibold">Following</button></div>)}
              {following.length === 0 && <div className="text-[13px] text-ink/50">Follow a few brands to fill your feed.</div>}
            </div>
          </div>
          <div className="md:hidden flex flex-col gap-2">{session.role === "brand" ? <Link href="/dashboard"><Button full variant="navy">Brand dashboard</Button></Link> : <Link href="/sell"><Button full variant="secondary">Open a brand account</Button></Link>}</div>
          <button onClick={() => { if (confirm("Reset all demo data on this device? Bag, orders, brands you created, everything.")) resetDemo(); }} className="text-left text-[12px] text-ink/40 underline-offset-2 hover:underline">Reset demo data</button>
        </div>
      </div>
    </Page>
  );
}
