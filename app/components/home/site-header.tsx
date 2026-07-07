"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSelector } from "@/app/login/components/language-selector";
import { useScrollToTopOnHomeClick } from "@/hooks/use-scroll-to-top-on-home-click";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { AccountMenuButton } from "./account-menu-button";
import { NavLink } from "./nav-link";
import { NotificationBell } from "./notification-bell";

interface SiteHeaderProps {
  /** Current locale — forwarded to `LanguageSelector` so it seeds correctly
   * on every render (no cookie flash on reload, see FR-5). */
  locale: Locale;
  /** Nav link labels (`shared.nav`). */
  nav: Dictionary["shared"]["nav"];
  /** Account menu labels (`shared.account`). */
  account: Dictionary["shared"]["account"];
  /** Notification panel copy (`shared.notifications`). */
  notifications: Dictionary["shared"]["notifications"];
}

/**
 * Homepage SAA sticky header — MoMorph node `2167:9091` (mms_A1_Header).
 * https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
 *
 * Layout: logo + nav links (left) vs language/notification/account (right),
 * `justify-between` across the full viewport width — the Figma frame is
 * 1512px wide but the header itself must fill 100% of the real viewport
 * (see code-rules.md rule 3, Sizing), so padding uses the same responsive
 * scale as `login-header.tsx` (`lg:px-36` = 144px matches the design at
 * desktop width).
 *
 * Nav hrefs: "About SAA 2025" is `/`, "Award Information" routes to
 * `/awards`, "Sun* Kudos" routes to `/kudos` (FR-7) — both are real,
 * protected placeholder pages. Which link is `selected` is derived from
 * the current pathname (bug fix: previously hardcoded to `/`, so every
 * route highlighted "About SAA 2025") — `/` matches exactly, `/awards`
 * and `/kudos` match by prefix so nested routes under them stay active.
 */
export function SiteHeader({ locale, nav, account, notifications }: SiteHeaderProps) {
  const handleLogoClick = useScrollToTopOnHomeClick("/");
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href) ?? false;

  return (
    // mm:2167:9091
    <header className="sticky top-0 z-20 flex min-h-20 w-full flex-wrap items-center justify-between gap-y-2 bg-[rgba(16,20,23,0.8)] px-6 py-3 sm:px-10 lg:px-36">
      {/* mm:I2167:9091;186:2166 */}
      <div className="flex items-center gap-4 sm:gap-8 lg:gap-16">
        {/* mm:I2167:9091;178:1033 */}
        <Link
          href="/"
          aria-label="Sun* Annual Awards 2025 — home"
          onClick={handleLogoClick}
          className="flex items-center gap-2"
        >
          {/* mm:I2167:9091;178:1033;178:1030 */}
          <Image
            src="/homepage-saa/Logo.png"
            alt="Sun* Annual Awards 2025"
            width={52}
            height={48}
            priority
          />
          {/*
           * Ground truth (I2167:9091;178:1033;178:1030) is a single
           * flattened 52x48 raster that bakes a 4-line "Sun* / Annual /
           * Awards / 2025" wordmark into the icon pixels — confirmed by
           * sampling the exported PNG directly (white, anti-aliased text
           * spans roughly x:26-52,y:16-48). There's no separate TEXT child
           * node in the Figma tree to read an exact font from
           * (get_node_context on the instance returns one RECTANGLE child
           * only), so a pixel-identical recreation isn't recoverable from
           * MCP data. `public/homepage-saa/Logo.png` ships icon-only.
           * Rather than guess a font match or drop the wordmark, render
           * the same words as real text next to the icon using this
           * header's existing brand typeface (`font-montserrat`, the same
           * token `NavLink` uses) so the brand name stays legible.
           */}
          <span
            aria-hidden="true"
            className="font-montserrat flex flex-col justify-center text-[10px] leading-2.75 font-bold tracking-[0.2px] text-white uppercase"
          >
            <span>Sun*</span>
            <span>Annual</span>
            <span>Awards</span>
            <span>2025</span>
          </span>
        </Link>
        {/* mm:I2167:9091;178:653 */}
        <nav className="flex flex-wrap items-center gap-1 sm:gap-3 lg:gap-6">
          <NavLink href="/" label={nav.aboutSaa} selected={isActive("/")} />
          <NavLink href="/awards" label={nav.awardInfo} selected={isActive("/awards")} />
          <NavLink href="/kudos" label={nav.kudos} selected={isActive("/kudos")} />
        </nav>
      </div>
      {/* mm:I2167:9091;186:1601 — order matches ground truth left-to-right:
          Notification (I2167:9091;186:2101) -> Language (I2167:9091;186:1696)
          -> Account (I2167:9091;186:1597), per re-fetched node x-offsets
          0-40 / 56-164 / 180-220 within the 220px cluster. */}
      <div className="flex items-center gap-4">
        <NotificationBell empty={notifications.empty} />
        <LanguageSelector initialLocale={locale} />
        <AccountMenuButton profile={account.profile} signOut={account.signOut} />
      </div>
    </header>
  );
}
