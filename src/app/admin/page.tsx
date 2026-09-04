import { seo } from "@/lib/seo";
import Client from "./ClientAdmin";

export const metadata = seo({ title: "Admin", description: "Kindred internal admin.", path: "/admin", noIndex: true });
export default function Page() { return <Client />; }
