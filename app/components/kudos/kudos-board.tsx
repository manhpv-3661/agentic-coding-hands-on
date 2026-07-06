"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { filterKudos, getTopKudosByHearts } from "@/lib/kudos/kudos-selectors";
import type { KudosFilterState, KudosPost } from "@/lib/kudos/kudos-types";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { AllKudosFeed } from "./all-kudos-feed";
import { HighlightKudosCarousel } from "./highlight-kudos-carousel";
import { KudosFilters } from "./kudos-filters";

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
}: KudosBoardProps) {
  const [filter, setFilter] = useState<KudosFilterState>({ hashtag: null, department: null });

  const filtered = filterKudos(posts, filter);
  const top5 = getTopKudosByHearts(filtered, 5);

  function setHashtag(tag: string) {
    setFilter((current) => ({ ...current, hashtag: tag }));
  }

  return (
    <div className="mx-auto flex w-full max-w-[1224px] flex-col gap-16 px-6 sm:px-10 lg:px-36">
      <HighlightKudosCarousel
        posts={top5}
        cardLabels={labels.card}
        emptyLabel={labels.empty.kudos}
        filtersSlot={
          <KudosFilters
            value={filter}
            onChange={setFilter}
            hashtagOptions={hashtagOptions}
            departmentOptions={departmentOptions}
            labels={labels.filters}
          />
        }
      />

      {spotlight}

      <section className="flex w-full flex-col gap-8 lg:flex-row lg:items-start">
        <AllKudosFeed
          posts={filtered}
          cardLabels={labels.card}
          emptyLabel={labels.empty.kudos}
          onHashtagClick={setHashtag}
        />
        {sidebar}
      </section>
    </div>
  );
}
