import { routeSeo } from "@/lib/seo";
import Client from "./ClientLogin";

export const metadata = routeSeo("/login");
export default function Page() { return <Client />; }
