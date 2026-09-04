export type Brand = {
  slug: string; name: string; init: string; city: string; country: string;
  tagline: string; items: number; followers: number; verified: boolean;
  tint: string; ink: string;
};

export const BRANDS: Brand[] = [
  { slug: "form-and-void", name: "Form & Void", init: "FV", city: "Rotterdam", country: "NL", tagline: "Workwear cut from one bolt at a time", items: 22, followers: 1847, verified: true, tint: "#DBE1EF", ink: "#1A1A1A" },
  { slug: "studio-arva", name: "Studio Arva", init: "SA", city: "Lisbon", country: "PT", tagline: "Heavyweight cotton, no seasons", items: 14, followers: 892, verified: true, tint: "#C7DCEF", ink: "#1A1A1A" },
  { slug: "onda-studio", name: "Onda Studio", init: "OS", city: "Porto", country: "PT", tagline: "Salt-washed, cut once", items: 31, followers: 4200, verified: true, tint: "#1C3247", ink: "#F6F7F9" },
  { slug: "core-theory", name: "Core Theory", init: "CT", city: "Kyoto", country: "JP", tagline: "Knitwear for long winters", items: 9, followers: 340, verified: false, tint: "#456F94", ink: "#fff" },
  { slug: "neutral-ground", name: "Neutral Ground", init: "NG", city: "Copenhagen", country: "DK", tagline: "Quiet shirting", items: 18, followers: 2400, verified: true, tint: "#456F94", ink: "#fff" },
  { slug: "nomad", name: "Nomad", init: "NO", city: "Melbourne", country: "AU", tagline: "Ripstop for the road", items: 26, followers: 1120, verified: false, tint: "#EDF1F4", ink: "#1A1A1A" },
];

export const brandBySlug = (slug: string) => BRANDS.find((b) => b.slug === slug);
export const brandByName = (name: string) => BRANDS.find((b) => b.name === name)!;
export const fmtFollowers = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n));
export const brandMeta = (b: Brand) => `${b.items} items · ${fmtFollowers(b.followers)} followers`;

export type Product = {
  slug: string; brand: string; name: string; price: number; compareAt?: number;
  tag?: string; tagBg?: string; tagFg?: string; category: string;
};

export const PRODUCTS: Product[] = [
  { slug: "panel-work-jacket", brand: "form-and-void", name: "Panel Work Jacket", price: 248, compareAt: 310, tag: "20% off", tagBg: "#DBE1EF", tagFg: "#1A1A1A", category: "Outerwear" },
  { slug: "heavyweight-crew", brand: "studio-arva", name: "Heavyweight Crew", price: 126, tag: "New", tagBg: "#121212", tagFg: "#fff", category: "Knitwear" },
  { slug: "sail-overshirt", brand: "onda-studio", name: "Sail Overshirt", price: 186, category: "Outerwear" },
  { slug: "merino-half-zip", brand: "core-theory", name: "Merino Half-Zip", price: 164, tag: "Last 3", tagBg: "#456F94", tagFg: "#fff", category: "Knitwear" },
  { slug: "boxy-poplin-shirt", brand: "neutral-ground", name: "Boxy Poplin Shirt", price: 112, category: "Shirting" },
  { slug: "ripstop-cargo", brand: "nomad", name: "Ripstop Cargo", price: 139, tag: "New", tagBg: "#121212", tagFg: "#fff", category: "Trousers" },
  { slug: "cotton-chore-coat", brand: "studio-arva", name: "Cotton Chore Coat", price: 268, category: "Outerwear" },
  { slug: "wide-wool-trouser", brand: "form-and-void", name: "Wide Wool Trouser", price: 195, category: "Trousers" },
  { slug: "salt-wash-tee", brand: "onda-studio", name: "Salt-Wash Tee", price: 68, category: "Shirting" },
  { slug: "felted-cardigan", brand: "core-theory", name: "Felted Cardigan", price: 232, tag: "20% off", tagBg: "#DBE1EF", tagFg: "#1A1A1A", category: "Knitwear" },
  { slug: "canvas-field-bag", brand: "nomad", name: "Canvas Field Bag", price: 148, category: "Accessories" },
  { slug: "pleated-short", brand: "neutral-ground", name: "Pleated Short", price: 94, category: "Trousers" },
  { slug: "corozo-overshirt", brand: "form-and-void", name: "Corozo Overshirt", price: 178, category: "Outerwear" },
  { slug: "yoke-back-shirt", brand: "form-and-void", name: "Yoke Back Shirt", price: 142, category: "Shirting" },
  { slug: "waxed-tote", brand: "form-and-void", name: "Waxed Tote", price: 96, category: "Accessories" },
  { slug: "duck-canvas-cap", brand: "form-and-void", name: "Duck Canvas Cap", price: 64, category: "Accessories" },
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
  { name: "Mira K.", init: "MK", meta: "Bought size L · 3 weeks ago", stars: "★ 5.0", tint: "#C7DCEF", body: "The canvas is genuinely heavy — it stands up on its own for the first week and then softens into the best jacket I own. Sized down and it's perfect over a tee." },
  { name: "Daniel V.", init: "DV", meta: "Bought size XL · 1 month ago", stars: "★ 4.0", tint: "#DBE1EF", body: "Beautiful make and the corozo buttons are a nice touch. Sleeves run long on me, so I'd call it true to size but not slim. Shipping from Rotterdam took three days." },
];

