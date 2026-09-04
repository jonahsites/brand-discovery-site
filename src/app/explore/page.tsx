import { routeSeo } from "@/lib/seo";
import Client from "./ClientExplore";

export const metadata = routeSeo("/explore");
export default function Page() { return <Client />; }
