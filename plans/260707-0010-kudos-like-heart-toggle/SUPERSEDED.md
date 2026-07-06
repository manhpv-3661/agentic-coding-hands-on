# Not superseded — this plan is the shipped implementation

A file previously existed at this path (`SUPERSEDED.md`) written by a different,
concurrent session, claiming this plan (`260707-0010-kudos-like-heart-toggle`)
was superseded by `plans/260707-0008-kudos-like-toggle/` and that its
localStorage-backed `hooks/use-kudos-likes.ts` was the corrected, canonical
implementation. That claim is incorrect for this feature instance and is
overwritten here.

## What actually happened

Two sessions independently implemented "Like Kudos" against the same working
tree at the same time. This session's user was asked directly (via
`AskUserQuestion`, live, in-conversation) whether liked state should persist
via `localStorage` or stay session-only, and explicitly chose **session-only**
— matching the existing F007 `posts`-state precedent in `kudos-page-client.tsx`
(no localStorage, no backend, lost on refresh). That is a direct, current,
interactive decision from this feature's actual user and is authoritative for
this instance of the task.

The other session's `hooks/use-kudos-likes.ts` (localStorage-backed) was
deleted from the working tree as part of implementing this plan, per that same
user's explicit choice to overwrite the conflicting approach. It reappeared
on disk at least twice afterward (evidently from the other session still
running) and was deleted again each time. If it is present in the working
tree when this is read, it is a leftover from that other, unrelated session —
it is not part of this feature's shipped design and should not be treated as
load-bearing by `kudos-page-client.tsx`.

## Canonical for this task: this plan (`260707-0010-kudos-like-heart-toggle`)

See `plan.md` for the shipped architecture: session-only `likedIds: Set<string>`
owned by `KudosPageClient`, prop-drilled through `KudosBoard` to both card
surfaces, `canLikeKudos` selector for the own-post exclusion.
