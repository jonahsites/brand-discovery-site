"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { track } from "@/lib/analytics";

/** Fires a page_view whenever the route or query changes. Mounted once in the layout. */
export default function Analytics() {
  const path = usePathname();
  const sp = useSearchParams();
  useEffect(() => {
    track("page_view", { path, q: sp.toString() });
  }, [path, sp]);
  return null;
}
