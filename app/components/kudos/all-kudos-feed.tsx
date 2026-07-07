"use client";

import { canLikeKudos } from "@/lib/kudos/kudos-selectors";
import type { KudosPerson, KudosPost } from "@/lib/kudos/kudos-types";
import { KudosCard, type KudosCardLabels } from "./kudos-card";

export interface AllKudosFeedProps {
  /** Already-filtered posts, computed by the board (`kudos-board.tsx`,
   * Phase 08) — same `filtered` dataset the Highlight carousel derives
   * its top-5 from, so both sections stay in sync (FR-16). */
  posts: KudosPost[];
  cardLabels: KudosCardLabels;
  emptyLabel: string;
  /** Forwards a clicked hashtag up to the board, which sets it as the
   * active hashtag filter (FR-17). */
  onHashtagClick: (tag: string) => void;
  /** F008 like wiring, owned by `KudosPageClient` and forwarded through
   * the board — optional so this component still renders the legacy
   * static heart when a caller omits them. */
  likedIds?: Set<string>;
  currentUser?: KudosPerson;
  onToggleLike?: (postId: string) => void;
}

/**
 * "ALL KUDOS" feed (FR-12/13/14/17). Client because it receives filtered
 * posts + the hashtag-click callback from the board — the sidebar
 * (stats/top-10) is a separate, server-renderable slot (Phase 07/08), NOT
 * a child of this component, so it never enters this client bundle.
 *
 * Cards-only: the "ALL KUDOS" section heading is owned and rendered by
 * `kudos-board.tsx`, full-width above this feed and the sidebar (mm:
 * `C_All kudos` 2940:13475 — `C.1_Header` sits alone above the row of
 * feed + sidebar, so the sidebar's top edge lines up with the first card,
 * not with the heading).
 */
export function AllKudosFeed({
  posts,
  cardLabels,
  emptyLabel,
  onHashtagClick,
  likedIds,
  currentUser,
  onToggleLike,
}: AllKudosFeedProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      {posts.length === 0 ? (
        <p className="font-montserrat text-sm text-white/60">{emptyLabel}</p>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <KudosCard
              key={post.id}
              post={post}
              variant="feed"
              labels={cardLabels}
              onHashtagClick={onHashtagClick}
              liked={likedIds?.has(post.id)}
              canLike={currentUser ? canLikeKudos(post, currentUser) : undefined}
              onToggleLike={onToggleLike}
            />
          ))}
        </div>
      )}
    </div>
  );
}
