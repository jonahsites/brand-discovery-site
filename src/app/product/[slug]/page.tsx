import { PRODUCTS } from "@/lib/data";
import ProductView from "./ProductView";

export const dynamicParams = true;
export function generateStaticParams() { return PRODUCTS.map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  return { title: PRODUCTS.find((p) => p.slug === slug)?.name ?? "Product" };
}
export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  return <ProductView slug={slug} />;
}
