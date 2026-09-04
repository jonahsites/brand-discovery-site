import { Page } from "@/components/ui";
import DS from "./DS";

export const metadata = { title: "Design system" };

export default function DesignSystem() {
  return (
    <Page className="pt-10">
      <div className="mb-[34px] max-w-[760px]">
        <div className="mono text-[10px] font-medium uppercase tracking-[.14em] text-ink/42">01 · Foundations</div>
        <h1 className="mb-[10px] mt-3 text-[34px] md:text-[46px] font-bold leading-[1.02] tracking-[-.035em]">Soft, rounded, no shadows.</h1>
        <p className="text-[15px] leading-[1.55] text-ink/60">Off-white page, hairline-bordered cards, frosted glass reserved for anything that floats. One accent per card. Radii top out at 18px; nothing casts a shadow.</p>
      </div>
      <DS />
    </Page>
  );
}
