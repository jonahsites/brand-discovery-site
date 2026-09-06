import { brandSeo, brandJsonLd, breadcrumbJsonLd, ldScript, absUrl } from "@/lib/seo";
import { getServiceClient } from "@/lib/supabase-server";
import type { Brand } from "@/lib/data";
import BrandView from "./BrandView";

// Every brand row lives in Supabase — nothing to prerender at build time.
// Force per-request rendering so Next doesn't try to build a static shell for an empty catalogue.
export const dynamic = "force-dynamic";

/** Row-to-type mapper kept here (rather than imported from db.ts) so this server module
 *  doesn't pull the browser-only Supabase client. Only the fields metadata reads are mapped. */
type BrandRow = {
  slug: string; name: string; init: string; city: string; country: string;
  tagline: string; items: number; followers: number; verified: boolean;
  tint: string; ink: string; founded: number | null; website: string | null; story: string | null;
  styles: string[]; moods: string[]; categories: string[]; materials: string[]; values: string[];
  made_in: string; batch: string; gender: string[]; price_min: number; price_max: number;
  size_min: string; size_max: string; ships_to: string[]; ships_from: string;
  logo: string | null; cover: string | null;
};
async function fetchBrand(slug: string): Promise<Brand | undefined> {
  const sb = getServiceClient();
  if (!sb) return undefined;
  const { data } = await sb.from("brands").select("*").eq("slug", slug).maybeSingle();
  if (!data) return undefined;
  const r = data as BrandRow;
  return {
    slug: r.slug, name: r.name, init: r.init, city: r.city, country: r.country,
    tagline: r.tagline, items: r.items, followers: r.followers, verified: r.verified,
    tint: r.tint, ink: r.ink, founded: r.founded ?? undefined, website: r.website ?? undefined, story: r.story ?? undefined,
    styles: r.styles ?? [], moods: r.moods ?? [], categories: r.categories ?? [], materials: r.materials ?? [],
    values: r.values ?? [], madeIn: r.made_in ?? "", batch: (r.batch ?? "small") as Brand["batch"],
    gender: r.gender ?? [], priceBand: [r.price_min ?? 0, r.price_max ?? 0],
    sizeRange: [r.size_min ?? "S", r.size_max ?? "XL"], shipsTo: r.ships_to ?? [], shipsFrom: r.ships_from ?? "",
    logo: r.logo ?? undefined, cover: r.cover ?? undefined,
  };
}

export async function generateMetadata({ params }: PageProps<"/brand/[slug]">) {
  const { slug } = await params;
  const b = await fetchBrand(slug);
  return b ? brandSeo(b) : { title: "Brand not found", robots: { index: false, follow: false } };
}

export default async function BrandPage({ params }: PageProps<"/brand/[slug]">) {
  const { slug } = await params;
  const b = await fetchBrand(slug);
  return (
    <>
      {b && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldScript(brandJsonLd(b)) }} />}
      {b && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldScript(breadcrumbJsonLd([["Kindred", "/"], ["Brands", "/brands"], [b.name, `/brand/${b.slug}`]])) }} />}
      <link rel="canonical" href={absUrl(`/brand/${slug}`)} />
      <BrandView slug={slug} />
    </>
  );
}
