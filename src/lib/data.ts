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
  bg?: string;              // hex — the brand-page ground colour
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

export const BRANDS: Brand[] = [
  { slug: "form-and-void", cover: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&q=70&auto=format&fit=crop", name: "Form & Void", init: "FV", city: "Rotterdam", country: "NL", tagline: "Workwear cut from one bolt at a time", items: 22, followers: 1847, verified: true, tint: "#E5DFD3", ink: "#121A24",
    founded: 2021, website: "formandvoid.nl", story: "Started when Wies and Tomas bought a roll of deadstock cotton duck from a shuttered sailmaker two streets over. Six jackets, sold to friends, no business plan. Everything is still made in the same room above a bike shop.",
    styles: ["Workwear", "Minimalist", "Archive"], moods: ["rugged", "rainy weekend", "utilitarian", "heavy", "worn-in", "outdoors", "cold morning"], categories: ["Outerwear", "Trousers", "Shirting", "Accessories"], materials: ["Cotton canvas", "Deadstock", "Wool", "Waxed cotton"], values: ["Small batch", "Deadstock", "Repairs for life", "Made locally"], madeIn: "Rotterdam, NL", batch: "small", gender: ["Unisex"], priceBand: [64, 268], sizeRange: ["S", "XXL"], shipsTo: ["EU", "UK", "US & Canada"], shipsFrom: "Rotterdam" },
  { slug: "studio-arva", cover: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=70&auto=format&fit=crop", name: "Studio Arva", init: "SA", city: "Lisbon", country: "PT", tagline: "Heavyweight cotton, no seasons", items: 14, followers: 892, verified: true, tint: "#DCD5C7", ink: "#121A24",
    founded: 2022, website: "studioarva.pt", story: "A two-person Lisbon workshop cutting heavyweight cotton. Fourteen pieces, no seasons, nothing on sale, ever.",
    styles: ["Minimalist", "Tailoring", "Japanese streetwear"], moods: ["clean", "quiet", "everyday", "boxy", "calm", "uniform", "soft"], categories: ["Knitwear", "Outerwear", "Shirting"], materials: ["Organic cotton", "Heavyweight jersey", "Linen"], values: ["Small batch", "Organic", "Made locally", "No sales"], madeIn: "Lisbon, PT", batch: "small", gender: ["Unisex"], priceBand: [68, 268], sizeRange: ["XS", "XL"], shipsTo: ["EU", "UK", "US & Canada", "Worldwide"], shipsFrom: "Lisbon" },
  { slug: "onda-studio", cover: "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=1200&q=70&auto=format&fit=crop", name: "Onda Studio", init: "OS", city: "Porto", country: "PT", tagline: "Salt-washed, cut once", items: 31, followers: 4200, verified: true, tint: "#121A24", ink: "#F6F4EF",
    founded: 2019, website: "onda.studio", story: "Salt-washed cotton, cut once and never restocked. Shot on the seawall at 6am. Every run is 40 pieces.",
    styles: ["Skate", "Outdoors", "Vintage revival"], moods: ["beach", "summer", "salty", "sun-faded", "relaxed", "coastal", "surf", "warm evening"], categories: ["Shirting", "Outerwear", "Trousers", "Accessories"], materials: ["Cotton", "Hemp", "Recycled cotton"], values: ["Recycled", "Limited runs", "Plastic-free"], madeIn: "Porto, PT", batch: "medium", gender: ["Unisex", "Men"], priceBand: [48, 210], sizeRange: ["S", "XXL"], shipsTo: ["EU", "UK", "US & Canada", "Worldwide"], shipsFrom: "Porto" },
  { slug: "core-theory", cover: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&q=70&auto=format&fit=crop", name: "Core Theory", init: "CT", city: "Kyoto", country: "JP", tagline: "Knitwear for long winters", items: 9, followers: 340, verified: false, tint: "#7C8C6F", ink: "#fff",
    founded: 2023, website: "coretheory.jp", story: "Nine knits made on a hand-flat machine in a Kyoto attic. Merino from a single farm in Tasmania.",
    styles: ["Knitwear", "Minimalist", "Techwear"], moods: ["cozy", "warm", "winter", "cabin", "soft", "layered", "slow", "snow"], categories: ["Knitwear", "Accessories"], materials: ["Merino", "Wool", "Felted wool", "Alpaca"], values: ["Small batch", "Traceable wool", "Made locally"], madeIn: "Kyoto, JP", batch: "one-off", gender: ["Unisex"], priceBand: [90, 260], sizeRange: ["S", "XL"], shipsTo: ["Japan", "US & Canada", "EU", "Worldwide"], shipsFrom: "Kyoto" },
  { slug: "neutral-ground", cover: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1200&q=70&auto=format&fit=crop", name: "Neutral Ground", init: "NG", city: "Copenhagen", country: "DK", tagline: "Quiet shirting", items: 18, followers: 2400, verified: true, tint: "#7C8C6F", ink: "#fff",
    founded: 2020, website: "neutralground.dk", story: "Poplin, oxford and twill in colours you already own. Cut boxy, finished by hand in a Copenhagen studio.",
    styles: ["Minimalist", "Tailoring", "Scandi"], moods: ["office", "clean", "smart casual", "date night", "quiet", "polished", "spring"], categories: ["Shirting", "Trousers"], materials: ["Poplin", "Organic cotton", "Tencel", "Linen"], values: ["Organic", "Fair wages", "Carbon neutral shipping"], madeIn: "Copenhagen, DK", batch: "medium", gender: ["Women", "Men", "Unisex"], priceBand: [80, 180], sizeRange: ["XS", "XL"], shipsTo: ["EU", "UK", "US & Canada"], shipsFrom: "Copenhagen" },
  { slug: "nomad", cover: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=1200&q=70&auto=format&fit=crop", name: "Nomad", init: "NO", city: "Melbourne", country: "AU", tagline: "Ripstop for the road", items: 26, followers: 1120, verified: false, tint: "#D6D9CE", ink: "#121A24",
    founded: 2018, website: "nomad.au", story: "Ripstop, cordura and canvas built for weeks away from a washing machine. Tested on the Overland Track.",
    styles: ["Outdoors", "Techwear", "Workwear"], moods: ["travel", "hiking", "rugged", "adventure", "rainy", "functional", "trail", "camping"], categories: ["Trousers", "Outerwear", "Accessories", "Footwear"], materials: ["Ripstop nylon", "Cordura", "Canvas", "Recycled polyester"], values: ["Recycled", "Repairs for life", "Durable"], madeIn: "Melbourne, AU", batch: "medium", gender: ["Unisex"], priceBand: [40, 240], sizeRange: ["XS", "XXL"], shipsTo: ["Australia", "US & Canada", "EU", "UK", "Worldwide"], shipsFrom: "Melbourne" },
];

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

