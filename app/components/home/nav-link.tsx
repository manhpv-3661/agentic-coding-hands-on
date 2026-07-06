"use client";

import Link from "next/link";
import { useScrollToTopOnHomeClick } from "@/hooks/use-scroll-to-top-on-home-click";

export interface NavLinkProps {
  /** Destination — internal route or same-page anchor (e.g. `#awards-section`). */
  href: string;
  /** Link label, taken verbatim from the Figma text layer. */
  label: string;
  /** Marks this as the current page's nav item (gold underline + glow). */
  selected?: boolean;
}

/**
 * Header nav item — MoMorph component set `186:1426`, frozen in the design
 * as three separate state instances that are actually ONE reusable link:
 * - `I2167:9091;186:1579` mms_A1.2_Button-Selected state ("About SAA 2025")
 * - `I2167:9091;186:1587` mms_A1.3_Button Hover State ("Award Information")
 * - `I2167:9091;186:1593` mms_A1.5_Button-Normal state ("Sun* Kudos")
 *
 * `selected` reproduces the gold underline + text-glow state; the default
 * state gets a real CSS `:hover` (white text, `bg-white/10` highlight)
 * instead of a second frozen "hover" component.
 */
export function NavLink({ href, label, selected = false }: NavLinkProps) {
  const handleClick = useScrollToTopOnHomeClick(href);

  return (
    // mm:186:1426
    <Link
      href={href}
      onClick={handleClick}
      aria-current={selected ? "page" : undefined}
      className={`font-montserrat inline-flex items-center justify-center rounded-[4px] px-2 py-4 text-center text-sm leading-5 font-bold tracking-[0.1px] whitespace-nowrap transition-colors duration-200 ease-out sm:px-3 lg:px-4 ${
        selected
          ? "border-b border-[#FFEA9E] text-[#FFEA9E]"
          : "text-white hover:bg-white/10"
      }`}
      style={
        selected
          ? { textShadow: "0 4px 4px rgba(0, 0, 0, 0.25), 0 0 6px #FAE287" }
          : undefined
      }
    >
      {label}
    </Link>
  );
}
