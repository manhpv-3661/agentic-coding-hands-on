import Image from "next/image";
import { Montserrat } from "next/font/google";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { ContentFrame, PageGutter } from "../layout/page-layout";

/**
 * "Root Further" narrative content block — Homepage SAA.
 * MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
 * Section root node: `3204:10152` ("Frame 486").
 *
 * Copy is threaded in from the dictionary (`homepage.rootFurther`, F005) —
 * values are sourced verbatim from the Figma design (nodes `3204:10156`,
 * `3204:10161`, `3204:10162`). The EN pull-quote deliberately drops the VI
 * back-translation parenthetical (see `lib/i18n/dictionaries/en.ts`), so
 * this component just renders `content.pullQuote` as-is per locale.
 *
 * Font scoped locally (not a shared `fonts.ts`/`globals.css` token) so this
 * file stays self-contained per file-ownership rules for parallel section
 * agents on the same screen.
 *
 * Text-fill note: nodes `3204:10156` and `3204:10162` report their solid
 * white fill under MoMorph's `backgroundColor` field instead of `color` (an
 * export quirk for this section). Both are rendered as white text to match
 * the pull-quote (`3204:10161`), which carries the same
 * `--Details-Text-Secondary-1` (`#FFF`) token explicitly.
 *
 * Responsive note: `get_node('3204:10152')` only has one authored frame
 * (1152px wide, `padding: 120px 104px`) — there is no mobile/tablet variant
 * to source scaled-down padding/type from. The 104px/120px padding and
 * 24px/20px paragraph sizes are the `lg` values only; below `lg` this scales
 * down using the same step pattern as the sibling sections on this screen
 * (`hero-section.tsx`, `awards-section.tsx`: `px-6 sm:px-10 lg:px-36`) so the
 * long paragraph copy keeps a readable column width instead of being
 * squeezed by the full desktop gutter at mobile widths.
 *
 * Outer gutter fix: the outer `<section>` carries the shared `px-6 sm:px-10
 * lg:px-36` viewport gutter (the same 144px 'Bìa' column used by
 * `hero-section.tsx`/`awards-section.tsx`/`sun-kudos-section.tsx`) so this
 * block stays flush with its siblings at every width — previously the
 * section relied solely on `max-w-[1152px]` centering, which collapses to
 * 0px of gutter at/below 1152px (a real `lg`-range width, e.g. 1024px) while
 * the sibling sections stay pinned at 144px. The 104px/120px values inside
 * `get_node('3204:10152')` are that node's own *interior* padding (its text
 * inset from its own card edge), not the page gutter, so they are kept
 * as-is on the inner `max-w-[1152px]` div.
 */
const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["700"],
  display: "swap",
});

export interface RootFurtherContentProps {
  /** Paragraph 1/2 + pull-quote copy (`homepage.rootFurther`). */
  content: Dictionary["homepage"]["rootFurther"];
}

export function RootFurtherContent({ content }: RootFurtherContentProps) {
  return (
    // mm:3204:10152
    <PageGutter as="section" className={`${montserrat.className} flex justify-center`}>
      <ContentFrame
        width={1152}
        className="flex flex-col items-center justify-center gap-8 rounded-[8px] px-6 py-16 sm:px-10 sm:py-20 lg:px-[104px] lg:py-[120px]"
      >
        {/* mm:3204:10153 — "Root" / "Further" wordmark lockup */}
        <div className="relative h-[134px] w-[290px] shrink-0">
          {/* mm:3204:10155 */}
          <Image
            src="/homepage-saa/Root-Text.png"
            alt="Root"
            width={189}
            height={67}
            className="absolute top-0 left-[51px]"
          />
          {/* mm:3204:10154 */}
          <Image
            src="/homepage-saa/Further-Text.png"
            alt="Further"
            width={290}
            height={67}
            className="absolute top-[67px] left-0"
          />
        </div>

        {/* mm:5001:14827 */}
        <div className="flex w-full flex-col gap-8">
          {/* mm:3204:10156 */}
          <p className="text-justify text-base leading-6 font-bold tracking-[0px] whitespace-pre-line text-white sm:text-lg sm:leading-7 lg:text-[24px] lg:leading-[32px]">
            {content.paragraph1}
          </p>
          {/* mm:3204:10161 */}
          <p className="text-center text-base leading-6 font-bold whitespace-pre-line text-white sm:text-lg sm:leading-7 lg:text-[20px] lg:leading-[32px]">
            {content.pullQuote}
          </p>
          {/* mm:3204:10162 */}
          <p className="text-justify text-base leading-6 font-bold tracking-[0px] whitespace-pre-line text-white sm:text-lg sm:leading-7 lg:text-[24px] lg:leading-[32px]">
            {content.paragraph2}
          </p>
        </div>
      </ContentFrame>
    </PageGutter>
  );
}
