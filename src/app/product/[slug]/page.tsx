import { PRODUCTS, BRANDS } from "@/lib/data";
import { productSeo, productJsonLd, breadcrumbJsonLd, ldScript, absUrl } from "@/lib/seo";
import ProductView from "./ProductView";

export const dynamicParams = true;
export function generateStaticParams() { return PRODUCTS.map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const p = PRODUCTS.find((x) => x.slug === slug);
  return p ? productSeo(p) : { title: "Piece not found", robots: { index: false, follow: false } };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const p = PRODUCTS.find((x) => x.slug === slug);
  const b = p ? BRANDS.find((x) => x.slug === p.brand) : undefined;
  return (
    <>
      {p && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldScript(productJsonLd(p)) }} />}
      {p && b && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldScript(breadcrumbJsonLd([["Kindred", "/"], ["Explore", "/explore"], [b.name, `/brand/${b.slug}`], [p.name, `/product/${p.slug}`]])) }} />}
      <link rel="canonical" href={absUrl(`/product/${slug}`)} />
      <ProductView slug={slug} />
    </>
  );
}
