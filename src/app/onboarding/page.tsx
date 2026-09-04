import { routeSeo } from "@/lib/seo";
import Client from "./ClientOnboarding";

export const metadata = routeSeo("/onboarding");
export default function Page() { return <Client />; }
