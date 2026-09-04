"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";

export default function ReferralLanding({ code }: { code: string }) {
  const { hydrated, applyReferral, toast } = useApp();
  const router = useRouter();
  const done = useRef(false);
  useEffect(() => {
    if (!hydrated || done.current) return;
    done.current = true;
    const ok = applyReferral(code);
    toast(ok ? `Welcome. ${code} sent you; 200 points are on your account.` : "That referral link has already been used on this device.");
    router.replace(ok ? "/onboarding" : "/");
  }, [hydrated, code, applyReferral, toast, router]);
  return null;
}
