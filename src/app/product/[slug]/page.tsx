import { productSeo, productJsonLd, breadcrumbJsonLd, ldScript, absUrl } from "@/lib/seo";
import { getServiceClient } from "@/lib/supabase-server";
import type { Brand, Product } from "@/lib/data";
import ProductView from "./ProductView";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type ProductRow = {
  slug: string; brand_slug: string; name: string; price: number; compare_at: number | null;
  tag: string | null; tag_bg: string | null; tag_fg: string | null; category: string;
  sizes: string[]; colors: string[]; materials: string[]; tags: string[];
  stock: number | null; description: string | null; image: string | null; images: string[];
  preorder: string | null; is_deleted?: boolean;
};
type BrandLite = { slug: string; name: string; city: string; country: string; styles: string[]; values: string[]; materials: string[]; made_in: string };

async function fetchProductAndBrand(slug: string): Promise<{ p?: Product; b?: Brand }> {
  const sb = getServiceClient();
  if (!sb) return {};
  const { data: p } = await sb.from("products").select("*").eq("slug", slug).maybeSingle();
  if (!p || (p as ProductRow).is_deleted) return {};
  const pr = p as ProductRow;
  const { data: br } = await sb.from("brands").select("slug,name,city,country,styles,values,materials,made_in").eq("slug", pr.brand_slug).maybeSingle();
  const b = br ? {
    slug: (br as BrandLite).slug, name: (br as BrandLite).name, init: (br as BrandLite).name.slice(0, 2).toUpperCase(),
    city: (br as BrandLite).city, country: (br as BrandLite).country, tagline: "",
    items: 0, followers: 0, verified: false, tint: "#EAEAE4", ink: "#0F1113",
    styles: (br as BrandLite).styles ?? [], moods: [], categories: [], materials: (br as BrandLite).materials ?? [],
    values: (br as BrandLite).values ?? [], madeIn: (br as BrandLite).made_in ?? "", batch: "small" as Brand["batch"],
    gender: [], priceBand: [0, 0] as [number, number], sizeRange: ["S", "XL"] as [string, string],
    shipsTo: [], shipsFrom: "",
  } satisfies Brand : undefined;
  const product: Product = {
    slug: pr.slug, brand: pr.brand_slug, name: pr.name, price: pr.price,
    compareAt: pr.compare_at ?? undefined, tag: pr.tag ?? undefined,
    tagBg: pr.tag_bg ?? undefined, tagFg: pr.tag_fg ?? undefined, category: pr.category ?? "",
    sizes: pr.sizes ?? undefined, colors: pr.colors ?? undefined,
    materials: pr.materials ?? undefined, tags: pr.tags ?? undefined,
    stock: pr.stock ?? undefined, description: pr.description ?? undefined,
    image: pr.image ?? undefined, images: pr.images ?? undefined,
    preorder: pr.preorder ?? undefined,
  };
  return { p: product, b };
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const { p } = await fetchProductAndBrand(slug);
  return p ? productSeo(p) : { title: "Piece not found", robots: { index: false, follow: false } };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const { p, b } = await fetchProductAndBrand(slug);
  return (
    <>
      {p && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldScript(productJsonLd(p)) }} />}
      {p && b && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldScript(breadcrumbJsonLd([["Kindred", "/"], ["Explore", "/explore"], [b.name, `/brand/${b.slug}`], [p.name, `/product/${p.slug}`]])) }} />}
      <link rel="canonical" href={absUrl(`/product/${slug}`)} />
      <ProductView slug={slug} />
    </>
  );
}
