import { routeSeo } from "@/lib/seo";
import Client from "./ClientForgot";

export const metadata = { ...routeSeo("/login"), title: "Forgot your password" };
export default function Page() { return <Client />; }
