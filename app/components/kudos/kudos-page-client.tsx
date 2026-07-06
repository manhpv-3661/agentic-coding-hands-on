"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { useDismissableMenu } from "@/hooks/use-dismissable-menu";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { getDistinctDepartments, getDistinctHashtags } from "@/lib/kudos/kudos-selectors";
import type { KudosPerson, KudosPost } from "@/lib/kudos/kudos-types";
import { ComposeDialog } from "./compose/compose-dialog";
import { KudosBanner } from "./kudos-banner";
import { KudosBoard } from "./kudos-board";

export interface KudosPageClientProps {
  initialPosts: KudosPost[];
  currentUser: KudosPerson;
  recipientOptions: KudosPerson[];
  /** Full `kudos` dictionary slice — forwards `banner`/`composer`/`compose`
   * sub-slices to the pieces this wrapper owns, and the whole slice
   * through to `KudosBoard` unchanged (F006 contract). */
  labels: Dictionary["kudos"];
  spotlight: ReactNode;
  sidebar: ReactNode;
}

/**
 * The SINGLE owner of the compose dialog's open/close state AND the
 * session-scoped `posts` list (F007, FR-2/21) — sits between `page.tsx`
 * (Server Component) and `KudosBanner`/`KudosBoard`/`ComposeDialog`.
 *
 * No backend/persistence exists for this mock project (clarifications.md):
 * `posts` seeds from the `initialPosts` prop and a submitted Kudos is
 * simply prepended in-memory — lost on refresh, same spirit as every other
 * non-persisted F006 interaction.
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
  labels,
  spotlight,
  sidebar,
}: KudosPageClientProps) {
  const compose = useDismissableMenu({ haspopup: "dialog" });
  const [posts, setPosts] = useState<KudosPost[]>(initialPosts);

  const addPost = useCallback((post: KudosPost) => {
    setPosts((previous) => [post, ...previous]);
  }, []);

  // F008: "liked by me" post ids — session-only, same spirit as `posts`
  // above (lost on refresh, no localStorage/backend per this feature's
  // clarifications.md).
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set());

  const toggleLike = useCallback((postId: string) => {
    setLikedIds((previous) => {
      const next = new Set(previous);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  }, []);

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
        currentUser={currentUser}
        labels={labels.compose}
      />
    </>
  );
}
