/* eslint-disable @next/next/no-img-element -- poster is a same-origin PNG from /brand/[slug]/poster */
"use client";
import { useEffect, useState } from "react";
import type { Brand } from "@/lib/data";
import { IconClose, IconShare } from "@/components/Icon";
import { useApp } from "@/lib/store";

/**
 * Share sheet for a brand. Renders a Kindred-styled preview of the /brand/[slug]/poster PNG
 * (1080×1350, Instagram-feed 4:5) plus three actions: Copy link, Download poster, native Share.
 * Native share uses `navigator.share` when available (iOS + Android + newer Chrome / Edge on
 * desktop). Everywhere else we fall back to opening a pre-typed X compose URL.
 */
export default function ShareBrand({ b, className }: { b: Brand; className?: string }) {
  const { toast } = useApp();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = typeof location !== "undefined" ? `${location.origin}/brand/${b.slug}` : `/brand/${b.slug}`;
  const posterUrl = `/brand/${b.slug}/poster?v=${b.plan ?? "basic"}`;
  const caption = `Check me out on Kindred — ${url}`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1600); }
    catch { toast("Couldn't copy — long-press the link and copy manually."); }
  };

  const share = async () => {
    try {
      const canShareFiles = typeof navigator !== "undefined" && "canShare" in navigator && typeof navigator.share === "function";
      if (canShareFiles) {
        const res = await fetch(posterUrl);
        const blob = await res.blob();
        const file = new File([blob], `${b.slug}-kindred.png`, { type: "image/png" });
        const withFile = (navigator as Navigator & { canShare?: (d: ShareData) => boolean }).canShare?.({ files: [file] });
        if (withFile) { await navigator.share({ files: [file], title: b.name, text: caption, url }); return; }
      }
      if (typeof navigator !== "undefined" && "share" in navigator) { await navigator.share({ title: b.name, text: caption, url }); return; }
    } catch { /* user cancelled or the API refused — fall through */ }
    const composeUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`;
    window.open(composeUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Share this brand" className={className ?? "press grid h-[38px] w-[38px] place-items-center rounded-md bg-cream text-ink/70"}>
        <IconShare size={16} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button aria-label="Close" onClick={() => setOpen(false)} className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" />
          <div role="dialog" aria-label="Share brand" className="absolute inset-0 grid place-items-center px-4">
            <div className="card relative flex w-full max-w-[440px] flex-col rounded-lg p-5 md:p-6">
              <div className="mb-4 flex items-baseline justify-between">
                <div>
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-[.14em] text-ink/50">Share {b.name}</div>
                  <div className="text-[20px] leading-none tracking-[-.015em]" style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}>Post it anywhere.</div>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-md bg-cream text-ink/60"><IconClose size={16} /></button>
              </div>

              <div className="mb-4 overflow-hidden rounded-md" style={{ background: b.accent ?? "var(--sage)" }}>
                <img src={posterUrl} alt={`Share poster for ${b.name}`} className="block h-auto w-full" width={1080} height={1350} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={copy} className="press rounded-md bg-cream px-3 py-[10px] text-[12px] font-semibold text-ink">{copied ? "Copied ✓" : "Copy link"}</button>
                <a href={posterUrl} download={`${b.slug}-kindred.png`} className="press flex items-center justify-center rounded-md bg-cream px-3 py-[10px] text-[12px] font-semibold text-ink">Download</a>
                <button type="button" onClick={share} className="press rounded-md bg-ink px-3 py-[10px] text-[12px] font-semibold text-paper">Share</button>
              </div>

              <div className="mt-3 text-center text-[11px] text-ink/45">1080×1350 · Instagram-feed friendly. Long-press the image on iPhone to save it.</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
