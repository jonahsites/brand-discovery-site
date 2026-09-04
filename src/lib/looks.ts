/**
 * Looks: the six visual worlds Kindred can dress itself in. A shopper's onboarding style picks
 * decide their look; the look sets CSS variables (palette, radius, display font, shadow) through
 * `data-look` on <html>. Brands match shoppers through the same style tags.
 */
export type LookKey = "minimal" | "heritage" | "street" | "tech" | "cozy" | "avant";

export type Look = {
  key: LookKey;
  name: string;
  tagline: string;
  /** Onboarding style tags that vote for this look. */
  styles: string[];
  /** paper, ink, accent — for previews and swatches. */
  swatch: [string, string, string];
  /** One line about how the interface changes. */
  ui: string;
};

export const LOOKS: Look[] = [
  { key: "minimal", name: "Minimal", tagline: "Paper, cream, quiet type.", styles: ["Minimalist", "Scandi", "Tailoring"], swatch: ["#F6F4EF", "#121A24", "#7C8C6F"], ui: "The Kindred v2 base: soft cards, sage accents, nothing shouting." },
  { key: "heritage", name: "Heritage", tagline: "Tan paper, serif headlines, worn-in.", styles: ["Workwear", "Vintage revival", "Archive"], swatch: ["#F3EBDD", "#2B211A", "#8B5E34"], ui: "Old-fashioned: serif display type, saddle-brown accents, squarer corners, catalogue feel." },
  { key: "street", name: "Street", tagline: "White, black, one loud red.", styles: ["Japanese streetwear", "Streetwear", "Skate"], swatch: ["#FFFFFF", "#0A0A0A", "#FF3B1F"], ui: "Hard contrast, grotesk type, tight corners, sticker-like tags." },
  { key: "tech", name: "Tech", tagline: "Dark shell, LED green, physical buttons.", styles: ["Techwear", "Outdoors"], swatch: ["#111315", "#F2F4F5", "#3DDC84"], ui: "Dark mode. Controls read like a key fob: inset, rubbery, a green indicator." },
  { key: "cozy", name: "Cozy", tagline: "Oat, terracotta, extra round.", styles: ["Knitwear", "Sustainable", "Upcycled"], swatch: ["#F7F1EA", "#3B2F2A", "#C4704F"], ui: "Warmer paper, rounder everything, softer contrast." },
  { key: "avant", name: "Avant", tagline: "Stark, editorial, sharp corners.", styles: ["Avant-garde", "Designer"], swatch: ["#F4F4F2", "#000000", "#6B6B6B"], ui: "No radius, no shadow, hairlines, big italic serif headlines." },
];

export const LOOK_OF_STYLE: Record<string, LookKey> = Object.fromEntries(LOOKS.flatMap((l) => l.styles.map((s) => [s, l.key])));

export const DEFAULT_LOOK: LookKey = "minimal";

export function lookByKey(key: string | undefined): Look {
  return LOOKS.find((l) => l.key === key) ?? LOOKS[0];
}

/** Majority vote over the shopper's style tags; ties go to whichever look they picked first. */
export function deriveLook(styleTags: string[]): LookKey {
  const votes = new Map<LookKey, number>();
  const first = new Map<LookKey, number>();
  styleTags.forEach((s, i) => {
    const k = LOOK_OF_STYLE[s];
    if (!k) return;
    votes.set(k, (votes.get(k) ?? 0) + 1);
    if (!first.has(k)) first.set(k, i);
  });
  let best: LookKey | undefined;
  for (const [k, n] of votes) {
    if (!best) { best = k; continue; }
    const bn = votes.get(best)!;
    if (n > bn || (n === bn && first.get(k)! < first.get(best)!)) best = k;
  }
  return best ?? DEFAULT_LOOK;
}

/** How many style tags a brand shares with the shopper. 0 means no match. */
export function styleOverlap(brandStyles: string[], userStyles: string[]): number {
  return brandStyles.filter((s) => userStyles.includes(s)).length;
}

/** Looks a brand belongs to, by its own style tags. */
export function looksOfBrand(brandStyles: string[]): Look[] {
  const keys = new Set(brandStyles.map((s) => LOOK_OF_STYLE[s]).filter(Boolean));
  return LOOKS.filter((l) => keys.has(l.key));
}
