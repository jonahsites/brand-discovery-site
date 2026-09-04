"use client";
/**
 * Kindred's tactile button — modelled on the physical key-fob buttons you sent, but in the site's
 * paper palette instead of black. A cream slab, an inset bottom edge that reads as a bevel, a small
 * highlight along the top, and a sage LED bar when active. Use it for chip-style choices where the
 * "flat" feeling was strongest: onboarding style tags, feed switchers, category chips.
 *
 * Prefer <Fob active onClick=...>label</Fob>; wrap a row with <FobRow> so the buttons share the
 * gap and don't inherit any pill styles.
 */
import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Fob({
  active = false,
  size = "md",
  className,
  children,
  led = "sage",
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  active?: boolean;
  size?: "sm" | "md" | "lg";
  /** Colour of the LED bar that lights up on active. Defaults to sage. */
  led?: "sage" | "moss" | "ink";
  children: ReactNode;
}) {
  const pad =
    size === "sm" ? "px-[13px] py-[9px] text-[11px] rounded-[13px]" :
    size === "lg" ? "px-6 py-[16px] text-[13px] rounded-[20px]" :
    "px-5 py-[13px] text-[12px] rounded-[17px]";
  const ledColour = led === "moss" ? "var(--moss)" : led === "ink" ? "var(--ink)" : "var(--sage)";
  return (
    <button
      type="button"
      {...rest}
      data-active={active || undefined}
      className={clsx(
        "fob press relative inline-flex flex-none items-center justify-center gap-2 font-semibold",
        "text-ink whitespace-nowrap select-none",
        pad,
        className,
      )}
      style={{ ["--fob-led" as string]: ledColour, ...(rest.style ?? {}) }}
    >
      <span className="fob-led" aria-hidden="true" />
      <span className="relative">{children}</span>
    </button>
  );
}

export function FobRow({ children, className, scroll }: { children: ReactNode; className?: string; scroll?: boolean }) {
  return (
    <div className={clsx(scroll ? "no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0" : "flex flex-wrap gap-2", className)}>
      {children}
    </div>
  );
}
