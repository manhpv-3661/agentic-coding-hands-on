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
 * Desktop-only (native 1512 frame): `get_node('3204:10152')` ("Frame 486")
 * DECLARES `padding: 120px 104px 120px 104px`, but re-verified 2026-07-10
 * against its actual child bounds (`get_node`, screen `i87tDx10uM`) — the
 * declared padding is NOT applied to the real content: child `5001:14827`
 * (the paragraph/pull-quote group) spans `startX:180 → endX:1332`,
 * IDENTICAL to the parent frame's own bounds (`180 → 1332`), i.e. zero
 * horizontal inset; the vertical numbers don't reconcile either (child
 * height 1090 vs. the 1219 − 2×120 = 979 the declared padding would
 * predict, and the child's bottom edge sits slightly BELOW the parent's).
 * Conclusion: this frame's `padding` value is vestigial Figma metadata that
 * doesn't drive the actual visual layout (likely the child has
 * fixed/ignore-auto-layout sizing in the source file) — the content
 * genuinely fills the full 1152px `ContentFrame`, no interior padding.
 * (A prior pass added `px-[104px] py-[120px]` by trusting the declared
 * property alone without this cross-check — do not reintroduce it without
 * re-verifying against child bounds first.)
 *
 * Outer gutter: the outer `<section>` carries the shared `PageGutter`
 * (144px, the same 'Bìa' column used by
 * `hero-section.tsx`/`awards-section.tsx`/`sun-kudos-section.tsx`) so this
 * block stays flush with its siblings.
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
