import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { montserrat } from "@/app/fonts";
import { ContentFrame, PageGutter } from "../layout/page-layout";
import { UpChevronIcon } from "./up-chevron-icon";

interface SunKudosSectionProps {
  /** Eyebrow + body copy for the promo block (`homepage.kudos`). */
  kudos: Dictionary["homepage"]["kudos"];
  /** "Chi tiết" CTA label, shared with `award-card.tsx` (`shared.detailsCta`). */
  detailsCta: Dictionary["shared"]["detailsCta"];
}

/**
 * "Sun* Kudos" promo block — Homepage SAA. MoMorph node `3390:10349`
 * (mms_D1_Sunkudos).
 * https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
 *
 * The header nav's "Sun* Kudos" link (`site-header.tsx` -> `NavLink`)
 * anchors to this section's `id="kudos-section"`. The "Chi tiết" CTA routes
 * to `/kudos` (FR-24), same destination as the header/footer/hero links.
 *
 * Copy sourced verbatim from Figma via MoMorph MCP. Font is scoped locally
 * (not the shared `/login` route `fonts.ts`) so this file stays
 * self-contained per file-ownership rules for parallel section agents
 * working on the same screen — same pattern as `root-further-content.tsx`.
 *
 * Layout note (desktop-only, native 1512 frame): Figma models this as an
 * absolute overlay (background image + text block + logo mark) inside a
 * 1120x500 card, itself centered in a 1224px frame. Reproduced with
 * percentage-based absolute positioning + a fixed `aspect-1120/500` ratio
 * (the width the Figma frame was authored at) so the card keeps the
 * design's exact proportions. `Frame 367` (`I3390:10349;313:8417`) is an empty
 * layout frame in the design (no children, no fill) and is intentionally
 * not rendered.
 *
 * Gutter note: the outer `<section>` reproduces the same 144px edge
 * padding as `hero-section.tsx` / `awards-section.tsx` (shared `PageGutter`)
 * since all three sections share the same 1224px Figma content column — the
 * inner `ContentFrame(1224)` matches that column, and the card itself is
 * capped at the design's 1120px width inside it.
 */
export function SunKudosSection({ kudos, detailsCta }: SunKudosSectionProps) {
  return (
    // mm:3390:10349
    <PageGutter
      as="section"
      id="kudos-section"
      className="flex items-center justify-center"
    >
      <ContentFrame width={1224} className="flex items-center justify-center">
        {/* mm:I3390:10349;313:8415 */}
        <ContentFrame
          width={1120}
          className="relative aspect-1120/500 overflow-hidden rounded-2xl"
        >
          {/* mm:I3390:10349;313:8416 */}
          <Image
            src="/homepage-saa/Kudos-Background.png"
            alt=""
            fill
            sizes="(max-width: 1120px) 100vw, 1120px"
            className="object-cover"
          />

          {/* mm:I3390:10349;313:8419 */}
          <div
            className={`${montserrat.className} absolute top-1/2 left-[5.71%] z-10 flex w-[40.8%] -translate-y-1/2 flex-col items-start gap-8`}
          >
            {/* mm:I3390:10349;313:8420 */}
            <div className="flex flex-col items-start gap-4">
              {/* mm:I3390:10349;313:8421 */}
              <p className="text-2xl leading-8 font-bold text-white">
                {kudos.eyebrow}
              </p>
              {/* mm:I3390:10349;313:8422 — brand name, untranslated (clarifications.md Q4) */}
              <p className="text-[57px] leading-[64px] font-bold tracking-[-0.25px] text-[#FFEA9E]">
                Sun* Kudos
              </p>
              {/* mm:I3390:10349;313:8423 */}
              <p className="text-justify text-base leading-6 font-bold tracking-[0.5px] whitespace-pre-line text-white">
                {kudos.description}
              </p>
            </div>

            {/* mm:I3390:10349;313:8424 */}
            {/* mm:I3390:10349;313:8426 */}
            <Link
              href="/kudos"
              className="flex items-center gap-2 rounded-[4px] bg-[#FFEA9E] px-4 py-4 text-[#00101A] transition-shadow duration-200 ease-out hover:shadow-[0_8px_24px_rgba(255,234,158,0.35)]"
            >
              {/* mm:I3390:10349;313:8426;186:1568 */}
              <span className="text-base leading-6 font-bold tracking-[0.15px]">
                {detailsCta}
              </span>
              {/* mm:I3390:10349;313:8426;186:1766 */}
              <UpChevronIcon />
            </Link>
          </div>

          {/* mm:I3390:10349;329:2948 — logo mark, positioned over the promo
              copy per the absolute overlay layout above. */}
          <Image
            src="/homepage-saa/Kudos-Logo.svg"
            alt=""
            width={364}
            height={74}
            sizes="364px"
            className="absolute top-[43%] left-[60%] w-[32.5%]"
          />
        </ContentFrame>
      </ContentFrame>
    </PageGutter>
  );
}
