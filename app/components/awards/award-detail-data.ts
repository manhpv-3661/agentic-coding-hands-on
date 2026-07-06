import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { AwardDetailEntry } from "./award-detail-card";

export type { AwardDetailEntry };

type AwardDetailDict = Dictionary["awards"]["detail"];
type AwardDetailEntryKey = keyof AwardDetailDict["entries"];

/**
 * Per-category static metadata that never changes with locale: the
 * hardcoded English title (brand/category name, not translated — locked
 * decision), the title graphic, and which `awards.detail.entries.<key>`
 * slice of the dictionary supplies the quantity/value strings. Ordered to
 * match `AWARD_CATEGORIES` 1:1 — index `i` here describes
 * `AWARD_CATEGORIES[i]`. Source: `spec/awards-page/feature.md` §2.5 (FR-12)
 * — note the MVP title includes its long form ("MVP (Most Valuable
 * Person)"), matching the FR-12 table and the homepage precedent
 * (`awards-section.tsx`'s `titleAlt`), even though `AWARD_CATEGORIES`
 * stores the short "MVP".
 */
const STATIC_ENTRY_META: ReadonlyArray<{
  title: string;
  titleImageSrc: string;
  dictEntryKey: AwardDetailEntryKey;
}> = [
  {
    title: "Top Talent",
    titleImageSrc: "/homepage-saa/Award-Name-TopTalent.png",
    dictEntryKey: "topTalent",
  },
  {
    title: "Top Project",
    titleImageSrc: "/homepage-saa/Award-Name-TopProject.png",
    dictEntryKey: "topProject",
  },
  {
    title: "Top Project Leader",
    titleImageSrc: "/homepage-saa/Award-Name-TopProjectLeader.png",
    dictEntryKey: "topProjectLeader",
  },
  {
    title: "Best Manager",
    titleImageSrc: "/homepage-saa/Award-Name-BestManager.png",
    dictEntryKey: "bestManager",
  },
  {
    title: "Signature 2025 - Creator",
    titleImageSrc: "/homepage-saa/Award-Name-Signature2025Creator.png",
    dictEntryKey: "signatureCreator",
  },
  {
    title: "MVP (Most Valuable Person)",
    titleImageSrc: "/homepage-saa/Award-Name-MVP.png",
    dictEntryKey: "mvp",
  },
];

/**
 * Builds the 6 award detail entries for the `/awards` catalog from the
 * active locale's dictionary slice (`d.awards.detail`). Order and slugs
 * match `AWARD_CATEGORIES` — asserted by `award-detail-card.test.tsx`.
 *
 * Only `signature-2025-creator` (dict key `signatureCreator`) uses
 * `detail.descriptions.signatureCreator`; the other 5 categories share
 * `detail.descriptions.sharedUnfinished` verbatim — the Figma source design
 * has not yet finished writing per-category copy for those 5, so they all
 * carry the exact same paragraph (mirrors the precedent already documented
 * on the homepage grid, `award-card.tsx`). Do not shorten, paraphrase, or
 * invent copy.
 */
export function buildAwardDetailEntries(detail: AwardDetailDict): AwardDetailEntry[] {
  return AWARD_CATEGORIES.map((category, index) => {
    const meta = STATIC_ENTRY_META[index];
    const description =
      meta.dictEntryKey === "signatureCreator"
        ? detail.descriptions.signatureCreator
        : detail.descriptions.sharedUnfinished;
    const dictEntry = detail.entries[meta.dictEntryKey];

    return {
      slug: category.slug,
      title: meta.title,
      description,
      quantity: dictEntry.quantity,
      value: dictEntry.value,
      titleImageSrc: meta.titleImageSrc,
    };
  });
}
