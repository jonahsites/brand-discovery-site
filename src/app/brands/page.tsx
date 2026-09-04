import { routeSeo } from "@/lib/seo";
import Client from "./ClientBrands";

export const metadata = routeSeo("/brands");
export default function Page() { return <Client />; }
