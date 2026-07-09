# Phase 05 — Wire Like-Toggle → Backend

## Context Links
- Depends on: Phase 04 (same files: `kudos-page-client.tsx`, `page.tsx`) —
  **must run AFTER Phase 04, never in parallel**.
- Depends on: Phase 03 (`toggleLikeAction`).
- Current: `kudos-page-client.tsx` owns `likedIds: Set<string>` via
  session-only `useState`; `toggleLike` flips the set; drilled to
  `KudosBoard` → carousel/feed → `KudosCard`. Display hearts =
  `post.hearts + (liked?1:0)`.

## Overview
- **Priority:** P1
- **Status:** pending
- **Description:** Seed `likedIds` from the server (`getLikedPostIds`), keep
  the optimistic `Set` toggle for instant feedback, and back it with
  `toggleLikeAction`. In mock mode the optimistic set stands alone (today's
  behavior — session-only, no persistence).

## Key Insights
- The existing `likedIds` Set is the optimistic layer; only its SEED and a
  fire-and-reconcile action call change. Prop-drilling shape
  (`likedIds`/`onToggleLike`) stays → `KudosBoard`/carousel/feed/`KudosCard`
  need NO changes (DRY).
- Real hearts already include the like row server-side (`base_hearts +
  count`). To avoid double-count, when a post is already reflected in the
  server count, the client `+1` must not stack. Keep the display rule
  self-consistent: server `hearts` = base + others' likes EXCLUDING the
  current user's optimistic delta; add current-user delta client-side only.
  → `getKudosPosts` should compute hearts EXCLUDING the current user's own
  like, and the client adds `+1` when in `likedIds` (mirrors today exactly).
- Self-like still blocked by `canLikeKudos` (client) + action guard (server).

## Requirements
- `page.tsx`: pass `initialLikedIds` from `getLikedPostIds(user.id)`.
- `kudos-page-client.tsx`: seed `likedIds` state from `initialLikedIds`;
  `toggleLike` = optimistic flip → `await toggleLikeAction(postId)` →
  reconcile to `{liked}` on success, roll back on error; mock mode
  (`skipped`) keeps optimistic only.
- Repository `getKudosPosts` hearts EXCLUDE current user's own like row
  (so client `+1` overlay stays correct and non-double-counting).

## Architecture — data flow
```
page.tsx: initialLikedIds = getLikedPostIds(uid); posts.hearts exclude uid's like
  → KudosPageClient seeds likedIds Set
      → KudosCard click → optimistic flip Set (+1/-1 overlay)
          → toggleLikeAction(postId) → reconcile liked / rollback on error
```

## Related Code Files
- **Modify:** `app/kudos/page.tsx` (pass `initialLikedIds`),
  `app/components/kudos/kudos-page-client.tsx` (seed + async toggle).
- **Modify (repository):** `lib/kudos/kudos-repository.ts` — hearts exclude
  current user's like (coordinate with Phase 02's count query).
- **Unchanged:** `kudos-board.tsx`, `all-kudos-feed.tsx`,
  `highlight-kudos-carousel.tsx`, `kudos-card.tsx` (prop contract stable).

## Implementation Steps
1. Extend `getKudosPosts` to accept `currentUserId` and exclude their like
   from the count (or compute overlay separately). Keep mock mode returning
   `KUDOS_POSTS` unchanged.
2. `page.tsx`: fetch + pass `initialLikedIds`.
3. `kudos-page-client.tsx`: seed state; async `toggleLike` with optimistic
   flip + `toggleLikeAction` reconcile/rollback.
4. Keep disabled/self-like rendering via existing `canLikeKudos`.

## Todo List
- [ ] repository: hearts exclude current user's like + `getLikedPostIds`
- [ ] `page.tsx` pass `initialLikedIds`
- [ ] seed `likedIds` from prop
- [ ] async `toggleLike` optimistic + reconcile + rollback
- [ ] mock-mode (skipped) unchanged

## Success Criteria
- Configured: a like persists across reload (row in `kudos_likes`); count
  correct, no double-count for the acting user.
- Unlike removes the row; count decrements.
- Mock/authless: session-only toggle exactly as today (e2e/unit unaffected
  in mock mode).
- Self-authored post: heart still disabled.

## Risk Assessment
- **[High] Double-count** if server hearts include the user's own like AND
  client overlays `+1`. Mitigation: server count excludes current user (see
  step 1) — unit-test the mapper for this.
- **[Med] Race on rapid toggle** — UNIQUE constraint + action returns
  authoritative `liked`; client reconciles to it.
- **[Med] Sequential dependency on Phase 04** — both edit the same 2 files.

## Rollback
Revert to session-only `useState` seed `new Set()`; action call removed.
Mock fallback is the safe state.

## Security Considerations
`user_id` from `auth.uid()` server-side; self-like rejected server-side.

## Next Steps
Phase 07 updates the F008 like assertions in `kudos-page-client.test.tsx` /
`kudos-card.test.tsx` for the async/seeded flow.
