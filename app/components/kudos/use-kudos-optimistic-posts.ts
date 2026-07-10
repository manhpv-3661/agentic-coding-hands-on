"use client";

import { useCallback, useState } from "react";
import { createKudosAction } from "@/app/kudos/actions";
import type { KudosPerson, KudosPost } from "@/lib/kudos/kudos-types";
import { uploadKudosImages } from "@/lib/kudos/upload-kudos-image";
import {
  buildKudosPost,
  toCreateKudosInput,
  type ComposeFormState,
} from "./compose/compose-form-helpers";

export interface UseKudosOptimisticPostsOptions {
  initialPosts: KudosPost[];
  currentUser: KudosPerson;
  /** Fired once `createKudosAction`'s promise resolves with a genuine
   * success — `{ok:true, skipped:false}` (real insert) OR `{ok:true,
   * skipped:true}` (mock mode, no Supabase configured) both count, since
   * both should feel like a successful send to the user. Never fired
   * before the result is known (review finding H2: no more toasting
   * "success" ahead of the real outcome). */
  onSuccess: () => void;
  /** Fired when `createKudosAction` resolves `{ok:false}`, AFTER the
   * optimistic post has already been rolled back. */
  onFailure: () => void;
}

export interface UseKudosOptimisticPostsResult {
  posts: KudosPost[];
  addPost: (state: ComposeFormState) => Promise<void>;
}

/**
 * Owns the Kudos feed's `posts` list and the optimistic-prepend/rollback
 * dance around `createKudosAction` (backend pivot, Phase 04) — split out of
 * `kudos-page-client.tsx` (review low-priority finding: file size) so the
 * wrapper component stays thin prop-wiring.
 *
 * The optimistic prepend happens first (instant feedback), built from the
 * SAME validated `state` the serializable `CreateKudosInput` is derived
 * from — no duplicated field-mapping between the two. A `{ok:false}` result
 * rolls the prepend back; `{ok:true, skipped:true}` (mock mode) keeps it as
 * the sole source of truth, same as before the backend pivot.
 */
export function useKudosOptimisticPosts({
  initialPosts,
  currentUser,
  onSuccess,
  onFailure,
}: UseKudosOptimisticPostsOptions): UseKudosOptimisticPostsResult {
  const [posts, setPosts] = useState<KudosPost[]>(initialPosts);

  const addPost = useCallback(
    async (state: ComposeFormState) => {
      const optimisticPost = buildKudosPost(state, currentUser, new Date());
      setPosts((previous) => [optimisticPost, ...previous]);
      try {
        const imageUrls =
          state.images.length > 0 && currentUser.id
            ? await uploadKudosImages(currentUser.id, state.images)
            : [];
        const result = await createKudosAction(toCreateKudosInput(state, imageUrls));

        if (!result.ok) {
          setPosts((previous) => previous.filter((post) => post.id !== optimisticPost.id));
          onFailure();
          return;
        }

        // Review finding (Medium): a real insert returns the DB's own
        // `postId` — swap it in for the client-generated optimistic id
        // (`kudos-new-{timestamp}-{seq}`), otherwise anything keying off
        // `post.id` (e.g. `CopyLinkButton`'s `/kudos#${post.id}` anchor)
        // stays permanently desynced from the row a page reload will show.
        if (!result.skipped) {
          setPosts((previous) =>
            previous.map((post) =>
              post.id === optimisticPost.id ? { ...post, id: result.postId } : post,
            ),
          );
        }

        onSuccess();
      } catch {
        setPosts((previous) => previous.filter((post) => post.id !== optimisticPost.id));
        onFailure();
      }
    },
    [currentUser, onFailure, onSuccess],
  );

  return { posts, addPost };
}
