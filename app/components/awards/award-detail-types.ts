/**
 * Shared type definitions for the award-detail data model — the shape
 * `buildAwardDetailEntries` (`award-detail-data.ts`) produces per category,
 * and that `AwardDetailCard`/`AwardValueSection` consume to render it. Split
 * out from `award-detail-card.tsx` (re-exported there for existing
 * importers) to keep that file under the project's 200-line guideline.
 */

/** One value figure + its suffix line, e.g. "5.000.000 VNĐ" / "cho giải cá
 * nhân" (mm:313:8495-8497 / 313:8506-8508) — one half of the dual value
 * structure `AwardDetailEntry.valueVariants` carries for a "split" award. */
export interface AwardValueVariant {
  value: string;
  suffix: string;
}

/**
 * A quantity/value metric split into MoMorph's two authored typographic
 * tiers: the large hero `number` (36px/44 bold white) and its smaller
 * `unit`/qualifier caption (14px/20 bold white), e.g.
 * `{ number: "10", unit: "Đơn vị" }` or `{ number: "7.000.000 VNĐ", unit:
 * "cho mỗi giải thưởng" }`. Ground truth renders these as two separate text
 * nodes (mm:I313:8467;214:2538/2546 for the number,
 * `;214:3532`/`;214:2547` for the unit caption) rather than one string at
 * one size — the dictionaries (`lib/i18n/dictionaries/{vi,en}.ts`) author
 * `quantity`/`value` pre-split into this shape so the card can render both
 * tiers directly, with no runtime string-splitting/parsing. `unit` is `""`
 * when a category's ground truth has no trailing caption (e.g. MVP's bare
 * quantity `"01"`, or Top Project Leader/Best Manager/MVP's bare value
 * amount with no "cho mỗi..."/"per award" qualifier).
 */
export interface AwardMetric {
  number: string;
  unit: string;
}

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
  /** "Số lượng giải thưởng" metric, e.g. `{ number: "10", unit: "Đơn vị" }`
   * (per locale). See `AwardMetric`. */
  quantity: AwardMetric;
  /** "Giá trị giải thưởng" metric, e.g. `{ number: "7.000.000 VNĐ", unit:
   * "cho mỗi giải thưởng" }` (per locale). Mutually exclusive with
   * `valueVariants` — every category except "Signature 2025 - Creator" sets
   * this; that one sets `valueVariants` instead (mm:313:8474's 7-child
   * structure only has this single-metric value shape for 5 of the 6 award
   * cards). See `AwardMetric`. */
  value?: AwardMetric;
  /** Two distinct value rows — individual then collective award amount —
   * split by a centered "orLabel" divider (mm:313:8490/313:8498/313:8501).
   * Set only for "Signature 2025 - Creator"; when present, the card renders
   * this instead of the single `value` line. */
  valueVariants?: {
    orLabel: string;
    individual: AwardValueVariant;
    collective: AwardValueVariant;
  };
  /** Per-award thumbnail (336×336), cropped from the MoMorph full-frame
   * render (`get_frame_image`, screenId `zFYDgyj_pD`) — background photo +
   * gold-ring illustration + award name are already composited into one
   * image at design time, matching ground truth exactly. Distinct per
   * award (NOT a shared background + runtime text overlay — that was the
   * bug: single-node export of `Award-Thumb-Background` 401/500s, same
   * failure mode as the avatar/gallery export issue, and a prior session
   * papered over it with one reused generic background). */
  titleImageSrc: string;
}
