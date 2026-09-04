/* eslint-disable @next/next/no-img-element -- brand-supplied image URLs come from any host; next/image needs allow-listed remotePatterns */
import clsx from "clsx";
import type { ReactNode, ButtonHTMLAttributes, CSSProperties } from "react";

export function Avatar({ init, tint, ink, size = 44, radius, className, src }: { init: string; tint: string; ink?: string; size?: number; radius?: number; className?: string; src?: string }) {
  return (
    <div
      className={clsx("grid flex-none place-items-center overflow-hidden font-bold", className)}
      style={{ width: size, height: size, borderRadius: radius ?? 999, background: tint, color: ink ?? "#121A24", fontSize: Math.round(size * 0.3), letterSpacing: "-.03em" }}
    >
      {src ? <img src={src} alt={init} className="h-full w-full object-cover" /> : init}
    </div>
  );
}

export function Placeholder({ label, className, style, children, wide, src, alt }: { label?: string; className?: string; style?: CSSProperties; children?: ReactNode; wide?: boolean; src?: string; alt?: string }) {
  return (
    <div className={clsx(!className?.includes("absolute") && "relative", "grid place-items-center overflow-hidden", !src && (wide ? "stripes-wide" : "stripes"), src && "bg-moss", className)} style={style}>
      {src ? <img src={src} alt={alt ?? label ?? ""} loading="lazy" className="absolute inset-0 h-full w-full object-cover" /> : label && <span className="mono text-[9px] font-medium uppercase tracking-[.1em] text-ink/30">{label}</span>}
      {children}
    </div>
  );
}

export function Label({ children, className, light }: { children: ReactNode; className?: string; light?: boolean }) {
  return <div className={clsx("label", light && "!text-paper/60", className)}>{children}</div>;
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "navy" | "soft" | "ghost"; size?: "sm" | "md" | "lg"; full?: boolean };
export function Button({ variant = "primary", size = "md", full, className, ...rest }: BtnProps) {
  return (
    <button
      className={clsx(
        "press inline-flex min-w-0 items-center justify-center gap-2 rounded-pill font-semibold whitespace-nowrap",
        size === "sm" && "px-4 py-[8px] text-[11px]",
        size === "md" && "px-[22px] py-[12px] text-[12px]",
        size === "lg" && "px-[26px] py-[14px] text-[12.5px]",
        variant === "primary" && "bg-ink text-paper",
        variant === "navy" && "bg-sage text-paper",
        variant === "secondary" && "bg-white text-ink soft",
        variant === "soft" && "bg-cream text-ink",
        variant === "ghost" && "bg-white/80 text-ink soft",
        full && "w-full",
        className,
      )}
      {...rest}
    />
  );
}

export function IconCircle({ children, size = 42, variant = "white", className, style, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { size?: number; variant?: "white" | "sky" | "black" | "glass" | "soft" | "peri" }) {
  return (
    <button
      className={clsx(
        "press grid flex-none place-items-center rounded-pill text-[15px] leading-none",
        variant === "white" && "bg-white soft",
        variant === "soft" && "bg-cream",
        variant === "sky" && "bg-sand",
        variant === "peri" && "bg-sand-2",
        variant === "black" && "bg-ink text-paper",
        variant === "glass" && "glass-chip",
        className,
      )}
      style={{ width: size, height: size, ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Chip({ active, children, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={clsx("press flex-none rounded-pill px-4 py-[9px] text-[11px] font-semibold", active ? "bg-ink text-paper" : "bg-white text-ink/72 soft", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Tag({ children, bg = "#E5DFD3", fg = "#121A24", className }: { children: ReactNode; bg?: string; fg?: string; className?: string }) {
  return <span className={clsx("inline-flex items-center rounded-pill px-[10px] py-[5px] text-[9px] font-semibold uppercase tracking-[.06em]", className)} style={{ background: bg, color: fg }}>{children}</span>;
}

export function Verified({ size = 15 }: { size?: number }) {
  return <span className="grid flex-none place-items-center rounded-pill bg-sage text-paper font-semibold" style={{ width: size, height: size, fontSize: size * 0.6 }}>✓</span>;
}

export function QtyStepper({ value, onChange, size = "md", className }: { value: number; onChange: (v: number) => void; size?: "sm" | "md"; className?: string }) {
  const btn = size === "sm" ? "h-7 w-7 text-[13px]" : "h-9 w-9 text-[16px]";
  return (
    <div className={clsx("flex flex-none items-center gap-[2px] rounded-pill bg-white p-1 soft", className)}>
      <button aria-label="Decrease" onClick={() => onChange(Math.max(1, value - 1))} className={clsx("press grid place-items-center rounded-pill text-ink/55", btn)}>−</button>
      <div className={clsx("text-center font-medium", size === "sm" ? "min-w-[18px] text-[12px]" : "min-w-[26px] text-[14px]")}>{value}</div>
      <button aria-label="Increase" onClick={() => onChange(value + 1)} className={clsx("press grid place-items-center rounded-pill bg-ink text-paper", btn)}>+</button>
    </div>
  );
}

export function SectionHead({ title, sub, action, href }: { title: ReactNode; sub?: string; action?: string; href?: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <div>
        <h3 className="text-[19px] md:text-[22px] leading-tight">{title}</h3>
        {sub && <div className="mt-1 text-[12.5px] text-ink/48">{sub}</div>}
      </div>
      {action && <a href={href ?? "#"} className="text-[12.5px] font-semibold text-ink whitespace-nowrap">{action} →</a>}
    </div>
  );
}

export function Page({ children, className, narrow }: { children: ReactNode; className?: string; narrow?: boolean }) {
  return <main className={clsx("mx-auto w-full px-4 md:px-10 pb-16", narrow ? "max-w-[1100px]" : "max-w-[1440px]", className)}>{children}</main>;
}

export const inputCls = "w-full rounded-[16px] bg-white px-4 py-3 text-[13px] font-medium outline-none shadow-[inset_0_0_0_1px_rgba(18,26,36,.07)] focus:shadow-[inset_0_0_0_1.5px_rgba(18,26,36,.5)] placeholder:text-ink/38";
