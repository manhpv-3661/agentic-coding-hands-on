import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { montserrat } from "@/app/fonts";
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
 * Desktop-only (native 1512 frame): `get_node('3204:10152')`'s single
 * authored frame is 1152px wide with `padding: 120px 104px` — reproduced
 * verbatim as `px-[104px] py-[120px]` on the inner `ContentFrame(1152)`
 * (interior card padding, not a viewport gutter — see below).
 *
 * Outer gutter: the outer `<section>` carries the shared `PageGutter`
 * (144px, the same 'Bìa' column used by
 * `hero-section.tsx`/`awards-section.tsx`/`sun-kudos-section.tsx`) so this
 * block stays flush with its siblings. The 104px/120px values inside
 * `get_node('3204:10152')` are that node's own *interior* padding (its text
 * inset from its own card edge), not the page gutter, so they are kept
 * as-is on the inner `ContentFrame(1152)`.
 */
interface RootFurtherContentProps {
  /** Paragraph 1/2 + pull-quote copy (`homepage.rootFurther`). */
  content: Dictionary["homepage"]["rootFurther"];
}

export function RootFurtherContent({ content }: RootFurtherContentProps) {
  return (
    // mm:3204:10152
    <PageGutter as="section" className={`${montserrat.className} flex justify-center`}>
      <ContentFrame
        width={1152}
        className="flex flex-col items-center justify-center gap-8 rounded-[8px]"
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
          <p className="text-justify text-[24px] leading-[32px] font-bold tracking-[0px] whitespace-pre-line text-white">
            {content.paragraph1}
          </p>
          {/* mm:3204:10161 */}
          <p className="text-center text-[20px] leading-[32px] font-bold whitespace-pre-line text-white">
            {content.pullQuote}
          </p>
          {/* mm:3204:10162 */}
          <p className="text-justify text-[24px] leading-[32px] font-bold tracking-[0px] whitespace-pre-line text-white">
            {content.paragraph2}
          </p>
        </div>
      </ContentFrame>
    </PageGutter>
  );
}
