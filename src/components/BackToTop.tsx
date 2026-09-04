"use client";
import { useEffect, useState } from "react";

/** Fades in past 900px of scroll. Ink pill in the bottom-right. */
export default function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 900);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={
        "press fixed z-30 grid h-10 w-10 place-items-center rounded-pill bg-ink text-paper text-[16px] shadow-[var(--sh-float)] transition-opacity duration-200 " +
        (show ? "opacity-100" : "pointer-events-none opacity-0") +
        // Sit above the mobile tab bar and the sticky bag/checkout bars.
        " bottom-[86px] right-4 md:bottom-6 md:right-6"
      }
    >
      ↑
    </button>
  );
}
