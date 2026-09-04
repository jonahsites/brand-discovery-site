import { seo } from "@/lib/seo";
import { LegalPage, LegalH2 } from "@/components/LegalPage";

export const metadata = seo({ title: "Privacy", description: "How Kindred handles the data you give it.", path: "/privacy" });

export default function PrivacyPage() {
  return (
    <LegalPage kicker="Legal" title="Privacy." updated="September 2026">
      <p>This is the short version. If you want the long one, ask us — we&apos;ll write it plainly, not in legalese.</p>
      <LegalH2>What we store</LegalH2>
      <p>Your name, email, and the choices you made in onboarding (style tags, sizes). Your bag, orders, follows, saved pieces, and gift cards. If you signed in with Google or Apple or X, we store the id they gave us so we know it&apos;s you next time.</p>
      <LegalH2>Where we store it</LegalH2>
      <p>Supabase (Postgres). Row-level security is on so each row is only visible to the account that owns it.</p>
      <LegalH2>Who we share it with</LegalH2>
      <p>The brand that ships your order sees your shipping address and the items you bought — no more. Payment card details go straight to Stripe and never touch our servers. Analytics stays in your browser today (localStorage only); when we add a real analytics vendor we&apos;ll say so here.</p>
      <LegalH2>Getting your data back or deleted</LegalH2>
      <p>Ask us at hello@kindred.shop and we&apos;ll send you a JSON export or delete the account, whichever you want.</p>
      <LegalH2>Cookies</LegalH2>
      <p>Only the essential ones — your login session and your bag. No third-party trackers.</p>
    </LegalPage>
  );
}
