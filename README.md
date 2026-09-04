# Kindred

Find your next favorite clothing brand. A marketplace where independent labels onboard with one honest questionnaire, and shoppers search by how they feel.

Live: https://brand-discovery-site.vercel.app

## Run it

```bash
pnpm install
cp .env.example .env.local   # optional; everything runs on seed data without it
pnpm dev                      # http://localhost:3000
```

## Check it

```bash
pnpm check        # lint + typecheck + unit tests
pnpm test         # vitest: catalog engine and cart math (src/lib/__tests__)
pnpm test:e2e     # playwright smoke suite (e2e/), starts its own dev server on :3199
pnpm build        # production build, same as Vercel
```

The first `pnpm test:e2e` needs a browser: `npx playwright install chromium`. Next allows one dev server per project, so if `pnpm dev` is already running point the suite at it: `E2E_BASE_URL=http://localhost:3000 pnpm test:e2e`.

The e2e suite covers the paths that matter most: Discover renders, feel search on Explore opens a product, add to bag → promo code → checkout → order in account, gift card issue → redeem → debit, and the seven-step brand onboarding landing on the dashboard and a live brand page. It runs on desktop and a Pixel 7 viewport.

## Environment

| Variable | Effect |
|---|---|
| `ANTHROPIC_API_KEY` | Turns on Claude-powered feel search in `/api/search`. Without it the local synonym engine in `src/lib/catalog.ts` answers. |
| `NEXT_PUBLIC_SITE_URL` | Absolute origin for the sitemap and robots. Defaults to the Vercel URL. |

## Where things live

- `src/app` routes: `/` discover, `/brands`, `/explore`, `/brand/[slug]`, `/product/[slug]`, `/lookbooks`, `/lookbook/[slug]`, `/bag`, `/checkout`, `/gift`, `/account`, `/messages`, `/sell` (brand onboarding), `/dashboard` (seller), `/onboarding` (shopper), `/r/[code]` (referral landing), `/design-system`. `error.tsx` and `global-error.tsx` catch render failures; `not-found.tsx` is the 404.
- `src/lib/data.ts` seed brands, products, lookbooks, and the onboarding option lists. Types for every entity live here.
- `src/lib/catalog.ts` the pure engine: merge seed + user-created entities, promo pricing, `filterProducts`, feel search (`searchCatalog`), daily pick.
- `src/lib/cart.ts` pure cart math: brand grouping, per-brand shipping, promo codes, points, gift cards. Unit-tested; the server-side checkout should call the same function.
- `src/lib/store.tsx` client state persisted to localStorage (`kindred.v2`). It is the only stateful module and the piece to replace with a database. See `docs/backend-plan.md`.
- `src/components` shared UI: `ui.tsx` primitives (Button, Chip, Label, Placeholder, QtyStepper, Page, `inputCls`), `ProductCard`, `BrandCard`, `TopNav`, `MobileTabBar`, `SearchOverlay`, `BagDrawer`, `Countdown` (shared clock, hydration-safe), `Toaster`.
- `docs/design/Kindred-v2.dc.html` the Claude Design source of truth for the UI. `docs/backend-plan.md` the schema and API plan for taking this to a real backend.

## Design rules (Kindred v2)

Plus Jakarta Sans; headlines 800 at −4% tracking; body 13/500; labels 10/600 uppercase wide. Palette: paper `#F6F4EF` page, cream `#EDE8DE` panels, sand `#DCD5C7`, ink `#121A24`, sage `#7C8C6F`, white cards at 24px radius with one long soft shadow. Pill controls; ink CTAs; selected state is ink on paper; idle controls are white with the soft shadow or cream fills. No hairline borders, no glass, and hover never grows a shadow: cards rise 3px, shift to cream, and their image eases in.

## What is demo-only

Payment (no card is charged), Apple/Google/Shop Pay buttons, brand verification review, and the seeded analytics on the dashboard for the six built-in brands. Everything a user creates (brands, products, promos, drops, orders, reviews, posts, threads, lookbooks, gift cards) is real within the device and survives reloads.
