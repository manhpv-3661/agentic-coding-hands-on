import { AWARD_CATEGORY_TITLES, resolveAwardCategoryMeta } from "@/lib/awards/award-category-meta";
import type { AwardCategoryRow } from "@/lib/awards/award-categories-repository";
import { formatAwardQuantity, formatVnd } from "@/lib/awards/format-prize-amount";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import type { AwardDetailEntry } from "./award-detail-types";

export type { AwardDetailEntry };

type AwardDetailDict = Dictionary["awards"]["detail"];
type AwardDetailEntryKey = keyof AwardDetailDict["entries"];

/**
 * Per-slug static metadata that never comes from the DB and never changes
 * with locale: which `awards.detail.entries.<key>` slice of the dictionary
 * supplies the quantity/value unit captions for that slug. The title itself
 * now lives in the shared `AWARD_CATEGORY_TITLES` map
 * (`lib/awards/award-category-meta.ts`) — this map only carries what's
 * unique to this consumer. Keyed by slug (not index) so a slug present in
 * the DB but missing here is detected explicitly rather than silently
 * misaligned — see the `skip + console.warn` guard
 * (`resolveAwardCategoryMeta`) in `buildAwardDetailEntries` below.
 */
const CATEGORY_META: Readonly<Record<string, { dictEntryKey: AwardDetailEntryKey }>> = {
  "top-talent": { dictEntryKey: "topTalent" },
  "top-project": { dictEntryKey: "topProject" },
  "top-project-leader": { dictEntryKey: "topProjectLeader" },
  "best-manager": { dictEntryKey: "bestManager" },
  "signature-2025-creator": { dictEntryKey: "signatureCreator" },
  mvp: { dictEntryKey: "mvp" },
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
    const meta = resolveAwardCategoryMeta(row.slug, CATEGORY_META, "award-detail-data");

    if (!meta) {
      continue;
    }

    const title = AWARD_CATEGORY_TITLES[row.slug];

    // Signature 2025 - Creator is the one category with a dual value
    // structure (individual vs. collective award, mm:313:8490/8498/8501) —
    // built from its own two amount columns, not the generic
    // `value_amount_vnd` column the other 5 categories share below.
    if (meta.dictEntryKey === "signatureCreator") {
      const dictEntry = detail.entries.signatureCreator;

      entries.push({
        slug: row.slug,
        title,
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
      title,
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
