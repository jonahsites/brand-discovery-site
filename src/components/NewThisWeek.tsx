"use client";
/**
 * A BrandRail specialisation showing only brands whose createdAt is within
 * the last 14 days. Renders nothing when there are no fresh brands, so the
 * empty state on a quiet site is invisible rather than embarrassing.
 */
import type { Brand, Product } from "@/lib/data";
import BrandRail from "@/components/BrandRail";

export default function NewThisWeek({
  brands,
  products,
  windowDays = 14,
}: {
  brands: Brand[];
  products: Product[];
  windowDays?: number;
}) {
  const cutoff = Date.now() - windowDays * 864e5;
  const fresh = brands
    .filter((b) => b.createdAt && Date.parse(b.createdAt) >= cutoff)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 12);
  if (fresh.length === 0) return null;
  const heroFor = (slug: string) => products.find((p) => p.brand === slug && !!p.image);
  return (
    <BrandRail
      eyebrow="Fresh · this week"
      title="New brands just landed"
      href="/brands?sort=Newest"
      linkLabel="All new"
      brands={fresh}
      variant="portrait"
      productFor={heroFor}
      newBadgeFor={() => true}
    />
  );
}
