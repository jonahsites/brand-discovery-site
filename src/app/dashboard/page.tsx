"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { CATEGORY_OPTIONS, COLORS, DASH, SIZE_LADDER, money, lookCount, type Drop, type Product, type Promo, type LookFrame } from "@/lib/data";
import { slugify } from "@/lib/catalog";
import { useApp, uid } from "@/lib/store";
import Countdown, { useNow } from "@/components/Countdown";
import { Avatar, Button, Label, Placeholder, inputCls } from "@/components/ui";

const NAV = ["Overview", "Products", "Promos", "Drops", "Lookbooks", "Orders", "Messages", "Settings"];

export default function Dashboard() { return <Suspense><DashInner /></Suspense>; }

function DashInner() {
  const sp = useSearchParams();
  const app = useApp();
  const { session, brands, products, orders, promos, drops, hydrated, setSession, threads } = app;
  const [nav, setNav] = useState(sp.get("tab") ?? "Overview");
  const welcome = sp.get("welcome") === "1";
  const brand = brands.find((b) => b.slug === (session.role === "brand" ? session.brand : "form-and-void"));
  if (!hydrated) return null;
  if (!brand) return <div className="grid min-h-screen place-items-center p-6 text-center"><div><h1 className="mb-2 text-[28px] font-bold tracking-[-.03em]">No brand account yet.</h1><Link href="/sell" className="font-semibold text-navy">Open one in five minutes →</Link></div></div>;
  const mine = products.filter((p) => p.brand === brand.slug);
  const myOrders = orders.filter((o) => o.items.some((i) => i.brand === brand.slug));
  const myPromos = promos.filter((p) => p.brand === brand.slug);
  const myDrops = drops.filter((d) => d.brand === brand.slug);
  const revenue = myOrders.reduce((s, o) => s + o.items.filter((i) => i.brand === brand.slug).reduce((a, i) => a + i.unit * i.qty, 0), 0);
  const seeded = !brand.createdAt;
  const stats = [
    { label: "Sales · 30d", value: money((seeded ? 12408 : 0) + revenue), delta: seeded ? "↑ 34% vs prev" : `${myOrders.length} live orders`, bg: "#1C3247", ink: "#F6F7F9" },
    { label: "Orders", value: String((seeded ? 86 : 0) + myOrders.length), delta: seeded ? "↑ 12 vs prev" : "since launch", bg: "#fff", ink: "#1A1A1A" },
    { label: "Followers", value: (brand.followers + (app.follows.includes(brand.slug) && !seeded ? 1 : 0)).toLocaleString(), delta: seeded ? "↑ 214 new" : "share your page", bg: "#C7DCEF", ink: "#1A1A1A" },
    { label: "Products", value: String(mine.length), delta: `${mine.filter((p) => p.stock === 0).length} sold out`, bg: "#fff", ink: "#1A1A1A" },
  ];
  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-[252px] flex-none flex-col bg-navy p-5 pt-7 sticky top-0 h-screen">
        <div className="px-[10px] pb-[26px]"><div className="flex items-center gap-[11px]"><div className="grid h-9 w-9 place-items-center rounded-sm text-[12px] font-extrabold" style={{ background: brand.tint, color: brand.ink }}>{brand.init}</div><div><div className="text-[14px] font-bold tracking-[-.02em] text-offwhite">{brand.name}</div><div className="mono text-[9.5px] text-offwhite/45">Seller account</div></div></div></div>
        <div className="flex flex-col gap-[3px]">{NAV.map((l) => <button key={l} onClick={() => setNav(l)} className={clsx("rounded-sm px-[14px] py-[11px] text-left text-[13px] font-medium", nav === l ? "bg-offwhite/14 text-offwhite" : "text-offwhite/55")}>{l}</button>)}</div>
        <div className="mt-auto rounded-md border border-offwhite/14 bg-offwhite/10 p-[18px]"><div className="mb-[6px] text-[12.5px] font-semibold text-offwhite">Payout Friday</div><div className="mb-2 text-[24px] font-bold tracking-[-.03em] text-peri">{money(Math.round(((seeded ? 4182 : 0) + revenue * 0.92)))}</div><div className="mono text-[10.5px] leading-[1.5] text-offwhite/50">Held until parcels scan · 8% Kindred fee</div></div>
        <div className="mt-4 flex flex-col gap-1 px-[10px] text-[12px] font-medium text-offwhite/50"><Link href={`/brand/${brand.slug}`}>View public page →</Link><Link href="/">← Back to Kindred</Link>{session.role === "brand" && <button onClick={() => setSession({ role: "shopper", name: "Jules Renard" })} className="text-left">Switch to shopper</button>}</div>
      </aside>

      <div className="min-w-0 flex-1 bg-offwhite">
        <div className="glass-navy md:hidden sticky top-0 z-30 px-[18px] pb-3 pt-4 !border-0">
          <div className="flex items-center gap-[10px]"><div className="grid h-[30px] w-[30px] place-items-center rounded-[8px] text-[10.5px] font-extrabold" style={{ background: brand.tint, color: brand.ink }}>{brand.init}</div><div className="flex-1 text-[13.5px] font-semibold text-offwhite">{brand.name}</div><Link href="/" className="grid h-[34px] w-[34px] place-items-center rounded-pill bg-offwhite/14 text-[14px] text-offwhite">✕</Link></div>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">{NAV.map((l) => <button key={l} onClick={() => setNav(l)} className={clsx("flex-none rounded-pill px-3 py-[7px] text-[12px] font-semibold", nav === l ? "bg-offwhite text-navy" : "bg-offwhite/12 text-offwhite/70")}>{l}</button>)}</div>
        </div>
        <div className="p-4 md:p-[34px] pb-16">
          {welcome && nav === "Overview" && <div className="mb-6 rounded-lg bg-sky p-6"><div className="label mb-2 !text-black/48">You&apos;re live</div><h2 className="mb-2 text-[24px] font-bold tracking-[-.035em]">Welcome to Kindred, {brand.name}.</h2><p className="mb-4 max-w-[520px] text-[14px] leading-[1.55] text-black/65">Your page is up at /brand/{brand.slug}. Add your first product so it shows in Explore and search, then schedule a drop to land at the top of followers&apos; feeds.</p><div className="flex gap-2"><Button onClick={() => setNav("Products")}>Add a product</Button><Link href={`/brand/${brand.slug}`}><Button variant="ghost">See your page</Button></Link></div></div>}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4"><div><h1 className="mb-[5px] text-[26px] md:text-[30px] font-bold leading-[1.05] tracking-[-.038em]">{nav}</h1><div className="text-[12.5px] text-black/50">{nav === "Overview" ? "Last 30 days · compared to the 30 before" : nav === "Products" ? `${mine.length} listed` : nav === "Promos" ? "Codes shoppers can apply at checkout" : nav === "Drops" ? "Scheduled releases with countdowns" : nav === "Orders" ? `${myOrders.length} live orders` : "Your onboarding facts drive filters and search"}</div></div>{nav === "Overview" && <div className="flex gap-[10px]"><Button variant={app.featured === brand.slug ? "navy" : "secondary"} onClick={() => app.setFeatured(app.featured === brand.slug ? undefined : brand.slug)}>{app.featured === brand.slug ? "✓ Featured on home" : "Feature on home · $40/wk"}</Button><Button onClick={() => setNav("Products")}>+ New product</Button></div>}</div>

          {nav === "Overview" && <Overview stats={stats} mine={mine} myOrders={myOrders} seeded={seeded} brand={brand.slug} />}
          {nav === "Products" && <Products brand={brand.slug} mine={mine} />}
          {nav === "Promos" && <Promos brand={brand.slug} mine={mine} myPromos={myPromos} />}
          {nav === "Drops" && <Drops brand={brand.slug} mine={mine} myDrops={myDrops} />}
          {nav === "Lookbooks" && <LookbookBuilder brand={brand.slug} mine={mine} />}
          {nav === "Orders" && <Orders brand={brand.slug} myOrders={myOrders} seeded={seeded} />}
          {nav === "Messages" && <div className="card rounded-lg p-6 text-[13.5px] text-black/60">{threads.filter((t) => t.brand === brand.slug).length} conversation{threads.filter((t) => t.brand === brand.slug).length === 1 ? "" : "s"}. <Link href="/messages" className="font-semibold text-navy">Open inbox →</Link></div>}
          {nav === "Settings" && <Settings brand={brand.slug} />}
        </div>
      </div>
    </div>
  );
}

