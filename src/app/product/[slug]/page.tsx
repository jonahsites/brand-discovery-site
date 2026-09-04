import { notFound } from "next/navigation";
import { PRODUCTS, productBySlug } from "@/lib/data";
import ProductView from "./ProductView";

export function generateStaticParams() { return PRODUCTS.map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  return { title: productBySlug(slug)?.name ?? "Product" };
}
export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) notFound();
  return <ProductView p={p} />;
}
