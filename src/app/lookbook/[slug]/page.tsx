import { LOOKBOOKS } from "@/lib/data";
import LookbookView from "./LookbookView";

export const dynamicParams = true;
export function generateStaticParams() { return LOOKBOOKS.map((l) => ({ slug: l.slug })); }
export default async function LookbookPage({ params }: PageProps<"/lookbook/[slug]">) {
  const { slug } = await params;
  return <LookbookView slug={slug} />;
}
