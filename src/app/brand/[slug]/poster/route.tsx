/**
 * Dynamic share poster for a brand — 1080×1350 (Instagram feed 4:5, also fine for X/Twitter).
 *
 * Three styles selectable via ?style=bold|mag|clean :
 *   - bold (default): accent-color takeover with the brand's logo mark top-left,
 *     giant serif brand name, a "CHECK ME OUT" burst, cover-image strip at the bottom
 *   - mag: magazine-style 50/50 split with the brand's cover on one side and the
 *     identity + kicker on the other, using both accent + accent_2 for a duo moment
 *   - clean: minimal cream ground, tiny logo top-left, name in serif ink, cover big
 *     underneath — for brands whose look is quiet.
 *
 * Reads name, tagline, city, country, accent, accent_2, motto, logo, cover, plan from
 * Supabase (public read). Everything falls back to the slug + defaults.
 */
import { planOf } from "@/lib/data";
import { SITE } from "@/lib/seo";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const contentType = "image/png";

type BrandRow = {
  slug: string; name: string; tagline?: string; city?: string; country?: string;
  accent?: string; accent_2?: string; motto?: string; logo?: string; cover?: string;
  plan?: "basic" | "signature" | "premium";
};

async function loadBrand(slug: string): Promise<BrandRow | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/brands?slug=eq.${encodeURIComponent(slug)}&select=slug,name,tagline,city,country,accent,accent_2,motto,logo,cover,plan&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as BrandRow[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const style = (searchParams.get("style") ?? "bold") as "bold" | "mag" | "clean";
  const b = await loadBrand(slug);

  const name = b?.name ?? slug.replace(/-/g, " ");
  const tagline = b?.tagline ?? "on Kindred";
  const motto = b?.motto;
  const city = b?.city && b?.country ? `${b.city}, ${b.country}` : b?.city ?? "";
  const accent = b?.accent ?? "#3A5A3F";
  const accent2 = b?.accent_2 ?? accent;
  const logo = b?.logo;
  const cover = b?.cover;
  const ink = "#0F1113";
  const paper = "#F4F4F2";
  const cream = "#ECECEA";
  const badge = b?.plan === "premium" || b?.plan === "signature" ? planOf(b.plan).badge : null;
  const badgeBg = b?.plan === "premium" || b?.plan === "signature" ? planOf(b.plan).badgeBg : null;
  const url = new URL(`/brand/${slug}`, SITE.url).toString().replace(/^https?:\/\//, "");
  const nameSize = name.length > 20 ? 96 : name.length > 14 ? 128 : 160;

  const KindredMark = ({ light = false }: { light?: boolean }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", width: 44, height: 44, borderRadius: 12, background: light ? paper : ink, color: light ? ink : paper, alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, fontFamily: "sans-serif" }}>k</div>
      <div style={{ display: "flex", fontFamily: "sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: -1, color: light ? paper : ink }}>Kindred</div>
    </div>
  );

  const CheckMeOut = ({ tone }: { tone: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, transform: "rotate(-4deg)", background: tone, color: paper, padding: "12px 22px", borderRadius: 999, fontFamily: "sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: 1, textTransform: "uppercase" }}>
      <span>Check me out ↓</span>
    </div>
  );

  const BadgePill = () => badge ? (
    <div style={{ display: "flex", background: badgeBg ?? accent, color: paper, padding: "8px 16px", borderRadius: 999, fontSize: 14, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", fontFamily: "sans-serif" }}>{badge}</div>
  ) : (
    <div style={{ display: "flex", fontFamily: "sans-serif", fontSize: 13, letterSpacing: 1.6, textTransform: "uppercase", color: "rgba(15,17,19,0.5)" }}>Independent brand</div>
  );

  const LogoBlock = ({ size = 72, light = false }: { size?: number; light?: boolean }) => logo ? (
    // eslint-disable-next-line @next/next/no-img-element -- ImageResponse handles remote images
    <img src={logo} alt={name} width={size} height={size} style={{ width: size, height: size, borderRadius: size * 0.22, objectFit: "cover" }} />
  ) : (
    <div style={{ display: "flex", width: size, height: size, borderRadius: size * 0.22, background: light ? paper : ink, color: light ? ink : paper, alignItems: "center", justifyContent: "center", fontSize: size * 0.42, fontWeight: 800, fontFamily: "sans-serif" }}>{name[0]?.toUpperCase() ?? "K"}</div>
  );

  let el: React.ReactElement;

  if (style === "clean") {
    el = (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: paper, color: ink, padding: 72, fontFamily: "Georgia, 'Times New Roman', serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <KindredMark />
          <BadgePill />
        </div>
        <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "flex-start", marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <LogoBlock size={64} />
            {city ? <div style={{ display: "flex", fontFamily: "sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(15,17,19,0.55)" }}>{city}</div> : null}
          </div>
          <div style={{ fontSize: nameSize, lineHeight: 0.94, letterSpacing: -3, fontWeight: 400, marginBottom: 24 }}>{name}</div>
          <div style={{ display: "flex", fontSize: 30, lineHeight: 1.2, color: "rgba(15,17,19,0.72)", maxWidth: 900, fontStyle: "italic" }}>{`"${motto ?? tagline}"`}</div>
        </div>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" width={936} height={280} style={{ width: "100%", height: 280, borderRadius: 20, objectFit: "cover", marginBottom: 24 }} />
        ) : (
          <div style={{ display: "flex", height: 280, borderRadius: 20, marginBottom: 24, background: accent }} />
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "sans-serif", fontSize: 20 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 14, letterSpacing: 2, textTransform: "uppercase", color: "rgba(15,17,19,0.55)" }}>Now on Kindred</div>
            <div style={{ display: "flex", marginTop: 4, fontSize: 24, fontWeight: 700 }}>{url}</div>
          </div>
          <div style={{ display: "flex", width: 16, height: 16, borderRadius: 8, background: accent }} />
        </div>
      </div>
    );
  } else if (style === "mag") {
    el = (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row", background: paper, color: ink, fontFamily: "Georgia, 'Times New Roman', serif" }}>
        {/* Left: cover */}
        <div style={{ display: "flex", flex: 1, background: `linear-gradient(135deg, ${accent} 0%, ${accent2} 100%)`, position: "relative", overflow: "hidden" }}>
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" width={540} height={1350} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", color: paper, fontFamily: "sans-serif", fontSize: 20, letterSpacing: 3, textTransform: "uppercase", opacity: 0.75 }}>{city || "Independent"}</div>
          )}
        </div>
        {/* Right: identity */}
        <div style={{ display: "flex", flex: 1, flexDirection: "column", padding: 60, background: cream }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <KindredMark />
            <BadgePill />
          </div>
          <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", marginTop: 24 }}>
            <LogoBlock size={80} />
            <div style={{ display: "flex", marginTop: 24, fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(15,17,19,0.55)" }}>{city || "Independent brand"}</div>
            <div style={{ fontSize: nameSize * 0.72, lineHeight: 0.95, letterSpacing: -2, fontWeight: 400, marginTop: 16 }}>{name}</div>
            <div style={{ display: "flex", marginTop: 24, fontSize: 26, lineHeight: 1.25, color: "rgba(15,17,19,0.75)", maxWidth: 420, fontStyle: "italic" }}>{`"${motto ?? tagline}"`}</div>
            <div style={{ display: "flex", marginTop: 32 }}>
              <CheckMeOut tone={accent} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "sans-serif" }}>
            <div style={{ display: "flex", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: "rgba(15,17,19,0.55)" }}>Now on Kindred</div>
            <div style={{ display: "flex", marginTop: 4, fontSize: 22, fontWeight: 700 }}>{url}</div>
          </div>
        </div>
      </div>
    );
  } else {
    // bold (default)
    el = (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: paper, color: ink, padding: 56, fontFamily: "Georgia, 'Times New Roman', serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <KindredMark />
          <BadgePill />
        </div>
        <div style={{ position: "relative", display: "flex", flex: 1, flexDirection: "column", justifyContent: "flex-end", marginTop: 32, marginBottom: 24, padding: 60, background: `linear-gradient(160deg, ${accent} 0%, ${accent2} 100%)`, color: paper, borderRadius: 24, overflow: "hidden" }}>
          {/* Big burst top-right */}
          <div style={{ position: "absolute", top: 40, right: 40, display: "flex" }}>
            <CheckMeOut tone={ink} />
          </div>
          {/* Logo top-left */}
          <div style={{ position: "absolute", top: 40, left: 40, display: "flex" }}>
            <LogoBlock size={72} light />
          </div>
          {city ? <div style={{ display: "flex", fontFamily: "sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", opacity: 0.78, marginBottom: 20 }}>{city}</div> : null}
          <div style={{ fontSize: nameSize, lineHeight: 0.93, letterSpacing: -3, fontWeight: 400 }}>{name}</div>
          {motto || tagline ? <div style={{ display: "flex", marginTop: 24, fontSize: 30, lineHeight: 1.18, opacity: 0.92, maxWidth: 860, fontStyle: "italic" }}>{`"${motto ?? tagline}"`}</div> : null}
        </div>
        {cover ? (
          <div style={{ display: "flex", flexDirection: "row", gap: 16, marginBottom: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="" width={640} height={200} style={{ height: 200, flex: 1, borderRadius: 16, objectFit: "cover" }} />
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", background: cream, borderRadius: 16, padding: 22, minWidth: 240 }}>
              <div style={{ display: "flex", fontFamily: "sans-serif", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: "rgba(15,17,19,0.55)" }}>Shop the drop</div>
              <div style={{ display: "flex", marginTop: 6, fontSize: 22, fontWeight: 700, letterSpacing: -0.5, fontFamily: "sans-serif" }}>{url}</div>
            </div>
          </div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "sans-serif", fontSize: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", width: 14, height: 14, borderRadius: 7, background: accent }} />
            <span style={{ color: "rgba(15,17,19,0.7)" }}>Small brands. Real people. shopkindred.org</span>
          </div>
          {!cover ? <div style={{ display: "flex", fontSize: 22, fontWeight: 700 }}>{url}</div> : null}
        </div>
      </div>
    );
  }

  return new ImageResponse(el, { width: 1080, height: 1350 });
}
