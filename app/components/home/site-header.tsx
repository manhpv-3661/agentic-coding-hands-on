"use client";

import Image from "next/image";
import Link from "next/link";
import { LanguageSelector } from "@/app/login/components/language-selector";
import { useScrollToTopOnHomeClick } from "@/hooks/use-scroll-to-top-on-home-click";
import { AccountMenuButton } from "./account-menu-button";
import { NavLink } from "./nav-link";
import { NotificationBell } from "./notification-bell";

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
 * Nav hrefs: "About SAA 2025" is this page (`/`, selected/active). "Award
 * Information" routes to `/awards`, "Sun* Kudos" routes to `/kudos`
 * (FR-7) — both are real, protected placeholder pages.
 */
export function SiteHeader() {
  const handleLogoClick = useScrollToTopOnHomeClick("/");

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
        >
          {/* mm:I2167:9091;178:1033;178:1030 */}
          <Image
            src="/homepage-saa/Logo.png"
            alt="Sun* Annual Awards 2025"
            width={52}
            height={48}
            priority
          />
        </Link>
        {/* mm:I2167:9091;178:653 */}
        <nav className="flex flex-wrap items-center gap-1 sm:gap-3 lg:gap-6">
          <NavLink href="/" label="About SAA 2025" selected />
          <NavLink href="/awards" label="Award Information" />
          <NavLink href="/kudos" label="Sun* Kudos" />
        </nav>
      </div>
      {/* mm:I2167:9091;186:1601 */}
      <div className="flex items-center gap-4">
        <LanguageSelector />
        <NotificationBell />
        <AccountMenuButton />
      </div>
    </header>
  );
}
