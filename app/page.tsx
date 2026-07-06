import type { Metadata } from "next";
import Image from "next/image";
import { requireUser } from "@/lib/auth/require-user";
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
 *    `get_node("2167:9030")`). Reproduced below on `<main>` responsively
 *    (`gap-12/py-12` mobile up to `lg:gap-[120px] lg:py-24` desktop) instead
 *    of leaving each section to guess its own external spacing.
 * 2. Background continuity — in Figma the keyvisual photo + dark gradient
 *    (`2167:9027` / `2167:9029`) sit BEHIND both the sticky header (which has
 *    a semi-transparent fill, `rgba(16,20,23,.8)`) and the hero card, as one
 *    continuous backdrop from y=0. Rendered once here, absolutely positioned
 *    behind everything, instead of re-scoped inside `HeroSection` (which
 *    would clip it to the hero's own box and leave a hard seam under the
 *    header). The root frame's own solid fill (`rgba(0,16,26,1)` = `#00101A`,
 *    confirmed via `get_node("2167:9026")`) covers the rest of the page.
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
 */
export default async function HomePage() {
  await requireUser();

  return (
    <div
      className={`${montserrat.variable} ${montserratAlternates.variable} relative isolate flex min-h-screen w-full flex-col bg-[#00101A]`}
    >
      {/* mm:2167:9027 + mm:2167:9029 — shared keyvisual backdrop behind the
          header and hero (see note 2 above) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] overflow-hidden sm:h-[760px] lg:h-[1392px]">
        {/* mm:2167:9028 */}
        <Image
          src="/homepage-saa/Keyvisual-BG.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
        {/* mm:2167:9029 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(12deg, #00101A 23.7%, rgba(0, 18, 29, 0.46) 38.34%, rgba(0, 19, 32, 0.00) 48.92%)",
          }}
        />
      </div>

      <SiteHeader />

      <main className="flex flex-1 flex-col gap-12 py-12 sm:gap-16 sm:py-16 lg:gap-[120px] lg:py-24">
        <HeroSection />
        <RootFurtherContent />
        <AwardsSection />
        <SunKudosSection />
      </main>

      <SiteFooter />
      <WidgetButton />
    </div>
  );
}
