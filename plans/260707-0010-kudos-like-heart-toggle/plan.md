---
title: "F008 — Like Kudos (thả tim) heart toggle"
description: "Turn the static heart icon+count on KudosCard into a two-way, session-only like toggle keyed by CURRENT_USER."
status: completed
priority: P2
effort: 6h
branch: main
tags: [kudos, ui, i18n, react-state, f008]
created: 2026-07-07
---

# F008 — Like Kudos (thả tim) heart toggle

Follow-up deliberately deferred from F006 (static `<span>` heart) and F007 (kept static).
The F006 heart icon+count in `kudos-card.tsx` becomes an interactive two-way like toggle.

## Goal (one sentence)
Click the heart to like a Kudos (+1, filled), click again to unlike (−1, outline) — state
lives in session React state (lost on refresh), keyed by the current user, everywhere the
card renders (Highlight carousel + All Kudos feed), and a user cannot like their own post.

## Key Architectural Decisions
- **State ownership:** `KudosPageClient` (already owns session `posts`) also owns
  `likedIds: Set<string>` + `toggleLike(id)`. Same session-only pattern as F007's `posts`;
  no localStorage, no context, no backend. Prop-drilled down (mirrors `onHashtagClick`).
- **Hearts mutation strategy: DO NOT mutate `KudosPost.hearts`.** Keep `hearts` as the
  static base ("everyone-else") count. Display count = `hearts + (liked ? 1 : 0)`, derived
  in the card. Rationale: `getTopKudosByHearts` sorts the carousel on `hearts`; leaving it
  static keeps top-5 membership + order stable while the single current user toggles likes
  (no jarring mid-session carousel reorder). No change to `kudos-types.ts` or the sort. KISS.
- **a11y contract:** interactive heart is `<button type="button" aria-pressed={liked}
  aria-label={liked ? labels.unlike : labels.like}>`. Filled icon when liked, outline when
  not. Own post → `disabled` button, reduced opacity (adopted rule, see Assumptions).
  When no `onToggleLike` prop is wired → falls back to the F006 static `<span>` (server-safe).
- **Own-post exclusion:** new pure selector `canLikeKudos(post, currentUser)` in
  `kudos-selectors.ts`, mirroring `getDistinctRecipients`'s currentUser-exclusion.

## Assumptions (surface for user review)
- **A user cannot like their own post** (`post.sender.name === currentUser.name` → heart
  disabled, reduced opacity). Not one of the 4 answered questions — adopted as sensible
  product UX (mirrors F007 recipient self-exclusion). Flagged here for visibility.

## Phases
| # | Phase | Status | Depends on |
|---|-------|--------|------------|
| 01 | [Foundation: selector + i18n + card-labels type](phase-01-foundation-selector-i18n.md) | completed | — |
| 02 | [KudosCard interactive heart toggle](phase-02-kudos-card-heart-toggle.md) | completed | 01 |
| 03 | [State ownership + prop drilling](phase-03-state-ownership-prop-drilling.md) | completed | 02 |
| 04 | [Tests hardening + docs + DoD gate](phase-04-tests-docs-dod.md) | completed | 01,02,03 |

## Delivery

Committed at `7d7d3c5` on `main` (2026-07-07). Full DoD green: 426/426 tests, `tsc --noEmit`
clean, eslint clean. Reviewed (`plans/reports/reviewer-260707-0052-f008-like-kudos-review.md`)
and validated (`plans/reports/tester-260707-0047-f008-like-kudos-validation.md`). A concurrent
session's incompatible localStorage-based implementation of the same feature
(`plans/260707-0008-kudos-like-toggle/`) was superseded by this plan per the user's live
in-session decision — see `SUPERSEDED.md` in this folder for the resolution record.

## Data Flow (after change)
```
page.tsx (server, passes CURRENT_USER)
  → KudosPageClient  [owns posts + likedIds Set + toggleLike + currentUser]
      → KudosBoard   [forwards likedIds, currentUser, onToggleLike]
          → HighlightKudosCarousel  → per post: liked, canLike, onToggleLike → KudosCard
          → AllKudosFeed            → per post: liked, canLike, onToggleLike → KudosCard
                                        KudosCard: displayHearts = hearts + (liked?1:0)
```

## Out of scope
- Persistence beyond session (no localStorage / backend).
- Liking on behalf of anyone but the mock `CURRENT_USER`.
- Optimistic/animated heart micro-interactions beyond fill/outline swap.
- Kudos detail route, profile route (still out of scope per F006/F007).

## Constraints
- Files <200 lines, kebab-case. YAGNI/KISS/DRY. No new dependencies.
- Do NOT touch `plans/260707-0008-kudos-like-toggle/` (concurrent session).
- Every modified component keeps its co-located Vitest+RTL test green.

## Unresolved Questions
- None blocking. Own-post rule is an assumption above; revert to "always likeable" if the
  user rejects it (removes `canLikeKudos` usage + disabled branch only).
