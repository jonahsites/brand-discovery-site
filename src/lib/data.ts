export type Batch = "one-off" | "small" | "medium" | "large";
export type Brand = {
  slug: string; name: string; init: string; city: string; country: string;
  tagline: string; items: number; followers: number; verified: boolean;
  tint: string; ink: string;
  /* Onboarding — the fields that drive filters and search */
  founded?: number; website?: string; story?: string;
  styles: string[];        // aesthetic tags e.g. "Workwear"
  moods: string[];         // how it feels e.g. "cozy", "rainy weekend"
  categories: string[];    // what they make
  materials: string[];     // fabrics
  values: string[];        // "Small batch", "Deadstock"
  madeIn: string; batch: Batch; gender: string[];
  priceBand: [number, number]; sizeRange: [string, string];
  shipsTo: string[]; shipsFrom: string;
  createdAt?: string;
  logo?: string; cover?: string; verification?: "pending";
  /* --- Personalisation the brand controls from Dashboard → Settings --- */
  accent?: string;          // hex, e.g. #4D6B52 — used as their page accent
  bg?: string;              // hex — the brand-page ground color
  headlineFont?: "serif" | "sans"; // display face for their h1/h2s
  intro?: string;           // longer paragraph shown on their brand page top
  quote?: string;           // pull quote (from press or a customer)
  quoteBy?: string;         // attribution
};
export type Promo = { id: string; brand: string; code: string; pct: number; label: string; products: string[] | "all"; ends?: string; active: boolean };
export type Drop = { id: string; brand: string; title: string; at: string; pieces: number; blurb: string; products: string[] };
export type OrderItem = { product: string; name: string; brand: string; variant: string; qty: number; unit: number };
export type Order = { id: string; placedAt: string; items: OrderItem[]; subtotal: number; shipping: number; total: number; status: "Placed" | "Packed" | "In transit" | "Delivered"; promo?: string; credit?: number; gift?: number };
export type GiftCard = { code: string; amount: number; balance: number; to: string; from: string; note?: string; at: string };
export type Review = { id: string; product: string; name: string; init: string; tint: string; stars: number; fit: 1 | 2 | 3; body: string; size: string; at: string };

export const BRANDS: Brand[] = [];

export const STYLE_OPTIONS = ["Japanese streetwear", "Minimalist", "Workwear", "Tailoring", "Techwear", "Vintage revival", "Knitwear", "Sustainable", "Avant-garde", "Skate", "Outdoors", "Archive", "Scandi", "Streetwear", "Designer", "Upcycled"];
export const MOOD_OPTIONS = ["cozy", "rugged", "clean", "beach", "office", "travel", "date night", "rainy weekend", "summer", "winter", "quiet", "loud", "relaxed", "polished", "worn-in", "soft", "heavy", "warm", "cold morning", "hiking", "cabin", "coastal", "everyday", "uniform"];
export const CATEGORY_OPTIONS = ["Outerwear", "Knitwear", "Shirting", "Trousers", "Footwear", "Accessories", "Dresses", "Denim", "Archive"];
export const MATERIAL_OPTIONS = ["Organic cotton", "Cotton canvas", "Linen", "Merino", "Wool", "Deadstock", "Recycled cotton", "Recycled polyester", "Hemp", "Tencel", "Ripstop nylon", "Waxed cotton", "Poplin", "Leather", "Denim"];
export const VALUE_OPTIONS = ["Small batch", "Deadstock", "Recycled", "Organic", "Made locally", "Repairs for life", "Fair wages", "Carbon neutral shipping", "Plastic-free", "Traceable materials", "No sales", "Limited runs"];
export const REGION_OPTIONS = ["EU", "UK", "US & Canada", "Japan", "Australia", "Worldwide"];
export const GENDER_OPTIONS = ["Unisex", "Women", "Men", "Kids"];
export const SIZE_LADDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"];
export const brandTier = (followers: number) => (followers < 1000 ? "Indie" : followers < 10000 ? "Rising" : "Established");

