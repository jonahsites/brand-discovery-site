"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { useApp } from "@/lib/store";
import { Avatar, Button, Label, Page, inputCls } from "@/components/ui";

export default function Messages() { return <Suspense><MessagesInner /></Suspense>; }

function MessagesInner() {
  const sp = useSearchParams();
  const { threads, brands, session, sendMessage, hydrated } = useApp();
  const asBrand = session.role === "brand";
  const mine = threads.filter((t) => (asBrand ? t.brand === session.brand : true));
  const [active, setActive] = useState<string | null>(sp.get("t"));
  const [text, setText] = useState("");
  const thread = mine.find((t) => t.id === active) ?? mine[0];
  const b = thread ? brands.find((x) => x.slug === thread.brand) : undefined;
  const send = () => { if (!thread || !text.trim()) return; sendMessage(thread.brand, text.trim(), asBrand ? "brand" : "shopper"); setText(""); };
  if (!hydrated) return null;
  return (
    <Page narrow className="pt-6 md:pt-9">
      <h1 className="mb-1 text-[28px] md:text-[32px] font-extrabold leading-[1.05] tracking-[-.038em]">Messages</h1>
      <p className="mb-6 text-[13.5px] text-ink/55">{asBrand ? "Shoppers asking about sizing, shipping and restocks." : "Ask a brand anything before you buy. They answer from their workshop."}</p>
      <div className="grid gap-4 md:grid-cols-[300px_1fr] items-start">
        <div className="card rounded-lg p-2">
          {mine.map((t) => { const tb = brands.find((x) => x.slug === t.brand); const last = t.messages[t.messages.length - 1]; return (
            <button key={t.id} onClick={() => setActive(t.id)} className={clsx("flex w-full items-center gap-3 rounded-md px-3 py-3 text-left", thread?.id === t.id ? "bg-cream" : "hover:bg-cream/50")}>
              {asBrand ? <Avatar init="JR" tint="#DCD5C7" size={36} /> : <Avatar init={tb?.init ?? "?"} tint={tb?.tint ?? "#E5DFD3"} ink={tb?.ink} size={36} src={tb?.logo} />}
              <div className="min-w-0 flex-1"><div className="text-[13px] font-semibold">{asBrand ? t.shopper : tb?.name}</div><div className="truncate text-[12px] text-ink/50">{last?.text}</div></div>
            </button>); })}
          {mine.length === 0 && <div className="p-6 text-center text-[13px] text-ink/50">No conversations yet. {asBrand ? "Shoppers will reach you from your brand page." : <>Hit <span className="font-semibold">Message</span> on any brand page.</>}</div>}
        </div>
        <div className="card flex min-h-[460px] flex-col rounded-lg">
          {thread && b ? (
            <>
              <div className="flex items-center gap-3 border-b border-ink/6 px-5 py-4"><Avatar init={b.init} tint={b.tint} ink={b.ink} size={36} src={b.logo} /><div className="flex-1"><Link href={`/brand/${b.slug}`} className="text-[14px] font-semibold">{b.name}</Link><div className="mono text-[10.5px] text-ink/45">{b.city} · usually replies within a day</div></div></div>
              <div className="flex flex-1 flex-col gap-3 overflow-auto px-5 py-5">
                {thread.messages.map((m) => { const me = (m.from === "brand") === asBrand; return <div key={m.id} className={clsx("max-w-[78%] rounded-[18px] px-4 py-[10px] text-[13.5px] leading-[1.5]", me ? "self-end bg-ink text-paper" : "self-start bg-offwhite")}>{m.text}<div className={clsx("mono mt-1 text-[9.5px]", me ? "text-paper/50" : "text-ink/40")}>{new Date(m.at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</div></div>; })}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t border-ink/6 p-4"><input value={text} onChange={(e) => setText(e.target.value)} placeholder={asBrand ? "Reply as the brand…" : "Ask about fit, fabric, shipping…"} className={clsx(inputCls, "!rounded-pill")} /><Button type="submit">Send</Button></form>
            </>
          ) : <div className="grid flex-1 place-items-center p-10 text-center text-[13.5px] text-ink/50"><div><Label className="mb-2">Nothing selected</Label>Pick a conversation.</div></div>}
        </div>
      </div>
    </Page>
  );
}
