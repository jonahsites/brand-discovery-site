"use client";
/**
 * Slim rust bar at the top of the page that appears the moment a link is clicked and
 * settles when the new route mounts. Same effect that GitHub, Vercel and Linear use to
 * tell a shopper "the site is doing something", so a snappy route change reads as a
 * real page load and not a flicker of HTML.
 */
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function RouteProgress() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const path = usePathname();
  const sp = useSearchParams();
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const visibleRef = useRef(false);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const start = () => {
    clear();
    visibleRef.current = true;
    setVisible(true);
    setProgress(0.15);
    timers.current.push(setTimeout(() => setProgress(0.55), 80));
    timers.current.push(setTimeout(() => setProgress(0.85), 220));
  };
  const done = () => {
    clear();
    setProgress(1);
    timers.current.push(setTimeout(() => { visibleRef.current = false; setVisible(false); setProgress(0); }, 220));
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = (e.target as HTMLElement | null)?.closest?.("a") as HTMLAnchorElement | null;
      if (!t || t.target === "_blank" || t.hasAttribute("download") || t.dataset.progress === "off") return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const href = t.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) return;
      const dest = new URL(href, location.href);
      if (dest.origin !== location.origin) return;
      if (dest.pathname === location.pathname && dest.search === location.search) return;
      start();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    // Route just changed. Bail if we never started (initial mount).
    if (!visibleRef.current) return;
    const id = setTimeout(() => done(), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, sp]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[2px]">
      <div
        className="h-full origin-left transition-[width,opacity] duration-200 ease-out"
        style={{
          width: `${progress * 100}%`,
          opacity: visible ? 1 : 0,
          background: "var(--rust)",
          boxShadow: "0 0 8px 0 var(--rust)",
        }}
      />
    </div>
  );
}