export const brandBySlug = (slug: string) => BRANDS.find((b) => b.slug === slug);
export const brandByName = (name: string) => BRANDS.find((b) => b.name === name)!;
export const fmtFollowers = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n));
export const brandMeta = (b: Brand) => `${b.items} items · ${fmtFollowers(b.followers)} followers`;

export type Product = {
  slug: string; brand: string; name: string; price: number; compareAt?: number;
  tag?: string; tagBg?: string; tagFg?: string; category: string;
  sizes?: string[]; colors?: string[]; materials?: string[]; tags?: string[];
  stock?: number; description?: string; createdAt?: string;
  image?: string; images?: string[];
  /** ISO date the piece ships if it is sold as a pre-order. */
  preorder?: string;
};
export type LookFrame = { image?: string; h: number; bg?: string; product?: string; x?: number; y?: number; label?: string };
export type Lookbook = { slug: string; brand: string; title: string; season: string; blurb: string; bg: string; frames: LookFrame[]; createdAt?: string };
export type Post = { id: string; brand: string; caption: string; image?: string; products: string[]; at: string; likes: number };
export type Message = { id: string; from: "shopper" | "brand"; text: string; at: string };
export type Thread = { id: string; brand: string; shopper: string; messages: Message[] };

export const PRODUCTS: Product[] = [];

export const productBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const productsForBrand = (slug: string) => PRODUCTS.filter((p) => p.brand === slug);
export const money = (n: number, cents = false) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });

export const CHIPS = ["All", "Outerwear", "Knitwear", "Footwear", "Accessories", "Streetwear", "Minimalist", "Sustainable", "Upcycled", "Designer"];

export const CATEGORIES = [
  { name: "Outerwear", n: 412 }, { name: "Knitwear", n: 308 }, { name: "Shirting", n: 266 },
  { name: "Trousers", n: 241 }, { name: "Footwear", n: 137 }, { name: "Accessories", n: 184 }, { name: "Archive", n: 62 },
];

export const ACCORDIONS = [
  ["Details", "Boxy fit with dropped shoulders and a four-panel front. Two flap chest pockets, corozo buttons, single-piece back yoke. Model is 6'1\" wearing L."],
  ["Materials & care", "14oz garment-dyed organic cotton canvas, woven in Portugal. Cold wash inside out, hang dry. Expect a half-size of shrink and honest fading at the seams."],
  ["Size guide", "Sizes run one up from standard streetwear. L fits a 42\" chest with room for a mid-layer. Chest, length and sleeve measurements are listed per size in the table."],
  ["Shipping & returns", "Ships from Rotterdam within 2–4 working days, tracked. Free returns within 30 days — Kindred covers the label on every order over $120."],
] as const;

export const REVIEWS: { stars: string; meta: string; body: string; init: string; tint: string }[] = [];

export const SIZES = ["L", "M", "XL", "XXL", "3XL"];
export const COLORS: [string, string][] = [["Faded black", "#121A24"], ["Bone", "#D6D9CE"], ["Sky", "#DCD5C7"], ["Slate", "#7C8C6F"]];

export type ShipOpt = { label: string; meta: string; cost: number };
export const SHIP_OPTS: Record<string, { from: string; opts: ShipOpt[] }> = {};
export const shipEstimate = (slug: string, fallbackFrom = "Workshop") => {
  const s = SHIP_OPTS[slug];
  if (!s) return `${fallbackFrom} · 5–8 days`;
  return `${s.from} · ${s.opts[0].meta.split(" · ")[0]}`;
};

export const LOOKS = [
  { ph: "Look 01 · full length", h: 520, bg: "stripes-wide", n: 1, x: 38, y: 34, product: "panel-work-jacket" },
  { ph: "Look 02 · detail", h: 340, bg: "#DCD5C7", n: 2, x: 62, y: 48, product: "corozo-overshirt" },
  { ph: "Look 03 · wide", h: 400, bg: "stripes-wide", n: 3, x: 28, y: 60, product: "wide-wool-trouser" },
  { ph: "Look 04 · portrait", h: 460, bg: "#121A24", n: 4, x: 50, y: 40, product: "duck-canvas-cap" },
  { ph: "Look 05 · full length", h: 560, bg: "stripes-wide", n: 5, x: 42, y: 52, product: "yoke-back-shirt" },
  { ph: "Look 06 · still life", h: 300, bg: "#E5DFD3", n: 6, x: 70, y: 36, product: "waxed-tote" },
];

