import type { ReactNode } from "react";
import { Page } from "@/components/ui";

export function LegalPage({ kicker, title, updated, children }: { kicker: string; title: string; updated: string; children: ReactNode }) {
  return (
    <Page narrow className="pt-8 md:pt-14 pb-24">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[.14em] text-ink/50">{kicker}</div>
      <h1 className="text-[42px] md:text-[56px] leading-[.95] tracking-[-.015em]" style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}>{title}</h1>
      <div className="mono mt-3 text-[11px] text-ink/45">Last updated {updated}</div>
      <div className="mt-10 flex flex-col gap-6 text-[14.5px] leading-[1.7] text-ink/70">{children}</div>
    </Page>
  );
}

/** Section heading inside a legal page. Use once per major topic. */
export function LegalH2({ children }: { children: ReactNode }) {
  return <h2 className="mt-4 text-[24px] leading-[1.15] tracking-[-.015em] text-ink" style={{ fontFamily: "var(--font-instrument), Georgia, serif" }}>{children}</h2>;
}
