import { seo } from "@/lib/seo";
import { LegalPage, LegalH2 } from "@/components/LegalPage";

export const metadata = seo({ title: "Terms of service", description: "The terms you agree to when you use Kindred.", path: "/terms" });

export default function TermsPage() {
  return (
    <LegalPage kicker="Legal" title="Terms of service." updated="September 2026">
      <p>These terms govern your use of Kindred, the independent-clothing-brand marketplace operated at shopkindred.org (the &ldquo;Service&rdquo;). By creating an account or using the Service you agree to these terms.</p>

      <LegalH2>Your account</LegalH2>
      <p>You own it. You&apos;re responsible for what happens under your login and for keeping your credentials safe. We reserve the right to suspend accounts that break these terms.</p>

      <LegalH2>Orders</LegalH2>
      <p>Every order is a contract between you and the brand you bought from. Kindred records the order and passes your details to the brand; today the brand contacts you directly to arrange payment and shipping (built-in payment is coming). If something&apos;s wrong with a piece, the brand handles the return; if the brand goes silent, we step in.</p>

      <LegalH2>Brand-side terms</LegalH2>
      <p>Brands agree to describe their pieces accurately, ship in the window they promised, and set a return policy on their brand page. Kindred takes a one-time placement fee to list on the marketplace; per-order fees and payout schedules will be described here once built-in payment is live.</p>

      <LegalH2>Connecting your Instagram or TikTok</LegalH2>
      <p>You may optionally connect the Instagram or TikTok account that belongs to your brand so we can automatically display your public posts on your Kindred brand page. When you connect an account:</p>
      <ul>
        <li>You confirm you are the owner of that account or are authorised to link it.</li>
        <li>We read your public posts (caption, media URL, permalink, timestamp) via the official Meta Graph API or TikTok Display API. We do not read direct messages, followers, or any private data.</li>
        <li>We display your posts on your public brand page with a badge linking back to the original post on Instagram or TikTok. You can disconnect at any time from Dashboard → Connections, which stops the sync and removes the imported posts within 24 hours.</li>
        <li>Continued use of the Service after you connect an account means you consent to this display of your public content on Kindred.</li>
        <li>Your access tokens are stored server-side in an encrypted, row-level-secured database column. They are never sent to the browser and are used only for the sync we describe above.</li>
      </ul>
      <p>You retain full ownership of everything you post on Instagram or TikTok. Kindred does not claim any license beyond the temporary display described here.</p>

      <LegalH2>Prohibited</LegalH2>
      <p>No counterfeits. No trademark infringement. No fur. No dropshipping — you must produce or curate what you sell. No connecting social accounts you do not own or control.</p>

      <LegalH2>Termination</LegalH2>
      <p>You can delete your account at any time from Account → Settings, or by emailing hello@shopkindred.org. We can suspend or terminate your account for breach of these terms; we&apos;ll tell you why.</p>

      <LegalH2>Disclaimers</LegalH2>
      <p>The Service is provided &ldquo;as is&rdquo;. Kindred is not liable for indirect or consequential damages beyond the value of the last order you placed.</p>

      <LegalH2>Governing law</LegalH2>
      <p>These terms are governed by the laws of the State of California, without regard to conflict-of-law rules.</p>

      <LegalH2>Changes</LegalH2>
      <p>We&apos;ll update these terms occasionally. Material changes get an email; the &ldquo;updated&rdquo; date at the top of this page is authoritative.</p>

      <LegalH2>Contact</LegalH2>
      <p>Questions: <a href="mailto:hello@shopkindred.org">hello@shopkindred.org</a>.</p>
    </LegalPage>
  );
}
