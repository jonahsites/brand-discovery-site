# Supabase setup

Kindred's client-side store falls back to a local demo account when Supabase env vars are missing, so nothing is broken today. To turn on real auth:

## 1. Create the project

The Supabase project has to be created under your own account. Two ways:

**Web UI (fastest):** go to https://supabase.com/dashboard, click **New project**, name it `kindred`, pick a region close to Vercel (`us-east-1` for the current deploy), and save the database password somewhere safe.

**CLI:**

```bash
brew install supabase/tap/supabase
supabase login             # opens the browser
supabase projects create kindred --org-id <your-org-id> --region us-east-1 --db-password '<strong-password>'
```

Get the org id with `supabase orgs list`.

## 2. Copy the two env vars

From **Project Settings → API** on the Supabase dashboard:

- `NEXT_PUBLIC_SUPABASE_URL` — the project URL (`https://<ref>.supabase.co`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the `anon` public key. This one is safe to ship in the browser.

Add them to `.env.local` for local dev and to **Vercel → Settings → Environment Variables** for production. Deploy again after adding them to Vercel.

## 3. Run the migration

The schema (profiles, style_tags, sizes, follows, saves) with row-level-security is at `supabase/migrations/0001_init.sql`. Two ways to run it:

**SQL editor (fastest):** open the SQL editor on the Supabase dashboard, paste the contents of the file, hit **Run**.

**CLI:**

```bash
supabase link --project-ref <ref>
supabase db push
```

## 4. Turn off email confirmation for early testing

Auth → Providers → Email → **Confirm email**: turn it OFF while you're testing locally. Otherwise every new account has to click a link in an inbox before it's signed in, and the free tier caps the confirmation-email volume at ~2 per hour. Turn it back on before launching to real users.

## 5. Turn on the sign-in providers you want

**Email + password** works out of the box. From **Authentication → Providers → Email**, turn on Email confirmations later; for now the demo signs the user in immediately.

**Google, Apple, X:** each provider on the same page has a toggle plus the OAuth client id and secret you paste in from that provider's developer console. Add the callback URL Supabase gives you as the redirect URI on the provider side. Once turned on, the three social buttons on `/signup` and `/login` in Kindred will use them; when they're off, those buttons still work locally (they create a demo account tagged with the provider name).

## 6. What the app does with all this

- `src/lib/supabase.ts` creates one browser client. Missing vars → `getSupabase()` returns `null` and the store keeps using the local demo account.
- `signUp`, `logIn`, `logOut` in `src/lib/store.tsx` call `supabase.auth.signUp` / `signInWithPassword` / `signOut` when the client is live, and fall back locally otherwise. In both modes the shape of `account` in the store is the same, so no screen has to know.
- `completeOnboarding` writes the profile back to Supabase: it sets `profiles.onboarded = true` and inserts one row into `style_tags` per pick and one row into `sizes`.
- Follows and saves fall through the same pattern: local `follows` and `saves` arrays in the store are the source of truth; if Supabase is live, every toggle upserts into the matching table so the same shopper on another device sees the same lists.

## 7. Verify it works

With env vars set:

```bash
pnpm dev
# open http://localhost:3000, sign up with a real email
# then open Supabase → Authentication → Users; your row is there
# and Supabase → Table editor → profiles; your name, email and referral_code are set
```

## What is still Kindred's own (not Supabase)

Bag, checkout, orders, gift cards, promos, drops, brand-created products, and the seller dashboard all live in the store. They move to their own tables when the backend lands — see `docs/backend-plan.md` for the schema. The auth work here is the first step of that plan; everything else keeps working on localStorage until you migrate it.
