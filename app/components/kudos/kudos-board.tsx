"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { filterKudos, getTopKudosByHearts } from "@/lib/kudos/kudos-selectors";
import type { KudosFilterState, KudosPerson, KudosPost } from "@/lib/kudos/kudos-types";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { ContentFrame, PageGutter } from "../layout/page-layout";
import { AllKudosFeed } from "./all-kudos-feed";
import { HighlightKudosCarousel } from "./highlight-kudos-carousel";
import { KudosFilters } from "./kudos-filters";
import { KudosSectionHeading } from "./kudos-section-heading";

export interface KudosBoardProps {
  posts: KudosPost[];
  hashtagOptions: string[];
  departmentOptions: string[];
  /** Full `kudos` dictionary slice — the board threads `filters`/`card`/
   * `empty` sub-slices down to the sections it owns. */
  labels: Dictionary["kudos"];
  /** Server-rendered Spotlight section, passed in as a slot so it stays
   * out of this client component's own render logic (plan.md: Spotlight
   * doesn't touch the shared hashtag/department filter). */
  spotlight: ReactNode;
  /** Server-rendered stats/top-10 sidebar, passed in as a slot so it
   * never enters this client bundle (Phase 07/08 boundary). */
  sidebar: ReactNode;
  /** F008: the logged-in Sunner — forwarded so the carousel/feed can gate
   * each card's like-ability via `canLikeKudos`. */
  currentUser: KudosPerson;
  /** F008: "liked by me" post ids, owned by `KudosPageClient` and forwarded
   * unchanged — this component has no like state itself. Client-side
   * `useState`, but seeded from `getLikedPostIds` (backend pivot) so it
   * survives a reload, not session-only. */
  likedIds: Set<string>;
  /** F008: flips a post's liked state, owned by `KudosPageClient`. */
  onToggleLike: (postId: string) => void;
}

/**
 * The SINGLE owner of the hashtag/department filter state (FR-15/16/17).
 * No context — two consumers (Highlight carousel, All Kudos feed)
 * prop-drilled directly is simpler than introducing the repo's first
 * context provider for this (KISS/YAGNI, plan.md decision).
 *
 * Derives `filtered` (both sections' shared dataset) and `top5` (the
 * Highlight carousel's slides) from `filter` on every render — cheap pure
 * functions over ~12 posts, no memoization needed.
 */
export function KudosBoard({
  posts,
  hashtagOptions,
  departmentOptions,
  labels,
  spotlight,
  sidebar,
  currentUser,
  likedIds,
  onToggleLike,
}: KudosBoardProps) {
  const [filter, setFilter] = useState<KudosFilterState>({ hashtag: null, department: null });

  const filtered = filterKudos(posts, filter);
  const top5 = getTopKudosByHearts(filtered, 5);

  function setHashtag(tag: string) {
    setFilter((current) => ({ ...current, hashtag: tag }));
  }

  return (
    <PageGutter>
      <ContentFrame width={1152} className="flex flex-col gap-[120px]">
        <HighlightKudosCarousel
          posts={top5}
          cardLabels={labels.card}
          emptyLabel={labels.empty.kudos}
          title={labels.sections.highlightKudos}
          ariaLabels={labels.highlight.a11y}
          filtersSlot={
            <KudosFilters
              value={filter}
              onChange={setFilter}
              hashtagOptions={hashtagOptions}
              departmentOptions={departmentOptions}
              labels={labels.filters}
            />
          }
          likedIds={likedIds}
          currentUser={currentUser}
          onToggleLike={onToggleLike}
        />

        {spotlight}

        {/* mm: `C_All kudos` (2940:13475) — full-width header sits alone
         * above the feed/sidebar row (`Frame 502`, 2940:13481), so the
         * sidebar's top edge lines up with the first feed card, not the
         * heading. */}
        <div className="flex w-full flex-col gap-10">
          <KudosSectionHeading subtitle="Sun* Annual Awards 2025" title={labels.sections.allKudos} />

          <section className="flex w-full flex-row items-start gap-20">
            <AllKudosFeed
              posts={filtered}
              cardLabels={labels.card}
              emptyLabel={labels.empty.kudos}
              onHashtagClick={setHashtag}
              likedIds={likedIds}
              currentUser={currentUser}
              onToggleLike={onToggleLike}
            />
            {sidebar}
          </section>
        </div>
      </ContentFrame>
    </PageGutter>
  );
}
