# Social integrations setup (Instagram + TikTok)

Everything the app needs is already deployed. What is left is the human work
of registering two OAuth apps (Meta + TikTok), passing App Review, and pasting
credentials into Vercel env. Until that happens, the dashboard shows
"Coming soon" cards and the OAuth routes return 503 `not_configured`.

Owner: Jonah. Rough time: half a day for TikTok, up to a couple of weeks for
Meta App Review.

---

## 1. Meta (Instagram Business)

Instagram's public content API requires a Business or Creator IG account
linked to a Facebook Page. Personal accounts cannot be pulled.

1. Go to <https://developers.facebook.com/apps>, click **Create App**.
2. Use case: **Other** → App type: **Business** → Continue.
3. Name the app "Kindred", set the contact email to your ops address.
4. In the app dashboard, add these products:
   - **Instagram** (formerly "Instagram Graph API")
   - **Facebook Login for Business** (Meta requires it as the login layer)
5. Under **Instagram → API setup with Instagram business login**:
   - Redirect URI: `https://<your-site>/api/oauth/instagram/callback`
     (both prod URL and any Vercel preview URL, comma-separated).
   - Deauthorize callback: `https://<your-site>/api/oauth/instagram/deauth`
     (optional; we currently ignore deauth pings).
6. In **App settings → Basic**: complete the business verification form
   (Meta wants a company registration doc + a phone verification).
7. In **App Review → Permissions and Features**, request:
   - `instagram_business_basic` — required to read the account's media list.
   - `instagram_business_content_publish` — optional today; we ask for it so
     the future "Publish from Kindred to your IG" flow doesn't need a second
     review round.
   Explain the use case: "Kindred is an independent-brand marketplace. When a
   seller connects their Instagram Business account we mirror their posts to
   their Kindred brand page. No data is shared with third parties. Tokens
   are stored server-side, RLS-locked to the account owner."
8. Meta will ask for a screencast — record one where a brand hits Connect
   Instagram from `/dashboard?tab=Connections`, completes login, and sees
   their posts appear on their Kindred page.
9. Once approved, from **App settings → Basic** copy:
   - `App ID` → `META_APP_ID`
   - `App Secret` → `META_APP_SECRET`

---

## 2. TikTok

TikTok's Login Kit v2 (`video.list` scope) approval is faster; typical
turnaround is 3–5 business days.

1. Go to <https://developers.tiktok.com>, sign in, **Manage apps → Create app**.
2. Name: "Kindred". Category: "Shopping / commerce".
3. In **Login Kit** → add these scopes: `user.info.basic`, `video.list`.
4. Set **Redirect URI**: `https://<your-site>/api/oauth/tiktok/callback`.
5. Submit for review. Provide the same explanation as the Meta case: we only
   read the user's own videos; we never publish, comment or DM.
6. Once approved, from the app's page copy:
   - `Client Key` → `TIKTOK_CLIENT_KEY`
   - `Client Secret` → `TIKTOK_CLIENT_SECRET`

---

## 3. Vercel env vars

Add every variable below in **Vercel → Project → Settings → Environment
variables**. Mark "Production" (and "Preview" if you want to test on preview
deploys). Don't check them into git.

| Name | Where it comes from | Notes |
| --- | --- | --- |
| `META_APP_ID` | Meta app basic settings | Public-ish (used in redirect). |
| `META_APP_SECRET` | Meta app basic settings | Server-only. |
| `TIKTOK_CLIENT_KEY` | TikTok app page | Public-ish. |
| `TIKTOK_CLIENT_SECRET` | TikTok app page | Server-only. |
| `INTEGRATIONS_SIGNING_SECRET` | You generate | Any long random string. Used to HMAC-sign the OAuth state param so callbacks can verify the caller round-tripped through us. |
| `CRON_SECRET` | You generate | Any long random string. `/api/sync/all` requires it as a Bearer token (or `?secret=…`). Vercel Cron adds an `x-vercel-cron: 1` header that also authorizes the call. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project settings → API → service_role key | Server-only. Used by the hourly cron sweep to reach every brand's connection. **Never** put this behind `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_INTEGRATIONS_STATUS` | You set once | JSON string like `{"instagram":true,"tiktok":true}`. Controls whether the dashboard cards are enabled. Server routes still re-check the real secrets, so getting this wrong won't leak anything — the cards will just show the wrong state. |

**Generate the two random secrets** with:

```bash
openssl rand -base64 48
```

Run it twice — once for `INTEGRATIONS_SIGNING_SECRET`, once for
`CRON_SECRET`. Paste each into Vercel env.

---

## 4. Verify

Redeploy after env changes. Then, as a brand owner:

1. Open `/dashboard?tab=Connections`.
2. The cards should say **Connect Instagram** / **Connect TikTok**
   (not "Coming soon").
3. Click Connect Instagram → complete Meta's flow → land back on
   `/dashboard?tab=Connections&connect=ok&provider=instagram#connections`.
4. Card now shows `@your_ig_handle`, "Last synced: just now", **Sync now**
   and **Disconnect** buttons.
5. Visit `/brand/<your-slug>` → Posts tab → see your Instagram grid.
6. The hourly Vercel cron (`vercel.json` → `0 * * * *`) sweeps every
   connection automatically. Watch it in Vercel → Cron logs.

---

## 5. Rate limits & failure modes

- Meta returns HTTP 429 when you exceed ~200 calls/hour per user. The sync
  logs it and moves on; the next tick re-tries. No user-facing error.
- TikTok's `video.list` is capped at 6 requests/minute per app. We paginate
  20 videos at a time, so an account with hundreds of videos may need
  two hourly ticks to finish backfilling.
- Long-lived Meta tokens expire in 60 days. Each sync refreshes if the
  token has less than 7 days left. Users won't notice.
- TikTok tokens expire in 24 hours; the refresh token lives ~1 year. Same
  proactive refresh policy.
- If a brand revokes access from Instagram/TikTok side, the next sync will
  401 and log; the connection row stays until the brand clicks Disconnect
  or re-connects.
