import { notFound } from "next/navigation";
import { BRANDS, brandBySlug } from "@/lib/data";
import BrandView from "./BrandView";

export function generateStaticParams() { return BRANDS.map((b) => ({ slug: b.slug })); }
export async function generateMetadata({ params }: PageProps<"/brand/[slug]">) {
  const { slug } = await params;
  const b = brandBySlug(slug);
  return { title: b ? b.name : "Brand" };
}

export default async function BrandPage({ params, searchParams }: PageProps<"/brand/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const b = brandBySlug(slug);
  if (!b) notFound();
  const tab = typeof sp.tab === "string" ? sp.tab : "Shop";
  return <BrandView b={b} initialTab={tab} />;
}
