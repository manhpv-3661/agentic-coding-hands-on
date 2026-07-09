"use client";

import { Fragment } from "react";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import { AwardDetailCard } from "./award-detail-card";
import type { AwardDetailEntry } from "./award-detail-types";
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
  /** Nav landmark aria-label (`shared.a11y.awardCategories`), forwarded to
   * `AwardsNavMenu` — optional/defaulted so existing callers/tests that
   * predate this prop keep compiling unchanged. */
  navAriaLabel?: string;
}

/**
 * Client wrapper owning the scroll-spy (Phase 01) and wiring it between the
 * nav menu (Phase 03) and the 6 award-detail sections (Phase 02 card +
 * data). Rendered by `app/awards/page.tsx` (Phase 05) between the inline
 * title section and `SunKudosSection`.
 *
 * Layout (desktop-only, `plans/260709-0724-desktop-only-banner-overlay-fix/`):
 * two columns — nav sticky on the left, cards stacked on the right, matching
 * the design's fixed 1440px frame; no responsive stacking below that width.
 * `w-[178px]` (sidebar) matches the measured MoMorph width for
 * `mms_C_Menu list` (`313:8459`). `gap-[121px]` (column gap) is the
 * *effective* gap once `mms_B_Hệ thống giải thưởng`'s (`313:8458`)
 * `justify-content: space-between` is accounted for — its declared `gap`
 * style is 80px, but with two fixed-width children (nav 178px, content
 * `D.Danh sách giải thưởng` `313:8466` authored at a fixed 853px) inside a
 * 1152px `space-between` row, the rendered gap is actually
 * `1152 - 178 - 853 = 121px` (confirmed via node position deltas, not the
 * declared `gap` property). Using `gap-[121px]` here with a flexible
 * (`w-full min-w-0`) content column reproduces that same 853px effective
 * content width without hard-coding it.
 *
 * Each section carries both the scroll-spy anchor id AND `scroll-mt-24` so
 * hash-anchor deep links from the homepage (`/awards#<slug>`, FR-14) land
 * clear of the sticky header (`min-h-20` in `site-header.tsx`).
 */
export function AwardsCatalog({ entries, quantityLabel, valueLabel, navAriaLabel }: AwardsCatalogProps) {
  // `useScrollSpy` returns `null` until an `IntersectionObserver` entry
  // actually intersects — i.e. before the user has scrolled at all. Per the
  // MoMorph ground truth (`313:8459`, item C.1 "Top Talent" marked active
  // in the initial/top-of-page state), the first category defaults active
  // rather than showing no active item on load.
  const activeSlug = useScrollSpy(CATEGORY_SLUGS) ?? CATEGORY_SLUGS[0];

  return (
    <div className="flex w-full flex-row items-start gap-[121px]">
      <div className="w-[178px] shrink-0">
        <AwardsNavMenu items={AWARD_CATEGORIES} activeSlug={activeSlug} ariaLabel={navAriaLabel} />
      </div>
      <div className="flex w-full min-w-0 flex-col gap-20">
        {entries.map((entry, index) => (
          // Fragment (not a bare array) so the trailing divider shares
          // `entry.slug` as its React key without introducing a second
          // mapped key namespace.
          <Fragment key={entry.slug}>
            <section id={entry.slug} className="scroll-mt-24">
              <AwardDetailCard
                {...entry}
                quantityLabel={quantityLabel}
                valueLabel={valueLabel}
                // Design alternates the 336×336 image slot left/right per
                // card (D.1 left, D.2 right, D.3 left, ...) — see
                // `award-detail-card.tsx`'s `imageSide` prop doc.
                imageSide={index % 2 === 0 ? "left" : "right"}
              />
            </section>
            {/* mm:Rectangle 14 (313:8467/8468/8471 last child, etc.) — a
                full-width 1px `#2E3940` trailing divider between cards,
                present after every card except the last (`313:8510` has no
                such child). Combined with the container's own `gap-20`
                (80px) on both sides, this reproduces the ground truth's
                161px card-to-card spacing (80 + 1 + 80) without hard-coding
                a one-off gap value. */}
            {index < entries.length - 1 && (
              <div className="h-px w-full shrink-0 bg-[#2E3940]" aria-hidden="true" />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
