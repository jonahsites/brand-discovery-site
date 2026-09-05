"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import type { Brand, Product } from "@/lib/data";

/**
 * One-tap seed route so the site owner can test the seller-side flows (brand page, share sheet,
 * dashboard, ranking) without walking through the seven-step wizard. Visits from a signed-in
 * shopper create a fully-formed demo brand + three sample products + switch the session to
 * that brand's role, then redirect to /brand/kindred-labs.
 */
const DEMO_BRAND: Brand = {
  slug: "kindred-labs",
  name: "Kindred Labs",
  init: "KL",
  city: "Portland",
  country: "US",
  tagline: "Test brand · everything one shopper can see.",
  items: 3,
  followers: 24,
  verified: true,
  tint: "#EAEAE4",
  ink: "#0F1113",
  founded: 2026,
  website: "shopkindred.org",
  story: "Kindred Labs is the internal demo brand we spun up to test the seller-side flow — the sell wizard, the dashboard, the brand page, the share poster. If you're seeing this in production it's because someone visited /demo-brand while signed in. Feel free to look around, break things, and hit the dashboard to delete the brand when you're done.",
  styles: ["Minimalist", "Workwear", "Archive"],
  moods: ["clean", "everyday", "worn-in", "quiet"],
  categories: ["Outerwear", "Knitwear", "Shirting"],
  materials: ["Organic cotton", "Merino", "Waxed cotton"],
  values: ["Small batch", "Repairs for life", "Made locally"],
  madeIn: "Portland, OR",
  batch: "small",
  gender: ["Unisex"],
  priceBand: [68, 320],
  sizeRange: ["S", "XL"],
  shipsTo: ["US & Canada", "EU"],
  shipsFrom: "Portland",
  createdAt: new Date().toISOString(),
  accent: "#3A5A3F",
  headlineFont: "serif",
  intro: "Two people in a converted garage, one industrial machine, twenty-nine pieces on the rack at any given time. This is what a shop page on Kindred looks like when a brand fills in every field of onboarding and picks up the paint bucket to make it their own.",
  quote: "The clearest sign a small brand is real: they answer when you email them.",
  quoteBy: "You, when this thing works",
  plan: "signature",
};

const DEMO_PRODUCTS: Product[] = [
  { slug: "kindred-labs-heavy-tee", brand: "kindred-labs", name: "Heavy Cotton Tee", price: 68, category: "Shirting", sizes: ["S","M","L","XL"], colors: ["Bone","Ink"], materials: ["Organic cotton"], tags: ["heavyweight","everyday"], stock: 42, description: "A 12oz cotton tee that reads more like a light sweatshirt. Boxy shoulder, ribbed collar, dropped hem. Made in the Pacific Northwest.", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=75&auto=format&fit=crop", createdAt: new Date().toISOString() },
  { slug: "kindred-labs-chore-coat", brand: "kindred-labs", name: "Waxed Chore Coat", price: 285, compareAt: 320, category: "Outerwear", sizes: ["S","M","L","XL"], colors: ["Waxed olive"], materials: ["Waxed cotton"], tags: ["outer","workwear"], stock: 8, description: "Traditional chore coat cut, three patch pockets, waxed heavyweight cotton that ages into a wallet-of-your-hand patina over three winters.", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=75&auto=format&fit=crop", createdAt: new Date(Date.now() - 3 * 864e5).toISOString() },
  { slug: "kindred-labs-merino", brand: "kindred-labs", name: "Ribbed Merino Crew", price: 178, category: "Knitwear", sizes: ["S","M","L"], colors: ["Fawn","Salt"], materials: ["Merino"], tags: ["knit","cold"], stock: 14, description: "Fine gauge merino, ribbed body, boat neck. Cut to sit an inch below the belt. One of those knits you throw over anything.", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&q=75&auto=format&fit=crop", createdAt: new Date(Date.now() - 6 * 864e5).toISOString() },
];

export default function ClientDemoBrand() {
  const { upsertBrand, upsertProduct, setSession, account, hydrated, toast } = useApp();
  const router = useRouter();
  const [done, setDone] = useState(false);
  const seededRef = useRef(false);
  const needsSignIn = hydrated && !account?.signedIn;

  useEffect(() => {
    if (!hydrated || seededRef.current || !account?.signedIn) return;
    seededRef.current = true;
    upsertBrand(DEMO_BRAND);
    for (const p of DEMO_PRODUCTS) upsertProduct(p);
    setSession({ role: "brand", name: account.name || "You", brand: DEMO_BRAND.slug });
    toast("Kindred Labs demo brand created");
    setDone(true);
    const t = setTimeout(() => router.push(`/brand/${DEMO_BRAND.slug}`), 800);
    return () => clearTimeout(t);
  }, [hydrated, account, upsertBrand, upsertProduct, setSession, router, toast]);

  const message = needsSignIn
    ? "Sign in first, then come back to this URL."
    : done
      ? "Brand created. Taking you to the brand page…"
      : "Creating a demo brand, three products, and switching your session to brand-role.";

  return (
    <div className="grid min-h-screen place-items-center bg-paper p-6 text-center">
      <div className="card max-w-[440px] rounded-lg p-8">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[.14em] text-ink/50">Founder tools</div>
        <h1 className="mb-3 text-[30px] leading-[1] tracking-[-.015em]" style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}>Seeding Kindred Labs.</h1>
        <p className="mb-4 text-[13px] leading-[1.55] text-ink/60">{message}</p>
        <div className="text-[11px] text-ink/40">You can delete the brand any time from Dashboard → Settings.</div>
      </div>
    </div>
  );
}
