"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDismissableMenu } from "@/hooks/use-dismissable-menu";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { getDistinctDepartments, getDistinctHashtags } from "@/lib/kudos/kudos-selectors";
import type { KudosPerson, KudosPost } from "@/lib/kudos/kudos-types";
import { ComposeDialog } from "./compose/compose-dialog";
import { KudosBanner } from "./kudos-banner";
import { KudosBoard } from "./kudos-board";
import { useKudosOptimisticLikes } from "./use-kudos-optimistic-likes";
import { useKudosOptimisticPosts } from "./use-kudos-optimistic-posts";

export interface KudosPageClientProps {
  initialPosts: KudosPost[];
  currentUser: KudosPerson;
  recipientOptions: KudosPerson[];
  /** F008 seed: post ids the signed-in user has already liked, from
   * `getLikedPostIds` (backend pivot, Phase 04) — empty in mock mode or
   * when unauthenticated. Optional/defaulted so existing callers/tests that
   * predate this prop keep compiling unchanged. */
  initialLikedIds?: string[];
  /** Full `kudos` dictionary slice — forwards `banner`/`composer`/`compose`
   * sub-slices to the pieces this wrapper owns, and the whole slice
   * through to `KudosBoard` unchanged (F006 contract). */
  labels: Dictionary["kudos"];
  /** `MentionSuggestions`'s listbox aria-label (`shared.a11y.mentionSuggestions`)
   * — forwarded to `ComposeDialog`; optional/defaulted so existing
   * callers/tests that predate this prop keep compiling unchanged. */
  mentionSuggestionsAria?: string;
  spotlight: ReactNode;
  sidebar: ReactNode;
}

type ToastVariant = "success" | "failure";

const TOAST_DURATION_MS = 2000;

/**
 * The SINGLE owner of the compose dialog's open/close state (F007, FR-2/21)
 * — sits between `page.tsx` (Server Component) and
 * `KudosBanner`/`KudosBoard`/`ComposeDialog`. The `posts`/`addPost` and
 * `likedIds`/`toggleLike` optimistic-update logic itself lives in
 * `use-kudos-optimistic-posts.ts`/`use-kudos-optimistic-likes.ts` — this
 * component just wires their results to props and owns the ONE toast shown
 * for either flow's outcome.
 *
 * Toast ownership (review finding H2): the success toast fires ONLY from
 * `addPost`'s own success callback, i.e. after `createKudosAction`'s real
 * result is known — never optimistically from `ComposeDialog` itself, so a
 * genuine backend failure can never show "Kudos sent!" followed moments
 * later by a contradicting failure toast at the same screen position.
 *
 * Reuses `useDismissableMenu({ haspopup: "dialog" })` for the compose
 * dialog's Escape/outside-click close, exactly like the header menus
 * already do (DRY) — the pill's `triggerProps` open it, `containerRef`
 * wraps the dialog panel.
 */
export function KudosPageClient({
  initialPosts,
  currentUser,
  recipientOptions,
  initialLikedIds = [],
  labels,
  mentionSuggestionsAria,
  spotlight,
  sidebar,
}: KudosPageClientProps) {
  const compose = useDismissableMenu({ haspopup: "dialog" });

  // One shared toast for both flows' outcomes — mirrors
  // `copy-link-button.tsx`'s local timeout pattern rather than inventing a
  // new mechanism. Lives here (not in the hooks) because this is the
  // single place both async results end up needing to render something.
  const [toast, setToast] = useState<ToastVariant | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const showToast = useCallback((variant: ToastVariant) => {
    setToast(variant);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  const showSuccessToast = useCallback(() => showToast("success"), [showToast]);
  const showFailureToast = useCallback(() => showToast("failure"), [showToast]);

  const { posts, addPost } = useKudosOptimisticPosts({
    initialPosts,
    currentUser,
    onSuccess: showSuccessToast,
    onFailure: showFailureToast,
  });

  const { likedIds, toggleLike } = useKudosOptimisticLikes({
    initialLikedIds,
    onFailure: showFailureToast,
  });

  // Derived from the live `posts` list (not just the server-seeded
  // `initialPosts`) so a newly-submitted Kudos's hashtags/department are
  // immediately selectable in the board's filters (F007) — recomputed
  // each render, same "cheap pure function over ~12 posts" precedent as
  // `kudos-board.tsx`'s own `filtered`/`top5`.
  const hashtagOptions = useMemo(() => getDistinctHashtags(posts), [posts]);
  const departmentOptions = useMemo(() => getDistinctDepartments(posts), [posts]);

  return (
    <>
      <KudosBanner
        labels={labels.banner}
        composer={labels.composer}
        composerTriggerProps={compose.triggerProps}
      />

      <KudosBoard
        posts={posts}
        hashtagOptions={hashtagOptions}
        departmentOptions={departmentOptions}
        labels={labels}
        spotlight={spotlight}
        sidebar={sidebar}
        currentUser={currentUser}
        likedIds={likedIds}
        onToggleLike={toggleLike}
      />

      <ComposeDialog
        open={compose.open}
        containerRef={compose.containerRef}
        onClose={() => compose.setOpen(false)}
        onSubmit={addPost}
        recipientOptions={recipientOptions}
        mentionNames={recipientOptions.map((person) => person.name)}
        labels={labels.compose}
        mentionSuggestionsAria={mentionSuggestionsAria}
      />

      {toast && (
        <span
          role="status"
          className="fixed bottom-6 left-1/2 z-60 -translate-x-1/2 rounded bg-[#00101A] px-3 py-2 text-xs text-white shadow"
        >
          {toast === "success" ? labels.compose.successToast : labels.compose.failureToast}
        </span>
      )}
    </>
  );
}
