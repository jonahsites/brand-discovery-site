import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/checkout", "/messages", "/account"] }, sitemap: "https://brand-discovery-site.vercel.app/sitemap.xml" };
}
