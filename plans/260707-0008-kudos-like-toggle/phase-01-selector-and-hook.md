# Phase 01 — Pure logic: `canLikeKudos` selector + `use-kudos-likes` hook

## Context Links
- Spec: `spec/kudos-like-toggle/feature.md` (FR-3, FR-4, FR-5)
- Decisions: `clarifications.md` (persistence key, SSR-safe hydrate, own-post rule)
- Precedent: `hooks/use-scroll-spy.ts` (mount-effect hydrate, SSR guard), `lib/kudos/kudos-selectors.ts` (`getDistinctRecipients` currentUser-exclusion)

## Overview
- **Priority:** P2 · **Status:** pending
- Add the two pure, UI-independent pieces the feature is built on: a like-permission selector and
  a localStorage-backed liked-ids hook. No component touches them yet (that's Phase 03).

## Key Insights
- `hearts` is never mutated — "liked by me" is client-only state (`Set<string>`), count is derived.
- SSR safety: initial state MUST be an empty Set; read localStorage only inside a mount `useEffect`,
  or first server/client render diverges (hydration mismatch). Same pattern as `use-scroll-spy`.
- `canLikeKudos` mirrors `getDistinctRecipients`'s `currentUser.name` comparison — name equality is
  this mock repo's identity (no ids on `KudosPerson`).

## Requirements
- **FR-3:** liked ids persist across reload via `localStorage["saa2025:kudos:liked-post-ids"]` (JSON array).
- **FR-4:** `canLikeKudos(post, currentUser)` returns `false` when `post.sender.name === currentUser.name`, else `true`.
- **FR-5:** toggle is idempotent per click; no pending/loading flag (no network).
- Non-functional: no `KudosPost`/`kudos-data.ts` type change; hook is `"use client"`.

## Architecture
```
canLikeKudos(post, currentUser) ──> boolean            (pure, in kudos-selectors.ts)

useKudosLikes()
  state: Set<string> likedIds  (starts empty)
  mount effect: localStorage.getItem(KEY) -> JSON.parse -> setLikedIds(new Set(...))
  toggleLike(id): setLikedIds(prev => next); localStorage.setItem(KEY, JSON.stringify([...next]))
  isLiked(id): likedIds.has(id)
  returns { isLiked, toggleLike }
```
Data flow: consumer (Board, Phase 03) calls the hook once; re-renders when `likedIds` changes;
`toggleLike` writes-through to localStorage synchronously (the write IS the persistence).

## Related Code Files
- **Modify:** `lib/kudos/kudos-selectors.ts` — add `canLikeKudos`.
- **Modify:** `lib/kudos/kudos-selectors.test.ts` — add `canLikeKudos` cases.
- **Create:** `hooks/use-kudos-likes.ts` — the hook.
- **Create:** `hooks/use-kudos-likes.test.ts` — hook tests (localStorage mocked/real jsdom).

## Implementation Steps
1. In `kudos-selectors.ts`, add (import `KudosPerson` already present):
   ```ts
   /** FR-4: you cannot like a Kudos you authored. Name equality is this mock
    * repo's identity (mirrors getDistinctRecipients). Pure. */
   export function canLikeKudos(post: KudosPost, currentUser: KudosPerson): boolean {
     return post.sender.name !== currentUser.name;
   }
   ```
2. Create `hooks/use-kudos-likes.ts` (`"use client"`):
   - `const STORAGE_KEY = "saa2025:kudos:liked-post-ids";`
   - `useState<Set<string>>(() => new Set())`.
   - mount `useEffect(() => { try { const raw = localStorage.getItem(KEY); if (raw) setLikedIds(new Set(JSON.parse(raw) as string[])); } catch {} }, [])`.
   - `toggleLike = useCallback((id) => setLikedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); try { localStorage.setItem(KEY, JSON.stringify([...next])); } catch {} return next; }), [])`.
   - `isLiked = useCallback((id) => likedIds.has(id), [likedIds])`.
   - export `interface UseKudosLikes { isLiked(id: string): boolean; toggleLike(id: string): void }` and return it.
3. Wrap all localStorage access in `try/catch` (private-mode / quota / disabled storage → no-op, in-memory state still works).
4. Add tests (see Success Criteria).
5. Run `npm run test -- kudos-selectors use-kudos-likes` and `npx tsc --noEmit` (or `npm run build`).

## Todo List
- [ ] `canLikeKudos` added to `kudos-selectors.ts`
- [ ] `use-kudos-likes.ts` created (SSR-safe hydrate, write-through, try/catch)
- [ ] Selector tests added
- [ ] Hook tests added
- [ ] Typecheck + targeted tests green

## Success Criteria
- `canLikeKudos`: false when sender is currentUser (test with `CURRENT_USER` + a self-authored post), true otherwise (incl. anonymous sender whose name ≠ currentUser).
- Hook tests (jsdom localStorage): initial `isLiked` false for any id; `toggleLike(x)` → `isLiked(x)` true and localStorage contains `["x"]`; second `toggleLike(x)` → false and localStorage `[]`; a fresh hook instance hydrates liked state from pre-seeded localStorage after mount effect (use `waitFor`/`act`).

## Risk Assessment
- **Hydration mismatch (Med likelihood / High impact):** mitigated by empty-Set initial state + mount-only read. Do NOT read localStorage during render.
- **Malformed/absent localStorage (Low/Low):** try/catch → treated as no likes.
- **Stale `isLiked` closure (Low/Med):** `isLiked` depends on `likedIds` so it re-derives each render; do not memoize it against `[]`.

## Security Considerations
- localStorage holds only non-sensitive post-id strings. No PII, no auth data. No injection surface (values are our own ids, JSON-parsed defensively).

## Next Steps
- Unblocks Phase 03 (Board consumes the hook + selector). Independent of Phase 02.
