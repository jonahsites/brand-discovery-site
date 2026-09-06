"use client";
/**
 * Owner-only re-triggerable celebration. Renders the full-viewport takeover
 * for the brand owner; anyone else lands on the public page instead. Dismiss
 * sends the owner into edit mode on their own brand page.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import PublishCelebration, { markCelebrated } from "@/components/PublishCelebration";

export default function CelebrateClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { brands, session, hydrated } = useApp();
  const b = brands.find((x) => x.slug === slug);
  const isOwner = session.role === "brand" && session.brand === slug;

  // Non-owner or missing brand — quietly redirect to the public brand page.
  useEffect(() => {
    if (!hydrated) return;
    if (!b || !isOwner) router.replace(`/brand/${slug}`);
  }, [hydrated, b, isOwner, router, slug]);

  if (!hydrated || !b || !isOwner) return null;

  return (
    <PublishCelebration
      b={b}
      onDismiss={() => {
        markCelebrated(b.slug);
        router.push(`/brand/${b.slug}?edit=1`);
      }}
    />
  );
}
