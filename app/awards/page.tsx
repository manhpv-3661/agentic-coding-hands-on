import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-user";
import { AwardsCatalog } from "../components/awards/awards-catalog";
import { AwardsHero } from "../components/awards/awards-hero";
import { SiteFooter } from "../components/home/site-footer";
import { SiteHeader } from "../components/home/site-header";
import { SunKudosSection } from "../components/home/sun-kudos-section";
import { montserrat, montserratAlternates } from "../login/fonts";

export const metadata: Metadata = {
  title: "Awards Information | Sun* Annual Awards 2025",
  description: "Thông tin các hạng mục giải thưởng Sun* Annual Awards 2025.",
};

/**
 * "Awards Information" screen — Sun* Annual Awards 2025.
 * MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
 *
 * Protected route: gated by `proxy.ts` (primary) and `requireUser()` below
 * (server-side defense-in-depth, see `docs/system/permissions.md`) — an
 * unauthenticated request never renders this tree.
 *
 * Composition (spec §1): `SiteHeader` → `AwardsHero` (Phase 04, keyvisual
 * mini) → inline title section (FR-5: "Sun* annual awards 2025" caption +
 * gold "Hệ thống giải thưởng SAA 2025" heading — same `mms_A_Title`
 * component the homepage's `AwardsSection` uses, reproduced inline here
 * rather than via a shared component since it is the only consumer outside
 * the homepage) → `AwardsCatalog` (Phase 05, client: nav + scroll-spy + 6
 * detail-card sections) → `SunKudosSection` (reused unmodified, FR-15) →
 * `SiteFooter`.
 *
 * `page.tsx` itself stays a server component (`requireUser()` + `metadata`);
 * only `AwardsCatalog` crosses into `"use client"` for the scroll-spy
 * `IntersectionObserver`. `app/layout.tsx` renders only `html`/`body` — the
 * header/footer are NOT global, so this page renders them itself, mirroring
 * `app/page.tsx`.
 *
 * Fonts: `app/login/fonts.ts` is reused (not duplicated) for Montserrat /
 * Montserrat Alternates, same pattern as `app/page.tsx`. Applying
 * `.variable` here makes `--font-montserrat` / `--font-montserrat-alternates`
 * available to every section below that only references the Tailwind
 * `font-montserrat` utility without importing its own font instance (the
 * inline title section here, `nav-link`, `event-info` reused via
 * `SiteHeader`/`SiteFooter`).
 */
export default async function AwardsPage() {
  await requireUser();

  return (
    <div
      className={`${montserrat.variable} ${montserratAlternates.variable} flex min-h-screen w-full flex-col bg-[#00101A]`}
    >
      <SiteHeader />

      <main className="flex flex-1 flex-col gap-16 py-12 sm:gap-20 sm:py-16 lg:gap-24 lg:py-24">
        <AwardsHero />

        {/* mm:awards-title-section (FR-5) + Phase 05 catalog — share one
            padded, max-width container so the catalog itself stays
            layout-only (no page-level gutter baked in). */}
        <div className="mx-auto flex w-full max-w-[1224px] flex-col gap-10 px-6 sm:px-10 lg:px-36">
          <div className="flex w-full flex-col items-start gap-4">
            <p className="font-montserrat text-[24px] leading-[32px] font-bold text-white">
              Sun* annual awards 2025
            </p>
            <div className="h-px w-full bg-[#2E3940]" />
            <h1 className="font-montserrat text-[57px] leading-[64px] font-bold tracking-[-0.25px] text-[#FFEA9E]">
              Hệ thống giải thưởng SAA 2025
            </h1>
          </div>

          <AwardsCatalog />
        </div>

        <SunKudosSection />
      </main>

      <SiteFooter />
    </div>
  );
}
