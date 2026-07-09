/**
 * Canonical per-slug award category **titles** — hardcoded English
 * brand/category names (not translated, locked decision). Single source of
 * truth for what used to be two verbatim-duplicated maps:
 * `award-detail-data.ts`'s `CATEGORY_META` (awards detail page) and
 * `home/awards-section.tsx`'s `AWARD_CARD_META` (homepage grid) — both keyed
 * the exact same 6 slugs to the exact same title strings. Source:
 * `spec/awards-page/feature.md` §2.5 (FR-12) — note the MVP title includes
 * its long form ("MVP (Most Valuable Person)"), matching the FR-12 table,
 * even though `lib/awards/award-categories.ts` (nav-menu labels) stores the
 * short "MVP".
 *
 * Each consumer still keeps its own per-slug "extra" metadata (which
 * dictionary entry/key supplies its copy) alongside this shared title map —
 * see `resolveAwardCategoryMeta` below.
 */
export const AWARD_CATEGORY_TITLES: Readonly<Record<string, string>> = {
  "top-talent": "Top Talent",
  "top-project": "Top Project",
  "top-project-leader": "Top Project Leader",
  "best-manager": "Best Manager",
  "signature-2025-creator": "Signature 2025 - Creator",
  mvp: "MVP (Most Valuable Person)",
};

/**
 * Looks up `slug` in a caller-supplied per-slug `meta` map, returning
 * `undefined` (and warning) when the slug has no entry instead of throwing —
 * a DB row (`award_categories.slug`) with no corresponding metadata is a
 * DB/dict drift bug, not a reason to crash the whole page. This is the same
 * "skip + console.warn" guard both `award-detail-data.ts` and
 * `home/awards-section.tsx` implemented independently before this
 * extraction; `callerLabel` and `metadataLabel` together reproduce each
 * caller's own warn-message text exactly (the two original messages differed
 * in what they called the missing data — "title/dict metadata" vs "title
 * metadata" — so `metadataLabel` is a parameter, not a shared constant).
 */
export function resolveAwardCategoryMeta<T>(
  slug: string,
  meta: Readonly<Record<string, T>>,
  callerLabel: string,
  metadataLabel: string = "title/dict metadata",
): T | undefined {
  const entry = meta[slug];

  if (!entry) {
    console.warn(`[${callerLabel}] no ${metadataLabel} for award slug "${slug}", skipping card`);
    return undefined;
  }

  return entry;
}
