import { seo } from "@/lib/seo";
import { LegalPage, LegalH2 } from "@/components/LegalPage";
import Link from "next/link";

export const metadata = seo({ title: "Contact", description: "How to reach the Kindred team.", path: "/contact" });

export default function ContactPage() {
  return (
    <LegalPage kicker="Support" title="Say hello." updated="September 2026">
      <p>The fastest way to reach the team is email. We usually answer within a business day.</p>
      <LegalH2>General</LegalH2>
      <p>Anything about your account, an order, a payout, or a bug: <a href="mailto:hello@kindred.shop" className="font-semibold text-ink underline">hello@kindred.shop</a></p>
      <LegalH2>Press</LegalH2>
      <p>Interviews, product loans, feature requests from writers: <a href="mailto:press@kindred.shop" className="font-semibold text-ink underline">press@kindred.shop</a></p>
      <LegalH2>Sell on Kindred</LegalH2>
      <p>Independent label, real workshop, own the pattern? <Link href="/sell" className="font-semibold text-ink underline">Open a brand account</Link> — the onboarding is five minutes and doesn&apos;t need us to approve it. Questions before you start: <a href="mailto:brands@kindred.shop" className="font-semibold text-ink underline">brands@kindred.shop</a></p>
    </LegalPage>
  );
}
