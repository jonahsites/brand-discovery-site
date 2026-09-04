import { seo } from "@/lib/seo";
import Client from "./ClientFeed";

export const metadata = seo({
  title: "Discover new brands",
  description: "One brand at a time. Swipe through independent labels on Kindred — full-screen, cover to caption, follow or shop in one tap.",
  path: "/feed",
});

export default function Page() { return <Client />; }
