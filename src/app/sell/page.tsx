import { routeSeo } from "@/lib/seo";
import Client from "./ClientSell";

export const metadata = routeSeo("/sell");
export default function Page() { return <Client />; }
