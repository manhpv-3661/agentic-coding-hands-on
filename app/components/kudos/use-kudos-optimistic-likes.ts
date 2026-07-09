"use client";

import { useCallback, useRef, useState } from "react";
import { toggleLikeAction } from "@/app/kudos/actions";

export interface UseKudosOptimisticLikesOptions {
  /** Seed ids from `getLikedPostIds` (backend pivot, Phase 04/05) — empty
   * in mock mode or when unauthenticated. */
  initialLikedIds: string[];
  /** Fired when `toggleLikeAction` resolves `{ok:false}`, AFTER the
   * optimistic flip has already been rolled back. */
  onFailure: () => void;
}

export interface UseKudosOptimisticLikesResult {
  likedIds: Set<string>;
  toggleLike: (postId: string) => Promise<void>;
}

/**
 * Owns the "liked by me" post-id set and the optimistic-flip/reconcile
 * dance around `toggleLikeAction` (F008, backend pivot Phase 05) — split
 * out of `kudos-page-client.tsx` for the same file-size reason as
 * `use-kudos-optimistic-posts.ts`.
 *
 * Also closes review finding M1 (double-click race): `pendingPostIdsRef`
 * tracks post ids with an in-flight toggle, mirroring `ComposeDialog`'s own
 * `isSubmittingRef` double-submit guard — a plain mutable ref (not state)
 * since it only needs to gate re-entrancy, not trigger a re-render. A
 * second `toggleLike(postId)` call for a post whose toggle hasn't resolved
 * yet is ignored outright. This is an ADDITIONAL guard — the caller's
 * existing `canLikeKudos`/`isOwnPost` disable logic is untouched.
 */
export function useKudosOptimisticLikes({
  initialLikedIds,
  onFailure,
}: UseKudosOptimisticLikesOptions): UseKudosOptimisticLikesResult {
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set(initialLikedIds));
  const pendingPostIdsRef = useRef<Set<string>>(new Set());

  const toggleLike = useCallback(
    async (postId: string) => {
      if (pendingPostIdsRef.current.has(postId)) return; // see class doc above
      pendingPostIdsRef.current.add(postId);

      try {
        // Remember the PRE-toggle membership so a failure can roll back to
        // exactly that state, even if other likes changed `likedIds` while
        // this call was in flight.
        const wasLiked = likedIds.has(postId);
        setLikedIds((previous) => {
          const next = new Set(previous);
          if (wasLiked) {
            next.delete(postId);
          } else {
            next.add(postId);
          }
          return next;
        });

        const result = await toggleLikeAction(postId);

        if (!result.ok) {
          setLikedIds((previous) => {
            const next = new Set(previous);
            if (wasLiked) {
              next.add(postId);
            } else {
              next.delete(postId);
            }
            return next;
          });
          onFailure();
          return;
        }

        if (result.skipped) {
          // Mock mode: keep the optimistic flip only — unchanged from today.
          return;
        }

        // Reconcile to the server's authoritative `liked` boolean — on a
        // concurrent double-click race the server's answer wins over the
        // client's optimistic guess.
        setLikedIds((previous) => {
          const next = new Set(previous);
          if (result.liked) {
            next.add(postId);
          } else {
            next.delete(postId);
          }
          return next;
        });
      } finally {
        pendingPostIdsRef.current.delete(postId);
      }
    },
    [likedIds, onFailure],
  );

  return { likedIds, toggleLike };
}
