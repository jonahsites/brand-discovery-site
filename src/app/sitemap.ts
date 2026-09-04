import type { MetadataRoute } from "next";
import { BRANDS, LOOKBOOKS, PRODUCTS } from "@/lib/data";
const base = "https://brand-discovery-site.vercel.app";
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...["", "/explore", "/brands", "/lookbooks", "/sell", "/onboarding"].map((p) => ({ url: base + p, lastModified: now })),
    ...BRANDS.map((b) => ({ url: `${base}/brand/${b.slug}`, lastModified: now })),
    ...PRODUCTS.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: now })),
    ...LOOKBOOKS.map((l) => ({ url: `${base}/lookbook/${l.slug}`, lastModified: now })),
  ];
}
