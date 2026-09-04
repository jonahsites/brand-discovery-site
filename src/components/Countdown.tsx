"use client";
import { useSyncExternalStore } from "react";
import clsx from "clsx";

/* A shared 1s clock. Server snapshot is 0 so SSR output never depends on the time,
   which keeps hydration deterministic; the client gets the real time on mount. */
let nowCache = 0;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) { nowCache = Date.now(); timer = setInterval(() => { nowCache = Date.now(); listeners.forEach((l) => l()); }, 1000); }
  return () => { listeners.delete(cb); if (listeners.size === 0 && timer) { clearInterval(timer); timer = undefined; } };
}
export function useNow() { return useSyncExternalStore(subscribe, () => nowCache || Date.now(), () => 0); }
export function useMounted() { return useSyncExternalStore((cb) => { cb(); return () => {}; }, () => true, () => false); }

export default function Countdown({ at, dark, compact }: { at: string; dark?: boolean; compact?: boolean }) {
  const now = useNow();
  const diff = now === 0 ? null : Math.max(0, new Date(at).getTime() - now);
  if (diff === 0) return <span className={clsx("mono text-[12px]", dark ? "text-paper/70" : "text-ink/55")}>Live now</span>;
  const d = diff === null ? null : Math.floor(diff / 864e5), h = diff === null ? null : Math.floor((diff % 864e5) / 36e5), m = diff === null ? null : Math.floor((diff % 36e5) / 6e4), s = diff === null ? null : Math.floor((diff % 6e4) / 1000);
  const cells = [[d, "d"], [h, "h"], [m, "m"], [s, "s"]] as const;
  return (
    <div className={clsx("flex gap-[6px]", compact && "gap-1")}>
      {cells.map(([v, l]) => <div key={l} className={clsx("rounded-[8px] text-center", compact ? "min-w-[38px] px-2 py-1" : "min-w-[52px] px-2 py-2", dark ? "bg-cream/12" : "bg-white border border-ink/7")}><div className={clsx("mono font-medium tabular-nums", compact ? "text-[13px]" : "text-[18px]")}>{v === null ? "––" : String(v).padStart(2, "0")}</div><div className={clsx("text-[9px] uppercase tracking-[.1em]", dark ? "text-paper/50" : "text-ink/40")}>{l}</div></div>)}
    </div>
  );
}
