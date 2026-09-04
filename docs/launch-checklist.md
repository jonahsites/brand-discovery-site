# Launch checklist

Everything below the horizontal rule is done. Above the rule is what still needs your login, your money, or your call before we go live.

## Only you can do these

- [ ] **Vercel env.** Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Production, Preview and Development. Also `NEXT_PUBLIC_SITE_URL=https://<your-domain>` when you move off the Vercel-generated subdomain. Optional: `ANTHROPIC_API_KEY` to turn on Claude-powered "feel search".
- [ ] **Supabase email confirmation.** For launch, turn *on* email confirmation (Authentication → Providers → Email). The app already handles the "check your email" state (`/verify-email`) and the reset flow (`/forgot-password` → `/reset-password`).
- [ ] **Custom domain.** Point kindred.shop (or whatever) at Vercel and set `NEXT_PUBLIC_SITE_URL` to match. The sitemap, robots and JSON-LD all read from that.
- [ ] **Email deliverability.** Add a custom SMTP provider in Supabase (Auth → Emails) so confirmation emails come from `no-reply@kindred.shop` instead of the noreply@supabase.io shared sender. Free tier is 2/hour and lands in spam.
- [ ] **Real OAuth apps.** For X, Apple, Google sign-in: enable each in Supabase (Auth → Providers), paste the OAuth client id + secret from each provider's dev console. The three social buttons on `/signup` and `/login` show a helpful error until they're on.
- [ ] **Stripe Connect.** The order flow calls `placeOrder` which stores the order locally; there's no real charge. See `docs/backend-plan.md` for the wiring.
- [ ] **Legal review.** `/privacy` and `/terms` are plain-English drafts — get a lawyer to read them before people give you real money.
- [ ] **DMARC / SPF.** Configure once the SMTP sender is set.
- [ ] **Analytics vendor.** `src/lib/analytics.ts` is a localStorage stub; swap the two functions for PostHog / Plausible / Umami.

---

## Done

### Product

- [x] Discover feed (For you / Following / Matched / Saved) with promo hero, category tiles, drops row, today's pick, workshop posts, brands-you'll-like, recently-viewed.
- [x] Explore with a real filter panel (price, lead time, studio, brand size, size, materials, values), sort options including For-you (style-overlap), text and feel search via `/api/search`.
- [x] Brand page (Shop / Lookbooks / About / Posts) as a storefront card, not a social profile.
- [x] Product page with size/colour selection, reviews, price alerts, waitlist, complete-the-look, more-from-brand, similar-from-others.
- [x] Bag with per-brand shipping estimates, promo codes, gift cards, points redemption.
- [x] Checkout with the same computation as the bag (both call `cart.ts::computeCart`) and a real order in `/account?tab=Orders`.
- [x] Brand onboarding: 7-step wizard that creates a brand and drops the user on the seller dashboard.
- [x] Shopper onboarding: 3-step wizard (styles, sizes, brands) that gates every non-open route.
- [x] Seller dashboard: Overview, Audience, Products, Promos, Drops, Lookbooks, Orders, Messages, Settings.
- [x] Gift cards: buy → redeem → debit at checkout, all end-to-end tested.
- [x] Referrals: `/r/[code]` landing, account card, +200 points bonus.
- [x] Legal pages: About, Shipping & returns, Privacy, Terms, Contact.
- [x] Admin (`/admin`): brand verification queue + analytics event log.
- [x] Newsletter capture in the footer.

### Auth

- [x] Signup / login / logout / forgot-password / reset-password / verify-email.
- [x] Supabase session restored on page reload via `getSession` + `onAuthStateChange`.
- [x] Follows and saves sync to Supabase on toggle; on sign-in the whole profile pulls fresh.
- [x] Onboarding writes `profiles.onboarded`, `style_tags`, `sizes`, `follows`, `saves` back to Supabase.
- [x] Migration `0001_init.sql` applied to the Kindred project (`gxyrrsoskcnuijhlfpri`); RLS on every table; `handle_new_user` trigger hardened (`SET search_path`, `REVOKE EXECUTE` from public/anon/authenticated). Zero security advisors.

### Perf & SEO

- [x] Metadata for every route via `src/lib/seo.ts` (canonical, OG, Twitter, Googlebot).
- [x] Product / Brand / Breadcrumb JSON-LD on every dynamic route; Organization + WebSite JSON-LD in the layout.
- [x] Dynamic OG image at `/opengraph-image` (serif wordmark, rust bar, headline).
- [x] Sitemap and robots covering every static route + every brand/product/lookbook slug.
- [x] Every `<img>` lazy-loaded with `decoding="async"`.

### A11y

- [x] Skip-to-content link (visible on first Tab).
- [x] Rust focus-visible outline with 3px offset.
- [x] Bag drawer, search overlay, notifications, mobile tab bar have real `aria-label`s.
- [x] Escape closes bag and search overlays.
- [x] Cmd/Ctrl+K and `/` open the search overlay.

### Testing

- [x] `pnpm check` (lint + typecheck + 39 vitest).
- [x] `pnpm test:e2e` — 32 Playwright tests across desktop + Pixel 7 viewports. Covers discover, explore, product, brand, bag, checkout, gift, onboarding, brand-onboarding, admin, legal.
