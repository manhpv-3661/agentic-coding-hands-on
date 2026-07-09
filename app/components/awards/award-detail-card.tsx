import Image from "next/image";
import { GOLD_GLOW_BOX_SHADOW } from "@/lib/ui/gold-glow";
import { AwardValueSection } from "./award-value-section";
import type { AwardDetailEntry } from "./award-detail-types";

// Data-model types live in `award-detail-types.ts` (split out to keep this
// file under the project's 200-line guideline) — `awards-catalog.tsx`,
// `award-detail-data.ts`, and `award-value-section.tsx` import them directly
// from there rather than via this module.

export interface AwardDetailCardProps extends AwardDetailEntry {
  /** "Số lượng giải thưởng: " / English equivalent label prefix, already
   * including its own trailing separator (`awards.detail.quantityLabel`). */
  quantityLabel: string;
  /** "Giá trị giải thưởng: " / English equivalent label prefix, already
   * including its own trailing separator (`awards.detail.valueLabel`). */
  valueLabel: string;
  /** Which side the 336×336 image slot renders on at `lg`+ (mobile/tablet
   * always stacks image-above-content regardless). Per the MoMorph ground
   * truth (`313:8458`), the 6 cards alternate image-left/image-right
   * (D.1 left, D.2 right, D.3 left, ...) — the catalog (`awards-catalog.tsx`)
   * computes this from each entry's position, since it is a purely
   * presentational/positional concern, not part of the award's own data.
   * Defaults to `"left"` (D.1's side) for callers that omit it. */
  imageSide?: "left" | "right";
}

/**
 * One full award detail card — image left (336×336) by default, content
 * right, stacking vertically on tablet/mobile. NOT the homepage grid card
 * (`award-card.tsx`): this variant shows the full description (no
 * ellipsis/"Chi tiết" link) plus quantity/value metadata rows with icons.
 *
 * Renders only the card body — the enclosing `<section id={slug}>` anchor
 * used for scroll-spy is owned by the Phase 05 catalog component.
 *
 * **Decision record — one shared component vs. two card variants
 * (re-investigated, MoMorph `zFYDgyj_pD`):** Figma authors two *mirrored*
 * component sets — `214:2554` (image LEFT / content RIGHT: D.1, D.3, D.5)
 * and `214:2646` (content LEFT / image RIGHT: D.2, D.4, D.6) — a prior pass
 * read this as "two visually distinct card sub-layouts" incompatible with
 * one shared component. Re-verified via `get_node` on the quantity-row and
 * value-block containers of D.1, D.2, and D.5
 * (`I313:8467;214:2534/2540`, `I313:8468;214:2626/2632`, `313:8482/8491`):
 * all three have IDENTICAL internal structure (quantity row `flexDirection:
 * row`, value block `flexDirection: column`, matching dimensions). The only
 * real difference is image/content ordering — already handled by the
 * `imageSide` prop below. Remaining per-card variation is pure *content*
 * shape (Signature's dual `valueVariants`; some cards' value has no `unit`
 * caption), already representable as props/data, same precedent as
 * `valueVariants`. Conclusion: kept one shared `AwardDetailCard`; the prior
 * "materially different sub-layout" finding doesn't hold up under direct
 * node inspection.
 */
export function AwardDetailCard({
  slug,
  title,
  description,
  quantity,
  value,
  valueVariants,
  titleImageSrc,
  quantityLabel,
  valueLabel,
  imageSide = "left",
}: AwardDetailCardProps) {
  return (
    <div
      data-award-slug={slug}
      className={`flex w-full flex-row items-start gap-10 ${
        imageSide === "right" ? "flex-row-reverse" : ""
      }`}
    >
      {/* mm:214:1032 — Picture-Award: one pre-composited thumbnail per award
          (background + gold-ring + name baked in at design time), not a
          shared background with a runtime text overlay. */}
      <div
        className="relative aspect-square w-[336px] shrink-0 overflow-hidden rounded-3xl border-[0.955px] border-[#FFEA9E]"
        style={{ boxShadow: GOLD_GLOW_BOX_SHADOW }}
      >
        <Image
          src={titleImageSrc}
          alt={title}
          fill
          sizes="336px"
          className="object-cover object-center"
        />
      </div>

      {/* Content column — outer gap-8 (32px) separates the title+description
          group from the quantity/value rows, each pair split by a 1px
          `#2E3940` divider (mm:I313:8467;214:2532 / `;214:2539`), matching
          the title section's own eyebrow divider treatment. */}
      <div className="flex w-full flex-col items-start gap-8">
        <div className="flex w-full flex-col items-start gap-6">
          <div className="flex w-full items-center gap-4">
            <img
              src="/awards-saa/Icon-Target.svg"
              alt=""
              aria-hidden="true"
              className="h-6 w-6 shrink-0"
            />
            <h3 className="font-montserrat text-[24px] leading-[32px] font-bold text-[#FFEA9E]">
              {title}
            </h3>
          </div>
          <p className="font-montserrat w-full text-justify text-[16px] leading-[24px] font-bold whitespace-pre-line tracking-[0.5px] text-white">
            {description}
          </p>
        </div>

        <div className="h-px w-full bg-[#2E3940]" />

        <div className="flex flex-wrap items-center gap-4">
          <img
            src="/awards-saa/Icon-Diamond.svg"
            alt=""
            aria-hidden="true"
            className="h-6 w-6 shrink-0"
          />
          <span className="font-montserrat text-[24px] leading-[32px] font-bold text-[#FFEA9E]">
            {quantityLabel}
          </span>
          {/* mm:I313:8467;214:3552 — nested "Số lượng" row (gap 8px): the
              hero number at 36px/44px bold white beside its 14px/20px bold
              white unit caption, not one uniform 24px line. Ground truth is
              `align-items: center` (verified on both the Top Talent row and
              the Signature card's taller, two-line-caption row, `313:8485`)
              — `items-baseline` anchors to font ascent/descent metrics and
              visibly misaligns the 44px number against the 20px (or 40px
              wrapped) caption. */}
          <div className="flex items-center gap-2">
            <span className="font-montserrat text-[36px] leading-[44px] font-bold text-white">
              {quantity.number}
            </span>
            {quantity.unit && (
              <span className="font-montserrat text-[14px] leading-[20px] font-bold tracking-[0.1px] text-white">
                {quantity.unit}
              </span>
            )}
          </div>
        </div>

        <div className="h-px w-full bg-[#2E3940]" />

        <AwardValueSection valueLabel={valueLabel} value={value} valueVariants={valueVariants} />
      </div>
    </div>
  );
}
