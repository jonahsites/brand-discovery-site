"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";

export function useNow(everyMs = 0) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { if (!everyMs) return; const id = setInterval(() => setNow(Date.now()), everyMs); return () => clearInterval(id); }, [everyMs]);
  return now;
}

export default function Countdown({ at, dark, compact }: { at: string; dark?: boolean; compact?: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const diff = Math.max(0, new Date(at).getTime() - now);
  const d = Math.floor(diff / 864e5), h = Math.floor((diff % 864e5) / 36e5), m = Math.floor((diff % 36e5) / 6e4), s = Math.floor((diff % 6e4) / 1000);
  if (diff === 0) return <span className={clsx("mono text-[12px]", dark ? "text-offwhite/70" : "text-black/55")}>Live now</span>;
  const cells = [[d, "d"], [h, "h"], [m, "m"], [s, "s"]] as const;
  return (
    <div className={clsx("flex gap-[6px]", compact && "gap-1")}>
      {cells.map(([v, l]) => <div key={l} className={clsx("rounded-[8px] text-center", compact ? "min-w-[38px] px-2 py-1" : "min-w-[52px] px-2 py-2", dark ? "bg-offwhite/12" : "bg-white border border-black/7")}><div className={clsx("mono font-medium tabular-nums", compact ? "text-[13px]" : "text-[18px]")}>{String(v).padStart(2, "0")}</div><div className={clsx("text-[9px] uppercase tracking-[.1em]", dark ? "text-offwhite/50" : "text-black/40")}>{l}</div></div>)}
    </div>
  );
}
