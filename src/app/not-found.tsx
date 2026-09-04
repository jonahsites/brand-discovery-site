import Link from "next/link";
import { Button, Page } from "@/components/ui";

export default function NotFound() {
  return (
    <Page narrow className="pt-24 text-center">
      <div className="mx-auto max-w-[520px] rounded-lg bg-peri p-10">
        <div className="label mb-3 !text-ink/48">404</div>
        <h1 className="mb-3 text-[32px] font-bold leading-[1.05] tracking-[-.04em]">Nothing hangs here.</h1>
        <p className="mb-6 text-[14.5px] leading-[1.55] text-ink/65">The page you wanted was never stitched, or a brand took it down.</p>
        <div className="flex justify-center gap-3"><Link href="/"><Button>Back to Discover</Button></Link><Link href="/explore"><Button variant="ghost">Explore brands</Button></Link></div>
      </div>
    </Page>
  );
}
