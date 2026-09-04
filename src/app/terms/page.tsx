import { seo } from "@/lib/seo";
import { LegalPage, LegalH2 } from "@/components/LegalPage";

export const metadata = seo({ title: "Terms of use", description: "The terms you agree to when you use Kindred.", path: "/terms" });

export default function TermsPage() {
  return (
    <LegalPage kicker="Legal" title="Terms of use." updated="September 2026">
      <LegalH2>Your account</LegalH2>
      <p>You own it. You&apos;re responsible for what happens under your login. We reserve the right to suspend accounts that break these terms or the brand-side terms below.</p>
      <LegalH2>Orders</LegalH2>
      <p>Every order is a contract between you and the brand you bought from. Kindred is the payment holder and the customer-service backup, not the seller. If something&apos;s wrong with a piece, the brand handles the return; if the brand goes silent, we step in.</p>
      <LegalH2>Brand-side terms</LegalH2>
      <p>Brands agree to describe their pieces accurately, ship in the window they promised, and honour the return policy on the product page. Kindred keeps 8% of each order after the first 90 free days; payouts land every Friday, held only until the parcel scans.</p>
      <LegalH2>Prohibited</LegalH2>
      <p>No counterfeits. No trademark infringement. No fur. No dropshipping — you must produce or curate what you sell.</p>
      <LegalH2>Changes</LegalH2>
      <p>We&apos;ll change these terms occasionally. Material changes get an email.</p>
    </LegalPage>
  );
}
