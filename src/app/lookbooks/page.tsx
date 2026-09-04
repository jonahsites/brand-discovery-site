"use client";
import Link from "next/link";
import clsx from "clsx";
import { lookCount } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Avatar, Label, Page } from "@/components/ui";

export default function Lookbooks() {
  const { brands, allLookbooks } = useApp();
  return (
    <Page className="pt-6 md:pt-9">
      <div className="mb-6"><h1 className="mb-[5px] text-[26px] md:text-[30px] font-extrabold leading-[1.05] tracking-[-.035em]">Lookbooks</h1><div className="text-[12.5px] text-ink/48">Editorial, but shoppable. Tap any numbered dot inside.</div></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {allLookbooks.map((l) => { const b = brands.find((x) => x.slug === l.brand); const dark = l.bg === "#121A24"; const { looks, shoppable } = lookCount(l); return (
          <Link key={l.slug} href={`/lookbook/${l.slug}`} className="flex h-[300px] flex-col justify-between rounded-lg p-7 lift" style={{ background: l.bg, color: dark ? "#F6F4EF" : "#121A24" }}>
            <div><Label light={dark} className="mb-3">{l.season}</Label><h2 className="mb-2 text-[28px] font-extrabold leading-[1.05] tracking-[-.038em]">{l.title}</h2><p className={clsx("max-w-[300px] text-[13.5px] leading-[1.55]", dark ? "text-paper/72" : "text-ink/65")}>{l.blurb}</p></div>
            <div className="flex items-center justify-between">{b && <span className="flex items-center gap-2 text-[12.5px] font-semibold"><Avatar init={b.init} tint={b.tint} ink={b.ink} size={26} src={b.logo} />{b.name}</span>}<span className={clsx("mono text-[11px]", dark ? "text-paper/60" : "text-ink/50")}>{looks} looks · {shoppable} shoppable</span></div>
          </Link>); })}
      </div>
    </Page>
  );
}
