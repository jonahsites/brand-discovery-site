"use client";
/**
 * Break out of the max-width container so a section can bleed a color rail to
 * the viewport edges. Content inside `PageBleed` re-centers at max-width.
 * Use for the hero and category-tile rows where a warm ground should touch
 * the edge of the screen instead of stopping at the 1440px page gutter.
 */
import type { CSSProperties, ReactNode } from "react";
import clsx from "clsx";

export default function PageBleed({
  children,
  className,
  style,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: "section" | "div" | "header" | "footer";
}) {
  return (
    <Tag
      className={clsx("relative", className)}
      style={{
        // shift left by half of (viewport - parent width), then re-widen to viewport
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
        width: "100vw",
        maxWidth: "100vw",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
