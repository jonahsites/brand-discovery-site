"use client";
/**
 * Infinite horizontal ticker. Renders its children twice back-to-back inside a
 * flex track so the CSS keyframe `tickerX` (defined in globals.css) can loop
 * from 0 → -50% seamlessly. Duration is derived from a target speed in px/s so
 * the same component reads at the same visual pace on a phone and a desktop.
 *
 * Motion respects prefers-reduced-motion via globals.css; we don't need any JS.
 */
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import clsx from "clsx";

type MarqueeProps = {
  /** Roughly this many pixels per second. Default is the "reading" pace. */
  speed?: number;
  /** Pause on pointer hover. */
  pauseOnHover?: boolean;
  /** Additional wrapper classes. */
  className?: string;
  /** Gap between one copy of the children and the next. */
  gap?: number;
  children: ReactNode;
};

export default function Marquee({ speed = 55, pauseOnHover = true, gap = 40, className, children }: MarqueeProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState<number>(30);

  useEffect(() => {
    const el = groupRef.current;
    if (!el) return;
    const measure = () => {
      // width of one copy (the group is one copy; the track holds two)
      const w = el.getBoundingClientRect().width;
      if (w > 0) setDuration(Math.max(12, Math.round(w / speed)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [speed]);

  const trackStyle: CSSProperties = { ["--marquee-duration" as string]: `${duration}s`, gap };
  const groupStyle: CSSProperties = { gap };

  return (
    <div className={clsx("relative overflow-hidden", pauseOnHover && "marquee-pause", className)} aria-hidden={false}>
      <div className="marquee-track" style={trackStyle}>
        <div ref={groupRef} className="flex flex-none items-center" style={groupStyle}>
          {children}
        </div>
        <div className="flex flex-none items-center" style={groupStyle} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
