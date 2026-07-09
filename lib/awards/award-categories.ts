/**
 * Slug + nav-label list for the 6 Sun* Annual Awards 2025 award categories.
 * Structural/numeric data (order, thumbnail, quantity, VND amounts) now
 * lives in Postgres's `award_categories` table, read via
 * `lib/awards/award-categories-repository.ts`'s `getAwardCategories()` —
 * this list stays the source for the two things that are NOT DB columns:
 * the stable slug used for hash-anchor scrolling, and the nav-menu `title`
 * (UI chrome, not localized — see `awards-nav-menu.tsx`).
 *
 * Consumed by:
 * - `app/awards/page.tsx` / `awards-catalog.tsx` — one `<section id={slug}>`
 *   anchor per category, and the `AwardsNavMenu` label list.
 * - `app/components/home/awards-section.tsx` — `href="/awards#<slug>"`.
 *
 * Slugs are stable, kebab-case identifiers and MUST match the DB's `slug`
 * column exactly — a mismatch drops a card (`award-detail-data.ts` skips +
 * warns rather than crashing). Do not rename an existing slug without
 * updating every consumer, including the seeded DB rows.
 */
export type AwardCategory = {
  slug: string;
  title: string;
};

export const AWARD_CATEGORIES: AwardCategory[] = [
  { slug: "top-talent", title: "Top Talent" },
  { slug: "top-project", title: "Top Project" },
  { slug: "top-project-leader", title: "Top Project Leader" },
  { slug: "best-manager", title: "Best Manager" },
  { slug: "signature-2025-creator", title: "Signature 2025 - Creator" },
  { slug: "mvp", title: "MVP" },
];
