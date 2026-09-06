import type { Metadata } from "next";
import CelebrateClient from "./CelebrateClient";

export const dynamic = "force-dynamic";

// Owner-only takeover — hide from crawlers and OG previews.
export const metadata: Metadata = {
  title: "Your page is live",
  robots: { index: false, follow: false },
};

export default async function CelebratePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CelebrateClient slug={slug} />;
}
