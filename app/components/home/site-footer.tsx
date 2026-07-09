"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { montserrat, montserratAlternates } from "@/app/fonts";
import { useScrollToTopOnHomeClick } from "@/hooks/use-scroll-to-top-on-home-click";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { isNavLinkActive, NavLink } from "./nav-link";

interface SiteFooterProps {
  /** Nav link labels (`shared.nav`). */
  nav: Dictionary["shared"]["nav"];
  /** Footer copy — copyright line + "General Standards" link (`shared.footer`). */
  footer: Dictionary["shared"]["footer"];
  /** Icon-only control aria-labels (`shared.a11y`) — optional/defaulted so
   * existing callers/tests that predate this prop keep compiling unchanged;
   * falls back to the English design label when omitted. */
  a11y?: Dictionary["shared"]["a11y"];
}

/**
 * Page footer — Homepage SAA. MoMorph node `5001:14800` (mms_7_Footer).
 * https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
 *
 * Layout: brand logo + nav links (left) vs copyright (right) in one row,
 * full-bleed `border-top` divider (same `border-t` pattern as
 * `login-footer.tsx`) with the design's side padding (flat 90px at the
 * design's 1512px frame width, desktop-only — no breakpoint scaling) — the
 * Figma frame is already the full page width, so no separate max-width
 * container is needed here (code-rules.md rule 3, Sizing).
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
export function SiteFooter({ nav, footer, a11y }: SiteFooterProps) {
  const handleLogoClick = useScrollToTopOnHomeClick("/");
  const pathname = usePathname();
  const isActive = (href: string) => isNavLinkActive(pathname, href);

  return (
    // mm:5001:14800
    <footer className="flex w-full flex-row flex-nowrap items-center justify-between gap-6 border-t border-[#2E3940] px-[90px] py-10">
      {/* mm:I5001:14800;342:1407 */}
      <div className="flex flex-nowrap items-center gap-20">
        {/* mm:I5001:14800;342:1408 */}
        <Link
          href="/"
          aria-label={`Sun* Annual Awards 2025 — ${a11y?.logoHomeSuffix ?? "home"}`}
          onClick={handleLogoClick}
          className="shrink-0"
        >
          {/* mm:I5001:14800;342:1408;178:1030 */}
          <Image
            src="/homepage-saa/Logo.png"
            alt="Sun* Annual Awards 2025"
            width={69}
            height={64}
            className="h-16 w-[69px] object-cover"
          />
        </Link>
        {/* mm:I5001:14800;342:1409 */}
        <nav className={`${montserrat.className} flex flex-nowrap items-center gap-12`}>
          {/* mm:I5001:14800;342:1410 */}
          <NavLink href="/" label={nav.aboutSaa} selected={isActive("/")} variant="footer" />
          {/* mm:I5001:14800;342:1411 */}
          <NavLink href="/awards" label={nav.awardInfo} selected={isActive("/awards")} variant="footer" />
          {/* mm:I5001:14800;342:1412 */}
          <NavLink href="/kudos" label={nav.kudos} selected={isActive("/kudos")} variant="footer" />
          {/* mm:I5001:14800;1161:9487 */}
          <NavLink href="#" label={footer.generalStandards} variant="footer" />
        </nav>
      </div>

      {/* mm:I5001:14800;342:1413 */}
      <p
        className={`${montserratAlternates.className} text-center text-base leading-6 font-bold text-white whitespace-nowrap`}
      >
        {footer.copyright}
      </p>
    </footer>
  );
}
