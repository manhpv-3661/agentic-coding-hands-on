import Image from "next/image";
import { Montserrat } from "next/font/google";

/**
 * Font scoped to this file (mirrors `awards-section.tsx` / `site-footer.tsx`)
 * so the component renders correctly even when composed outside a parent
 * that already provides the `--font-montserrat` CSS variable.
 */
const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

/** Same background photo reused for all 6 awards — intentional design
 * decision, not a data bug (see `award-card.tsx` docstring precedent). */
const AWARD_BACKGROUND_SRC = "/homepage-saa/Award-BG.png";

/**
 * One locale-agnostic award entry — the shape `buildAwardDetailEntries`
 * (`award-detail-data.ts`) produces per category. Kept separate from
 * `AwardDetailCardProps` because the quantity/value label prefixes
 * (`awards.detail.quantityLabel`/`valueLabel`) are shared across all 6
 * entries and threaded in once by `AwardsCatalog`, not stored per-entry.
 */
export interface AwardDetailEntry {
  /** Stable hash-anchor slug (from `AWARD_CATEGORIES`) — not rendered as an
   * `id` here (the catalog/`<section>` wrapper owns that, Phase 05); kept on
   * the DOM as `data-award-slug` for traceability/testing. */
  slug: string;
  /** Award title, rendered as the card heading (`<h3>`). Hardcoded English
   * brand/category name — NOT translated (locked decision). */
  title: string;
  /** Full, untruncated award description (verbatim MoMorph copy, per locale). */
  description: string;
  /** "Số lượng giải thưởng" value, e.g. "10 Đơn vị" (per locale). */
  quantity: string;
  /** "Giá trị giải thưởng" value, e.g. "7.000.000 VNĐ cho mỗi giải thưởng" (per locale). */
  value: string;
  /** Stylized title graphic overlaid on the shared background photo. */
  titleImageSrc: string;
}

export interface AwardDetailCardProps extends AwardDetailEntry {
  /** "Số lượng giải thưởng: " / English equivalent label prefix, already
   * including its own trailing separator (`awards.detail.quantityLabel`). */
  quantityLabel: string;
  /** "Giá trị giải thưởng: " / English equivalent label prefix, already
   * including its own trailing separator (`awards.detail.valueLabel`). */
  valueLabel: string;
}

/**
 * One full award detail card — image left (336×336), content right,
 * stacking vertically on tablet/mobile. NOT the homepage grid card
 * (`award-card.tsx`): this variant shows the full description (no
 * ellipsis/"Chi tiết" link) plus quantity/value metadata rows with icons.
 *
 * Renders only the card body — the enclosing `<section id={slug}>` anchor
 * used for scroll-spy is owned by the Phase 05 catalog component.
 */
export function AwardDetailCard({
  slug,
  title,
  description,
  quantity,
  value,
  titleImageSrc,
  quantityLabel,
  valueLabel,
}: AwardDetailCardProps) {
  return (
    <div
      data-award-slug={slug}
      className={`${montserrat.variable} flex w-full flex-col items-start gap-8 lg:flex-row lg:gap-10`}
    >
      {/* mm:214:1032 — Picture-Award: same bg+overlay technique as award-card.tsx */}
      <div
        className="relative aspect-square w-full max-w-[336px] shrink-0 overflow-hidden rounded-3xl lg:w-[336px]"
        style={{ boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25), 0 0 6px 0 #FAE287" }}
      >
        <div
          className="absolute inset-0 rounded-3xl border-[0.955px] border-[#FFEA9E] bg-no-repeat"
          style={{
            backgroundImage: `url(${AWARD_BACKGROUND_SRC})`,
            backgroundPosition: "-33.807px -26.646px",
            backgroundSize: "121.672% 123.049%",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <div className="relative h-16 w-full max-w-[232px]">
            <Image
              src={titleImageSrc}
              alt={title}
              fill
              sizes="232px"
              className="object-contain object-center"
            />
          </div>
        </div>
      </div>

      {/* Content column */}
      <div className="flex w-full flex-col items-start gap-4">
        <div className="flex w-full items-center gap-2">
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
        <p className="font-montserrat w-full text-left text-[16px] leading-[24px] font-normal whitespace-pre-line tracking-[0.5px] text-white">
          {description}
        </p>
        <div className="flex items-center gap-2">
          <img
            src="/awards-saa/Icon-Diamond.svg"
            alt=""
            aria-hidden="true"
            className="h-6 w-6 shrink-0"
          />
          <p className="font-montserrat text-[16px] leading-[24px] font-normal text-white">
            {`${quantityLabel}${quantity}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <img
            src="/awards-saa/Icon-License.svg"
            alt=""
            aria-hidden="true"
            className="h-6 w-6 shrink-0"
          />
          <p className="font-montserrat text-[16px] leading-[24px] font-normal text-white">
            {`${valueLabel}${value}`}
          </p>
        </div>
      </div>
    </div>
  );
}
