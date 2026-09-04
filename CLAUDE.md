@AGENTS.md

## Product notes for this repo

Independent-clothing-brand discovery marketplace. Full decisions live in the user's memory file `brand-discovery-site`; the design brief is in `docs/claude-design-prompt.md`.

Key constraints:
- Not social-media first. The feed is secondary. Brand pages must not look like social profiles.
- Brand ("business") accounts go through a detailed onboarding; those fields are the source of truth for filters and AI natural-language search.
- Design language (Kindred, from the Claude Design file in `docs/design/Kindred.dc.html`): rounded but restrained (8/12/18px cards, pill buttons and chips), NO drop shadows anywhere (hairline borders instead), off-white `#F6F7F9`, sky `#C7DCEF`, periwinkle `#DBE1EF`, slate `#456F94`, navy `#1C3247`, near-black `#121212`. Geist + JetBrains Mono (user rejected Schibsted Grotesk on 2026-09-03). Glass only on floating chrome. Tokens and `glass` utilities in `src/app/globals.css`.
- Data model: `src/lib/data.ts` holds seed brands/products plus the option lists for onboarding (styles, moods, categories, materials, values, regions). `Brand` carries the onboarding fields that power filters and search. `src/lib/catalog.ts` is the pure engine: merge seed + user-created entities, promo pricing, `filterProducts`, feel-based `searchCatalog` (synonym expansion + price parsing), `dailyPick`. `src/lib/store.tsx` is the client state (session, custom brands/products, promos, drops, orders, reviews, bag, follows, saved, alerts) persisted to localStorage under `kindred.v2`. Replace the store's persistence with a real DB when the backend lands; keep the catalog engine.
- `/api/search` calls Claude (`claude-opus-5`, structured output) to turn a feeling into intent when `ANTHROPIC_API_KEY` is set; the client falls back to `searchCatalog` otherwise. Set the key in Vercel env to switch it on.
- Business accounts: `/sell` is the 7-step brand onboarding; it creates a Brand, switches the session to role `brand`, and lands on `/dashboard` where products, promos, drops, orders, and settings are managed. Everything a brand enters shows up immediately in Explore filters, search, and their public page.
- Routes: `/` discover (For you / Following / Drops, daily pick), `/explore` (real filters, `?q=` feel search, `?cat=`), `/brand/[slug]`, `/product/[slug]` (reviews, price alerts), `/bag` (promo codes), `/checkout` (places orders), `/lookbook/[slug]`, `/account`, `/sell` (brand onboarding), `/dashboard` (seller), `/onboarding` (shopper), `/design-system`. Search is an overlay (`SearchOverlay.tsx`), bag is a drawer (`BagDrawer.tsx`).
- Stack: Next.js App Router, TypeScript, Tailwind v4, pnpm, deploy on Vercel.

Rules learned the hard way:
- Toggle handlers must use functional `setState` updates; rapid clicks otherwise overwrite each other.
- Never gate hydration on `requestAnimationFrame`; it does not fire in background tabs. Use `setTimeout(…, 0)`.
- The React compiler lint forbids `Date.now()` in render; use `useNow()` from `src/components/Countdown.tsx`.
