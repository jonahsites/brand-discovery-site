"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Button, Page } from "@/components/ui";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <Page narrow className="pt-24 text-center">
      <div className="mx-auto max-w-[520px] rounded-lg bg-cream p-10">
        <div className="label mb-3">Something tore</div>
        <h1 className="mb-3 text-[30px]">That page hit a snag.</h1>
        <p className="mb-6 text-[14px] leading-[1.55] text-ink/65">Nothing you did. Try again, or head back to Discover while we look at it.{error.digest && <span className="mono block pt-2 text-[10.5px] text-ink/40">ref {error.digest}</span>}</p>
        <div className="flex justify-center gap-3"><Button onClick={reset}>Try again</Button><Link href="/"><Button variant="secondary">Back to Discover</Button></Link></div>
      </div>
    </Page>
  );
}
