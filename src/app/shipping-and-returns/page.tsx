import { seo } from "@/lib/seo";
import { LegalPage, LegalH2 } from "@/components/LegalPage";

export const metadata = seo({ title: "Shipping and returns", description: "How Kindred parcels ship and how returns work.", path: "/shipping-and-returns" });

export default function ShippingPage() {
  return (
    <LegalPage kicker="Support" title="Shipping and returns." updated="September 2026">
      <p>Each brand ships from its own workshop. That means each parcel arrives on its own timing and its own carrier. We show the estimate before you add to bag; each brand you check out with is one shipping fee.</p>
      <LegalH2>Timing</LegalH2>
      <p>Ready-made pieces ship in two to eight days depending on the brand. Made-to-order pieces are cut after your order lands — the ship date is shown on the product page.</p>
      <LegalH2>Cost</LegalH2>
      <p>Set by the brand. Two or three tiers per brand (standard, express, made-to-order). Displayed at checkout, per parcel.</p>
      <LegalH2>Returns</LegalH2>
      <p>Free returns within 30 days of delivery on any ready-made piece. Made-to-order and final-sale pieces aren&apos;t returnable — we say so on the product page.</p>
      <LegalH2>Where&apos;s my order?</LegalH2>
      <p>Your account carries every order with its live status. Kindred holds payment until each parcel scans, and each brand marks it packed → in transit → delivered.</p>
    </LegalPage>
  );
}
