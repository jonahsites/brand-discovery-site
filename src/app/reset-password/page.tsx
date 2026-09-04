import { routeSeo } from "@/lib/seo";
import Client from "./ClientReset";

export const metadata = { ...routeSeo("/login"), title: "Reset your password" };
export default function Page() { return <Client />; }
