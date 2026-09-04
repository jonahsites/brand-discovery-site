import { routeSeo } from "@/lib/seo";
import Client from "./ClientMessages";

export const metadata = routeSeo("/messages");
export default function Page() { return <Client />; }
