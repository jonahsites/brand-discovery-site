"use client";
import Link from "next/link";
import clsx from "clsx";
import { LOOKBOOKS } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Avatar, Label, Page } from "@/components/ui";

export default function Lookbooks() {
  const { brands } = useApp();
  return (
    <Page className="pt-6 md:pt-9">
      <div className="mb-6"><h1 className="mb-[5px] text-[26px] md:text-[30px] font-bold leading-[1.05] tracking-[-.035em]">Lookbooks</h1><div className="text-[12.5px] text-black/48">Editorial, but shoppable. Tap any numbered dot inside.</div></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {LOOKBOOKS.map((l, i) => { const b = brands.find((x) => x.slug === l.brand); const dark = l.bg === "#1C3247"; return (
          <Link key={l.slug} href={`/lookbook/${l.slug}`} className={clsx("flex h-[300px] flex-col justify-between rounded-lg p-7 lift border border-transparent")} style={{ background: l.bg, color: dark ? "#F6F7F9" : "#1A1A1A" }}>
            <div><Label light={dark} className="mb-3">{l.season}</Label><h2 className="mb-2 text-[28px] font-bold leading-[1.05] tracking-[-.038em]">{l.title}</h2><p className={clsx("max-w-[300px] text-[13.5px] leading-[1.55]", dark ? "text-offwhite/72" : "text-black/65")}>{l.blurb}</p></div>
            <div className="flex items-center justify-between">{b && <span className="flex items-center gap-2 text-[12.5px] font-semibold"><Avatar init={b.init} tint={b.tint} ink={b.ink} size={26} src={b.logo} />{b.name}</span>}<span className={clsx("mono text-[11px]", dark ? "text-offwhite/60" : "text-black/50")}>{l.looks} looks · {l.shoppable} shoppable{i === 0 ? "" : ""}</span></div>
          </Link>); })}
      </div>
    </Page>
  );
}
