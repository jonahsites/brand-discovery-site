import { BRANDS } from "@/lib/data";
import { brandSeo, brandJsonLd, breadcrumbJsonLd, ldScript, absUrl } from "@/lib/seo";
import BrandView from "./BrandView";

// Every brand row lives in Supabase/localStorage — nothing to prerender at build time.
// Force per-request rendering so Next doesn't try to build a static shell for an empty catalogue.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/brand/[slug]">) {
  const { slug } = await params;
  const b = BRANDS.find((x) => x.slug === slug);
  return b ? brandSeo(b) : { title: "Brand not found", robots: { index: false, follow: false } };
}

export default async function BrandPage({ params }: PageProps<"/brand/[slug]">) {
  const { slug } = await params;
  const b = BRANDS.find((x) => x.slug === slug);
  return (
    <>
      {b && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldScript(brandJsonLd(b)) }} />}
      {b && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldScript(breadcrumbJsonLd([["Kindred", "/"], ["Brands", "/brands"], [b.name, `/brand/${b.slug}`]])) }} />}
      <link rel="canonical" href={absUrl(`/brand/${slug}`)} />
      <BrandView slug={slug} />
    </>
  );
}
