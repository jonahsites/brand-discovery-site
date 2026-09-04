import { Page } from "@/components/ui";
import DS from "./DS";

export const metadata = { title: "Design system" };

export default function DesignSystem() {
  return (
    <Page className="pt-10">
      <div className="mb-[34px] max-w-[760px]">
        <div className="mono text-[10px] font-medium uppercase tracking-[.14em] text-black/42">01 · Foundations</div>
        <h1 className="mb-[10px] mt-3 text-[34px] md:text-[46px] font-bold leading-[1.02] tracking-[-.035em]">Soft, rounded, slightly liquid.</h1>
        <p className="text-[15px] leading-[1.55] text-black/60">Off-white page, solid content cards, frosted glass reserved for anything that floats. One accent per card. If a corner is sharp, it&apos;s a bug.</p>
      </div>
      <DS />
    </Page>
  );
}
