# Kindred

Find your next favorite clothing brand. A marketplace where independent labels onboard with one honest questionnaire, and shoppers search by how they feel.

Live: https://brand-discovery-site.vercel.app

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build && pnpm start
pnpm lint
```

## Environment

| Variable | Effect |
|---|---|
| `ANTHROPIC_API_KEY` | Turns on Claude-powered feel search in `/api/search`. Without it the local synonym engine in `src/lib/catalog.ts` answers. |

## Where things live

- `src/app` routes: `/` discover, `/brands`, `/explore`, `/brand/[slug]`, `/product/[slug]`, `/lookbooks`, `/lookbook/[slug]`, `/bag`, `/checkout`, `/account`, `/messages`, `/sell` (brand onboarding), `/dashboard` (seller), `/onboarding` (shopper), `/design-system`.
- `src/lib/data.ts` seed brands, products, onboarding option lists.
- `src/lib/catalog.ts` the pure engine: merge, promo pricing, filters, feel search, daily pick.
- `src/lib/store.tsx` client state persisted to localStorage (`kindred.v2`). This is the piece to replace with a database.
- `docs/design/Kindred.dc.html` the Claude Design source the UI was built from.

## Design rules

Rounded but restrained (8/12/18px cards, pill buttons), no drop shadows, hairline borders, glass only on floating chrome, Geist + JetBrains Mono.
