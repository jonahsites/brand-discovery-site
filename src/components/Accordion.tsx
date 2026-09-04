"use client";
import { useState } from "react";

export default function Accordion({ items, defaultOpen = 0 }: { items: readonly (readonly [string, string])[]; defaultOpen?: number }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-black/9">
      {items.map(([title, body], i) => (
        <div key={title} className="border-b border-black/9">
          <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between py-[18px] text-left text-[14px] font-semibold">
            {title}<span className="text-[15px] text-black/40">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <p className="max-w-[520px] pb-5 text-[13.5px] leading-[1.65] text-black/62">{body}</p>}
        </div>
      ))}
    </div>
  );
}
