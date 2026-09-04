import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Instrument_Serif, Space_Grotesk } from "next/font/google";
import "./globals.css";
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
  title: { default: "Kindred", template: "%s · Kindred" },
  description: "Find your next favorite clothing brand. Independent labels, one bag, one checkout.",
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
        {/* Apply the saved look before first paint so the page never flashes the default palette. */}
        <script dangerouslySetInnerHTML={{ __html: `try{var s=JSON.parse(localStorage.getItem("kindred.v2")||"{}");if(s.look)document.documentElement.dataset.look=s.look}catch(e){}` }} />
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
