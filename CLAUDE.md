@AGENTS.md

## Product notes for this repo

Independent-clothing-brand discovery marketplace. Full decisions live in the user's memory file `brand-discovery-site`; the design brief is in `docs/claude-design-prompt.md`.

Key constraints:
- Not social-media first. The feed is secondary. Brand pages must not look like social profiles.
- Brand ("business") accounts go through a detailed onboarding; those fields are the source of truth for filters and AI natural-language search.
- Design language is **Kindred v2** (`docs/design/Kindred-v2.dc.html`, 2026-09-03 late): Plus Jakarta Sans, headlines 800 at −4% tracking, body 13/500, labels 10/600 uppercase wide. Palette: paper `#F6F4EF` page, cream `#EDE8DE` panels, sand `#DCD5C7`, ink `#121A24`, sage `#7C8C6F` accent, white cards. Cards 24px radius with a long soft shadow (`card` utility), pill controls, ink CTAs, soft-shadow white secondary buttons, no glass and no hairline-border cards. Legacy color names (offwhite/sky/peri/slate/navy/black) are aliased to the v2 palette in `globals.css` so older screens shift automatically. Base CSS lives in `@layer base` so utilities win. v1 `Kindred.dc.html` and the Geist/serif passes are superseded.
- Data model: `src/lib/data.ts` holds seed brands/products plus the option lists for onboarding (styles, moods, categories, materials, values, regions). `Brand` carries the onboarding fields that power filters and search. `src/lib/catalog.ts` is the pure engine: merge seed + user-created entities, promo pricing, `filterProducts`, feel-based `searchCatalog` (synonym expansion + price parsing), `dailyPick`. `src/lib/store.tsx` is the client state (session, custom brands/products, promos, drops, orders, reviews, bag, follows, saved, alerts) persisted to localStorage under `kindred.v2`. Replace the store's persistence with a real DB when the backend lands; keep the catalog engine.
- `/api/search` calls Claude (`claude-opus-5`, structured output) to turn a feeling into intent when `ANTHROPIC_API_KEY` is set; the client falls back to `searchCatalog` otherwise. Set the key in Vercel env to switch it on.
- Also in the store: brand posts (Following feed + brand Posts tab), shopper↔brand message threads (`/messages`), custom lookbooks built in the dashboard (frames with image URL + one hotspot), waitlist for sold-out pieces, price alerts, drop reminders, a derived `notifications` list shown from the nav bell, rewards points (1/$1), a `featured` brand that takes the home hero (dashboard "Feature on home"), CSV product import, verification requests. Images are plain URLs rendered with `<img>` (no next/image; hosts are arbitrary).
- Business accounts: `/sell` is the 7-step brand onboarding; it creates a Brand, switches the session to role `brand`, and lands on `/dashboard` where products, promos, drops, orders, and settings are managed. Everything a brand enters shows up immediately in Explore filters, search, and their public page.
- Routes: `/` discover (For you / Following / Drops, daily pick), `/explore` (real filters, `?q=` feel search, `?cat=`), `/brand/[slug]`, `/product/[slug]` (reviews, price alerts), `/bag` (promo codes), `/checkout` (places orders), `/lookbook/[slug]`, `/account`, `/sell` (brand onboarding), `/dashboard` (seller), `/onboarding` (shopper), `/design-system`. Search is an overlay (`SearchOverlay.tsx`), bag is a drawer (`BagDrawer.tsx`).
- Stack: Next.js App Router, TypeScript, Tailwind v4, pnpm, deploy on Vercel.

Rules learned the hard way:
- Toggle handlers must use functional `setState` updates; rapid clicks otherwise overwrite each other.
- Keep global element rules inside `@layer base`; an unlayered `a { color: inherit }` silently beats every Tailwind color utility on links.
- Never gate hydration on `requestAnimationFrame`; it does not fire in background tabs. Use `setTimeout(…, 0)`.
- The React compiler lint forbids `Date.now()` in render; use `useNow()` from `src/components/Countdown.tsx`.