function Overview({ stats, mine, myOrders, seeded, brand }: { stats: { label: string; value: string; delta: string; bg: string; ink: string }[]; mine: Product[]; myOrders: ReturnType<typeof useApp>["orders"]; seeded: boolean; brand: string }) {
  const { priceOf, addPost, posts, deletePost } = useApp();
  const rows = mine.slice(0, 5);
  const [post, setPost] = useState({ caption: "", image: "", products: [] as string[] });
  const [posted, setPosted] = useState(false);
  const publish = () => { if (!post.caption.trim()) return; addPost({ brand, caption: post.caption.trim(), image: post.image.trim() || undefined, products: post.products }); setPost({ caption: "", image: "", products: [] }); setPosted(true); setTimeout(() => setPosted(false), 1500); };
  const myPosts = posts.filter((p) => p.brand === brand);
  return (
    <>
      <div className="mb-5 grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">{stats.map((t) => <div key={t.label} className="rounded-2xl p-5 md:p-6" style={{ background: t.bg, color: t.ink, border: t.bg === "#fff" ? "1px solid rgba(0,0,0,.05)" : undefined }}><div className="mb-[14px] text-[10px] font-semibold uppercase tracking-[.14em] opacity-62">{t.label}</div><div className="mb-2 text-[26px] md:text-[34px] font-bold leading-none tracking-[-.04em]">{t.value}</div><div className="mono text-[11.5px] opacity-62">{t.delta}</div></div>)}</div>
      <div className="mb-5 grid gap-5 xl:grid-cols-[1fr_380px] items-start">
        <div className="card rounded-lg p-5 md:p-[26px]"><div className="mb-6 flex items-baseline justify-between"><div className="text-[16px] font-semibold tracking-[-.02em]">Sales</div><div className="mono text-[11.5px] text-black/42">30 days</div></div><div className="flex h-[170px] items-end gap-[5px]">{DASH.chart.map((h, i) => <div key={i} className="flex-1 rounded-t-[4px]" style={{ height: seeded ? h : Math.max(4, (i > 24 ? myOrders.length * 30 : 0)), background: i > 26 ? "#1C3247" : "rgba(28,50,71,.26)" }} />)}</div><div className="mono mt-3 flex justify-between text-[10.5px] text-black/35"><span>Aug 4</span><span>Aug 18</span><span>Sep 2</span></div></div>
        <div className="card rounded-lg p-6">
          <Label className="mb-4">New post</Label>
          <textarea value={post.caption} onChange={(e) => setPost({ ...post, caption: e.target.value })} placeholder="Say something about this drop…" className="mb-3 min-h-[84px] w-full resize-none rounded-md bg-offwhite p-4 text-[13.5px] leading-[1.6] outline-none placeholder:text-black/42" />
          <input value={post.image} onChange={(e) => setPost({ ...post, image: e.target.value })} placeholder="Image URL (optional)" className={clsx(inputCls, "mb-3")} />
          <div className="mb-4 flex flex-wrap gap-[6px]">{mine.slice(0, 6).map((p) => <button key={p.slug} onClick={() => setPost({ ...post, products: post.products.includes(p.slug) ? post.products.filter((x) => x !== p.slug) : [...post.products, p.slug] })} className={clsx("rounded-pill border px-3 py-[5px] text-[11px] font-medium", post.products.includes(p.slug) ? "bg-navy text-offwhite border-navy" : "bg-offwhite border-transparent")}>◇ {p.name}</button>)}</div>
          <div className="flex gap-[9px]"><Button className="flex-1" onClick={publish} disabled={!post.caption.trim()}>{posted ? "Published ✓" : "Publish"}</Button></div>
          {myPosts.length > 0 && <div className="mt-4 flex flex-col gap-2 border-t border-black/6 pt-4">{myPosts.slice(0, 3).map((p) => <div key={p.id} className="flex items-center gap-2 text-[12px]"><span className="min-w-0 flex-1 truncate text-black/65">{p.caption}</span><span className="mono text-black/40">♡ {p.likes}</span><button onClick={() => deletePost(p.id)} className="text-black/40">✕</button></div>)}</div>}
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_380px] items-start">
        <div className="card rounded-lg p-5 md:p-[26px]">
          <div className="mb-[18px] flex items-center justify-between"><div className="text-[16px] font-semibold tracking-[-.02em]">Products · {mine.length}</div></div>
          <div className="flex flex-col gap-2">{rows.map((r) => <div key={r.slug} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-md bg-offwhite px-4 py-3"><div className="flex min-w-0 items-center gap-3"><Placeholder className="h-11 w-[38px] flex-none rounded-sm" /><span className="truncate text-[13px] font-medium">{r.name}</span></div><span className="text-[13px] font-medium">{money(priceOf(r).price)}</span><span className={clsx("text-[12.5px] font-medium", r.stock !== undefined && r.stock <= 6 ? "text-slate" : "text-black/60")}>{r.stock === undefined ? "∞" : r.stock === 0 ? "Sold out" : r.stock <= 6 ? `${r.stock} left` : r.stock}</span></div>)}{rows.length === 0 && <div className="text-[13px] text-black/50">No products yet.</div>}</div>
        </div>
        <div className="card rounded-lg p-5 md:p-6">
          <div className="mb-[18px] flex items-center justify-between"><div className="text-[16px] font-semibold tracking-[-.02em]">Orders</div><span className="rounded-pill bg-slate px-[13px] py-[6px] text-[10.5px] font-semibold uppercase tracking-[.08em] text-white">{myOrders.filter((o) => o.status === "Placed").length + (seeded ? 6 : 0)} to pack</span></div>
          <div className="flex flex-col gap-[10px]">
            {myOrders.slice(0, 3).map((o) => <div key={o.id} className="flex items-center gap-3 rounded-md bg-offwhite px-[15px] py-[13px]"><Avatar init="JR" tint="#C7DCEF" size={32} /><div className="min-w-0 flex-1"><div className="text-[12.5px] font-medium">Jules Renard</div><div className="mono text-[10px] text-black/42">#{o.id} · {o.status}</div></div><div className="text-[12.5px] font-medium">{money(o.items.filter((i) => i.brand === brand).reduce((s, i) => s + i.unit * i.qty, 0), true)}</div></div>)}
            {seeded && DASH.orderRows.slice(0, 5 - Math.min(3, myOrders.length)).map((o) => <div key={o.meta} className="flex items-center gap-3 rounded-md bg-offwhite px-[15px] py-[13px]"><Avatar init={o.init} tint={o.tint} ink={o.ink} size={32} /><div className="min-w-0 flex-1"><div className="text-[12.5px] font-medium">{o.name}</div><div className="mono text-[10px] text-black/42">{o.meta}</div></div><div className="text-[12.5px] font-medium">{o.total}</div></div>)}
            {!seeded && myOrders.length === 0 && <div className="text-[13px] text-black/50">No orders yet.</div>}
          </div>
        </div>
      </div>
    </>
  );
}

const EMPTY: Product = { slug: "", brand: "", name: "", price: 0, category: "Outerwear", sizes: ["S", "M", "L", "XL"], colors: ["Bone"], materials: [], tags: [], stock: 20, description: "" };

function Products({ brand, mine }: { brand: string; mine: Product[] }) {
  const { upsertProduct, deleteProduct, priceOf } = useApp();
  const [edit, setEdit] = useState<Product | null>(null);
  const [tagText, setTagText] = useState("");
  const [csv, setCsv] = useState(false);
  const [csvText, setCsvText] = useState("");
  const importCsv = () => {
    csvText.split("\n").map((l) => l.split(",").map((c) => c.trim())).filter((c) => c[0] && Number(c[1]) > 0).forEach((c, i) => {
      const slug = slugify(`${c[0]}-${brand.split("-")[0]}`) + (mine.some((p) => p.slug === slugify(`${c[0]}-${brand.split("-")[0]}`)) ? "-" + uid().slice(0, 4) : "");
      upsertProduct({ slug, brand, name: c[0], price: Number(c[1]), category: c[2] && CATEGORY_OPTIONS.includes(c[2]) ? c[2] : "Shirting", sizes: c[3] ? c[3].split(/[\s/]+/).filter(Boolean) : ["S", "M", "L", "XL"], image: c[4] || undefined, stock: 20, tags: [], createdAt: new Date(Date.now() + i).toISOString() });
    });
    setCsvText(""); setCsv(false);
  };
  const start = (p?: Product) => { setEdit(p ? { ...p } : { ...EMPTY, brand }); setTagText(p?.tags?.join(", ") ?? ""); };
  const save = () => {
    if (!edit || !edit.name.trim() || !(edit.price > 0)) return;
    const slug = edit.slug || slugify(`${edit.name}-${brand.split("-")[0]}`) + (mine.some((p) => p.slug === slugify(`${edit.name}-${brand.split("-")[0]}`)) ? "-" + uid().slice(0, 4) : "");
    upsertProduct({ ...edit, slug, brand, tags: tagText.split(",").map((t) => t.trim()).filter(Boolean), createdAt: edit.createdAt ?? new Date().toISOString() });
    setEdit(null);
  };
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px] items-start">
      <div className="card rounded-lg p-4 md:p-[26px]">
        <div className="mb-4 flex items-center justify-between"><div className="text-[16px] font-semibold tracking-[-.02em]">Catalogue</div><div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => setCsv(!csv)}>Import CSV</Button><Button size="sm" onClick={() => start()}>+ New product</Button></div></div>
        {csv && <div className="mb-4 rounded-md bg-offwhite p-4"><div className="mb-2 text-[12.5px] text-black/60">Paste rows as <span className="mono">name, price, category, sizes, image</span> (one per line). Works with a Shopify product export trimmed to those columns.</div><textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder={"Slow Morning Linen Shirt, 138, Shirting, S M L XL, https://…/shirt.jpg"} className={clsx(inputCls, "mb-2 min-h-[90px] font-mono text-[12px]")} /><Button size="sm" onClick={importCsv} disabled={!csvText.trim()}>Import {csvText.split("\n").filter((l) => l.trim()).length} rows</Button></div>}
        <div className="flex flex-col gap-2">
          {mine.map((p) => { const { price, promo } = priceOf(p); return (
            <div key={p.slug} className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_90px_90px_auto] items-center gap-3 rounded-md bg-offwhite px-4 py-3">
              <div className="flex min-w-0 items-center gap-3"><Placeholder className="h-11 w-[38px] flex-none rounded-sm" /><div className="min-w-0"><div className="truncate text-[13px] font-medium">{p.name}</div><div className="mono text-[10px] text-black/42">{p.category} · {(p.sizes ?? []).join(" ")}</div></div></div>
              <span className="hidden md:inline text-[13px] font-medium">{money(price)}{promo && <span className="ml-1 text-[10px] text-navy">−{promo.pct}%</span>}</span>
              <span className={clsx("hidden md:inline text-[12.5px] font-medium", p.stock !== undefined && p.stock <= 6 ? "text-slate" : "text-black/60")}>{p.stock === undefined ? "∞" : p.stock === 0 ? "Sold out" : p.stock}</span>
              <div className="flex gap-1"><button onClick={() => start(p)} className="rounded-pill bg-white px-3 py-[6px] text-[11.5px] font-semibold">Edit</button><button onClick={() => { if (confirm(`Remove ${p.name}?`)) deleteProduct(p.slug); }} className="rounded-pill bg-white px-3 py-[6px] text-[11.5px] font-semibold text-black/50">✕</button></div>
            </div>); })}
          {mine.length === 0 && <div className="rounded-md bg-offwhite p-8 text-center text-[13px] text-black/50">Nothing listed yet. Your first product goes live in Explore and search the moment you save it.</div>}
        </div>
      </div>
      {edit && (
        <div className="card rounded-lg p-5 md:p-6 xl:sticky xl:top-6">
          <div className="mb-4 text-[16px] font-semibold tracking-[-.02em]">{edit.slug ? "Edit product" : "New product"}</div>
          <div className="flex flex-col gap-3">
            <div><Label className="mb-2">Name</Label><input className={inputCls} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="Panel Work Jacket" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="mb-2">Price · USD</Label><input className={inputCls} inputMode="numeric" value={edit.price || ""} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) || 0 })} /></div>
              <div><Label className="mb-2">Compare at</Label><input className={inputCls} inputMode="numeric" value={edit.compareAt ?? ""} onChange={(e) => setEdit({ ...edit, compareAt: Number(e.target.value) || undefined })} placeholder="optional" /></div>
              <div><Label className="mb-2">Category</Label><select className={inputCls} value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>{CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div><Label className="mb-2">Stock</Label><input className={inputCls} inputMode="numeric" value={edit.stock ?? ""} onChange={(e) => setEdit({ ...edit, stock: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder="∞" /></div>
            </div>
            <div><Label className="mb-2">Sizes</Label><div className="flex flex-wrap gap-[6px]">{SIZE_LADDER.map((s) => <button key={s} onClick={() => setEdit({ ...edit, sizes: (edit.sizes ?? []).includes(s) ? (edit.sizes ?? []).filter((x) => x !== s) : [...(edit.sizes ?? []), s].sort((a, b) => SIZE_LADDER.indexOf(a) - SIZE_LADDER.indexOf(b)) })} className={clsx("rounded-pill border px-3 py-[6px] text-[12px] font-medium", (edit.sizes ?? []).includes(s) ? "bg-black text-white border-black" : "bg-white border-black/10")}>{s}</button>)}</div></div>
            <div><Label className="mb-2">Colours</Label><div className="flex flex-wrap gap-[6px]">{COLORS.map(([n, hex]) => <button key={n} onClick={() => setEdit({ ...edit, colors: (edit.colors ?? []).includes(n) ? (edit.colors ?? []).filter((x) => x !== n) : [...(edit.colors ?? []), n] })} className={clsx("flex items-center gap-2 rounded-pill border px-3 py-[6px] text-[12px] font-medium", (edit.colors ?? []).includes(n) ? "bg-black text-white border-black" : "bg-white border-black/10")}><span className="h-3 w-3 rounded-pill" style={{ background: hex }} />{n}</button>)}</div></div>
            <div><Label className="mb-2">Image URL</Label><input className={inputCls} value={edit.image ?? ""} onChange={(e) => setEdit({ ...edit, image: e.target.value || undefined })} placeholder="https://…/front.jpg" /></div>
            <div><Label className="mb-2">More image URLs · comma separated</Label><input className={inputCls} value={(edit.images ?? []).join(", ")} onChange={(e) => setEdit({ ...edit, images: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} placeholder="back.jpg, detail.jpg" /></div>
            <div><Label className="mb-2">Search tags · comma separated</Label><input className={inputCls} value={tagText} onChange={(e) => setTagText(e.target.value)} placeholder="rainy, heavy canvas, workwear" /></div>
            <div><Label className="mb-2">Description</Label><textarea className={clsx(inputCls, "min-h-[80px] resize-y")} value={edit.description ?? ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
            <div className="flex gap-2"><Button onClick={save} disabled={!edit.name.trim() || !(edit.price > 0)} className={clsx((!edit.name.trim() || !(edit.price > 0)) && "opacity-40")}>Save</Button><Button variant="secondary" onClick={() => setEdit(null)}>Cancel</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function Promos({ brand, mine, myPromos }: { brand: string; mine: Product[]; myPromos: Promo[] }) {
  const { upsertPromo, deletePromo } = useApp();
  const [f, setF] = useState({ code: "", pct: "15", label: "", days: "7", all: true, products: [] as string[] });
  const save = () => { if (!f.code.trim() || !(Number(f.pct) > 0)) return; upsertPromo({ id: uid(), brand, code: f.code.trim().toUpperCase(), pct: Math.min(90, Number(f.pct)), label: f.label.trim() || `${f.pct}% off`, products: f.all ? "all" : f.products, active: true, ends: new Date(Date.now() + Number(f.days) * 864e5).toISOString() }); setF({ code: "", pct: "15", label: "", days: "7", all: true, products: [] }); };
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px] items-start">
      <div className="card rounded-lg p-4 md:p-[26px]">
        <div className="mb-4 text-[16px] font-semibold tracking-[-.02em]">Running</div>
        <div className="flex flex-col gap-2">
          {myPromos.map((p) => <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-md bg-offwhite px-4 py-3"><span className="mono rounded-pill bg-peri px-3 py-1 text-[12px] font-semibold">{p.code}</span><div className="min-w-0 flex-1"><div className="text-[13px] font-medium">{p.pct}% off · {p.label}</div><div className="mono text-[10px] text-black/42">{p.products === "all" ? "whole catalogue" : `${p.products.length} products`}{p.ends ? ` · ends ${new Date(p.ends).toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : ""}</div></div><button onClick={() => upsertPromo({ ...p, active: !p.active })} className={clsx("rounded-pill px-3 py-[6px] text-[11.5px] font-semibold", p.active ? "bg-black text-white" : "bg-white")}>{p.active ? "Active" : "Paused"}</button><button onClick={() => deletePromo(p.id)} className="rounded-pill bg-white px-3 py-[6px] text-[11.5px] font-semibold text-black/50">✕</button></div>)}
          {myPromos.length === 0 && <div className="rounded-md bg-offwhite p-8 text-center text-[13px] text-black/50">No promos yet. They show on your brand page, on product cards, and apply at checkout.</div>}
        </div>
      </div>
      <div className="card rounded-lg p-5 md:p-6">
        <div className="mb-4 text-[16px] font-semibold tracking-[-.02em]">New promo</div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3"><div><Label className="mb-2">Code</Label><input className={clsx(inputCls, "mono uppercase")} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} placeholder="WARMUP" /></div><div><Label className="mb-2">% off</Label><input className={inputCls} inputMode="numeric" value={f.pct} onChange={(e) => setF({ ...f, pct: e.target.value })} /></div></div>
          <div><Label className="mb-2">Label</Label><input className={inputCls} value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} placeholder="Autumn knit week" /></div>
          <div><Label className="mb-2">Runs for</Label><div className="flex gap-[6px]">{["3", "7", "14", "30"].map((d) => <button key={d} onClick={() => setF({ ...f, days: d })} className={clsx("rounded-pill border px-3 py-[6px] text-[12px] font-medium", f.days === d ? "bg-black text-white border-black" : "bg-white border-black/10")}>{d} days</button>)}</div></div>
          <div><Label className="mb-2">Applies to</Label><div className="mb-2 flex gap-[6px]"><button onClick={() => setF({ ...f, all: true })} className={clsx("rounded-pill border px-3 py-[6px] text-[12px] font-medium", f.all ? "bg-black text-white border-black" : "bg-white border-black/10")}>Whole catalogue</button><button onClick={() => setF({ ...f, all: false })} className={clsx("rounded-pill border px-3 py-[6px] text-[12px] font-medium", !f.all ? "bg-black text-white border-black" : "bg-white border-black/10")}>Pick products</button></div>{!f.all && <div className="flex flex-wrap gap-[6px]">{mine.map((p) => <button key={p.slug} onClick={() => setF({ ...f, products: f.products.includes(p.slug) ? f.products.filter((x) => x !== p.slug) : [...f.products, p.slug] })} className={clsx("rounded-pill border px-3 py-[6px] text-[11.5px]", f.products.includes(p.slug) ? "bg-navy text-offwhite border-navy" : "bg-white border-black/10")}>{p.name}</button>)}</div>}</div>
          <Button onClick={save} disabled={!f.code.trim()} className={clsx(!f.code.trim() && "opacity-40")}>Launch promo</Button>
        </div>
      </div>
    </div>
  );
}

function Drops({ brand, mine, myDrops }: { brand: string; mine: Product[]; myDrops: Drop[] }) {
  const { upsertDrop, deleteDrop, notify } = useApp();
  const now = useNow();
  const [f, setF] = useState({ title: "", at: "", pieces: "40", blurb: "", products: [] as string[] });
  const save = () => { if (!f.title.trim() || !f.at) return; upsertDrop({ id: uid(), brand, title: f.title.trim(), at: new Date(f.at).toISOString(), pieces: Number(f.pieces) || 0, blurb: f.blurb.trim(), products: f.products }); setF({ title: "", at: "", pieces: "40", blurb: "", products: [] }); };
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px] items-start">
      <div className="flex flex-col gap-3">
        {myDrops.map((d) => { const past = new Date(d.at).getTime() < now; return <div key={d.id} className={clsx("rounded-lg p-6", past ? "card" : "bg-navy text-offwhite")}><div className="mb-1 flex items-center justify-between gap-3"><div className="text-[20px] font-bold tracking-[-.03em]">{d.title}</div><button onClick={() => deleteDrop(d.id)} className={clsx("text-[12px] font-semibold", past ? "text-black/45" : "text-offwhite/60")}>Remove</button></div><div className={clsx("mb-4 text-[13px]", past ? "text-black/55" : "text-offwhite/70")}>{new Date(d.at).toLocaleString(undefined, { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {d.pieces} pieces · {notify.includes(d.id) ? 1 : 0}{past ? "" : " + "}{past ? "" : Math.round(d.pieces * 2.3)} waiting</div>{!past && <Countdown at={d.at} dark />}</div>; })}
        {myDrops.length === 0 && <div className="card rounded-lg p-8 text-center text-[13px] text-black/50">No drops scheduled. A drop pins to the top of the Drops feed for everyone who follows you.</div>}
      </div>
      <div className="card rounded-lg p-5 md:p-6">
        <div className="mb-4 text-[16px] font-semibold tracking-[-.02em]">Schedule a drop</div>
        <div className="flex flex-col gap-3">
          <div><Label className="mb-2">Title</Label><input className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Bone colourway" /></div>
          <div className="grid grid-cols-2 gap-3"><div><Label className="mb-2">When</Label><input type="datetime-local" className={inputCls} value={f.at} onChange={(e) => setF({ ...f, at: e.target.value })} /></div><div><Label className="mb-2">Pieces</Label><input className={inputCls} inputMode="numeric" value={f.pieces} onChange={(e) => setF({ ...f, pieces: e.target.value })} /></div></div>
          <div><Label className="mb-2">One line</Label><input className={inputCls} value={f.blurb} onChange={(e) => setF({ ...f, blurb: e.target.value })} placeholder="Forty pieces from the last of the roll." /></div>
          <div><Label className="mb-2">Products in the drop</Label><div className="flex flex-wrap gap-[6px]">{mine.map((p) => <button key={p.slug} onClick={() => setF({ ...f, products: f.products.includes(p.slug) ? f.products.filter((x) => x !== p.slug) : [...f.products, p.slug] })} className={clsx("rounded-pill border px-3 py-[6px] text-[11.5px]", f.products.includes(p.slug) ? "bg-navy text-offwhite border-navy" : "bg-white border-black/10")}>{p.name}</button>)}{mine.length === 0 && <span className="text-[12px] text-black/45">Add products first.</span>}</div></div>
          <Button onClick={save} disabled={!f.title.trim() || !f.at} className={clsx((!f.title.trim() || !f.at) && "opacity-40")}>Schedule</Button>
        </div>
      </div>
    </div>
  );
}

function Orders({ brand, myOrders, seeded }: { brand: string; myOrders: ReturnType<typeof useApp>["orders"]; seeded: boolean }) {
  const { setOrderStatus } = useApp();
  const NEXT: Record<string, string> = { Placed: "Packed", Packed: "In transit", "In transit": "Delivered" };
  return (
    <div className="card rounded-lg p-4 md:p-[26px]">
      <div className="flex flex-col gap-2">
        {myOrders.map((o) => { const items = o.items.filter((i) => i.brand === brand); return (
          <div key={o.id} className="flex flex-wrap items-center gap-3 rounded-md bg-offwhite px-4 py-3">
            <Avatar init="JR" tint="#C7DCEF" size={36} />
            <div className="min-w-0 flex-1"><div className="text-[13.5px] font-medium">Jules Renard · #{o.id}</div><div className="mono text-[10.5px] text-black/42">{items.map((i) => `${i.name} (${i.variant} ×${i.qty})`).join(", ")} · {new Date(o.placedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</div></div>
            <span className="text-[13px] font-medium">{money(items.reduce((s, i) => s + i.unit * i.qty, 0), true)}</span>
            <span className={clsx("rounded-pill px-3 py-[6px] text-[10.5px] font-semibold uppercase tracking-[.08em]", o.status === "Delivered" ? "bg-white text-black/55" : "bg-sky")}>{o.status}</span>
            {NEXT[o.status] && <Button size="sm" onClick={() => setOrderStatus(o.id, NEXT[o.status] as typeof o.status)}>Mark {NEXT[o.status].toLowerCase()}</Button>}
          </div>); })}
        {seeded && DASH.orderRows.map((o) => <div key={o.meta} className="flex items-center gap-3 rounded-md bg-offwhite px-4 py-3"><Avatar init={o.init} tint={o.tint} ink={o.ink} size={36} /><div className="min-w-0 flex-1"><div className="text-[13.5px] font-medium">{o.name}</div><div className="mono text-[10.5px] text-black/42">{o.meta}</div></div><span className="text-[13px] font-medium">{o.total}</span><span className="rounded-pill bg-sky px-3 py-[6px] text-[10.5px] font-semibold uppercase tracking-[.08em]">To pack</span></div>)}
        {!seeded && myOrders.length === 0 && <div className="rounded-md bg-offwhite p-8 text-center text-[13px] text-black/50">No orders yet.</div>}
      </div>
    </div>
  );
}

function Settings({ brand }: { brand: string }) {
  const { brands, upsertBrand } = useApp();
  const b = brands.find((x) => x.slug === brand)!;
  const [f, setF] = useState({ tagline: b.tagline, story: b.story ?? "", moods: b.moods.join(", "), styles: b.styles.join(", "), materials: b.materials.join(", "), values: b.values.join(", "), website: b.website ?? "", logo: b.logo ?? "", cover: b.cover ?? "" });
  const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
  const [saved, setSaved] = useState(false);
  return (
    <div className="card max-w-[760px] rounded-lg p-5 md:p-[26px]">
      <div className="mb-5 flex items-center justify-between rounded-md bg-offwhite px-4 py-3"><div><div className="text-[13.5px] font-semibold">Verified badge</div><div className="text-[12px] text-black/55">{b.verified ? "You're verified. Shoppers see the ✓ next to your name." : b.verification === "pending" ? "Application received. We review within 5 working days." : "Prove you make what you sell. We check a workshop photo and one order."}</div></div>{!b.verified && b.verification !== "pending" && <Button size="sm" onClick={() => upsertBrand({ ...b, verification: "pending" })}>Apply</Button>}{b.verification === "pending" && <span className="rounded-pill bg-sky px-3 py-[6px] text-[10.5px] font-semibold uppercase tracking-[.08em]">Pending</span>}</div>
      <div className="flex flex-col gap-4">
        <div><Label className="mb-2">Tagline</Label><input className={inputCls} value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} /></div>
        <div><Label className="mb-2">Website</Label><input className={inputCls} value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} /></div>
        <div className="grid gap-4 md:grid-cols-2"><div><Label className="mb-2">Logo image URL</Label><input className={inputCls} value={f.logo} onChange={(e) => setF({ ...f, logo: e.target.value })} placeholder="https://…/logo.png" /></div><div><Label className="mb-2">Cover image URL</Label><input className={inputCls} value={f.cover} onChange={(e) => setF({ ...f, cover: e.target.value })} placeholder="https://…/cover.jpg" /></div></div>
        <div><Label className="mb-2">Aesthetic tags</Label><input className={inputCls} value={f.styles} onChange={(e) => setF({ ...f, styles: e.target.value })} /></div>
        <div><Label className="mb-2">Moods · what search reads</Label><input className={inputCls} value={f.moods} onChange={(e) => setF({ ...f, moods: e.target.value })} /></div>
        <div><Label className="mb-2">Materials</Label><input className={inputCls} value={f.materials} onChange={(e) => setF({ ...f, materials: e.target.value })} /></div>
        <div><Label className="mb-2">Values</Label><input className={inputCls} value={f.values} onChange={(e) => setF({ ...f, values: e.target.value })} /></div>
        <div><Label className="mb-2">Story</Label><textarea className={clsx(inputCls, "min-h-[140px] resize-y leading-[1.6]")} value={f.story} onChange={(e) => setF({ ...f, story: e.target.value })} /></div>
        <div className="flex items-center gap-3"><Button onClick={() => { upsertBrand({ ...b, tagline: f.tagline.trim(), story: f.story.trim(), website: f.website.trim() || undefined, logo: f.logo.trim() || undefined, cover: f.cover.trim() || undefined, styles: split(f.styles), moods: split(f.moods), materials: split(f.materials), values: split(f.values) }); setSaved(true); setTimeout(() => setSaved(false), 1500); }}>Save changes</Button>{saved && <span className="text-[12.5px] font-medium text-navy">Saved ✓</span>}</div>
      </div>
    </div>
  );
}

const EMPTY_FRAME: LookFrame = { h: 420, x: 50, y: 45 };
function LookbookBuilder({ brand, mine }: { brand: string; mine: Product[] }) {
  const { allLookbooks, upsertLookbook, deleteLookbook } = useApp();
  const books = allLookbooks.filter((l) => l.brand === brand);
  const [f, setF] = useState({ title: "", season: "", blurb: "", bg: "#C7DCEF", frames: [{ ...EMPTY_FRAME }, { ...EMPTY_FRAME, h: 320 }, { ...EMPTY_FRAME, h: 480 }] as LookFrame[] });
  const setFrame = (i: number, patch: Partial<LookFrame>) => setF((p) => ({ ...p, frames: p.frames.map((fr, j) => (j === i ? { ...fr, ...patch } : fr)) }));
  const save = () => { if (!f.title.trim()) return; const slug = slugify(`${f.title}-${brand.split("-")[0]}`); upsertLookbook({ slug, brand, title: f.title.trim(), season: f.season.trim() || "No season", blurb: f.blurb.trim(), bg: f.bg, frames: f.frames.filter((fr) => fr.image || fr.product || fr.label), createdAt: new Date().toISOString() }); setF({ title: "", season: "", blurb: "", bg: "#C7DCEF", frames: [{ ...EMPTY_FRAME }, { ...EMPTY_FRAME, h: 320 }, { ...EMPTY_FRAME, h: 480 }] }); };
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_460px] items-start">
      <div className="flex flex-col gap-3">
        {books.map((l) => { const c = lookCount(l); const dark = l.bg === "#1C3247"; return <div key={l.slug} className="flex items-center justify-between gap-4 rounded-lg p-5" style={{ background: l.bg, color: dark ? "#F6F7F9" : "#1A1A1A" }}><div><div className="mb-1 text-[10px] font-semibold uppercase tracking-[.14em] opacity-60">{l.season}</div><div className="text-[20px] font-bold tracking-[-.03em]">{l.title}</div><div className="mono text-[11px] opacity-60">{c.looks} looks · {c.shoppable} shoppable</div></div><div className="flex gap-2"><Link href={`/lookbook/${l.slug}`} className="rounded-pill bg-white/80 px-3 py-[6px] text-[11.5px] font-semibold text-ink">View</Link>{l.createdAt && <button onClick={() => deleteLookbook(l.slug)} className="rounded-pill bg-white/60 px-3 py-[6px] text-[11.5px] font-semibold text-ink/60">✕</button>}</div></div>; })}
        {books.length === 0 && <div className="card rounded-lg p-8 text-center text-[13px] text-black/50">No lookbooks yet. Build one on the right: each frame can carry an image URL and one shoppable hotspot.</div>}
      </div>
      <div className="card rounded-lg p-5 md:p-6">
        <div className="mb-4 text-[16px] font-semibold tracking-[-.02em]">New lookbook</div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3"><div><Label className="mb-2">Title</Label><input className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Off the shipyard." /></div><div><Label className="mb-2">Season</Label><input className={inputCls} value={f.season} onChange={(e) => setF({ ...f, season: e.target.value })} placeholder="Autumn 26" /></div></div>
          <div><Label className="mb-2">One or two lines</Label><input className={inputCls} value={f.blurb} onChange={(e) => setF({ ...f, blurb: e.target.value })} placeholder="Eleven looks shot across two cold mornings." /></div>
          <div><Label className="mb-2">Cover colour</Label><div className="flex gap-2">{["#C7DCEF", "#DBE1EF", "#1C3247", "#456F94"].map((c) => <button key={c} onClick={() => setF({ ...f, bg: c })} className="h-8 w-8 rounded-pill" style={{ background: c, boxShadow: f.bg === c ? "0 0 0 2px #F6F7F9,0 0 0 3.5px #1A1A1A" : undefined }} />)}</div></div>
          <Label>Frames</Label>
          {f.frames.map((fr, i) => (
            <div key={i} className="rounded-md bg-offwhite p-3">
              <div className="mb-2 flex items-center justify-between"><span className="text-[12px] font-semibold">Frame {i + 1}</span><button onClick={() => setF({ ...f, frames: f.frames.filter((_, j) => j !== i) })} className="text-[11px] text-black/45">Remove</button></div>
              <input className={clsx(inputCls, "mb-2 !py-2 !text-[13px]")} value={fr.image ?? ""} onChange={(e) => setFrame(i, { image: e.target.value || undefined })} placeholder="Image URL" />
              <div className="flex flex-wrap gap-2">
                <select className={clsx(inputCls, "!w-auto !py-2 !text-[12px]")} value={fr.product ?? ""} onChange={(e) => setFrame(i, { product: e.target.value || undefined })}><option value="">No hotspot</option>{mine.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select>
                <label className="flex items-center gap-1 text-[11px] text-black/55">x <input type="range" min={5} max={95} value={fr.x ?? 50} onChange={(e) => setFrame(i, { x: Number(e.target.value) })} className="w-16 accent-black" /></label>
                <label className="flex items-center gap-1 text-[11px] text-black/55">y <input type="range" min={5} max={95} value={fr.y ?? 45} onChange={(e) => setFrame(i, { y: Number(e.target.value) })} className="w-16 accent-black" /></label>
                <label className="flex items-center gap-1 text-[11px] text-black/55">h <input type="range" min={240} max={600} step={20} value={fr.h} onChange={(e) => setFrame(i, { h: Number(e.target.value) })} className="w-16 accent-black" /></label>
              </div>
            </div>
          ))}
          <button onClick={() => setF({ ...f, frames: [...f.frames, { ...EMPTY_FRAME }] })} className="rounded-md border-[1.5px] border-dashed border-black/16 py-3 text-[12.5px] font-medium text-black/55">+ Add frame</button>
          <Button onClick={save} disabled={!f.title.trim()} className={clsx(!f.title.trim() && "opacity-40")}>Publish lookbook</Button>
        </div>
      </div>
    </div>
  );
}
