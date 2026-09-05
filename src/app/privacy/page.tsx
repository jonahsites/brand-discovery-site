import { seo } from "@/lib/seo";
import { LegalPage, LegalH2 } from "@/components/LegalPage";

export const metadata = seo({ title: "Privacy policy", description: "How Kindred collects, uses, and protects your data.", path: "/privacy" });

export default function PrivacyPage() {
  return (
    <LegalPage kicker="Legal" title="Privacy policy." updated="September 2026">
      <p>Kindred (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates the marketplace at shopkindred.org. This policy explains what data we collect, why, where we store it, and how you can get it back or have it deleted.</p>

      <LegalH2>What we collect</LegalH2>
      <ul>
        <li><strong>Account data:</strong> your name, email, and password hash.</li>
        <li><strong>Preferences:</strong> the style tags and sizes you chose during onboarding.</li>
        <li><strong>Activity:</strong> your bag, orders, follows, saved pieces, gift cards, reviews, and messages you send to brands.</li>
        <li><strong>Brand data</strong> (sellers only): the fields you entered in the seller wizard, plus any products, posts, drops, promos, and lookbooks you create.</li>
        <li><strong>Social integrations</strong> (opt-in, sellers only): if you connect Instagram or TikTok, we store the OAuth access token, refresh token, expiry, your platform username, and the public posts we import from your account. Details below.</li>
        <li><strong>Technical:</strong> anonymised page-view counts via Vercel Analytics. No cross-site tracking, no advertising IDs.</li>
      </ul>

      <LegalH2>How we use Instagram and TikTok data</LegalH2>
      <p>When you connect an Instagram or TikTok account in Dashboard → Connections, we request only the minimum scopes needed to display your public posts on your Kindred brand page:</p>
      <ul>
        <li><strong>Instagram (Meta Graph API):</strong> <code>instagram_business_basic</code>. We read your username and your public media (id, caption, media URL, thumbnail, permalink, timestamp, media type).</li>
        <li><strong>TikTok (Display API):</strong> <code>user.info.basic</code> and <code>video.list</code>. We read your username and your public videos (id, cover image, description, share URL, embed link, create time, duration).</li>
      </ul>
      <p>We do <strong>not</strong> read direct messages, follower lists, ad accounts, private posts, insights, or anything not listed above. We do not post on your behalf. We do not sell this data to anyone.</p>
      <p>Imported posts appear on your public Kindred brand page with a badge that links back to the original post on Instagram or TikTok. A background job runs once per hour to pull any new posts you&apos;ve made since the last sync.</p>
      <p><strong>Storage.</strong> Access tokens live server-side in a Supabase Postgres table with row-level security enabled — only your account can read them, and they are never exposed to the browser. Post metadata lives in the <code>posts</code> table alongside your Kindred-native posts.</p>
      <p><strong>Retention and deletion.</strong> Disconnecting your Instagram or TikTok from Dashboard → Connections immediately revokes the token on our side, deletes the token row, and removes every post that was imported from that platform within 24 hours. You can also revoke access at any time from Instagram (Settings → Apps and Websites) or TikTok (Settings → Manage app permissions); when we detect a revoked token during the next sync we treat it the same as a disconnect.</p>

      <LegalH2>Where we store it</LegalH2>
      <p>Supabase (Postgres, hosted in the AWS us-east-1 region). Row-level security is on for every table. Passwords are hashed by Supabase Auth (bcrypt). Access tokens for connected social accounts sit in a table only the owning brand can read.</p>

      <LegalH2>Who we share it with</LegalH2>
      <ul>
        <li>The brand that ships your order sees your shipping address and the items you bought — nothing else.</li>
        <li>Payment card details go straight to Stripe and never touch our servers.</li>
        <li>We do <strong>not</strong> sell your data. We do not share it with data brokers or advertisers.</li>
        <li>We disclose data only when legally compelled (subpoena, court order) and, when the law permits, will tell you first.</li>
      </ul>

      <LegalH2>Cookies</LegalH2>
      <p>Only the essentials: your login session, your bag, your UI preferences. No third-party trackers.</p>

      <LegalH2>Your rights</LegalH2>
      <ul>
        <li><strong>Access:</strong> email us and we&apos;ll send you a JSON export of everything we hold on you within 30 days.</li>
        <li><strong>Deletion:</strong> delete your account from Account → Settings, or email us. We&apos;ll remove your data within 30 days except where we&apos;re required to keep records (tax law: order records for 7 years, redacted of personal identifiers where possible).</li>
        <li><strong>Correction:</strong> update any field on your account or brand profile directly in the app.</li>
        <li><strong>Withdraw consent</strong> for the social integrations at any time by disconnecting in Dashboard → Connections.</li>
      </ul>

      <LegalH2>Children</LegalH2>
      <p>Kindred is not intended for anyone under 13. We don&apos;t knowingly collect data from children under 13.</p>

      <LegalH2>Changes</LegalH2>
      <p>We&apos;ll update this policy when we materially change what we collect or how we use it. The &ldquo;updated&rdquo; date at the top of this page is authoritative; we&apos;ll also email registered users about material changes.</p>

      <LegalH2>Contact</LegalH2>
      <p>Privacy questions or data requests: <a href="mailto:hello@shopkindred.org">hello@shopkindred.org</a>.</p>
    </LegalPage>
  );
}