export const SIZES = ["L", "M", "XL", "XXL", "3XL"];
export const COLORS: [string, string][] = [["Faded black", "#1A1A1A"], ["Bone", "#EDF1F4"], ["Sky", "#C7DCEF"], ["Slate", "#456F94"]];

export type ShipOpt = { label: string; meta: string; cost: number };
export const SHIP_OPTS: Record<string, { from: string; opts: ShipOpt[] }> = {
  "form-and-void": { from: "Rotterdam", opts: [{ label: "Standard", meta: "2–4 days · $8.00", cost: 8 }, { label: "Express", meta: "1–2 days · $19.00", cost: 19 }] },
  "studio-arva": { from: "Lisbon", opts: [{ label: "Free standard", meta: "3–5 days · Free", cost: 0 }, { label: "Tracked", meta: "2–3 days · $12.00", cost: 12 }] },
  "onda-studio": { from: "Porto", opts: [{ label: "Standard", meta: "2–3 days · $6.00", cost: 6 }, { label: "Next day", meta: "Tomorrow · $22.00", cost: 22 }] },
  "core-theory": { from: "Kyoto", opts: [{ label: "Standard", meta: "6–9 days · $14.00", cost: 14 }, { label: "Express", meta: "3–4 days · $28.00", cost: 28 }] },
  "neutral-ground": { from: "Copenhagen", opts: [{ label: "Standard", meta: "2–4 days · $7.00", cost: 7 }, { label: "Express", meta: "1–2 days · $16.00", cost: 16 }] },
  "nomad": { from: "Melbourne", opts: [{ label: "Standard", meta: "8–12 days · $18.00", cost: 18 }, { label: "Express", meta: "4–6 days · $34.00", cost: 34 }] },
};
export const shipEstimate = (slug: string) => {
  const s = SHIP_OPTS[slug];
  const o = s.opts[0];
  return `${s.from} · ${o.meta.split(" · ")[0]}`;
};

export const LOOKS = [
  { ph: "Look 01 · full length", h: 520, bg: "stripes-wide", n: 1, x: 38, y: 34, product: "panel-work-jacket" },
  { ph: "Look 02 · detail", h: 340, bg: "#C7DCEF", n: 2, x: 62, y: 48, product: "corozo-overshirt" },
  { ph: "Look 03 · wide", h: 400, bg: "stripes-wide", n: 3, x: 28, y: 60, product: "wide-wool-trouser" },
  { ph: "Look 04 · portrait", h: 460, bg: "#1C3247", n: 4, x: 50, y: 40, product: "duck-canvas-cap" },
  { ph: "Look 05 · full length", h: 560, bg: "stripes-wide", n: 5, x: 42, y: 52, product: "yoke-back-shirt" },
  { ph: "Look 06 · still life", h: 300, bg: "#DBE1EF", n: 6, x: 70, y: 36, product: "waxed-tote" },
];

