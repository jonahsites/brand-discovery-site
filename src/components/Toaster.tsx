"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useApp } from "@/lib/store";
import { IconClose } from "./Icon";

export default function Toaster() {
  const { toasts, dismissToast, openSearch, searchOpen, bagOpen } = useApp();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if ((e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) && !searchOpen && !bagOpen && !(el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable))) { e.preventDefault(); openSearch(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch, searchOpen, bagOpen]);
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[104px] md:bottom-6 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div key={t.id} className="card pointer-events-auto flex items-center gap-3 rounded-pill py-[10px] pl-4 pr-2 text-[13px] font-medium">
          <span>{t.text}</span>
          {t.href && <Link href={t.href} onClick={() => dismissToast(t.id)} className="rounded-pill bg-ink px-3 py-[6px] text-[11.5px] font-semibold text-paper">View</Link>}
          <button onClick={() => dismissToast(t.id)} aria-label="Dismiss" className="grid h-7 w-7 place-items-center rounded-md text-ink/50 hover:text-ink"><IconClose size={14} /></button>
        </div>
      ))}
    </div>
  );
}
