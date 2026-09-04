import type { MetadataRoute } from "next";
import { BRANDS, LOOKBOOKS, PRODUCTS } from "@/lib/data";
import { SITE, absUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const home = { url: SITE.url + "/", lastModified: now, changeFrequency: "daily" as const, priority: 1 };
  const staticRoutes = ["/explore", "/brands", "/lookbooks", "/gift", "/sell", "/design-system", "/signup"].map((p) => ({
    url: absUrl(p), lastModified: now, changeFrequency: "weekly" as const, priority: 0.9,
  }));
  const brands = BRANDS.map((b) => ({
    url: absUrl(`/brand/${b.slug}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.8,
  }));
  const products = PRODUCTS.map((p) => ({
    url: absUrl(`/product/${p.slug}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.7,
  }));
  const lookbooks = LOOKBOOKS.map((l) => ({
    url: absUrl(`/lookbook/${l.slug}`), lastModified: now, changeFrequency: "monthly" as const, priority: 0.6,
  }));
  return [home, ...staticRoutes, ...brands, ...products, ...lookbooks];
}
