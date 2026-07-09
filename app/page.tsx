import type { Metadata } from "next";
import Image from "next/image";
import { getAwardCategories } from "@/lib/awards/award-categories-repository";
import { requireUser } from "@/lib/auth/require-user";
import { getEventSettings } from "@/lib/event/event-settings-repository";
import { formatEventDate } from "@/lib/event/format-event-date";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { AwardsSection } from "./components/home/awards-section";
import { HeroSection } from "./components/home/hero-section";
import { RootFurtherContent } from "./components/home/root-further-content";
import { SiteFooter } from "./components/home/site-footer";
import { SiteHeader } from "./components/home/site-header";
import { SunKudosSection } from "./components/home/sun-kudos-section";
import { WidgetButton } from "./components/home/widget-button";
import { montserrat, montserratAlternates } from "./login/fonts";

export const metadata: Metadata = {
  title: "Sun* Annual Awards 2025",
  description: "Root Further — Sun* Annual Awards 2025.",
};

/**
 * Homepage — Sun* Annual Awards 2025.
 * MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
 * (Figma node `2167:9026`, "Homepage SAA").
 *
 * Protected route: gated by `proxy.ts` (primary) and `requireUser()` below
 * (server-side defense-in-depth, see `docs/system/permissions.md`) — an
 * unauthenticated request never renders this tree.
 *
 * Composition + cross-section fixes done at this level (each subsection was
 * built by an independent agent against only its own MoMorph subtree, so a
 * few seams only became visible once assembled):
 *
 * 1. Vertical rhythm — per Figma, `Bìa` (2167:9030) is a single flex column
 *    with a uniform 120px gap between its Hero / Root-Further / Awards /
 *    Kudos children and 96px top/bottom padding (verified via
 *    `get_node("2167:9030")`). Reproduced below on `<main>` as the native
 *    `gap-[120px] py-24` (desktop-only, see `page-layout.tsx`) instead of
 *    leaving each section to guess its own external spacing.
 * 2. Background continuity — in Figma the keyvisual photo + dark gradient
 *    (`2167:9027` / `2167:9029`) sit BEHIND both the sticky header (which has
 *    a semi-transparent fill, `rgba(16,20,23,.8)`) and the hero card, as one
 *    continuous backdrop from y=0. Rendered once here, absolutely positioned
 *    behind everything, instead of re-scoped inside `HeroSection` (which
 *    would clip it to the hero's own box and leave a hard seam under the
 *    header). The root frame's own solid fill (`rgba(0,16,26,1)` = `#00101A`,
 *    confirmed via `get_node("2167:9026")`) covers the rest of the page.
 *    The photo (`2167:9028`, 1512x1392) and the gradient (`2167:9029`
 *    "Cover", 1512x1480 — same x/y origin but 88px taller) are independent
 *    siblings in Figma, not one nested inside the other's box — confirmed
 *    via `get_node`. They're rendered below as two separate
 *    absolutely-positioned boxes, both native (desktop-only, no responsive
 *    tiers), sharing the same top-left origin so the gradient's declared
 *    color stops (`23.7% / 38.34% / 48.92%`) land at the same coordinates as
 *    the design; nesting the gradient inside the shorter photo box would
 *    compress those stops upward.
 * 3. Fonts — `app/login/fonts.ts` is reused (not duplicated) for Montserrat /
 *    Montserrat Alternates. Applying `.variable` here makes the shared
 *    `--font-montserrat` / `--font-montserrat-alternates` custom properties
 *    (declared once in `app/globals.css`) available to every section below,
 *    including the ones that only reference the Tailwind `font-montserrat`
 *    utility class without importing a font themselves (`nav-link`,
 *    `event-info`, `hero-cta-buttons`, `countdown-timer`, `widget-button`).
 *
 * `WidgetButton` is `fixed` (viewport-anchored, not in the `Bìa` flow) so it
 * floats bottom-right at all scroll positions, per this build's "floating
 * Widget button" requirement — Figma parks it as an absolutely-positioned
 * overlay near the hero instead, which is a design-file placement, not a
 * scroll-behavior spec.
 *
 * i18n (F005): resolves the `NEXT_LOCALE` cookie once via `getLocale()` and
 * threads the resulting `Dictionary` slice into every child that needs
 * translated copy — see `plans/260706-2016-i18n-vi-en-translation/`. The
 * static `metadata` export above stays as-is (no `homepage.meta.*` key
 * exists in the dictionary; this page's `<title>`/description are English
 * marketing copy by design, not per-locale content).
 *
 * Supabase dynamic data (phase-04,
 * `plans/260709-0822-supabase-dynamic-data-all-screens/`): the award grid's
 * structural/numeric data now comes from `getAwardCategories()` (phase-02),
 * replacing `awards-section.tsx`'s formerly-inline `AWARDS` array. The
 * displayed event date is derived here from `NEXT_PUBLIC_EVENT_START_AT` —
 * the SAME timestamp `proxy.ts` uses to gate the Prelaunch redirect — via
 * `formatEventDate()`, overriding `dictionary.homepage.hero.eventDate`
 * before it's threaded down through `hero-section.tsx` (unchanged, out of
 * this phase's scope) exactly as before. This fixes a real 3-way date drift
 * (env var vs. `en.ts`'s "December 26, 2025" vs. `vi.ts`'s "26/12/2025"):
 * after this change there is exactly one source of truth for the date, and
 * the dictionary literals are no longer read for rendering it. The event
 * venue name comes from `getEventSettings()` and is threaded down through
 * `hero-section.tsx`'s new `venueName` prop (the one edit made to that file
 * this phase — see its header comment: `EventInfo`'s existing unit tests
 * render it synchronously, which rules out making it self-fetch via an
 * async Server Component instead).
 */