export const LOOKBOOKS: Lookbook[] = [];
export const lookCount = (l: Lookbook) => ({ looks: l.frames.length, shoppable: l.frames.filter((f) => !!f.product).length });

export const STYLE_CHOICES = ["Japanese streetwear", "Minimalist", "Workwear", "Tailoring", "Techwear", "Vintage revival", "Knitwear", "Sustainable", "Avant-garde", "Skate", "Outdoors", "Archive"];

export const STEP_COPY = [
  ["What do you actually wear?", "Pick at least three. This is the only thing that shapes your For You feed, and you can change it any time.", "Pick 3 or more"],
  ["Your sizes, once.", "We'll hide anything that's sold out in your size instead of letting you fall in love with it first.", "You can add more later"],
  ["Follow five brands to start.", "Every one of these has fewer than 5,000 followers. Their drops will land at the top of your feed.", ""],
] as const;

export const RECENTS = ["studio arva", "boxy overshirt", "deadstock canvas", "made in portugal", "wide trouser"];
export const TREND_TAGS = ["Under $150", "New this week", "Deadstock", "Small batch", "Japanese denim", "Ships from EU", "Unisex", "Archive sale"];

export const ORDERS: { title: string; meta: string; status: string; tint: string; ink: string; total: string }[] = [];
export const STYLE_TAGS = ["Japanese streetwear", "Workwear", "Minimalist", "Deadstock", "Unisex", "Knitwear", "Under $200"];

export const POSTS: { ph: string; tag: string; caption: string; likes: string }[] = [];

export const DASH = {
  nav: ["Overview", "Products", "Orders", "Posts", "Lookbooks", "Followers", "Payouts", "Settings"],
  stats: [
    { label: "Sales · 30d", value: "$12,408", delta: "↑ 34% vs prev", bg: "#121A24", ink: "#F6F4EF" },
    { label: "Orders", value: "86", delta: "↑ 12 vs prev", bg: "#fff", ink: "#121A24" },
    { label: "Followers", value: "1,847", delta: "↑ 214 new", bg: "#DCD5C7", ink: "#121A24" },
    { label: "Profile views", value: "24.1k", delta: "↓ 4% vs prev", bg: "#fff", ink: "#121A24" },
  ],
  chart: Array.from({ length: 30 }, (_, i) => Math.round(30 + Math.abs(Math.sin(i * 1.7) * 62) + (i > 22 ? 34 : 0))),
  prodRows: [
    { name: "Panel Work Jacket", price: "$248", stock: "6 left", warn: true, rev: "$3,472" },
    { name: "Wide Wool Trouser", price: "$195", stock: "18", warn: false, rev: "$2,730" },
    { name: "Corozo Overshirt", price: "$178", stock: "Sold out", warn: true, rev: "$2,136" },
    { name: "Yoke Back Shirt", price: "$142", stock: "24", warn: false, rev: "$1,846" },
    { name: "Waxed Tote", price: "$96", stock: "41", warn: false, rev: "$1,152" },
  ],
  orderRows: [
    { name: "Jules Renard", meta: "#UN-40912 · Paris", total: "$443.00", init: "JR", tint: "#DCD5C7", ink: "#121A24" },
    { name: "Ada Mensah", meta: "#UN-40908 · Accra", total: "$248.00", init: "AM", tint: "#E5DFD3", ink: "#121A24" },
    { name: "Tomo Ishii", meta: "#UN-40901 · Kyoto", total: "$337.00", init: "TI", tint: "#7C8C6F", ink: "#fff" },
    { name: "Lena Bauer", meta: "#UN-40894 · Berlin", total: "$195.00", init: "LB", tint: "#121A24", ink: "#F6F4EF" },
    { name: "Sam Okoro", meta: "#UN-40887 · Lagos", total: "$96.00", init: "SO", tint: "#121A24", ink: "#fff" },
  ],
};
