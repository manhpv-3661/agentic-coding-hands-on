import type { Metadata } from "next";
import { getAwardCategories } from "@/lib/awards/award-categories-repository";
import { requireUser } from "@/lib/auth/require-user";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { AwardsCatalog } from "../components/awards/awards-catalog";
import { buildAwardDetailEntries } from "../components/awards/award-detail-data";
import { AwardsHero } from "../components/awards/awards-hero";
import { SiteFooter } from "../components/home/site-footer";
import { SiteHeader } from "../components/home/site-header";
import { SunKudosSection } from "../components/home/sun-kudos-section";
import { ContentFrame, PageGutter } from "../components/layout/page-layout";
import { montserrat, montserratAlternates } from "../login/fonts";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);

  return {
    title: "Awards Information | Sun* Annual Awards 2025",
    description: dictionary.awards.meta.description,
  };
}

/**
 * "Awards Information" screen — Sun* Annual Awards 2025.
 * MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
 *
 * Protected route: gated by `proxy.ts` (primary) and `requireUser()` below
 * (server-side defense-in-depth, see `docs/system/permissions.md`) — an
 * unauthenticated request never renders this tree.
 *
 * Composition (spec §1): `SiteHeader` → `AwardsHero` (Phase 04, keyvisual
 * mini) → inline title section (FR-5: "Sun* Annual Awards 2025" caption +
 * gold "Hệ thống giải thưởng SAA 2025" heading — same `mms_A_Title`
 * component the homepage's `AwardsSection` uses, reproduced inline here
 * rather than via a shared component since it is the only consumer outside
 * the homepage) → `AwardsCatalog` (Phase 05, client: nav + scroll-spy + 6
 * detail-card sections) → `SunKudosSection` (reused unmodified, FR-15) →
 * `SiteFooter`.
 *
 * `page.tsx` itself stays a server component (`requireUser()` + locale/dict
 * read); only `AwardsCatalog` crosses into `"use client"` for the scroll-spy
 * `IntersectionObserver`. `app/layout.tsx` renders only `html`/`body` — the
 * header/footer are NOT global, so this page renders them itself, mirroring
 * `app/page.tsx`.
 *
 * i18n (Phase 05): `getLocale()` + `getDictionary(locale)` resolve once here
 * and thread down as props — `SiteHeader`/`SiteFooter`/`SunKudosSection`
 * take their dictionary slices per the Phase 02 shell contract;
 * `buildAwardDetailEntries(categories, dictionary.awards.detail, locale)`
 * merges the `award_categories` rows (`getAwardCategories()`, structural/
 * numeric — Postgres when Supabase is configured, static fallback
 * otherwise) with the dictionary's localized strings into the 6 award
 * entries consumed by `AwardsCatalog`. The eyebrow
 * caption "Sun* Annual Awards 2025" stays hardcoded (brand+year, excluded
 * from translation per clarifications.md).
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

  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const categories = await getAwardCategories();
  const entries = buildAwardDetailEntries(categories, dictionary.awards.detail, locale);

  return (
    <div
      className={`${montserrat.variable} ${montserratAlternates.variable} flex min-h-screen w-full flex-col bg-[#00101A]`}
    >
      <SiteHeader
        locale={locale}
        nav={dictionary.shared.nav}
        account={dictionary.shared.account}
        notifications={dictionary.shared.notifications}
        a11y={dictionary.shared.a11y}
      />

      <main className="flex flex-1 flex-col gap-[130px]">
        <AwardsHero dictionary={dictionary} />

        {/* mm:awards-title-section (FR-5) + Phase 05 catalog — `PageGutter`
            owns the 144px viewport gutter, `ContentFrame width={1152}` owns
            the max-width cap (matches "Bìa" 313:8449's 1152px content width
            in the live MoMorph contract, phase-06). Without the cap, content
            stretches unbounded past the native 1440px frame instead of
            centering at 1152px above that width — the same
            `PageGutter` → `ContentFrame` pattern every sibling section
            (`awards-section.tsx`, `hero-section.tsx`, `sun-kudos-section.tsx`)
            already uses. Inner gap matches `Bìa` (313:8449)'s own 120px
            spacing between the title block and the catalog (`mms_B`,
            313:8458). */}
        <PageGutter>
          <ContentFrame width={1152} className="flex flex-col gap-[120px]">
            {/* mm:313:8453 — both the eyebrow (313:8454) and the heading's
                wrapping row (Frame 488, 313:8456, `justify-content: center`)
                center their text within the full 1152px content width per
                ground truth, rather than sitting flush against the left
                gutter — `w-full text-center` on each reproduces that. */}


            <AwardsCatalog
              entries={entries}
              quantityLabel={dictionary.awards.detail.quantityLabel}
              valueLabel={dictionary.awards.detail.valueLabel}
              navAriaLabel={dictionary.shared.a11y.awardCategories}
            />
          </ContentFrame>
        </PageGutter>

        <SunKudosSection kudos={dictionary.homepage.kudos} detailsCta={dictionary.shared.detailsCta} />
      </main>

      <SiteFooter
        nav={dictionary.shared.nav}
        footer={dictionary.shared.footer}
        a11y={dictionary.shared.a11y}
      />
    </div>
  );
}
