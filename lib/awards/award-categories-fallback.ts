/**
 * Static fallback for the 6 SAA 2025 award-category structural/numeric
 * records — a verbatim mirror of the seeded `award_categories` rows
 * (`supabase/seed.sql`). Consumed by `award-categories-repository.ts`'s
 * `getAwardCategories()` when Supabase isn't configured or a query fails,
 * so the authless e2e build (port 3100, no Supabase env) and
 * `e2e/layout-contract.spec.ts` keep rendering identically to today.
 *
 * Order matches `sort_order` in the DB (and `AWARD_CATEGORIES` in
 * `award-categories.ts`). Locale-agnostic only — localized title,
 * description, and unit-caption strings stay in
 * `lib/i18n/dictionaries/{en,vi}.ts`, joined by `slug` at render (see
 * `app/components/awards/award-detail-data.ts`).
 */

/** One `award_categories` row, camelCased for TS consumers. */
export interface AwardCategoryRow {
  slug: string;
  sortOrder: number;
  thumbnailSrc: string;
  quantityNumber: number;
  valueAmountVnd: number | null;
  individualAmountVnd: number | null;
  collectiveAmountVnd: number | null;
}

export const AWARD_CATEGORY_FALLBACK_ROWS: AwardCategoryRow[] = [
  {
    slug: "top-talent",
    sortOrder: 1,
    thumbnailSrc: "/awards-saa/thumbnails/top-talent.png",
    quantityNumber: 10,
    valueAmountVnd: 7_000_000,
    individualAmountVnd: null,
    collectiveAmountVnd: null,
  },
  {
    slug: "top-project",
    sortOrder: 2,
    thumbnailSrc: "/awards-saa/thumbnails/top-project.png",
    quantityNumber: 2,
    valueAmountVnd: 15_000_000,
    individualAmountVnd: null,
    collectiveAmountVnd: null,
  },
  {
    slug: "top-project-leader",
    sortOrder: 3,
    thumbnailSrc: "/awards-saa/thumbnails/top-project-leader.png",
    quantityNumber: 3,
    valueAmountVnd: 7_000_000,
    individualAmountVnd: null,
    collectiveAmountVnd: null,
  },
  {
    slug: "best-manager",
    sortOrder: 4,
    thumbnailSrc: "/awards-saa/thumbnails/best-manager.png",
    quantityNumber: 1,
    valueAmountVnd: 10_000_000,
    individualAmountVnd: null,
    collectiveAmountVnd: null,
  },
  {
    slug: "signature-2025-creator",
    sortOrder: 5,
    thumbnailSrc: "/awards-saa/thumbnails/signature-2025-creator.png",
    quantityNumber: 1,
    valueAmountVnd: null,
    individualAmountVnd: 5_000_000,
    collectiveAmountVnd: 8_000_000,
  },
  {
    slug: "mvp",
    sortOrder: 6,
    thumbnailSrc: "/awards-saa/thumbnails/mvp.png",
    quantityNumber: 1,
    valueAmountVnd: 15_000_000,
    individualAmountVnd: null,
    collectiveAmountVnd: null,
  },
];
