import { routeSeo } from "@/lib/seo";
import Client from "./ClientGift";

export const metadata = routeSeo("/gift");
export default function Page() { return <Client />; }
