import { routeSeo } from "@/lib/seo";
import Client from "./ClientVerify";

export const metadata = { ...routeSeo("/login"), title: "Check your email" };
export default function Page() { return <Client />; }
