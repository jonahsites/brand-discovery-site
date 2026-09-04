"use client";
import { useState } from "react";
import clsx from "clsx";

export default function Accordion({ items, defaultOpen = 0 }: { items: readonly (readonly [string, string])[]; defaultOpen?: number }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="flex flex-col gap-2">
      {items.map(([title, body], i) => (
        <div key={title} className={clsx("rounded-md px-[18px] transition-colors", open === i ? "bg-cream" : "bg-white soft")}>
          <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between py-[15px] text-left text-[13.5px] font-semibold">
            {title}<span className={clsx("grid h-6 w-6 place-items-center rounded-pill text-[13px]", open === i ? "bg-ink text-paper" : "bg-cream text-ink/60")}>{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <p className="max-w-[520px] pb-[18px] text-[13px] leading-[1.65] text-ink/62">{body}</p>}
        </div>
      ))}
    </div>
  );
}
