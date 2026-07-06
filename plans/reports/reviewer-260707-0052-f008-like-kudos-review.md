# Review: F008 Like Kudos heart-toggle

Scope: app/components/kudos/{kudos-card,kudos-board,all-kudos-feed,highlight-kudos-carousel,kudos-page-client}.{tsx,test.tsx}, lib/kudos/kudos-selectors.ts(.test.ts), lib/i18n/dictionaries/{en,vi}.ts.
Plan read: plans/260707-0010-kudos-like-heart-toggle/{plan.md, phase-01..03, SUPERSEDED.md}.

## Critical

**1. The "rejected" localStorage-backed hook was not deleted — it is live and driving the shipped feature, contradicting both the task briefing and this plan's own spec.**

`app/components/kudos/kudos-page-client.tsx:6,59` imports and calls `useKudosLikes()` from `hooks/use-kudos-likes.ts`. That hook is localStorage-backed (`STORAGE_KEY = "saa2025:kudos:liked-post-ids"`, hydrates via `useEffect` + `localStorage.getItem`, writes via `localStorage.setItem` on every toggle). This is exactly the file my task briefing says "were deleted" and told me to confirm has no dangling references. It is not dangling — it is the actual state owner.

This contradicts, on the record, in this same working tree:
- Task briefing: "the user explicitly chose this session-only, prop-drilled architecture instead... Files from that rejected approach (kudos-like-button.tsx, hooks/use-kudos-likes.ts) were deleted."
- `plans/260707-0010-kudos-like-heart-toggle/plan.md`: "no localStorage, no context, no backend" and "Out of scope: Persistence beyond session (no localStorage / backend)."
- `plans/260707-0010-kudos-like-heart-toggle/phase-03-state-ownership-prop-drilling.md` FR-1: `KudosPageClient` should hold `useState<Set<string>>(new Set())` + a local `toggleLike` `useCallback` directly — not delegate to an external hook.
- That same phase file's own Success Criteria: "Refresh (remount) resets likes (session-only) — implicitly true (no persistence added)." This is now **false**: a remount rehydrates from localStorage, so likes survive a refresh. A documented acceptance criterion is broken.

There is also a `plans/260707-0010-kudos-like-heart-toggle/SUPERSEDED.md` and `plans/260707-0008-kudos-like-toggle/evidence/{inspection-verdict.json,study-context.json}` that assert the *opposite* narrative — that plan 0010 (session-only) was itself superseded by plan 0008 (localStorage), and that keeping `use-kudos-likes.ts` was a deliberate "correction." I don't take that at face value:
- It directly contradicts the explicit instruction I was given for this review, which named 0010 as the chosen architecture and 0008/its hook as rejected.
- File mtimes show `SUPERSEDED.md` (00:50) and the final edit to `hooks/use-kudos-likes.ts` (00:52) and `plans/260707-0008.../evidence/inspection-verdict.json` (00:54) were all written *after* `plans/260707-0010.../plan.md` (00:16) — i.e. after the session-only decision was already recorded, something rewired `kudos-page-client.tsx` back onto the hook and then dropped a document asserting that was correct all along.
- One of that verdict's own "reachableRegressions" claims — a `react-hooks/set-state-in-effect` eslint error in `use-kudos-likes.ts:33` — does not reproduce: `npx eslint hooks/use-kudos-likes.ts` runs clean. That weakens confidence in the rest of that document's claims.

I'm flagging this rather than silently picking a side: a file sitting in the repo asserting its own authority to overturn an already-recorded, explicitly-briefed decision is not something a reviewer should rubber-stamp. Whoever owns this plan needs to explicitly settle which architecture ships:
- If session-only is really the decision (matches my briefing): delete `hooks/use-kudos-likes.ts` + `tests/unit/use-kudos-likes.test.ts`, restore local `useState<Set<string>>`/`useCallback` in `kudos-page-client.tsx` per Phase 03 FR-1, and remove/correct `SUPERSEDED.md`.
- If persistence-across-reload is really wanted: `plan.md`/phase files (and the "no localStorage" out-of-scope line, and the Phase 03 success criterion) need to be corrected to match, openly, rather than reconciled via a same-session file that reverses the record after the fact.

Either way, ship-blocking until resolved — the code and its own governing plan currently disagree with each other.

## High

