"use client";

import Link from "next/link";
import { useScrollToTopOnHomeClick } from "@/hooks/use-scroll-to-top-on-home-click";
import { cn } from "@/lib/ui/cn";
import { GOLD_GLOW_TEXT_SHADOW } from "@/lib/ui/gold-glow";

export type NavLinkVariant = "header" | "footer";

export interface NavLinkProps {
  /** Destination — internal route or same-page anchor (e.g. `#awards-section`). */
  href: string;
  /** Link label, taken verbatim from the Figma text layer. */
  label: string;
  /** Marks this as the current page's nav item (gold underline/background +
   * text glow). */
  selected?: boolean;
  /** Which frozen Figma nav instance this reproduces — `"header"` (default,
   * `186:1426`, rounded pill) or `"footer"` (`342:1410`-`1413`, square
   * corners, larger type). Only the visual treatment differs; both wire the
   * same scroll-to-top-on-home-click + `aria-current` behavior. */
  variant?: NavLinkVariant;
}

const VARIANT_STYLES: Record<NavLinkVariant, { base: string; active: string; inactive: string }> = {
  header: {
    base: "font-montserrat inline-flex items-center justify-center rounded-[4px] px-4 py-4 text-center text-sm leading-5 font-bold tracking-[0.1px] whitespace-nowrap transition-colors duration-200 ease-out",
    active: "border-b border-[#FFEA9E] text-[#FFEA9E]",
    inactive: "text-white hover:bg-white/10",
  },
  footer: {
    base: "inline-flex items-center justify-center rounded-none px-4 py-4 text-center text-base leading-6 font-bold tracking-[0.15px] whitespace-nowrap transition-colors duration-200 ease-out",
    active: "bg-[#FFEA9E]/10 text-white",
    inactive: "text-white hover:bg-white/10",
  },
};

/**
 * Header nav item — MoMorph component set `186:1426`, frozen in the design
 * as three separate state instances that are actually ONE reusable link:
 * - `I2167:9091;186:1579` mms_A1.2_Button-Selected state ("About SAA 2025")
 * - `I2167:9091;186:1587` mms_A1.3_Button Hover State ("Award Information")
 * - `I2167:9091;186:1593` mms_A1.5_Button-Normal state ("Sun* Kudos")
 *
 * Also covers the footer's nav row (`342:1410`-`1413`, square-cornered,
 * larger type — see `variant="footer"`), which used to be a separate
 * `FooterNavLink` hand-copied inline in `site-footer.tsx` with the exact
 * same wiring (`useScrollToTopOnHomeClick` + `aria-current` + gold
 * text-glow), differing only in radius/size/active-state color.
 *
 * `selected` reproduces the active-state gold underline/background +
 * text-glow; the inactive state gets a real CSS `:hover` (white text,
 * `bg-white/10` highlight) instead of a second frozen "hover" component.
 */
export function NavLink({ href, label, selected = false, variant = "header" }: NavLinkProps) {
  const handleClick = useScrollToTopOnHomeClick(href);
  const styles = VARIANT_STYLES[variant];

  return (
    // mm:186:1426
    <Link
      href={href}
      onClick={handleClick}
      aria-current={selected ? "page" : undefined}
      className={cn(styles.base, selected ? styles.active : styles.inactive)}
      style={selected ? { textShadow: GOLD_GLOW_TEXT_SHADOW } : undefined}
    >
      {label}
    </Link>
  );
}

/**
 * True when `pathname` matches `href` — exact match for `/`, prefix match
 * otherwise, so nested routes under `/awards`/`/kudos` stay active. A
 * missing `pathname` resolves to not-active rather than throwing — the
 * single source of truth for what used to be two near-identical
 * `isActive` helpers (`site-header.tsx`, `site-footer.tsx`), unified to the
 * safer of the two (`site-header.tsx`'s `?.`/`?? false`); `usePathname()`
 * always returns a string in both call sites in practice, so this is a
 * no-op for real behavior, just a shared, defensive implementation.
 */
export function isNavLinkActive(pathname: string | null | undefined, href: string): boolean {
  return href === "/" ? pathname === "/" : (pathname?.startsWith(href) ?? false);
}
