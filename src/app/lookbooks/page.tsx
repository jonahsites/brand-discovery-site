import { routeSeo } from "@/lib/seo";
import Client from "./ClientLookbooks";

export const metadata = routeSeo("/lookbooks");
export default function Page() { return <Client />; }
