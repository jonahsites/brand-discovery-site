/**
 * Single-stroke line icons at 20/22/24px. All render `currentColor`, so they inherit the
 * button/link color and stay honest to the ink palette. Naming maps to what the app uses.
 * Sizes: 18 in the nav pills, 20 in the tab bar / bag drawer, 24 for hero controls.
 */
import type { SVGProps } from "react";
import clsx from "clsx";

type P = SVGProps<SVGSVGElement> & { size?: number };

const S = ({ size = 20, className, children, ...rest }: P & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={clsx("flex-none", className)} {...rest} aria-hidden="true">{children}</svg>
);

export const IconDiscover = (p: P) => <S {...p}><path d="M3.5 9.5 12 3.5 20.5 9.5 20.5 20.5 3.5 20.5Z" /><path d="M9 20.5v-6h6v6" /></S>;
export const IconExplore = (p: P) => <S {...p}><circle cx="12" cy="12" r="8.5" /><path d="M16.5 7.5 13 13l-5.5 3.5L11 11Z" /></S>;
export const IconSearch = (p: P) => <S {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20.5 20.5-4.7-4.7" /></S>;
export const IconHeart = ({ filled, ...p }: P & { filled?: boolean }) => <S {...p}><path d={filled ? "M12 20.5s-8-4.7-8-11.2c0-2.8 2.3-5 5-5 1.6 0 3 .8 3.9 2 1-1.2 2.4-2 4-2 2.7 0 5.1 2.2 5.1 5 0 6.5-8 11.2-8 11.2Z" : "M12 20.5s-8-4.7-8-11.2c0-2.8 2.3-5 5-5 1.6 0 3 .8 3.9 2 1-1.2 2.4-2 4-2 2.7 0 5.1 2.2 5.1 5 0 6.5-8 11.2-8 11.2Z"} fill={filled ? "currentColor" : "none"} /></S>;
export const IconBag = (p: P) => <S {...p}><path d="M5.5 8h13l-1 12h-11Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></S>;
export const IconBell = (p: P) => <S {...p}><path d="M6 17V11a6 6 0 0 1 12 0v6" /><path d="M4 17h16" /><path d="M10.5 20.5a1.5 1.5 0 0 0 3 0" /></S>;
export const IconUser = (p: P) => <S {...p}><circle cx="12" cy="8.5" r="3.5" /><path d="M4.5 20c1.5-3.5 4.5-5 7.5-5s6 1.5 7.5 5" /></S>;
export const IconArrow = (p: P) => <S {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></S>;
export const IconClose = (p: P) => <S {...p}><path d="m6 6 12 12" /><path d="m18 6-12 12" /></S>;
export const IconPlus = (p: P) => <S {...p}><path d="M12 5v14" /><path d="M5 12h14" /></S>;
export const IconMinus = (p: P) => <S {...p}><path d="M5 12h14" /></S>;
export const IconChat = (p: P) => <S {...p}><path d="M4 5h16v11H10l-4 4v-4H4Z" /></S>;
export const IconCheck = (p: P) => <S {...p}><path d="m5 12 4.5 4.5L20 6" /></S>;
export const IconLookbook = (p: P) => <S {...p}><rect x="4" y="4" width="16" height="16" rx="1.5" /><path d="M4 9h16" /><path d="M12 4v16" /></S>;
export const IconBrands = (p: P) => <S {...p}><path d="M4 8h4l1.5-3h5L16 8h4l-2 12H6Z" /></S>;
export const IconShare = (p: P) => <S {...p}><path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" /><path d="M8 8l4-4 4 4" /><path d="M12 4v12" /></S>;
