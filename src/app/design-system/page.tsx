import { Page } from "@/components/ui";
import DS from "./DS";

export const metadata = { title: "Design system" };

export default function DesignSystem() {
  return (
    <Page className="pt-10">
      <div className="mb-[34px] max-w-[760px]">
        <div className="label">01 — Kindred</div>
        <h1 className="mb-[10px] mt-3 text-[34px] md:text-[46px] font-extrabold leading-[1.02] tracking-[-.035em]">Foundations</h1>
        <p className="text-[15px] leading-[1.55] text-ink/60">Paper page, cream panels, sand tones, ink type, sage accent. Cards are white at 24px with a long soft shadow. Pill controls, navy CTAs.</p>
      </div>
      <DS />
    </Page>
  );
}
