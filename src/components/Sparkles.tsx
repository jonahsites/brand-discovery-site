"use client";
/**
 * Tiny inline sparkle stack — three CSS-only stars that pulse out of phase.
 * Used for "just published" moments and the NEW pill on brand cards.
 * Absolutely nothing to import; keeps the SVG inline so it inherits currentColor.
 */
import clsx from "clsx";
import type { CSSProperties } from "react";

const STAR_PATH =
  "M12 1.5 13.7 8.3 20.5 10 13.7 11.7 12 18.5 10.3 11.7 3.5 10 10.3 8.3Z";

export default function Sparkles({
  size = 14,
  color = "var(--tone-loud)",
  className,
  style,
}: {
  size?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={clsx("relative inline-block align-middle", className)}
      aria-hidden="true"
      style={{ width: size * 1.4, height: size, color, ...style }}
    >
      <Star delay={0} size={size} left={0} top={0} />
      <Star delay={0.4} size={size * 0.55} left={size * 0.65} top={-size * 0.15} />
      <Star delay={0.8} size={size * 0.4} left={size * 0.9} top={size * 0.35} />
    </span>
  );
}

function Star({ delay, size, left, top }: { delay: number; size: number; left: number; top: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className="absolute"
      style={{
        left,
        top,
        transformOrigin: "center",
        animation: `sparklePulse 1.8s ease-in-out ${delay}s infinite`,
      }}
    >
      <path d={STAR_PATH} fill="currentColor" />
    </svg>
  );
}
