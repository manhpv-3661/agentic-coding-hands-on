"use client";

import { canLikeKudos } from "@/lib/kudos/kudos-selectors";
import type { KudosPerson, KudosPost } from "@/lib/kudos/kudos-types";
import { KudosCard, type KudosCardLabels } from "./kudos-card";
import { KudosSectionHeading } from "./kudos-section-heading";

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
      <KudosSectionHeading subtitle="Sun* Annual Awards 2025" title="ALL KUDOS" />

      {posts.length === 0 ? (
        <p className="font-montserrat text-sm text-white/60">{emptyLabel}</p>
      ) : (
        <div className="flex flex-col gap-4">
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
