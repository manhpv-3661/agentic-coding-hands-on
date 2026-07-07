"use client";

import Image from "next/image";
import Link from "next/link";
import { Montserrat, Montserrat_Alternates } from "next/font/google";
import { usePathname } from "next/navigation";
import { useScrollToTopOnHomeClick } from "@/hooks/use-scroll-to-top-on-home-click";
import type { Dictionary } from "@/lib/i18n/dictionary";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["700"],
  display: "swap",
});

const montserratAlternates = Montserrat_Alternates({
  subsets: ["latin", "vietnamese"],
  weight: ["700"],
  display: "swap",
});

interface FooterNavLinkProps {
  /** Destination — internal route, same-page anchor, or `#` placeholder. */
  href: string;
  /** Link label, taken verbatim from the Figma text layer. */
  label: string;
  /** Reproduces the design's gold-tinted "Award Information" highlight state. */
  highlighted?: boolean;
}

interface SiteFooterProps {
  /** Nav link labels (`shared.nav`). */
  nav: Dictionary["shared"]["nav"];
  /** Footer copy — copyright line + "General Standards" link (`shared.footer`). */
  footer: Dictionary["shared"]["footer"];
}

/**
 * Note on `rounded-none`: the footer's `mms_7.x_Button-IC` instances are
 * square-cornered per ground truth (`borderRadius: 0px` on all 4 nodes,
 * e.g. `I5001:14800;342:1411`), unlike the header's `NavLink` sibling
 * component which is `4px` — do not "fix" this to match the header.
 */
function FooterNavLink({ href, label, highlighted = false }: FooterNavLinkProps) {
  const handleClick = useScrollToTopOnHomeClick(href);

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-current={highlighted ? "page" : undefined}
      className={`inline-flex items-center justify-center rounded-none px-4 py-4 text-center text-base leading-6 font-bold tracking-[0.15px] whitespace-nowrap transition-colors duration-200 ease-out ${
        highlighted ? "bg-[#FFEA9E]/10 text-white" : "text-white hover:bg-white/10"
      }`}
      style={
        highlighted
          ? { textShadow: "0 4px 4px rgba(0, 0, 0, 0.25), 0 0 6px #FAE287" }
          : undefined
      }
    >
      {label}
    </Link>
  );
}

/**
 * Page footer — Homepage SAA. MoMorph node `5001:14800` (mms_7_Footer).
 * https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
 *
 * Layout: brand logo + nav links (left) vs copyright (right) in one row,
 * full-bleed `border-top` divider (same `border-t` pattern as
 * `login-footer.tsx`) with the design's side padding (90px at the design's
 * 1512px frame width) — the Figma frame is already the full page width, so
 * no separate max-width container is needed here (code-rules.md rule 3,
 * Sizing). Padding scales down at narrower breakpoints
 * (`px-6 sm:px-10 lg:px-22.5`, mirroring `site-header.tsx`'s responsive
 * scale) so the fixed-width nav row + logo don't get crushed into a
 * multi-row wrap on mobile viewports — the 90px value only applies at
 * `lg`+, matching the design's actual (desktop) frame width.
 *
 * The 4 nav items are plain text links in Figma (the `mms_7.x_Button-IC`
 * component supports an icon slot, but none of these instances use it — no
 * social/media icon assets exist for this row). Hrefs: "About SAA 2025" ->
 * home, "Award Information" -> `/awards`, "Sun* Kudos" -> `/kudos` (matches
 * `site-header.tsx`'s routes), "Tiêu chuẩn chung" -> `#` placeholder (no
 * destination defined in specs/test cases). The design's gold-tinted
 * highlight (background + text glow) marks the CURRENT page's link, derived
 * from `usePathname()` — same active rule as `site-header.tsx` (the Figma
 * frame shows it on "Award Information" only because that frame depicts the
 * awards page).
 *
 * Font is scoped locally (not the shared `/login` route `fonts.ts`), same
 * pattern as `root-further-content.tsx` and `site-header.tsx` siblings on
 * this screen.
 *
 * Text-duplication note: `login-footer.tsx` renders the same copyright
 * string ("Bản quyền thuộc về Sun* © 2025") but without this footer's
 * logo/nav row — different structure, so it is intentionally not reused.
 */
export function SiteFooter({ nav, footer }: SiteFooterProps) {
  const handleLogoClick = useScrollToTopOnHomeClick("/");
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    // mm:5001:14800
    <footer className="flex w-full flex-wrap items-center justify-between gap-6 border-t border-[#2E3940] px-6 py-10 sm:px-10 lg:px-22.5">
      {/* mm:I5001:14800;342:1407 */}
      <div className="flex flex-wrap items-center gap-20">
        {/* mm:I5001:14800;342:1408 */}
        <Link
          href="/"
          aria-label="Sun* Annual Awards 2025 — home"
          onClick={handleLogoClick}
          className="flex items-center gap-2"
        >
          {/* mm:I5001:14800;342:1408;178:1030 */}
          <Image
            src="/homepage-saa/Logo.png"
            alt="Sun* Annual Awards 2025"
            width={69}
            height={64}
            className="h-16 w-[69px] object-cover"
          />
          {/* Same flattened-raster wordmark gap as site-header.tsx's logo
              (see its comment for the full rationale) — scaled up for this
              instance's larger 69x64 box. */}
          <span
            aria-hidden="true"
            className="font-montserrat flex flex-col justify-center text-[13px] leading-4 font-bold tracking-[0.2px] text-white uppercase"
          >
            <span>Sun*</span>
            <span>Annual</span>
            <span>Awards</span>
            <span>2025</span>
          </span>
        </Link>
        {/* mm:I5001:14800;342:1409 */}
        <nav
          className={`${montserrat.className} flex flex-wrap items-center gap-12`}
        >
          {/* mm:I5001:14800;342:1410 */}
          <FooterNavLink href="/" label={nav.aboutSaa} highlighted={isActive("/")} />
          {/* mm:I5001:14800;342:1411 */}
          <FooterNavLink href="/awards" label={nav.awardInfo} highlighted={isActive("/awards")} />
          {/* mm:I5001:14800;342:1412 */}
          <FooterNavLink href="/kudos" label={nav.kudos} highlighted={isActive("/kudos")} />
          {/* mm:I5001:14800;1161:9487 */}
          <FooterNavLink href="#" label={footer.generalStandards} />
        </nav>
      </div>

      {/* mm:I5001:14800;342:1413 */}
      <p
        className={`${montserratAlternates.className} text-center text-base leading-6 font-bold text-white`}
      >
        {footer.copyright}
      </p>
    </footer>
  );
}
