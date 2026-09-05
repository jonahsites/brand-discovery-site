/**
 * Dynamic share poster for a brand — 1080×1350 (Instagram feed 4:5, also works for Twitter).
 * Renders the brand's accent color, big serif brand name, tagline, city, and a small
 * "Find me on Kindred" strip with the URL. Downloadable from the brand-page Share modal.
 */
import { BRANDS, planOf } from "@/lib/data";
import { SITE } from "@/lib/seo";
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Read seed + custom brands. Custom brands live in localStorage on the client only,
  // so the poster route can only find seed brands. That's fine — this API is called from
  // the brand's own page which passes the brand slug that exists somewhere in the app.
  const b = BRANDS.find((x) => x.slug === slug);
  const name = b?.name ?? slug.replace(/-/g, " ");
  const tagline = b?.tagline ?? "on Kindred";
  const city = b ? `${b.city}, ${b.country}` : "";
  const accent = b?.accent ?? "#3A5A3F";
  const ink = "#0F1113";
  const paper = "#F4F4F2";
  const badge = b?.plan === "premium" || b?.plan === "signature" ? planOf(b.plan).badge : null;
  const badgeBg = b?.plan === "premium" || b?.plan === "signature" ? planOf(b.plan).badgeBg : null;
  const url = new URL(`/brand/${slug}`, SITE.url).toString().replace(/^https?:\/\//, "");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: paper, color: ink, padding: 72, fontFamily: "Georgia, 'Times New Roman', serif" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 24, fontWeight: 600 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", width: 40, height: 40, borderRadius: 10, background: ink, color: paper, alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800 }}>k</div>
            <span style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: -1 }}>Kindred</span>
            <div style={{ marginLeft: 8, width: 40, height: 4, background: accent, borderRadius: 2 }} />
          </div>
          {badge ? (
            <div style={{ display: "flex", background: badgeBg ?? accent, color: paper, padding: "8px 16px", borderRadius: 999, fontSize: 15, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase" }}>{badge}</div>
          ) : (
            <div style={{ display: "flex", fontFamily: "sans-serif", fontSize: 14, letterSpacing: 1.4, textTransform: "uppercase", color: "rgba(15,17,19,0.5)" }}>Independent brand</div>
          )}
        </div>

        {/* Accent panel with brand name */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", marginTop: 40, marginBottom: 40, padding: 60, background: accent, color: paper, borderRadius: 20, position: "relative" }}>
          <div style={{ display: "flex", fontFamily: "sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", opacity: 0.75, marginBottom: 24 }}>{city}</div>
          <div style={{ fontSize: name.length > 20 ? 110 : name.length > 14 ? 138 : 168, lineHeight: 0.95, letterSpacing: -2, fontWeight: 400 }}>{name}</div>
          <div style={{ marginTop: 32, fontSize: 34, lineHeight: 1.15, opacity: 0.9, maxWidth: 860, fontStyle: "italic" }}>&ldquo;{tagline}&rdquo;</div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "sans-serif", fontSize: 22 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 16, letterSpacing: 2, textTransform: "uppercase", color: "rgba(15,17,19,0.55)" }}>Find me on Kindred</span>
            <span style={{ marginTop: 6, fontSize: 26, fontWeight: 700 }}>{url}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: accent }} />
            <span style={{ color: "rgba(15,17,19,0.55)" }}>Small clothing brands, not small ambition.</span>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350 },
  );
}
