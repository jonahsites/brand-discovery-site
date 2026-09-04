import Link from "next/link";
import { seo } from "@/lib/seo";
import { LegalPage, LegalH2 } from "@/components/LegalPage";
import { BRANDS } from "@/lib/data";

export const metadata = seo({
  title: "About Kindred",
  description: "Kindred is a marketplace for independent clothing brands. What we make, why, and how we split the money.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <LegalPage kicker="About" title="A marketplace built for the makers." updated="September 2026">
      <p>Kindred is a marketplace for small independent clothing brands. One bag, one checkout, dozens of workshops. We built it because we kept hearing the same story: shoppers can&apos;t find the labels they&apos;d actually love, and small brands can&apos;t reach them without either giving up their margin to ad platforms or their soul to a big retailer.</p>
      <LegalH2>What Kindred is not</LegalH2>
      <p>Not a fast-fashion aggregator. Not a re-seller — we never hold your inventory. Not a social network with a shop bolted on. The feed is optional; the marketplace is the point.</p>
      <LegalH2>How we make money</LegalH2>
      <p>Brands keep 100% for their first 90 days. After that, Kindred takes 8% of each order. Nothing else — no listing fee, no featured-placement upcharge, no monthly plan.</p>
      <LegalH2>Who&apos;s on Kindred</LegalH2>
      <p>{BRANDS.length} independent labels at launch, most under 5,000 followers, most producing in small runs, many made-to-order. Onboarding takes five minutes and asks about the questions shoppers actually care about — where a piece is made, what it&apos;s made of, how many pieces exist.</p>
      <LegalH2>Who runs it</LegalH2>
      <p>A small team in Paris and Portland. If you want to reach us, <Link href="/contact" className="font-semibold text-ink underline">say hello here</Link>.</p>
    </LegalPage>
  );
}
