import type { AwardCategoryRow } from "@/lib/awards/award-categories-repository";
import { formatAwardQuantity, formatVnd } from "@/lib/awards/format-prize-amount";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import type { AwardDetailEntry } from "./award-detail-card";

export type { AwardDetailEntry };

type AwardDetailDict = Dictionary["awards"]["detail"];
type AwardDetailEntryKey = keyof AwardDetailDict["entries"];

/**
 * Per-slug static metadata that never comes from the DB and never changes
 * with locale: the hardcoded English title (brand/category name, not
 * translated — locked decision) and which `awards.detail.entries.<key>`
 * slice of the dictionary supplies the quantity/value unit captions. Keyed
 * by slug (not index) so a slug present in the DB but missing here is
 * detected explicitly rather than silently misaligned — see the `skip +
 * console.warn` guard in `buildAwardDetailEntries` below. Source:
 * `spec/awards-page/feature.md` §2.5 (FR-12) — note the MVP title includes
 * its long form ("MVP (Most Valuable Person)"), matching the FR-12 table
 * and the homepage precedent (`awards-section.tsx`'s `titleAlt`), even
 * though `lib/awards/award-categories.ts` stores the short "MVP".
 */
const CATEGORY_META: Readonly<Record<string, { title: string; dictEntryKey: AwardDetailEntryKey }>> = {
  "top-talent": { title: "Top Talent", dictEntryKey: "topTalent" },
  "top-project": { title: "Top Project", dictEntryKey: "topProject" },
  "top-project-leader": { title: "Top Project Leader", dictEntryKey: "topProjectLeader" },
  "best-manager": { title: "Best Manager", dictEntryKey: "bestManager" },
  "signature-2025-creator": {
    title: "Signature 2025 - Creator",
    dictEntryKey: "signatureCreator",
  },
  mvp: { title: "MVP (Most Valuable Person)", dictEntryKey: "mvp" },
};

/**
 * Builds the award detail entries for the `/awards` catalog by merging
 * `award_categories` rows (`getAwardCategories()`, structural/numeric —
 * slug, order, thumbnail, quantity, VND amounts) with the active locale's
 * dictionary slice (`detail`, localized title unit captions/descriptions),
 * joined by `slug`. Row order (DB `sort_order`) drives entry order.
 *
 * A `row.slug` with no `CATEGORY_META` entry (DB/dict drift) is skipped
 * with a `console.warn` rather than crashing the page (phase-02 risk:
 * "Slug mismatch DB↔dict").
 *
 * Only `signature-2025-creator` (dict key `signatureCreator`) uses
 * `detail.descriptions.signatureCreator` and the dual `individual`/
 * `collective` value rows built from `row.individualAmountVnd` /
 * `row.collectiveAmountVnd`; the other 5 categories share
 * `detail.descriptions.sharedUnfinished` verbatim — the Figma source design
 * has not yet finished writing per-category copy for those 5, so they all
 * carry the exact same paragraph (mirrors the precedent already documented
 * on the homepage grid, `award-card.tsx`). Do not shorten, paraphrase, or
 * invent copy.
 */
export function buildAwardDetailEntries(
  rows: AwardCategoryRow[],
  detail: AwardDetailDict,
  locale: Locale,
): AwardDetailEntry[] {
  const entries: AwardDetailEntry[] = [];

  for (const row of rows) {
    const meta = CATEGORY_META[row.slug];

    if (!meta) {
      console.warn(
        `[award-detail-data] no title/dict metadata for award slug "${row.slug}", skipping card`,
      );
      continue;
    }

    // Signature 2025 - Creator is the one category with a dual value
    // structure (individual vs. collective award, mm:313:8490/8498/8501) —
    // built from its own two amount columns, not the generic
    // `value_amount_vnd` column the other 5 categories share below.
    if (meta.dictEntryKey === "signatureCreator") {
      const dictEntry = detail.entries.signatureCreator;

      entries.push({
        slug: row.slug,
        title: meta.title,
        description: detail.descriptions.signatureCreator,
        quantity: { number: formatAwardQuantity(row.quantityNumber), unit: dictEntry.quantity.unit },
        valueVariants: {
          orLabel: detail.orLabel,
          individual: {
            value: row.individualAmountVnd != null ? formatVnd(row.individualAmountVnd, locale) : "",
            suffix: dictEntry.individualSuffix,
          },
          collective: {
            value: row.collectiveAmountVnd != null ? formatVnd(row.collectiveAmountVnd, locale) : "",
            suffix: dictEntry.collectiveSuffix,
          },
        },
        titleImageSrc: row.thumbnailSrc,
      });
      continue;
    }

    const dictEntry = detail.entries[meta.dictEntryKey];

    entries.push({
      slug: row.slug,
      title: meta.title,
      description: detail.descriptions.sharedUnfinished,
      quantity: { number: formatAwardQuantity(row.quantityNumber), unit: dictEntry.quantity.unit },
      value: {
        number: row.valueAmountVnd != null ? formatVnd(row.valueAmountVnd, locale) : "",
        unit: dictEntry.value.unit,
      },
      titleImageSrc: row.thumbnailSrc,
    });
  }

  return entries;
}
