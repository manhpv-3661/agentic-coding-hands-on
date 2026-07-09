import { AWARD_CATEGORY_FALLBACK_ROWS, type AwardCategoryRow } from "./award-categories-fallback";

export type { AwardCategoryRow };

/**
 * Awards content is in the agreed hardcode scope for this mock project.
 * Keep this repository as a stable abstraction boundary for callers, but
 * always serve the local fallback rows rather than touching Supabase.
 */

/**
 * All 6 SAA 2025 award-category structural/numeric records, ordered by the
 * local source-of-truth fallback array.
 */
export async function getAwardCategories(): Promise<AwardCategoryRow[]> {
  return AWARD_CATEGORY_FALLBACK_ROWS;
}
