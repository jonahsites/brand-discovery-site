import { ImageResponse } from "next/og";

/**
 * Default Open Graph card for every route that doesn't set its own image. 1200×630,
 * a warm off-white ground, big serif "Kindred", a tagline, and a rust accent bar so it
 * matches the app's identity when it's shared on Slack, iMessage, Twitter, LinkedIn.
 */
export const runtime = "edge";
export const alt = "Kindred — Find your next favorite clothing brand";
export const size = { width: 1200, height: 630 } as const;
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: "72px 84px",
          background: "#F6F4EF", color: "#121A24",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#121A24", color: "#F6F4EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 }}>k</div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>Kindred</div>
          <div style={{ marginLeft: 12, height: 4, width: 44, background: "#B85A3C", borderRadius: 2 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 96, lineHeight: 0.95, letterSpacing: -3 }}>
            Find your next<br />favorite clothing brand.
          </div>
          <div style={{ fontSize: 26, color: "rgba(18,26,36,0.55)", maxWidth: 900, lineHeight: 1.35 }}>
            A marketplace for independent labels. Type how you feel. Buy from many small brands in one bag.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 20, color: "rgba(18,26,36,0.5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ height: 8, width: 8, borderRadius: 4, background: "#4D6B52" }} />
            <span>Independent · Small batch · Made to order</span>
          </div>
          <div>kindred.shop</div>
        </div>
      </div>
    ),
    size,
  );
}
