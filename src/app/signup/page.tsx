import { routeSeo } from "@/lib/seo";
import Client from "./ClientSignup";

export const metadata = routeSeo("/signup");
export default function Page() { return <Client />; }
