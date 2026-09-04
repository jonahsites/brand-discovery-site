import { routeSeo } from "@/lib/seo";
import Client from "./ClientCheckout";

export const metadata = routeSeo("/checkout");
export default function Page() { return <Client />; }
