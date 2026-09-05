/**
 * One place for every meta tag Kindred ships. Every route that wants SEO calls `seo(...)`
 * or `productSeo(...)` / `brandSeo(...)` / `lookbookSeo(...)`. All URLs are absolute so they
 * validate as Open Graph and land correctly on other platforms.
 */
import type { Metadata } from "next";
import { BRANDS, PRODUCTS, LOOKBOOKS, type Brand, type Product, type Lookbook } from "./data";

export const SITE = {
  name: "Kindred",
  tagline: "Small clothing brands, not small ambition.",
  description:
    "Kindred is the marketplace for independent clothing brands. Search by how you feel, filter by materials, values and where a piece is made, and buy from many small labels in one bag and one checkout.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://brand-discovery-site.vercel.app").replace(/\/$/, ""),
  ogImage: "/opengraph-image",
  locale: "en_US",
  twitter: "@kindredshop",
  keywords: [
    "independent clothing brands",
    "small clothing labels",
    "slow fashion marketplace",
    "shop indie fashion",
    "sustainable clothing marketplace",
    "deadstock clothing",
    "made in europe clothing",
    "made to order clothing",
    "workwear brands",
    "minimalist clothing",
    "japanese streetwear",
    "knitwear brands",
    "linen shirts",
    "small batch clothing",
    "find new clothing brands",
    "type how you feel shopping",
    "Kindred", "Kindred clothing", "Kindred shop", "Kindred marketplace",
  ],
} as const;

export const absUrl = (path: string) => (path.startsWith("http") ? path : `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`);

type SeoInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: readonly string[];
  type?: "website" | "article" | "product" | "profile";
  noIndex?: boolean;
};