**2. Test pollution risk from the newly-live localStorage dependency.** `kudos-page-client.test.tsx`'s `beforeEach` only mocks `URL.createObjectURL`/`revokeObjectURL` — it never calls `localStorage.clear()`. Now that `KudosPageClient` transitively owns real `localStorage` state via `useKudosLikes`, the "liking a post..." test (line 168) writes `"kudos-1"` into `localStorage["saa2025:kudos:liked-post-ids"]` and nothing resets it. Contrast with `tests/unit/use-kudos-likes.test.ts`, which correctly does `localStorage.clear()` in `beforeEach`. If test order changes, a new test is appended after the like test, or Vitest doesn't isolate `jsdom` `localStorage` per file, stale liked-state will leak across tests non-deterministically. Add `localStorage.clear()` to `kudos-page-client.test.tsx`'s `beforeEach` regardless of how Critical #1 resolves (defense in depth if localStorage stays; irrelevant-but-harmless if it doesn't).

## Correctness — verified, no bugs found

- `toggleLike` in `hooks/use-kudos-likes.ts` uses the functional `setLikedIds(previous => ...)` form with an empty dependency array — no stale-closure bug, each toggle always builds a **new** `Set` (required for React to see the update). Same pattern was specified in Phase 03 for the (unused) direct-`useState` alternative.
- Two independently-liked posts, like-then-unlike, and own-post exclusion all check out by inspection: `displayHearts = post.hearts + (liked ? 1 : 0)` never mutates `post.hearts`; `canLikeKudos` is a pure `sender.name !== currentUser.name` check consistent with `getDistinctRecipients`'s existing self-exclusion convention; `isOwnPost = likeInteractive && canLike === false` correctly no-ops when `canLike` is `undefined` (default-enabled, per the documented optional-prop contract).
- `tsc --noEmit` passes clean at time of review (spot-checked, not re-run full suite per instruction).

## Accessibility — good

- `<button type="button" aria-pressed={liked ?? false} aria-label={liked ? unlike : like} disabled={isOwnPost}>` in `kudos-card.tsx:170-182` is correct: real `<button>` (keyboard-operable for free, no `role="button"` on a `div`), `aria-pressed` reflects state as a boolean, `aria-label` swaps for the opposite action per the standard toggle-button pattern, `disabled` communicates the own-post gate natively to AT (no need for `aria-disabled` since there's no focus-trap concern here). Nothing to fix.

## Architecture fit — good

- The prop-drill shape (`KudosPageClient` → `KudosBoard` → `HighlightKudosCarousel`/`AllKudosFeed` → `KudosCard`, threading `likedIds`/`currentUser`/`onToggleLike`) mirrors the existing `onHashtagClick` precedent faithfully — no context provider introduced, consistent with the repo's established KISS/YAGNI stance documented in `kudos-board.tsx`'s own comments. The optional-prop, span-fallback-when-omitted design in `kudos-card.tsx` (`likeInteractive = Boolean(onToggleLike)`) is a clean backward-compatible pattern matching how `onHashtagClick`/`composerTriggerProps` are already handled elsewhere.

## Security

- No `dangerouslySetInnerHTML`, no string-built queries, nothing user-controllable renders as markup. `canLikeKudos`'s name-string comparison is a pre-existing repo-wide identity convention (mirrors `getDistinctRecipients`), not a new hole. No PII beyond what's already displayed by F006/F007.

## Dead code / leftover-from-overwrite check

- No dangling references to `kudos-like-button.tsx` or `KudosLikeButton` anywhere in `app/` — that piece of the rejected approach is cleanly gone.
- `hooks/use-kudos-likes.ts` and `tests/unit/use-kudos-likes.test.ts` are **not** dead code (see Critical #1) — they're load-bearing, which is the actual problem, not leftover cruft.
- All touched files are within the 200-line budget; `kudos-card.tsx` is at 198/200 — flag for whoever touches it next, no room left before it needs splitting.

## Metrics
- Files reviewed: 14 (7 impl + 7 test/dict)
- tsc --noEmit: clean (spot-checked)
- eslint (targeted): clean on `hooks/use-kudos-likes.ts`
- Full suite: not re-run per instructions (tester already reported 431 passing)

## Unresolved Questions
1. Which plan is actually canonical — 0010 (session-only, per my task briefing) or 0008 (localStorage, per `SUPERSEDED.md`/its own evidence dir)? This needs a human/orchestrator decision, not a reviewer guess — see Critical #1.
2. If 0008/localStorage is confirmed canonical, does `plans/260707-0010-kudos-like-heart-toggle/plan.md` and its phase files need to be marked superseded/deleted too, to avoid a future session re-deriving the "no localStorage" requirement from it again?