export const LOOKBOOKS = [
  { slug: "off-the-shipyard", brand: "form-and-void", title: "Off the shipyard.", season: "Autumn 26", looks: 11, shoppable: 9, bg: "#C7DCEF", blurb: "Eleven looks shot across two cold mornings in the Rotterdam docks. Nine pieces are shoppable — tap any numbered dot." },
  { slug: "salt-and-static", brand: "onda-studio", title: "Salt and static", season: "Summer 26", looks: 8, shoppable: 6, bg: "#1C3247", blurb: "Eight looks on the Porto seawall at 6am." },
  { slug: "fourteen-pieces", brand: "studio-arva", title: "Fourteen pieces", season: "No season", looks: 14, shoppable: 14, bg: "#DBE1EF", blurb: "The whole Studio Arva range, one piece per frame." },
];

export const STYLE_CHOICES = ["Japanese streetwear", "Minimalist", "Workwear", "Tailoring", "Techwear", "Vintage revival", "Knitwear", "Sustainable", "Avant-garde", "Skate", "Outdoors", "Archive"];

export const STEP_COPY = [
  ["What do you actually wear?", "Pick at least three. This is the only thing that shapes your For You feed, and you can change it any time.", "Pick 3 or more"],
  ["Your sizes, once.", "We'll hide anything that's sold out in your size instead of letting you fall in love with it first.", "You can add more later"],
  ["Follow five brands to start.", "Every one of these has fewer than 5,000 followers. Their drops will land at the top of your feed.", ""],
] as const;

export const RECENTS = ["studio arva", "boxy overshirt", "deadstock canvas", "made in portugal", "wide trouser"];
export const TREND_TAGS = ["Under $150", "New this week", "Deadstock", "Small batch", "Japanese denim", "Ships from EU", "Unisex", "Archive sale"];

export const ORDERS = [
  { title: "Onda Studio · 2 pieces", meta: "#UN-40817 · placed 28 Aug", status: "In transit", tint: "#C7DCEF", ink: "#1A1A1A", total: "$254.00" },
  { title: "Studio Arva · 1 piece", meta: "#UN-40561 · placed 14 Aug", status: "Delivered", tint: "#F6F7F9", ink: "rgba(0,0,0,.6)", total: "$126.00" },
  { title: "Core Theory · 3 pieces", meta: "#UN-39902 · placed 2 Aug", status: "Delivered", tint: "#F6F7F9", ink: "rgba(0,0,0,.6)", total: "$488.00" },
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
    { label: "Sales · 30d", value: "$12,408", delta: "↑ 34% vs prev", bg: "#1C3247", ink: "#F6F7F9" },
    { label: "Orders", value: "86", delta: "↑ 12 vs prev", bg: "#fff", ink: "#1A1A1A" },
    { label: "Followers", value: "1,847", delta: "↑ 214 new", bg: "#C7DCEF", ink: "#1A1A1A" },
    { label: "Profile views", value: "24.1k", delta: "↓ 4% vs prev", bg: "#fff", ink: "#1A1A1A" },
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
    { name: "Jules Renard", meta: "#UN-40912 · Paris", total: "$443.00", init: "JR", tint: "#C7DCEF", ink: "#1A1A1A" },
    { name: "Ada Mensah", meta: "#UN-40908 · Accra", total: "$248.00", init: "AM", tint: "#DBE1EF", ink: "#1A1A1A" },
    { name: "Tomo Ishii", meta: "#UN-40901 · Kyoto", total: "$337.00", init: "TI", tint: "#456F94", ink: "#fff" },
    { name: "Lena Bauer", meta: "#UN-40894 · Berlin", total: "$195.00", init: "LB", tint: "#1C3247", ink: "#F6F7F9" },
    { name: "Sam Okoro", meta: "#UN-40887 · Lagos", total: "$96.00", init: "SO", tint: "#121212", ink: "#fff" },
  ],
};