/** Build the full Metadata object for a route. Titles get the `· Kindred` suffix from layout.tsx. */
export function seo({ title, description, path, image, keywords = [], type = "website", noIndex }: SeoInput): Metadata {
  const url = absUrl(path);
  const img = image ? absUrl(image) : absUrl(SITE.ogImage);
  return {
    title,
    description,
    keywords: [...keywords, ...SITE.keywords].slice(0, 24),
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · ${SITE.name}`,
      description,
      url,
      siteName: SITE.name,
      type: type === "product" ? "website" : type, // OG spec does not list "product" for site-wide
      locale: SITE.locale,
      images: [{ url: img, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title: `${title} · ${SITE.name}`, description, images: [img], creator: SITE.twitter, site: SITE.twitter },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  };
}

/* --------------------------------- Per-entity ---------------------------------- */

export function productSeo(p: Product): Metadata {
  const b = BRANDS.find((x) => x.slug === p.brand);
  const bits = [p.category, ...(p.materials ?? []).slice(0, 2), b?.madeIn && `made in ${b.madeIn}`].filter(Boolean).join(", ");
  const desc = p.description
    ? `${p.description.replace(/\s+/g, " ").slice(0, 155)}${p.description.length > 155 ? "…" : ""}`
    : `${p.name} by ${b?.name ?? "an independent brand"} on Kindred${bits ? ` — ${bits}` : ""}. Shop the piece and 100+ other independent labels in one bag.`;
  return seo({
    title: `${p.name} · ${b?.name ?? "Kindred"}`,
    description: desc,
    path: `/product/${p.slug}`,
    image: p.image,
    type: "product",
    keywords: [p.name, p.category, ...(p.materials ?? []), ...(p.tags ?? []), b?.name ?? "", ...(b?.styles ?? [])].filter(Boolean) as string[],
  });
}

export function brandSeo(b: Brand): Metadata {
  const desc = `${b.tagline} — ${b.city}, ${b.country}. ${b.styles.slice(0, 3).join(", ")}${b.materials.length ? ` in ${b.materials.slice(0, 2).join(" and ")}` : ""}. Shop ${b.name} and other independent labels on Kindred.`;
  return seo({
    title: b.name,
    description: desc.slice(0, 300),
    path: `/brand/${b.slug}`,
    image: b.cover ?? b.logo,
    type: "profile",
    keywords: [b.name, ...b.styles, ...b.values, ...b.materials, b.madeIn, "independent clothing brand"].filter(Boolean) as string[],
  });
}

export function lookbookSeo(l: Lookbook): Metadata {
  const b = BRANDS.find((x) => x.slug === l.brand);
  return seo({
    title: `${l.title} · ${b?.name ?? "Lookbook"}`,
    description: `${l.blurb} A shoppable ${l.season.toLowerCase()} lookbook by ${b?.name ?? "an independent brand"} on Kindred.`,
    path: `/lookbook/${l.slug}`,
    image: l.frames.find((f) => f.image)?.image,
    type: "article",
    keywords: [l.title, l.season, b?.name ?? "", ...(b?.styles ?? []), "lookbook", "shoppable lookbook"].filter(Boolean) as string[],
  });
}

/* --------------------------------- JSON-LD ----------------------------------- */

export const orgJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  logo: absUrl("/icon.svg"),
  sameAs: ["https://x.com/kindredshop", "https://instagram.com/kindredshop"],
});

export const siteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  potentialAction: { "@type": "SearchAction", target: `${SITE.url}/explore?q={q}`, "query-input": "required name=q" },
});

export const productJsonLd = (p: Product) => {
  const b = BRANDS.find((x) => x.slug === p.brand);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description ?? `${p.name} by ${b?.name ?? "an independent brand"} on Kindred.`,
    sku: p.slug,
    category: p.category,
    image: [p.image, ...(p.images ?? [])].filter(Boolean),
    brand: b ? { "@type": "Brand", name: b.name } : undefined,
    material: p.materials?.join(", ") || undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: p.price.toFixed(2),
      availability: p.stock === 0 ? "https://schema.org/OutOfStock" : p.preorder ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
      url: absUrl(`/product/${p.slug}`),
      seller: b ? { "@type": "Organization", name: b.name } : undefined,
    },
  };
};

export const brandJsonLd = (b: Brand) => ({
  "@context": "https://schema.org",
  "@type": "Brand",
  name: b.name,
  description: b.tagline,
  url: absUrl(`/brand/${b.slug}`),
  logo: b.logo ? absUrl(b.logo) : undefined,
  image: b.cover ? absUrl(b.cover) : undefined,
  slogan: b.tagline,
  foundingLocation: `${b.city}, ${b.country}`,
  foundingDate: b.founded ? `${b.founded}` : undefined,
});

export const breadcrumbJsonLd = (trail: [string, string][]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: absUrl(path) })),
});

/** Turn a JSON-LD object into a <script type="application/ld+json"> body. */
export const ldScript = (obj: unknown) => JSON.stringify(obj);

/* --------------------------------- Route defaults --------------------------------- */

export const ROUTE_META: Record<string, SeoInput> = {
  "/": {
    title: "Kindred · Independent clothing brand marketplace",
    description: "Kindred is the marketplace for independent clothing brands. Discover small labels you'd never find on Amazon or Instagram alone; buy from many in one bag, one checkout, one place.",
    path: "/",
  },
  "/explore": {
    title: "Explore clothing from independent brands",
    description: "Browse every piece from every independent label on Kindred. Filter by category, size, materials, values, lead time and studio, or type how you feel to search.",
    path: "/explore",
  },
  "/brands": {
    title: "Independent clothing brands",
    description: `Every independent clothing brand on Kindred, filtered by style, values, country and size. ${BRANDS.length} labels live, most under 5,000 followers.`,
    path: "/brands",
  },
  "/lookbooks": {
    title: "Shoppable lookbooks",
    description: `Editorial, but shoppable. ${LOOKBOOKS.length} lookbooks from independent brands with tap-to-shop hotspots on every look.`,
    path: "/lookbooks",
  },
  "/feed": { title: "Discover new brands", description: "One brand at a time. Swipe through independent labels on Kindred.", path: "/feed" },
  "/gift": {
    title: "Kindred gift cards",
    description: "Give someone their next favorite brand. A Kindred gift card spends at any workshop here, in one bag and one checkout. The balance never expires.",
    path: "/gift",
  },
  "/sell": {
    title: "Sell on Kindred",
    description: "Open a brand account in five minutes. One honest onboarding turns into your filters, your search results, and a brand page shoppers actually read. Keep your workshop, your shipping, your customers.",
    path: "/sell",
    keywords: ["sell independent clothing", "clothing marketplace for makers", "list your clothing brand", "small brand ecommerce"],
  },
  "/login": { title: "Log in", description: "Log in to Kindred.", path: "/login", noIndex: true },
  "/signup": { title: "Join Kindred", description: "Create a Kindred account and get a marketplace dressed for the way you dress.", path: "/signup" },
  "/onboarding": { title: "Your style, your look", description: "Three questions. Kindred rearranges itself around what you actually wear.", path: "/onboarding", noIndex: true },
  "/account": { title: "Your account", description: "Your saved pieces, boards, orders and style profile.", path: "/account", noIndex: true },
  "/bag": { title: "Your bag", description: "Your bag on Kindred.", path: "/bag", noIndex: true },
  "/checkout": { title: "Checkout", description: "Kindred checkout.", path: "/checkout", noIndex: true },
  "/messages": { title: "Messages", description: "Your conversations with brands.", path: "/messages", noIndex: true },
  "/dashboard": { title: "Brand dashboard", description: "Your Kindred brand dashboard.", path: "/dashboard", noIndex: true },
  "/verify-email": { title: "Check your email", description: "Confirm your Kindred email address.", path: "/verify-email", noIndex: true },
  "/forgot-password": { title: "Forgot your password", description: "Reset your Kindred password.", path: "/forgot-password", noIndex: true },
  "/reset-password": { title: "Reset your password", description: "Set a new Kindred password.", path: "/reset-password", noIndex: true },
  "/design-system": { title: "Design system", description: "The Kindred v2 design system.", path: "/design-system", noIndex: true },
};

/** Convenience: build metadata for one of the static routes above. */
export const routeSeo = (route: keyof typeof ROUTE_META): Metadata => seo(ROUTE_META[route]);

// Ensure the imports above are seen as used even when only their types matter to the compiler.
export type { Brand, Product, Lookbook };
export const _productCount = PRODUCTS.length;
