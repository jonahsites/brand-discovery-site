import { routeSeo } from "@/lib/seo";
import Client from "./ClientDashboard";

export const metadata = routeSeo("/dashboard");
export default function Page() { return <Client />; }
