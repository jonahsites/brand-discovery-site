import { notFound } from "next/navigation";
import { LOOKBOOKS } from "@/lib/data";
import LookbookView from "./LookbookView";

export function generateStaticParams() { return LOOKBOOKS.map((l) => ({ slug: l.slug })); }
export default async function LookbookPage({ params }: PageProps<"/lookbook/[slug]">) {
  const { slug } = await params;
  const l = LOOKBOOKS.find((x) => x.slug === slug);
  if (!l) notFound();
  return <LookbookView l={l} />;
}
