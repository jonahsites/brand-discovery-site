import { BRANDS } from "@/lib/data";
import { brandSeo, brandJsonLd, breadcrumbJsonLd, ldScript, absUrl } from "@/lib/seo";
import BrandView from "./BrandView";

export const dynamicParams = true;
export function generateStaticParams() { return BRANDS.map((b) => ({ slug: b.slug })); }

export async function generateMetadata({ params }: PageProps<"/brand/[slug]">) {
  const { slug } = await params;
  const b = BRANDS.find((x) => x.slug === slug);
  return b ? brandSeo(b) : { title: "Brand not found", robots: { index: false, follow: false } };
}

export default async function BrandPage({ params, searchParams }: PageProps<"/brand/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const tab = typeof sp.tab === "string" ? sp.tab : "Shop";
  const b = BRANDS.find((x) => x.slug === slug);
  return (
    <>
      {b && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldScript(brandJsonLd(b)) }} />}
      {b && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldScript(breadcrumbJsonLd([["Kindred", "/"], ["Brands", "/brands"], [b.name, `/brand/${b.slug}`]])) }} />}
      <link rel="canonical" href={absUrl(`/brand/${slug}`)} />
      <BrandView slug={slug} initialTab={tab} />
    </>
  );
}
