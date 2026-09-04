# Backend plan

The app is a complete client with all state in `src/lib/store.tsx` (persisted to localStorage). Moving to a real backend means replacing that one module's persistence, not the screens. This document is the contract to build against.

## Principles

- Keep `src/lib/catalog.ts` and `src/lib/cart.ts` as pure functions and run them on the server for search, filters and checkout totals. The client already calls them; the server must compute the same numbers.
- Every entity type in `src/lib/data.ts` maps to a table. Slugs stay the public identifiers.
- Brand onboarding answers are first-class columns, not a JSON blob: filters and the AI search query them.

## Schema (Postgres)

| Table | Key columns |
|---|---|
| `users` | id, email, name, role (`shopper` \| `brand`), brand_id?, referral_code, referred_by?, points_balance, created_at |
| `brands` | id, slug, name, tagline, story, city, country, founded, website, logo_url, cover_url, verified, verification (`none` \| `pending` \| `rejected`), tint, ink, batch (`one-off` \| `small` \| `medium` \| `large`), made_in, ships_from, price_min, price_max, size_min, size_max, created_at |
| `brand_tags` | brand_id, kind (`style` \| `mood` \| `category` \| `material` \| `value` \| `gender` \| `ships_to`), value — one row per checkbox the brand ticked in onboarding |
| `products` | id, slug, brand_id, name, price, compare_at?, category, description, stock?, preorder_ships_at?, created_at |
| `product_variants` | product_id, size, color, sku, stock |
| `product_images` | product_id, url, position |
| `product_tags` | product_id, value |
| `promos` | id, brand_id, code, pct, label, scope (`all` \| `products`), ends_at?, active |
| `promo_products` | promo_id, product_id |
| `drops` | id, brand_id, title, at, pieces, blurb |
| `drop_products` | drop_id, product_id |
| `drop_reminders` | user_id, drop_id |
| `follows` | user_id, brand_id |
| `saves` | user_id, product_id |
| `boards` / `board_products` | user boards of products |
| `price_alerts` | user_id, product_id, price_at_set |
| `waitlist` | user_id, product_id |
| `orders` | id (`UN-…`), user_id, subtotal, shipping, promo_discount, points_credit, gift_credit, total, promo_code?, gift_code?, status (`Placed` \| `Packed` \| `In transit` \| `Delivered`), placed_at |
| `order_items` | order_id, product_id, brand_id, name, variant, qty, unit |
| `order_shipments` | order_id, brand_id, option_index, cost, status, tracking? — one parcel per brand |
| `reviews` | id, product_id, user_id, stars, fit (1–3), body, size, created_at |
| `posts` | id, brand_id, caption, image_url, created_at, likes |
| `post_products` | post_id, product_id |
| `threads` / `messages` | brand_id, shopper_id; message: from (`brand` \| `shopper`), text, at |
| `lookbooks` / `lookbook_frames` | brand_id, slug, title, season, blurb, bg; frame: image_url, height, bg, product_id?, x, y, label |
| `gift_cards` | code, amount, balance, to_name, from_user_id, note, created_at |
| `views` | subject_type (`brand` \| `product`), subject_id, day, count |
| `payouts` | brand_id, period, gross, fee (8%), net, status |

Indexes: `brand_tags (kind, value)`, `products (brand_id)`, `product_tags (value)`, `orders (user_id, placed_at desc)`, `views (subject_type, subject_id, day)`.

## API surface

Route handlers under `src/app/api`, JSON in and out, same shapes as the types in `data.ts`.

| Area | Endpoints |
|---|---|
| Catalog | `GET /api/brands`, `GET /api/brands/:slug`, `GET /api/products?cat&price&sizes&tiers&materials&values&leadTimes&studio&studioOnly`, `GET /api/products/:slug`, `GET /api/search?q` (runs `searchCatalog`, and Claude when `ANTHROPIC_API_KEY` is set), `GET /api/daily-pick` |
| Shopper | `GET/PUT /api/me` (style tags, sizes), `POST /api/follows`, `POST /api/saves`, `POST /api/boards`, `POST /api/alerts`, `POST /api/waitlist`, `POST /api/drop-reminders` |
| Bag & checkout | `GET/PUT /api/bag` (server-side bag keyed by user or anonymous cookie), `POST /api/checkout/quote` (calls `computeCart`), `POST /api/checkout` (creates the order, one shipment per brand, debits gift card and points, creates a Stripe PaymentIntent with `transfer_group` per brand) |
| Gift cards | `POST /api/gift-cards`, `POST /api/gift-cards/redeem` |
| Referrals | `POST /api/referrals/apply` — credits both sides 200 points after the referred user's first order |
| Reviews | `POST /api/products/:slug/reviews` — only for a delivered order line |
| Messages | `GET /api/threads`, `POST /api/threads/:id/messages` |
| Seller | `POST /api/brands` (onboarding; role flips to `brand`), `PUT /api/brands/:slug`, CRUD for `/api/brands/:slug/products`, `/promos`, `/drops`, `/lookbooks`, `/posts`; `POST /api/brands/:slug/products/import` (CSV, Shopify export format), `GET /api/brands/:slug/orders`, `PUT /api/orders/:id/status`, `GET /api/brands/:slug/audience` (followers, per-product views/saves/waitlist/ordered), `POST /api/brands/:slug/verification`, `POST /api/brands/:slug/feature` (paid placement) |
| Notifications | `GET /api/notifications` — same derivation as the store's `notifications` memo, from drop reminders, price alerts, order status, and unread messages |

## Auth

Magic-link email sign-in (Auth.js or Clerk). A user has at most one brand. The store's `session` object is the shape the client already expects (`role`, `name`, `brand`).

## Payments

Stripe Connect. Each brand onboards a connected account from the dashboard Settings tab. Checkout creates one PaymentIntent for the whole bag; funds are held and transferred per brand when that brand marks its parcel packed. Kindred keeps 8% after the free 90 days. Gift cards and points are Kindred-funded credits deducted before the card charge.

## Images

Brand uploads go to object storage (Vercel Blob or S3) behind an upload endpoint; store the URL. Switch `Placeholder` and `Avatar` to `next/image` once hosts are known.

## Migration order

1. Auth + `users`, `brands`, `brand_tags`, `products` (+variants/images/tags). Replace `allBrands`/`allProducts` inputs with fetches; keep the seed data as fixtures for local dev and tests.
2. Follows, saves, boards, alerts, waitlist, drop reminders, style profile. These are the store's small arrays; each becomes a table plus two endpoints.
3. Bag + checkout quote + orders + shipments. `computeCart` runs on the server; the client keeps calling it for instant totals.
4. Stripe Connect, payouts.
5. Reviews, posts, threads, lookbooks, gift cards, referrals, views/audience.
6. Delete localStorage persistence from `store.tsx`; keep it as a cache if wanted.

## Testing

- Keep `pnpm test` pure-function tests for catalog and cart as the spec for the server implementations.
- The Playwright suite in `e2e/` should keep passing against the real backend with a seeded database; the only change is a seed step instead of `localStorage.removeItem`.
