import { routeSeo } from "@/lib/seo";
import Client from "./ClientAccount";

export const metadata = routeSeo("/account");
export default function Page() { return <Client />; }
