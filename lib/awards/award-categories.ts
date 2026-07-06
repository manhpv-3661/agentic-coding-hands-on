/**
 * Single source of truth for the 6 Sun* Annual Awards 2025 award categories.
 *
 * Consumed by:
 * - `app/awards/page.tsx` — one `<section id={slug}>` anchor per category.
 * - Homepage award-grid cards (Track A, wired later) — `href="/awards#<slug>"`.
 *
 * Slugs are stable, kebab-case identifiers. Do not rename an existing slug
 * without updating every consumer — a mismatch breaks hash-anchor scrolling.
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
