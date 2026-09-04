import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Instrument_Serif, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SITE, absUrl, orgJsonLd, siteJsonLd, ldScript } from "@/lib/seo";
import { AppProvider } from "@/lib/store";
import TopNav from "@/components/TopNav";
import MobileTabBar from "@/components/MobileTabBar";
import BagDrawer from "@/components/BagDrawer";
import SearchOverlay from "@/components/SearchOverlay";
import Footer from "@/components/Footer";
import Toaster from "@/components/Toaster";
import Personalize from "@/components/Personalize";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});
const instrument = Instrument_Serif({ variable: "--font-instrument-serif", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const space = Space_Grotesk({ variable: "--font-space", subsets: ["latin"], weight: ["500", "700"] });
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "shopping",
  alternates: { canonical: SITE.url },
  openGraph: {
    type: "website", url: SITE.url, siteName: SITE.name, locale: SITE.locale,
    title: `${SITE.name} — ${SITE.tagline}`, description: SITE.description,
    images: [{ url: absUrl(SITE.ogImage), width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: { card: "summary_large_image", site: SITE.twitter, creator: SITE.twitter, title: `${SITE.name} — ${SITE.tagline}`, description: SITE.description, images: [absUrl(SITE.ogImage)] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  formatDetection: { email: false, telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#F6F4EF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable} ${instrument.variable} ${space.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldScript(orgJsonLd()) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldScript(siteJsonLd()) }} />
      </head>
      <body className="min-h-full flex flex-col">
        <AppProvider>
          <Personalize />
          <TopNav />
          <div className="flex-1 pb-20 md:pb-0">{children}<Footer /></div>
          <MobileTabBar />
          <BagDrawer />
          <SearchOverlay />
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
