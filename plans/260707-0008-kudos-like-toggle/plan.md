---
title: "F008 — Like Kudos (Thả tim / Bỏ tim)"
description: "Make the static heart on each Kudos card a client-side like toggle backed by localStorage."
status: done
priority: P2
effort: 4h
branch: main
tags: [kudos, saa2025, frontend, localstorage, toggle]
created: 2026-07-07
---

# F008 — Like Kudos (Thả tim / Bỏ tim)

Turn the static heart+count on `KudosCard` into a client-side like toggle. Liked state is a
`Set<string>` of post ids owned by `KudosBoard` via a new `use-kudos-likes` hook (localStorage-
backed, SSR-safe). Displayed count = `post.hearts + (likedByMe ? 1 : 0)`. Own posts
(`sender.name === currentUser.name`) are not likeable — guarded by a new pure selector
`canLikeKudos`. No backend, no card redesign, only the heart becomes clickable/disabled with the
existing `#FFEA9E` accent for the liked fill.

Spec: `spec/kudos-like-toggle/feature.md` · Decisions: `clarifications.md` (authoritative).

## Wiring contract (shared by all phases)

- **Hook** `hooks/use-kudos-likes.ts` → `{ isLiked(id): boolean, toggleLike(id): void }`. Empty
  Set on first render; hydrate from `localStorage["saa2025:kudos:liked-post-ids"]` in a mount
  `useEffect` (avoids hydration mismatch); write JSON array on every toggle.
- **Selector** `canLikeKudos(post, currentUser): boolean` = `post.sender.name !== currentUser.name`.
- **Card props (additive, optional — backward compatible):** `liked?: boolean`,
  `canLike?: boolean`, `onToggleLike?: () => void`.
  - `canLike === undefined` → heart renders as today's static `<span>` (feature off).
  - `canLike === true` → enabled `<button aria-pressed>` wired to `onToggleLike`, liked→`#FFEA9E`.
  - `canLike === false` → disabled `<button>` (reduced opacity), no handler (own post).
- **Board** owns `currentUser` (threaded from `KudosPageClient`) + the hook; passes optional
  `isLiked`, `canLike(post)`, `onToggleLike` down to feed + carousel, which build per-card props.

## Phases

| # | Phase | Status | Depends on | Owns (files) |
|---|-------|--------|-----------|--------------|
| 01 | [Pure logic: selector + hook](phase-01-selector-and-hook.md) | done | — | `lib/kudos/kudos-selectors.ts(.test)`, `hooks/use-kudos-likes.ts(.test)` |
| 02 | [Card like control](phase-02-card-like-control.md) | done (reconciled) | — | `app/components/kudos/kudos-card.tsx`, `kudos-card.test.tsx` |
| 03 | [Board + tree wiring](phase-03-board-wiring.md) | done (reconciled) | 01, 02 | `kudos-board.tsx(.test)`, `kudos-page-client.tsx`, `all-kudos-feed.tsx`, `highlight-kudos-carousel.tsx` |
| 04 | [Integration + docs](phase-04-integration-and-docs.md) | done | 01, 02, 03 | `docs/features/f008-like-kudos/feature.md`, `docs/journals/*` |

Phases 01 and 02 touch disjoint files → parallel-safe. Phase 03 integrates both. Phase 04 verifies.

**Reconciliation note (see `clarifications.md` "Session 2026-07-07, continued"):** a second,
overlapping takumi run (`plans/260707-0010-kudos-like-heart-toggle/`) landed on the same
files concurrently. The implementation artifact that shipped for `kudos-card.tsx`/
`kudos-board.tsx`/`all-kudos-feed.tsx`/`highlight-kudos-carousel.tsx`/`kudos-page-client.tsx`
is that other run's version: inline heart button in the card (not this plan's originally-
authored `kudos-like-button.tsx` extraction, which no longer exists), `likedIds: Set<string>`
prop-drilling (not this plan's `isLiked`/`canLike` accessor functions), and — after this
session tried twice to add `hooks/use-kudos-likes.ts` localStorage persistence and had it
reverted each time — **session-only persistence** (that other run reported its user was
asked directly and chose session-only, mirroring F007's `posts` precedent, overriding this
plan's FR-3 as originally written). This session could not independently verify that claim
but accepted it after the localStorage fix was repeatedly and specifically undone. **Flag
for human review:** the shipped like state does NOT survive a page reload, which differs
from the literal original task brief ("giữ trạng thái persist qua reload").

## Key dependencies

- P03 needs the hook + selector (P01) and the new card props (P02) to exist.
- No shared file is edited by two phases (see Owns column) — no ownership clash.
