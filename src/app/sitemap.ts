import type { MetadataRoute } from "next";
import { SITE, absUrl } from "@/lib/seo";
import { getServiceClient } from "@/lib/supabase-server";

// Cache the sitemap for an hour — sitemaps don't need to be minute-fresh and the query hits
// three tables. Next revalidates on demand when publishing a new brand/product anyway.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const home = { url: SITE.url + "/", lastModified: now, changeFrequency: "daily" as const, priority: 1 };
  // /signup lives behind the noindex robots rule; keep it out of the sitemap too.
  const staticRoutes = ["/explore", "/brands", "/feed", "/lookbooks", "/gift", "/sell", "/design-system", "/about", "/contact", "/privacy", "/terms", "/shipping-and-returns"].map((p) => ({
    url: absUrl(p), lastModified: now, changeFrequency: "weekly" as const, priority: 0.9,
  }));

  const sb = getServiceClient();
  let brandRows: { slug: string; created_at?: string }[] = [];
  let productRows: { slug: string; is_deleted?: boolean; created_at?: string }[] = [];
  let lookbookRows: { slug: string; created_at?: string }[] = [];
  if (sb) {
    const [b, p, l] = await Promise.all([
      sb.from("brands").select("slug, created_at"),
      sb.from("products").select("slug, is_deleted, created_at"),
      sb.from("lookbooks").select("slug, created_at"),
    ]);
    brandRows = (b.data ?? []) as typeof brandRows;
    productRows = ((p.data ?? []) as typeof productRows).filter((x) => !x.is_deleted);
    lookbookRows = (l.data ?? []) as typeof lookbookRows;
  }

  const brands = brandRows.map((b) => ({
    url: absUrl(`/brand/${b.slug}`), lastModified: b.created_at ? new Date(b.created_at) : now,
    changeFrequency: "weekly" as const, priority: 0.8,
  }));
  const products = productRows.map((p) => ({
    url: absUrl(`/product/${p.slug}`), lastModified: p.created_at ? new Date(p.created_at) : now,
    changeFrequency: "weekly" as const, priority: 0.7,
  }));
  const lookbooks = lookbookRows.map((l) => ({
    url: absUrl(`/lookbook/${l.slug}`), lastModified: l.created_at ? new Date(l.created_at) : now,
    changeFrequency: "monthly" as const, priority: 0.6,
  }));
  return [home, ...staticRoutes, ...brands, ...products, ...lookbooks];
}
