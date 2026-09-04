import { BRANDS } from "@/lib/data";
import BrandView from "./BrandView";

export const dynamicParams = true;
export function generateStaticParams() { return BRANDS.map((b) => ({ slug: b.slug })); }
export async function generateMetadata({ params }: PageProps<"/brand/[slug]">) {
  const { slug } = await params;
  const b = BRANDS.find((x) => x.slug === slug);
  return { title: b ? b.name : "Brand" };
}
export default async function BrandPage({ params, searchParams }: PageProps<"/brand/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const tab = typeof sp.tab === "string" ? sp.tab : "Shop";
  return <BrandView slug={slug} initialTab={tab} />;
}