export default async function HomePage() {
  await requireUser();
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const [awardCategories, eventSettings] = await Promise.all([
    getAwardCategories(),
    getEventSettings(),
  ]);
  const hero = { ...dictionary.homepage.hero, eventDate: formatEventDate(locale) };

  return (
    <div
      className={`${montserrat.variable} ${montserratAlternates.variable} relative isolate flex min-h-screen w-full flex-col bg-[#00101A]`}
    >
      {/* mm:2167:9027 + mm:2167:9029 — shared keyvisual backdrop behind the
          header and hero (see note 2 above). Photo and gradient are two
          independent boxes (matching their independent Figma nodes) sharing
          the same top-left origin, rather than one nested inside the
          other's (shorter) box. */}
      {/* mm:2167:9028 — keyvisual photo, clipped to its own box */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-348 overflow-hidden">
        <Image
          src="/homepage-saa/Keyvisual-BG.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
      </div>
      {/* mm:2167:9029 — darkening gradient ("Cover"), its own taller box
          (1512x1480 vs the photo's 1512x1392) so its color stops land where
          Figma places them */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-370"
        style={{
          background:
            "linear-gradient(12deg, #00101A 23.7%, rgba(0, 18, 29, 0.46) 38.34%, rgba(0, 19, 32, 0.00) 48.92%)",
        }}
      />

      <SiteHeader
        locale={locale}
        nav={dictionary.shared.nav}
        account={dictionary.shared.account}
        notifications={dictionary.shared.notifications}
        a11y={dictionary.shared.a11y}
      />

      <main className="flex flex-1 flex-col gap-30 py-24">
        <HeroSection
          hero={hero}
          countdown={dictionary.shared.countdown}
          venueName={eventSettings.venueName}
        />
        <RootFurtherContent content={dictionary.homepage.rootFurther} />
        <AwardsSection
          awards={dictionary.homepage.awards}
          detailsCta={dictionary.shared.detailsCta}
          categories={awardCategories}
        />
        <SunKudosSection kudos={dictionary.homepage.kudos} detailsCta={dictionary.shared.detailsCta} />
      </main>

      <SiteFooter
        nav={dictionary.shared.nav}
        footer={dictionary.shared.footer}
        a11y={dictionary.shared.a11y}
      />
      <WidgetButton
        comingSoon={dictionary.shared.widget.comingSoon}
        ariaLabel={dictionary.shared.a11y.quickActions}
      />
    </div>
  );
}