export const PRODUCTS: Product[] = [
  { slug: "panel-work-jacket", image: "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=900&q=75&auto=format&fit=crop", brand: "form-and-void", name: "Panel Work Jacket", price: 248, compareAt: 310, tag: "20% off", tagBg: "#E5DFD3", tagFg: "#121A24", category: "Outerwear" },
  { slug: "heavyweight-crew", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=75&auto=format&fit=crop", brand: "studio-arva", name: "Heavyweight Crew", price: 126, tag: "New", tagBg: "#121A24", tagFg: "#fff", category: "Knitwear" },
  { slug: "sail-overshirt", image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=900&q=75&auto=format&fit=crop", brand: "onda-studio", name: "Sail Overshirt", price: 186, category: "Outerwear" },
  { slug: "merino-half-zip", image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=900&q=75&auto=format&fit=crop", brand: "core-theory", name: "Merino Half-Zip", price: 164, tag: "Last 3", tagBg: "#7C8C6F", tagFg: "#fff", category: "Knitwear" },
  { slug: "boxy-poplin-shirt", image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=900&q=75&auto=format&fit=crop", brand: "neutral-ground", name: "Boxy Poplin Shirt", price: 112, category: "Shirting" },
  { slug: "ripstop-cargo", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=75&auto=format&fit=crop", brand: "nomad", name: "Ripstop Cargo", price: 139, tag: "New", tagBg: "#121A24", tagFg: "#fff", category: "Trousers" },
  { slug: "cotton-chore-coat", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=75&auto=format&fit=crop", brand: "studio-arva", name: "Cotton Chore Coat", price: 268, category: "Outerwear" },
  { slug: "wide-wool-trouser", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&q=75&auto=format&fit=crop", brand: "form-and-void", name: "Wide Wool Trouser", price: 195, category: "Trousers" },
  { slug: "salt-wash-tee", preorder: new Date(Date.now() + 18 * 864e5).toISOString(), image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=75&auto=format&fit=crop", brand: "onda-studio", name: "Salt-Wash Tee", price: 68, category: "Shirting" },
  { slug: "felted-cardigan", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&q=75&auto=format&fit=crop", brand: "core-theory", name: "Felted Cardigan", price: 232, tag: "20% off", tagBg: "#E5DFD3", tagFg: "#121A24", category: "Knitwear" },
  { slug: "canvas-field-bag", image: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=900&q=75&auto=format&fit=crop", brand: "nomad", name: "Canvas Field Bag", price: 148, category: "Accessories" },
  { slug: "pleated-short", image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=900&q=75&auto=format&fit=crop", brand: "neutral-ground", name: "Pleated Short", price: 94, category: "Trousers" },
  { slug: "corozo-overshirt", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&q=75&auto=format&fit=crop", brand: "form-and-void", name: "Corozo Overshirt", price: 178, category: "Outerwear" },
  { slug: "yoke-back-shirt", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&q=75&auto=format&fit=crop", brand: "form-and-void", name: "Yoke Back Shirt", price: 142, category: "Shirting" },
  { slug: "waxed-tote", image: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=900&q=75&auto=format&fit=crop", brand: "form-and-void", name: "Waxed Tote", price: 96, category: "Accessories" },
  { slug: "duck-canvas-cap", image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=900&q=75&auto=format&fit=crop", brand: "form-and-void", name: "Duck Canvas Cap", price: 64, category: "Accessories" },
];

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

export const REVIEWS = [
  { name: "Mira K.", init: "MK", meta: "Bought size L · 3 weeks ago", stars: "★ 5.0", tint: "#DCD5C7", body: "The canvas is genuinely heavy — it stands up on its own for the first week and then softens into the best jacket I own. Sized down and it's perfect over a tee." },
  { name: "Daniel V.", init: "DV", meta: "Bought size XL · 1 month ago", stars: "★ 4.0", tint: "#E5DFD3", body: "Beautiful make and the corozo buttons are a nice touch. Sleeves run long on me, so I'd call it true to size but not slim. Shipping from Rotterdam took three days." },
];

export const SIZES = ["L", "M", "XL", "XXL", "3XL"];
export const COLORS: [string, string][] = [["Faded black", "#121A24"], ["Bone", "#D6D9CE"], ["Sky", "#DCD5C7"], ["Slate", "#7C8C6F"]];

export type ShipOpt = { label: string; meta: string; cost: number };
export const SHIP_OPTS: Record<string, { from: string; opts: ShipOpt[] }> = {
  "form-and-void": { from: "Rotterdam", opts: [{ label: "Standard", meta: "2–4 days · $8.00", cost: 8 }, { label: "Express", meta: "1–2 days · $19.00", cost: 19 }] },
  "studio-arva": { from: "Lisbon", opts: [{ label: "Free standard", meta: "3–5 days · Free", cost: 0 }, { label: "Tracked", meta: "2–3 days · $12.00", cost: 12 }] },
  "onda-studio": { from: "Porto", opts: [{ label: "Standard", meta: "2–3 days · $6.00", cost: 6 }, { label: "Next day", meta: "Tomorrow · $22.00", cost: 22 }] },
  "core-theory": { from: "Kyoto", opts: [{ label: "Standard", meta: "6–9 days · $14.00", cost: 14 }, { label: "Express", meta: "3–4 days · $28.00", cost: 28 }] },
  "neutral-ground": { from: "Copenhagen", opts: [{ label: "Standard", meta: "2–4 days · $7.00", cost: 7 }, { label: "Express", meta: "1–2 days · $16.00", cost: 16 }] },
  "nomad": { from: "Melbourne", opts: [{ label: "Standard", meta: "8–12 days · $18.00", cost: 18 }, { label: "Express", meta: "4–6 days · $34.00", cost: 34 }] },
};
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

export const LOOKBOOKS: Lookbook[] = [
  { slug: "off-the-shipyard", brand: "form-and-void", title: "Off the shipyard.", season: "Autumn 26", bg: "#DCD5C7", blurb: "Eleven looks shot across two cold mornings in the Rotterdam docks. Nine pieces are shoppable — tap any numbered dot.",
    frames: [
      { image: "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=900&q=75&auto=format&fit=crop", label: "Look 01 · full length", h: 520, product: "panel-work-jacket", x: 38, y: 34 }, { image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&q=75&auto=format&fit=crop", label: "Look 02 · detail", h: 340, bg: "#DCD5C7", product: "corozo-overshirt", x: 62, y: 48 },
      { image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&q=75&auto=format&fit=crop", label: "Look 03 · wide", h: 400, product: "wide-wool-trouser", x: 28, y: 60 }, { image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=900&q=75&auto=format&fit=crop", label: "Look 04 · portrait", h: 460, bg: "#121A24", product: "duck-canvas-cap", x: 50, y: 40 },
      { image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&q=75&auto=format&fit=crop", label: "Look 05 · full length", h: 560, product: "yoke-back-shirt", x: 42, y: 52 }, { image: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=900&q=75&auto=format&fit=crop", label: "Look 06 · still life", h: 300, bg: "#E5DFD3", product: "waxed-tote", x: 70, y: 36 },
    ] },
  { slug: "salt-and-static", brand: "onda-studio", title: "Salt and static", season: "Summer 26", bg: "#121A24", blurb: "Eight looks on the Porto seawall at 6am.",
    frames: [{ image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=900&q=75&auto=format&fit=crop", label: "Look 01", h: 480, product: "sail-overshirt", x: 45, y: 40 }, { image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=75&auto=format&fit=crop", label: "Look 02", h: 360, bg: "#DCD5C7", product: "salt-wash-tee", x: 55, y: 50 }, { image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=900&q=75&auto=format&fit=crop", label: "Look 03", h: 420 }, { image: "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=900&q=75&auto=format&fit=crop", label: "Look 04", h: 300, bg: "#E5DFD3" }] },
  { slug: "fourteen-pieces", brand: "studio-arva", title: "Fourteen pieces", season: "No season", bg: "#E5DFD3", blurb: "The whole Studio Arva range, one piece per frame.",
    frames: [{ image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=75&auto=format&fit=crop", label: "Crew", h: 420, product: "heavyweight-crew", x: 50, y: 45 }, { image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=75&auto=format&fit=crop", label: "Chore coat", h: 520, product: "cotton-chore-coat", x: 40, y: 38 }, { image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&q=75&auto=format&fit=crop", label: "Still life", h: 320, bg: "#DCD5C7" }] },
];
export const lookCount = (l: Lookbook) => ({ looks: l.frames.length, shoppable: l.frames.filter((f) => !!f.product).length });

export const STYLE_CHOICES = ["Japanese streetwear", "Minimalist", "Workwear", "Tailoring", "Techwear", "Vintage revival", "Knitwear", "Sustainable", "Avant-garde", "Skate", "Outdoors", "Archive"];

export const STEP_COPY = [
  ["What do you actually wear?", "Pick at least three. This is the only thing that shapes your For You feed, and you can change it any time.", "Pick 3 or more"],
  ["Your sizes, once.", "We'll hide anything that's sold out in your size instead of letting you fall in love with it first.", "You can add more later"],
  ["Follow five brands to start.", "Every one of these has fewer than 5,000 followers. Their drops will land at the top of your feed.", ""],
] as const;

export const RECENTS = ["studio arva", "boxy overshirt", "deadstock canvas", "made in portugal", "wide trouser"];
export const TREND_TAGS = ["Under $150", "New this week", "Deadstock", "Small batch", "Japanese denim", "Ships from EU", "Unisex", "Archive sale"];

export const ORDERS = [
  { title: "Onda Studio · 2 pieces", meta: "#UN-40817 · placed 28 Aug", status: "In transit", tint: "#DCD5C7", ink: "#121A24", total: "$254.00" },
  { title: "Studio Arva · 1 piece", meta: "#UN-40561 · placed 14 Aug", status: "Delivered", tint: "#F6F4EF", ink: "rgba(18,26,36,.6)", total: "$126.00" },
  { title: "Core Theory · 3 pieces", meta: "#UN-39902 · placed 2 Aug", status: "Delivered", tint: "#F6F4EF", ink: "rgba(18,26,36,.6)", total: "$488.00" },
];
export const STYLE_TAGS = ["Japanese streetwear", "Workwear", "Minimalist", "Deadstock", "Unisex", "Knitwear", "Under $200"];

export const POSTS = [
  { ph: "Post 01", tag: "3 tagged", caption: "Cutting the autumn run", likes: "842" },
  { ph: "Post 02", tag: "Carousel", caption: "Corozo buttons, close up", likes: "511" },
  { ph: "Post 03", tag: "1 tagged", caption: "Wies on the seawall", likes: "1,204" },
  { ph: "Post 04", tag: "Video", caption: "One bolt, start to finish", likes: "3,088" },
  { ph: "Post 05", tag: "2 tagged", caption: "Repairs, week 40", likes: "296" },
  { ph: "Post 06", tag: "4 tagged", caption: "New bone colourway", likes: "674" },
];

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
