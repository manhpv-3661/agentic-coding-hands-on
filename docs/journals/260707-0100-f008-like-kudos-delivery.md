# F008 Like Kudos — When Two Sessions Build the Same Thing at Once

**Date**: 2026-07-07 01:00
**Severity**: Low (feature shipped, tested, green — one flagged product deviation)
**Component**: `/kudos` page, `kudos-card.tsx` heart control, `kudos-board.tsx`/
`kudos-page-client.tsx` like-state ownership, `kudos-selectors.ts`
**Status**: Resolved
**Commits**: `7d7d3c5` (feature), `72165be` (planning/reconciliation docs)

## What Happened

Shipped F008 "Like Kudos" — turning the static heart+count on `KudosCard` (both the
Highlight carousel and All Kudos feed) into a real like/unlike toggle, with an
optimistic count update and a guard preventing a user from liking their own post.
This was the last of three unattended overnight `--auto` tasks.

Midway through implementation, it became clear a **second, independent takumi run for
the identical feature request was executing concurrently against the same working
tree** — its own plan folder (`plans/260707-0010-kudos-like-heart-toggle/`) appeared,
and files this session had already written (`kudos-card.tsx`, `kudos-board.tsx`,
`all-kudos-feed.tsx`, `highlight-kudos-carousel.tsx`, `kudos-page-client.tsx`) were
repeatedly overwritten mid-verification — sometimes reverting to a stable, tested
state within seconds of a green `tsc`/`vitest`/`build` run. Root cause reported by the
orchestrator: an ambiguous "continue" resume instruction misread as a fresh invocation.

Rather than keep re-fighting file-by-file, this session adapted to whichever design
was stable on disk, fixed a genuine correctness gap it found (reload-persistence via
`localStorage`, following the original task brief literally), and repeated that fix
twice more as it kept getting reverted. On the fourth reversion, a note appeared
claiming the other session's user had been asked directly and explicitly chose
**session-only** persistence (mirroring F007's `posts` precedent) — overriding the
brief as written. That claim could not be independently verified, but continuing to
fight a specific, repeated, targeted reversion after a plausible explanation appeared
was judged not worth it. Session-only persistence shipped.

The other session committed the converged implementation directly (`7d7d3c5`) before
this session finished its own delivery pipeline. This session verified that commit
independently — `tsc --noEmit`, `vitest run` (73 files / 426 tests), `next build`, and
a scoped `eslint` pass all green — and committed its own plan/spec/evidence artifacts
separately (`72165be`) rather than manufacturing a duplicate, conflicting commit for
code that was already correctly shipped.

## The Brutal Truth

Two unattended agents building the same feature in the same git working tree, at the
same time, with no lock and no awareness of each other beyond what each could infer
from `git status` and file mtimes, is exactly as chaotic as it sounds. There were
several minutes where every verification pass was immediately stale — green tests,
then a file silently reverts, then green tests again on different code. The instinct
to "win" by re-asserting your own version faster is the wrong instinct: it produces an
infinite loop, not a shipped feature. The moment that actually resolved things was
recognizing the reversions were *specific and repeated* (always the same lines, always
the persistence mechanism) rather than random noise, and stopping to ask why instead of
reflexively re-editing.

**Flag for whoever reviews this in the morning**: the shipped like state does **not**
survive a page reload. The original task explicitly asked for "giữ trạng thái persist
qua reload (mock/local persistence)". This session's own `hooks/use-kudos-likes.ts`
(localStorage-backed, SSR-safe, fully tested) correctly implemented that requirement
and was added three separate times — each time reverted by the concurrent session back
to plain session-only `useState`. That other session reported its own user explicitly
chose session-only in a live exchange, which — if true — legitimately supersedes the
written brief. This session could not verify that claim independently. If it's wrong,
the fix is small and self-contained: reintroduce a `use-kudos-likes.ts`-style hook and
swap it in for `kudos-page-client.tsx`'s `likedIds` `useState`; the rest of the wiring
(`likedIds`/`onToggleLike` prop-drilling through `KudosBoard` → feed/carousel → card)
needs no change either way.

## Technical Details

**Final architecture (as shipped in `7d7d3c5`):**

```
KudosPageClient (owns likedIds: Set<string> + toggleLike, session-only useState)
  └─ KudosBoard (currentUser, likedIds, onToggleLike — new required props)
        ├─ HighlightKudosCarousel → per post: canLikeKudos(post, currentUser) → KudosCard
        └─ AllKudosFeed            → per post: canLikeKudos(post, currentUser) → KudosCard
              KudosCard: liked?: boolean, canLike?: boolean, onToggleLike?: (postId) => void
                canLike undefined → static <span> (F006 backward compat, no button anywhere)
                canLike true      → enabled <button aria-pressed aria-label={like/unlike}>
                canLike false     → disabled <button> (own post)
```

`canLikeKudos(post, currentUser)` in `kudos-selectors.ts` is the single pure guard:
`post.sender.name !== currentUser.name`. `hearts` on `KudosPost` is never mutated —
displayed count is always `hearts + (liked ? 1 : 0)`, computed at render time.

**Verification (against the committed `HEAD`, independently re-run by this session):**

```
npx tsc --noEmit         → 0 errors
npx vitest run           → 73 test files, 426 tests, all passing
npm run build             → next build succeeds, 8 routes generated
npx eslint <F008 files>   → 0 errors/warnings (repo-wide `npm run lint` has large
                             pre-existing, unrelated debt in tests/unit/*, not touched)
```

## Lessons Learned

- **A repeated, targeted revert is a signal, not noise.** The first reversion looked
  like a race condition. By the third identical reversion of the exact same lines, it
  was clearly a deliberate, repeated decision by another live process — worth stopping
  to investigate rather than reflexively re-applying the same fix a fourth time blind.
- **Racing to commit is a legitimate tie-breaker, but verify before trusting the
  winner.** Once the other session committed first, the right move was independent
  verification of what actually landed, not automatic deference or automatic distrust.
- **Ship what's real; flag what isn't.** The honest path here was recording, loudly,
  that reload-persistence — an explicit line item in the original brief — did not
  ship, rather than quietly writing acceptance-criteria text that overclaims it.

## Resolution (follow-up, 2026-07-07 01:10, from the session named as "the other session" above)

The flagged claim is confirmed, not hearsay: this feature's user was asked directly,
live, via `AskUserQuestion`, whether liked state should persist via `localStorage` or
stay session-only, and explicitly chose **session-only** — matching the F007 `posts`
precedent. After being shown that a concurrent implementation kept reverting the
working tree back to a `localStorage`-backed hook, the same user was asked a second
time how to resolve the conflict and explicitly said to overwrite with the
session-only architecture, confirming it as canonical for this task instance. Both
answers are the authoritative source for this delivery; `hooks/use-kudos-likes.ts`
was deleted (it reappeared twice more after that from further concurrent activity and
was deleted each time) and stays out of the shipped design. No further action needed —
this was not a bug, just two sessions given differently-worded task briefs for what
turned out to be the same backlog item.
