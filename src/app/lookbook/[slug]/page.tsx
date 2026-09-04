import { LOOKBOOKS } from "@/lib/data";
import { lookbookSeo, breadcrumbJsonLd, ldScript, absUrl } from "@/lib/seo";
import LookbookView from "./LookbookView";

export const dynamicParams = true;
export function generateStaticParams() { return LOOKBOOKS.map((l) => ({ slug: l.slug })); }

export async function generateMetadata({ params }: PageProps<"/lookbook/[slug]">) {
  const { slug } = await params;
  const l = LOOKBOOKS.find((x) => x.slug === slug);
  return l ? lookbookSeo(l) : { title: "Lookbook not found", robots: { index: false, follow: false } };
}

export default async function LookbookPage({ params }: PageProps<"/lookbook/[slug]">) {
  const { slug } = await params;
  const l = LOOKBOOKS.find((x) => x.slug === slug);
  return (
    <>
      {l && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldScript(breadcrumbJsonLd([["Kindred", "/"], ["Lookbooks", "/lookbooks"], [l.title, `/lookbook/${l.slug}`]])) }} />}
      <link rel="canonical" href={absUrl(`/lookbook/${slug}`)} />
      <LookbookView slug={slug} />
    </>
  );
}
