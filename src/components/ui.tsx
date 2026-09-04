import clsx from "clsx";
import type { ReactNode, ButtonHTMLAttributes, CSSProperties } from "react";

export function Avatar({ init, tint, ink, size = 44, radius, className }: { init: string; tint: string; ink?: string; size?: number; radius?: number; className?: string }) {
  return (
    <div
      className={clsx("grid flex-none place-items-center font-bold", className)}
      style={{ width: size, height: size, borderRadius: radius ?? 999, background: tint, color: ink ?? "#1A1A1A", fontSize: Math.round(size * 0.3), letterSpacing: "-.03em" }}
    >
      {init}
    </div>
  );
}

export function Placeholder({ label, className, style, children, wide }: { label?: string; className?: string; style?: CSSProperties; children?: ReactNode; wide?: boolean }) {
  return (
    <div className={clsx(!className?.includes("absolute") && "relative", "grid place-items-center overflow-hidden", wide ? "stripes-wide" : "stripes", className)} style={style}>
      {label && <span className="mono text-[9px] font-medium uppercase tracking-[.1em] text-black/30">{label}</span>}
      {children}
    </div>
  );
}

export function Label({ children, className, light }: { children: ReactNode; className?: string; light?: boolean }) {
  return <div className={clsx("label", light && "!text-offwhite/60", className)}>{children}</div>;
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "navy" | "soft" | "ghost"; size?: "sm" | "md" | "lg"; full?: boolean };
export function Button({ variant = "primary", size = "md", full, className, ...rest }: BtnProps) {
  return (
    <button
      className={clsx(
        "press inline-flex items-center justify-center gap-2 rounded-pill font-semibold whitespace-nowrap",
        size === "sm" && "px-4 py-2 text-[12px]",
        size === "md" && "px-6 py-3 text-[13.5px]",
        size === "lg" && "px-8 py-4 text-[14.5px]",
        variant === "primary" && "bg-black text-white",
        variant === "navy" && "bg-navy text-offwhite",
        variant === "secondary" && "bg-white text-ink border border-black/14",
        variant === "soft" && "bg-offwhite text-ink",
        variant === "ghost" && "bg-white/70 border border-white/90 text-ink",
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
        variant === "white" && "bg-white border border-black/8",
        variant === "soft" && "bg-offwhite",
        variant === "sky" && "bg-sky",
        variant === "peri" && "bg-peri",
        variant === "black" && "bg-black text-white",
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
      className={clsx("press flex-none rounded-pill px-[18px] py-[10px] text-[12.5px] font-medium border", active ? "bg-black text-white border-black" : "bg-white text-ink border-black/10", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Tag({ children, bg = "#DBE1EF", fg = "#1A1A1A", className }: { children: ReactNode; bg?: string; fg?: string; className?: string }) {
  return <span className={clsx("inline-flex items-center rounded-pill px-3 py-[6px] text-[9.5px] font-semibold uppercase tracking-[.09em]", className)} style={{ background: bg, color: fg }}>{children}</span>;
}

export function Verified({ size = 15 }: { size?: number }) {
  return <span className="grid flex-none place-items-center rounded-pill bg-navy text-white font-semibold" style={{ width: size, height: size, fontSize: size * 0.6 }}>✓</span>;
}

export function QtyStepper({ value, onChange, size = "md", className }: { value: number; onChange: (v: number) => void; size?: "sm" | "md"; className?: string }) {
  const btn = size === "sm" ? "h-7 w-7 text-[13px]" : "h-9 w-9 text-[16px]";
  return (
    <div className={clsx("flex flex-none items-center gap-1 rounded-pill bg-offwhite p-[5px]", className)}>
      <button aria-label="Decrease" onClick={() => onChange(Math.max(1, value - 1))} className={clsx("press grid place-items-center rounded-pill bg-white", btn)}>−</button>
      <div className={clsx("text-center font-medium", size === "sm" ? "min-w-[18px] text-[12px]" : "min-w-[26px] text-[14px]")}>{value}</div>
      <button aria-label="Increase" onClick={() => onChange(value + 1)} className={clsx("press grid place-items-center rounded-pill bg-white", btn)}>+</button>
    </div>
  );
}

export function SectionHead({ title, sub, action, href }: { title: ReactNode; sub?: string; action?: string; href?: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <div>
        <h3 className="text-[19px] md:text-[21px] font-semibold leading-tight tracking-[-.025em]">{title}</h3>
        {sub && <div className="mt-1 text-[12.5px] text-black/48">{sub}</div>}
      </div>
      {action && <a href={href ?? "#"} className="text-[12.5px] font-semibold text-navy whitespace-nowrap">{action} →</a>}
    </div>
  );
}

export function Page({ children, className, narrow }: { children: ReactNode; className?: string; narrow?: boolean }) {
  return <main className={clsx("mx-auto w-full px-4 md:px-10 pb-16", narrow ? "max-w-[1100px]" : "max-w-[1440px]", className)}>{children}</main>;
}
