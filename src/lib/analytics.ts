/**
 * A tiny in-app analytics hook. Records page views + named events into a rolling
 * localStorage log the /admin route can visualise. Later this file is where you'd add
 * PostHog / Plausible / Umami — swap the two functions, keep the call sites.
 */
"use client";

const KEY = "kindred.analytics";
const CAP = 500;

type Ev = { ts: number; k: string; p?: Record<string, string | number> };

export function track(k: string, p?: Ev["p"]): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    const list: Ev[] = raw ? JSON.parse(raw) : [];
    list.push({ ts: Date.now(), k, p });
    if (list.length > CAP) list.splice(0, list.length - CAP);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

export function readEvents(): Ev[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function clearEvents(): void {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(KEY); } catch {}
}
