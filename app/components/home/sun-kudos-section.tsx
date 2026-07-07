import Image from "next/image";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { ContentFrame, PageGutter } from "../layout/page-layout";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["700"],
  display: "swap",
});

interface SunKudosSectionProps {
  /** Eyebrow + body copy for the promo block (`homepage.kudos`). */
  kudos: Dictionary["homepage"]["kudos"];
  /** "Chi tiết" CTA label, shared with `award-card.tsx` (`shared.detailsCta`). */
  detailsCta: Dictionary["shared"]["detailsCta"];
}

/**
 * "Chi tiết" CTA arrow — MoMorph node `I3390:10349;313:8426;186:1766`
 * (MM_MEDIA_Up). Figma's exported asset ships with a hardcoded `fill`, so it
 * is inlined here with `currentColor` and picks up the button's dark
 * (`#00101A`) text color instead.
 */
function UpArrowIcon() {
  return (
    // mm:I3390:10349;313:8426;186:1766
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8.49945 18.3104L5.68945 15.5004L12.0595 9.12043H7.10945V5.69043H18.3095V16.8904H14.8895V11.9404L8.49945 18.3104Z"
        fill="currentColor"
      />
    </svg>
  );
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
 * Layout note: Figma models this as an absolute overlay (background image +
 * text block + logo mark) inside a 1120x500 card, itself centered in a
 * 1224px frame. Reproduced with percentage-based absolute positioning + a
 * fixed `aspect-ratio` at the `lg` breakpoint (the width the Figma frame was
 * authored at) so the card keeps the design's exact proportions there.
 * Below `lg` there is no design source to scale the overlay from (`list_frames`
 * confirms no mobile/tablet variant of this screen exists), so the promo copy
 * instead falls back to normal document flow with responsive text sizes —
 * the card's height grows with its content rather than being clipped by a
 * fixed aspect-ratio + `overflow-hidden` (code-rules.md rule 3, Sizing).
 * `Frame 367` (`I3390:10349;313:8417`) is an empty layout frame in the
 * design (no children, no fill) and is intentionally not rendered.
 *
 * Gutter note: the outer `<section>` reproduces the same responsive edge
 * padding as `hero-section.tsx` / `awards-section.tsx` (`px-6 sm:px-10
 * lg:px-36`) since all three sections share the same 1224px Figma content
 * column — the inner `max-w-[1224px]` wrapper matches that column, and the
 * card itself is capped at the design's 1120px width inside it.
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
          className="relative overflow-hidden rounded-2xl lg:aspect-[1120/500]"
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
            className={`${montserrat.className} relative z-10 flex w-full flex-col items-start gap-6 px-6 py-10 sm:gap-8 sm:px-10 sm:py-12 lg:absolute lg:top-1/2 lg:left-[5.71%] lg:w-[40.8%] lg:-translate-y-1/2 lg:px-0 lg:py-0`}
          >
            {/* mm:I3390:10349;313:8420 */}
            <div className="flex flex-col items-start gap-4">
              {/* mm:I3390:10349;313:8421 */}
              <p className="text-lg leading-6 font-bold text-white sm:text-xl sm:leading-7 lg:text-2xl lg:leading-8">
                {kudos.eyebrow}
              </p>
              {/* mm:I3390:10349;313:8422 — brand name, untranslated (clarifications.md Q4) */}
              <p className="text-3xl leading-9 font-bold tracking-[-0.25px] text-[#FFEA9E] sm:text-5xl sm:leading-tight lg:text-[57px] lg:leading-[64px]">
                Sun* Kudos
              </p>
              {/* mm:I3390:10349;313:8423 */}
              <p className="text-justify text-sm leading-5 font-bold tracking-[0.5px] whitespace-pre-line text-white sm:text-base sm:leading-6">
                {kudos.description}
              </p>
            </div>

            {/* mm:I3390:10349;313:8424 */}
            {/* mm:I3390:10349;313:8426 */}
            <Link
              href="/kudos"
              className="flex items-center gap-2 rounded-[4px] bg-[#FFEA9E] px-3 py-3 text-[#00101A] transition-shadow duration-200 ease-out hover:shadow-[0_8px_24px_rgba(255,234,158,0.35)] sm:px-4 sm:py-4"
            >
              {/* mm:I3390:10349;313:8426;186:1568 */}
              <span className="text-sm leading-5 font-bold tracking-[0.15px] sm:text-base sm:leading-6">
                {detailsCta}
              </span>
              <UpArrowIcon />
            </Link>
          </div>

          {/* mm:I3390:10349;329:2948 — overlaps the promo copy once it falls
              back to normal document flow below `lg`, so it only renders at
              the breakpoint where the absolute overlay layout (and the
              design's exact positioning) is restored. */}
          <Image
            src="/homepage-saa/Kudos-Logo.svg"
            alt=""
            width={364}
            height={74}
            sizes="364px"
            className="absolute top-[43%] left-[60%] hidden w-[32.5%] lg:block"
          />
        </ContentFrame>
      </ContentFrame>
    </PageGutter>
  );
}
