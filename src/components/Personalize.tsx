"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/store";

/** Paths that work without an account. Everything else needs a signed-in, onboarded shopper. */
export const OPEN_PATHS = ["/login", "/signup", "/r/", "/design-system", "/verify-email", "/forgot-password", "/reset-password", "/about", "/contact", "/privacy", "/terms", "/shipping-and-returns"];
export const FULLSCREEN_PATHS = ["/feed"];
export const isOpenPath = (path: string) => OPEN_PATHS.some((p) => (p.endsWith("/") ? path.startsWith(p) : path === p));

/** Enforces the account gate: no account → /signup, signed out → /login, not onboarded → /onboarding. */
export default function Personalize() {
  const { hydrated, account, onboarded } = useApp();
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (!hydrated || isOpenPath(path)) return;
    const signedIn = !!account?.signedIn;
    if (!signedIn) { router.replace(`${account ? "/login" : "/signup"}?next=${encodeURIComponent(path)}`); return; }
    if (!onboarded && path !== "/onboarding") router.replace("/onboarding");
  }, [hydrated, account, onboarded, path, router]);
  return null;
}
