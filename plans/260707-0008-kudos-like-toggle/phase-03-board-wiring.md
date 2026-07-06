# Phase 03 — Board + tree wiring (thread currentUser + likes through the tree)

## Context Links
- Spec: `spec/kudos-like-toggle/feature.md` (FR-1..FR-4) · Decisions: `clarifications.md` (state lives in `KudosBoard`, prop-drill like the hashtag filter, no context)
- Source: `kudos-page-client.tsx` (owns `currentUser`, L82), `kudos-board.tsx` (owns filter state, L38-85), `all-kudos-feed.tsx`, `highlight-kudos-carousel.tsx`, `kudos-board.test.tsx`
- Depends on: **Phase 01** (`useKudosLikes`, `canLikeKudos`) + **Phase 02** (`KudosCard` like props)

## Overview
- **Priority:** P2 · **Status:** pending
- Wire the hook + selector into the live tree. `KudosBoard` gains a `currentUser` prop and owns the
  like state (mirroring how it already owns the hashtag/department filter); feed + carousel forward
  per-card like props to `KudosCard`. No context provider (KISS/YAGNI, same as the filter).

## Key Insights
- `KudosPageClient` already holds `currentUser` — just forward it one level to `KudosBoard`.
- Feed/carousel like props are **optional**: when absent (existing tests, non-like usage) each mapper
  passes nothing to `KudosCard` → `canLike` undefined → static span. Keeps existing feed/carousel
  tests green with zero edits to them.
- `canLikeKudos` is called via a board-owned closure `canLike = (post) => canLikeKudos(post, currentUser)`
  passed down — satisfies "called from KudosBoard" while the `.map()` (which lives in feed/carousel)
  builds the final per-card props. For own posts the mapper omits `onToggleLike` (clarifications).

## Requirements
- **FR-1/2:** clicking a card heart toggles + updates its count live, in both Highlight and Feed.
- **FR-3:** state survives reload (hook's localStorage).
- **FR-4:** own posts (`sender.name === currentUser.name`) render disabled hearts.

## Architecture
```
KudosPageClient (has currentUser)
  └─ KudosBoard  ← NEW prop: currentUser
        const { isLiked, toggleLike } = useKudosLikes()
        const canLike = (post) => canLikeKudos(post, currentUser)
        ├─ HighlightKudosCarousel  (NEW optional: isLiked, canLike, onToggleLike=toggleLike)
        │     map: <KudosCard liked={isLiked?.(p.id)} canLike={canLike?.(p)}
        │                     onToggleLike={canLike?.(p) ? () => onToggleLike?.(p.id) : undefined} />
        └─ AllKudosFeed            (same NEW optional trio)
```

## Related Code Files
- **Modify:** `app/components/kudos/kudos-page-client.tsx` — pass `currentUser={currentUser}` to `<KudosBoard>`.
- **Modify:** `app/components/kudos/kudos-board.tsx` — add `currentUser: KudosPerson` to props; call `useKudosLikes()`; define `canLike`; pass `isLiked`/`canLike`/`onToggleLike` to carousel + feed.
- **Modify:** `app/components/kudos/all-kudos-feed.tsx` — add optional `isLiked?`/`canLike?`/`onToggleLike?`; build per-card props in the `.map()`.
- **Modify:** `app/components/kudos/highlight-kudos-carousel.tsx` — same optional trio + per-card wiring.
- **Modify:** `app/components/kudos/kudos-board.test.tsx` — add a like-wiring test (+ `currentUser` prop on existing renders).

## Implementation Steps
1. `kudos-page-client.tsx`: add `currentUser={currentUser}` to the `<KudosBoard …>` call (currentUser is already a prop here).
2. `kudos-board.tsx`:
   - Import `useKudosLikes` from `@/hooks/use-kudos-likes`, `canLikeKudos` from selectors, `KudosPerson` type.
   - Add `currentUser: KudosPerson` to `KudosBoardProps`; destructure it.
   - `const { isLiked, toggleLike } = useKudosLikes();`
   - `const canLike = useCallback((post: KudosPost) => canLikeKudos(post, currentUser), [currentUser]);`
   - Pass `isLiked={isLiked} canLike={canLike} onToggleLike={toggleLike}` to both `<HighlightKudosCarousel>` and `<AllKudosFeed>`.
3. `all-kudos-feed.tsx` + `highlight-kudos-carousel.tsx`: add to props `isLiked?: (id: string) => boolean; canLike?: (post: KudosPost) => boolean; onToggleLike?: (id: string) => void;`. In each `.map((post) => …)`:
   ```tsx
   const cardCanLike = canLike?.(post);
   <KudosCard … liked={isLiked?.(post.id)} canLike={cardCanLike}
     onToggleLike={cardCanLike ? () => onToggleLike?.(post.id) : undefined} />
   ```
   (Highlight's card is nested inside the slide `<div>` — keep that wrapper unchanged.)
4. `kudos-board.test.tsx`: add `currentUser={{ name: "Tester", department: "Eng", stars: 0 }}` to the 3 existing renders (or a shared const). Add a test: render with a post whose `sender.name !== currentUser.name`, click its heart (feed occurrence), assert count increments; and a post authored by currentUser renders a disabled heart button.
5. Run `npm run test -- kudos-board kudos-page-client all-kudos-feed highlight-kudos-carousel` + `npm run build` (or `npx tsc --noEmit`).

## Todo List
- [ ] `currentUser` forwarded from page-client to board
- [ ] Board calls `useKudosLikes`, defines `canLike`, drills props to both sections
- [ ] Feed wires per-card like props
- [ ] Carousel wires per-card like props
- [ ] Board test updated (currentUser prop + like-wiring assertions)
- [ ] Typecheck/build + targeted tests green

## Success Criteria
- Clicking a heart in either section toggles it and the count changes live; toggling again reverts.
- A post authored by `currentUser` shows a disabled heart (no toggle on click).
- Existing feed/carousel tests (unmodified) still pass (optional props default to no-op).
- Reload preserves liked hearts (manual/dev check; covered structurally by Phase 01 hook tests).

## Risk Assessment
- **Same post in both sections (Med/Low):** a top-5 post appears in carousel AND feed; both read the same `isLiked(id)` from one hook instance → they stay in sync automatically. No extra work; note it in the test (query the feed occurrence specifically).
- **Missing `currentUser` breaks existing board tests (High/Low):** add the prop to all existing renders in the same edit — do not leave it required-but-unpassed.
- **`canLike` closure identity churn (Low/Low):** wrapped in `useCallback([currentUser])`; fine for ~12 posts even without.

## Security Considerations
- No new data exposure; `currentUser` is already in this client subtree (compose dialog uses it).

## Next Steps
- Unblocks Phase 04 (full-suite verification + docs).
