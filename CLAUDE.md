@AGENTS.md

## Product notes for this repo

Independent-clothing-brand discovery marketplace. Full decisions live in the user's memory file `brand-discovery-site`; the design brief is in `docs/claude-design-prompt.md`.

Key constraints:
- Not social-media first. The feed is secondary. Brand pages must not look like social profiles.
- Brand ("business") accounts go through a detailed onboarding; those fields are the source of truth for filters and AI natural-language search.
- Design language (Kindred, from the Claude Design file in `docs/design/Kindred.dc.html`): rounded but restrained (8/12/18px cards, pill buttons and chips), NO drop shadows anywhere (hairline borders instead), off-white `#F6F7F9`, sky `#C7DCEF`, periwinkle `#DBE1EF`, slate `#456F94`, navy `#1C3247`, near-black `#121212`. Geist + JetBrains Mono (user rejected Schibsted Grotesk on 2026-09-03). Glass only on floating chrome. Tokens and `glass` utilities in `src/app/globals.css`.
- Shared data lives in `src/lib/data.ts` (brands, products, lookbooks) and client state (bag, follows, saved, shipping choice) in `src/lib/store.tsx`, persisted to localStorage. Replace with a real DB when the backend lands.
- Routes: `/` discover, `/explore`, `/brand/[slug]`, `/product/[slug]`, `/bag`, `/checkout`, `/lookbook/[slug]`, `/account`, `/dashboard` (seller), `/onboarding`, `/design-system`. Search is an overlay (`SearchOverlay.tsx`), bag is a drawer (`BagDrawer.tsx`).
- Stack: Next.js App Router, TypeScript, Tailwind v4, pnpm, deploy on Vercel.
