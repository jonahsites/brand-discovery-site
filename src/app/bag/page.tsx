import { routeSeo } from "@/lib/seo";
import Client from "./ClientBag";

export const metadata = routeSeo("/bag");
export default function Page() { return <Client />; }
