"use client";

import type { ReactNode } from "react";
import { useCarousel } from "@/hooks/use-carousel";
import { canLikeKudos } from "@/lib/kudos/kudos-selectors";
import type { KudosPerson, KudosPost } from "@/lib/kudos/kudos-types";
import { KudosCard, type KudosCardLabels } from "./kudos-card";
import { KudosSectionHeading } from "./kudos-section-heading";

export interface HighlightKudosCarouselProps {
  /** Already-filtered top-5-by-hearts posts, computed by the board
   * (`kudos-board.tsx`, Phase 08) — this component only paginates what it
   * is given (0–5 cards), it does not own filter state. */
  posts: KudosPost[];
  cardLabels: KudosCardLabels;
  emptyLabel: string;
  /** The hashtag/department filter dropdowns, owned and rendered by the
   * board (Phase 08) via `<KudosFilters/>`. Rendered here in the header
   * row so the section owns layout while the board owns state (plan.md
   * client/server boundary decision). */
  filtersSlot?: ReactNode;
  /** F008 like wiring, owned by `KudosPageClient` and forwarded through
   * the board — optional so this component still renders the legacy
   * static heart when a caller omits them. */
  likedIds?: Set<string>;
  currentUser?: KudosPerson;
  onToggleLike?: (postId: string) => void;
}

/** Left/right chevrons — `currentColor` inline SVG, disabled via the
 * button's own `disabled` attribute (Tailwind fades opacity). */
function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  const path =
    direction === "left" ? "M15 18L9 12L15 6" : "M9 18L15 12L9 6";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={path} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Client carousel for the "HIGHLIGHT KUDOS" section (FR-5/6/7/8). Custom
 * carousel (no lib, `useCarousel`) — shows a 3-card window (index-1, index,
 * index+1) at full size/opacity, per the MoMorph ground truth
 * (`2940:13463`): three 528px cards side by side, full-bleed to the
 * viewport edge, with the outer two masked by a gradient-to-background
 * overlay rather than per-card scale/opacity dimming.
 */
export function HighlightKudosCarousel({
  posts,
  cardLabels,
  emptyLabel,
  filtersSlot,
  likedIds,
  currentUser,
  onToggleLike,
}: HighlightKudosCarouselProps) {
  const { index, next, prev, canPrev, canNext } = useCarousel(posts.length);

  const windowStart = Math.max(0, Math.min(index - 1, posts.length - 3));
  const visiblePosts = posts.slice(windowStart, windowStart + 3);

  return (
    <section className="flex w-full flex-col gap-10">
      <div className="mx-auto flex w-full max-w-[1152px] flex-wrap items-end justify-between gap-4 px-6 sm:px-10 lg:px-36">
        <KudosSectionHeading subtitle="Sun* Annual Awards 2025" title="HIGHLIGHT KUDOS" />
        {filtersSlot}
      </div>

      {posts.length === 0 ? (
        <p className="font-montserrat px-6 text-sm text-white/60 sm:px-10 lg:px-36">{emptyLabel}</p>
      ) : (
        <>
          {/* mm:2940:13463 — full-bleed row, breaking out of the page's
           * padded reading column (see `kudos-board.tsx`) to reach the
           * true viewport edge, per the 1440-wide "Bìa" ground truth. */}
          <div className="relative flex w-full items-center justify-center gap-6 overflow-hidden lg:left-1/2 lg:right-1/2 lg:-mx-[50vw] lg:w-screen">
            {visiblePosts.map((post) => (
              <div key={post.id} className="w-full max-w-[528px] shrink-0">
                <KudosCard
                  post={post}
                  variant="highlight"
                  labels={cardLabels}
                  liked={likedIds?.has(post.id)}
                  canLike={currentUser ? canLikeKudos(post, currentUser) : undefined}
                  onToggleLike={onToggleLike}
                />
              </div>
            ))}

            {/* mm:2940:13469 — left gradient-fade zone + large prev button */}
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[400px] items-center bg-gradient-to-r from-[#00101A] from-50% to-transparent pl-20 lg:flex">
              <button
                type="button"
                onClick={prev}
                disabled={!canPrev}
                aria-label="Previous slide"
                className="pointer-events-auto flex h-20 w-20 shrink-0 items-center justify-center rounded-[4px] text-white disabled:opacity-30"
              >
                <ChevronIcon direction="left" />
              </button>
            </div>
            {/* mm:2940:13467 ("Frame 527") — right gradient-fade zone + large
             * next button. Ground truth padding is "186px 40px 186px 80px"
             * with justify-content:center (not justify-end + pr-10 alone),
             * which is what puts the 80x80 button 140px in from the
             * viewport edge instead of 40px. */}
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[400px] items-center justify-center bg-gradient-to-l from-[#00101A] from-50% to-transparent pr-10 pl-20 lg:flex">
              <button
                type="button"
                onClick={next}
                disabled={!canNext}
                aria-label="Next slide"
                className="pointer-events-auto flex h-20 w-20 shrink-0 items-center justify-center rounded-[4px] text-white disabled:opacity-30"
              >
                <ChevronIcon direction="right" />
              </button>
            </div>
          </div>

          {/* mm:2940:13472 / mm:2940:13474 — borderless 48x48, 4px-radius
           * (near-square) buttons, not bordered circles. */}
          <div className="flex items-center justify-center gap-8">
            <button
              type="button"
              onClick={prev}
              disabled={!canPrev}
              aria-label="Previous"
              className="flex h-12 w-12 items-center justify-center rounded-[4px] text-white disabled:opacity-30"
            >
              <ChevronIcon direction="left" />
            </button>
            <span className="font-montserrat text-[28px] leading-9 font-bold text-[#999]">
              {index + 1}/{posts.length}
            </span>
            <button
              type="button"
              onClick={next}
              disabled={!canNext}
              aria-label="Next"
              className="flex h-12 w-12 items-center justify-center rounded-[4px] text-white disabled:opacity-30"
            >
              <ChevronIcon direction="right" />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
