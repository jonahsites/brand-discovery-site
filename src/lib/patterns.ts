/**
 * Kindred brand-page background patterns. Returns a CSS `background` value
 * built from inline SVG data URIs so the pattern renders without a network
 * hop and tints from any brand's accent color. The palette is tuned quiet —
 * ~6% opacity by default so a piece over the pattern still owns the eye.
 */
export type PatternKey = "none" | "grid" | "dot" | "arch" | "wave" | "grain";

const encode = (svg: string) => encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22");

function stroke(color: string, opacity: number) {
  // color arrives as any CSS color (#hex, rgb, var(...)). We honour a hex directly and fall back
  // to the raw string for anything else — the SVG will inherit.
  return { color, opacity };
}

function svgFor(key: PatternKey, color: string, opacity: number): string {
  const c = stroke(color, opacity).color;
  const a = opacity;
  switch (key) {
    case "grid":
      return `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><path d='M0 .5H40M0 .5V40' fill='none' stroke='${c}' stroke-opacity='${a}' stroke-width='1'/></svg>`;
    case "dot":
      return `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='1.4' fill='${c}' fill-opacity='${a}'/></svg>`;
    case "arch":
      return `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><path d='M0 80 A40 40 0 0 1 80 80' fill='none' stroke='${c}' stroke-opacity='${a}' stroke-width='1'/></svg>`;
    case "wave":
      return `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='24' viewBox='0 0 120 24'><path d='M0 12 Q 15 0 30 12 T 60 12 T 90 12 T 120 12' fill='none' stroke='${c}' stroke-opacity='${a}' stroke-width='1.25'/></svg>`;
    case "grain":
      // Grain is tiny filled dots at low opacity — the softest of the set.
      return `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><circle cx='7' cy='11' r='.7' fill='${c}' fill-opacity='${a * 1.2}'/><circle cx='23' cy='34' r='.6' fill='${c}' fill-opacity='${a}'/><circle cx='41' cy='9' r='.8' fill='${c}' fill-opacity='${a * 1.1}'/><circle cx='52' cy='47' r='.7' fill='${c}' fill-opacity='${a}'/><circle cx='16' cy='55' r='.6' fill='${c}' fill-opacity='${a * .9}'/><circle cx='34' cy='24' r='.7' fill='${c}' fill-opacity='${a}'/></svg>`;
    default:
      return "";
  }
}

/** Returns a `background-image` string ready for a style prop. Empty for `none`. */
export function patternBackground(key: PatternKey | undefined, accent: string, opacity = 0.06): string {
  if (!key || key === "none") return "";
  const svg = svgFor(key, accent, opacity);
  if (!svg) return "";
  return `url("data:image/svg+xml;utf8,${encode(svg)}")`;
}

/** Convenience: full style dict a caller can spread onto a hero backing div. */
export function patternStyle(key: PatternKey | undefined, accent: string, opacity = 0.06) {
  const bg = patternBackground(key, accent, opacity);
  if (!bg) return {};
  return { backgroundImage: bg, backgroundRepeat: "repeat" as const };
}
