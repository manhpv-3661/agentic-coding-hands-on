"use client";

import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import type { AwardDetailEntry } from "./award-detail-card";
import { AwardDetailCard } from "./award-detail-card";
import { AwardsNavMenu } from "./awards-nav-menu";

/** Stable id list for the scroll-spy — matches `AWARD_CATEGORIES` order, the
 * same order `entries` (built by `buildAwardDetailEntries`, Phase 05) is
 * built in. Declared once at module scope so `useScrollSpy` receives a
 * content-stable reference; the hook itself also guards on a joined-string
 * key, but avoiding a fresh per-render array here is simplest and cheapest. */
const CATEGORY_SLUGS = AWARD_CATEGORIES.map((category) => category.slug);

interface AwardsCatalogProps {
  /** Locale-resolved award entries, built by `buildAwardDetailEntries`
   * (`award-detail-data.ts`) in the server-rendered `app/awards/page.tsx`. */
  entries: AwardDetailEntry[];
  /** "Số lượng giải thưởng: " label prefix, shared across all 6 cards
   * (`awards.detail.quantityLabel`). */
  quantityLabel: string;
  /** "Giá trị giải thưởng: " label prefix, shared across all 6 cards
   * (`awards.detail.valueLabel`). */
  valueLabel: string;
}

/**
 * Client wrapper owning the scroll-spy (Phase 01) and wiring it between the
 * nav menu (Phase 03) and the 6 award-detail sections (Phase 02 card +
 * data). Rendered by `app/awards/page.tsx` (Phase 05) between the inline
 * title section and `SunKudosSection`.
 *
 * Layout: two columns at `lg` — nav sticky on the left, cards stacked on the
 * right; single column (nav above cards) below `lg`, matching the phase
 * spec's "two-column desktop / stack on tablet+mobile" requirement. No
 * exact sidebar width or gap is specified anywhere in the plan/spec set, so
 * `lg:w-[280px]` (sidebar) and `lg:gap-16` (column gap) are this
 * implementation's own reasonable defaults, sized to comfortably fit the
 * longest nav label ("Top Project Leader") without wrapping.
 *
 * Each section carries both the scroll-spy anchor id AND `scroll-mt-24` so
 * hash-anchor deep links from the homepage (`/awards#<slug>`, FR-14) land
 * clear of the sticky header (`min-h-20` in `site-header.tsx`).
 */
export function AwardsCatalog({ entries, quantityLabel, valueLabel }: AwardsCatalogProps) {
  const activeSlug = useScrollSpy(CATEGORY_SLUGS);

  return (
    <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
      <div className="w-full lg:w-[280px] lg:shrink-0">
        <AwardsNavMenu items={AWARD_CATEGORIES} activeSlug={activeSlug} />
      </div>
      <div className="flex w-full min-w-0 flex-col gap-16 lg:gap-20">
        {entries.map((entry) => (
          <section key={entry.slug} id={entry.slug} className="scroll-mt-24">
            <AwardDetailCard
              {...entry}
              quantityLabel={quantityLabel}
              valueLabel={valueLabel}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
