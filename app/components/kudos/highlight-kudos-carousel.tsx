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
 * carousel (no lib, `useCarousel`) — center slide prominent/opaque, both
 * neighbors faded, driven purely by `i - index` (no DOM measurement).
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

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="flex w-full flex-wrap items-end justify-between gap-4">
        <KudosSectionHeading subtitle="Sun* Annual Awards 2025" title="HIGHLIGHT KUDOS" />
        {filtersSlot}
      </div>

      {posts.length === 0 ? (
        <p className="font-montserrat text-sm text-white/60">{emptyLabel}</p>
      ) : (
        <>
          <div className="relative flex w-full items-center justify-center gap-4 overflow-hidden">
            {posts.map((post, i) => {
              const distance = i - index;
              const isActive = distance === 0;
              return (
                <div
                  key={post.id}
                  className="w-full max-w-[420px] shrink-0 transition-all duration-300 ease-out"
                  style={{
                    transform: `scale(${isActive ? 1 : 0.9}) translateX(${distance * -8}px)`,
                    opacity: isActive ? 1 : 0.4,
                    order: i,
                  }}
                  aria-hidden={!isActive}
                >
                  <KudosCard
                    post={post}
                    variant="highlight"
                    labels={cardLabels}
                    liked={likedIds?.has(post.id)}
                    canLike={currentUser ? canLikeKudos(post, currentUser) : undefined}
                    onToggleLike={onToggleLike}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={prev}
              disabled={!canPrev}
              aria-label="Previous"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white disabled:opacity-30"
            >
              <ChevronIcon direction="left" />
            </button>
            <span className="font-montserrat text-sm text-white/80">
              {index + 1}/{posts.length}
            </span>
            <button
              type="button"
              onClick={next}
              disabled={!canNext}
              aria-label="Next"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white disabled:opacity-30"
            >
              <ChevronIcon direction="right" />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
