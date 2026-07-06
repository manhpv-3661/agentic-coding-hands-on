# Phase 03 — State ownership + prop drilling

## Context Links
- Plan: [plan.md](plan.md) · Depends on [Phase 02](phase-02-kudos-card-heart-toggle.md)
- Owner: `app/components/kudos/kudos-page-client.tsx` (owns `posts`, `currentUser`)
- Chain: `kudos-board.tsx` → `highlight-kudos-carousel.tsx` + `all-kudos-feed.tsx`
- Selector: `canLikeKudos` (Phase 01)
- Pattern: existing `onHashtagClick` prop-drill (page-client not involved) and `posts`
  session state (`useState<KudosPost[]>`, F007).

## Overview
- **Priority:** P2
- **Status:** pending
- **Description:** `KudosPageClient` owns `likedIds: Set<string>` + `toggleLike`. Thread
  `likedIds`, `currentUser`, `onToggleLike` down through board → carousel + feed; each
  section computes per-card `liked`/`canLike` in its existing `.map` and passes to `KudosCard`.

## Key Insights
- No context provider — repo convention is prop-drilling (KISS/YAGNI, board comment lines
  28-37). Add three props to board/carousel/feed; primitives only.
- `KudosBoard` does NOT currently receive `currentUser` — add it (page-client already has
  it from props).
- `Set<string>` immutability: `toggleLike` must build a NEW Set each update or React skips
  the re-render.
- Carousel top-5 derives from `getTopKudosByHearts` on static `hearts` — unchanged, so
  ranking stays stable while likes toggle (see plan hearts decision).

## Requirements
- **FR-1:** `KudosPageClient` holds `const [likedIds, setLikedIds] = useState<Set<string>>
  (new Set())` and `toggleLike(id)` (add/delete → new Set), session-only.
- **FR-2:** `likedIds`, `currentUser`, `onToggleLike` reach both card render sites.
- **FR-3:** Each section passes `liked={likedIds.has(post.id)}`,
  `canLike={canLikeKudos(post, currentUser)}`, `onToggleLike={onToggleLike}` per card.
- **FR-4:** Both variants (highlight + feed) reflect the same like state (single source).
- **NFR:** Each file <200 lines; no new deps; useCallback for `toggleLike` (matches
  `addPost` style).

## Architecture
```
KudosPageClient
  likedIds: Set<string>; toggleLike = useCallback((id) => setLikedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next; }), [])
  → <KudosBoard likedIds currentUser onToggleLike={toggleLike} ... />
KudosBoard (add props likedIds, currentUser, onToggleLike)
  → HighlightKudosCarousel likedIds currentUser onToggleLike
  → AllKudosFeed           likedIds currentUser onToggleLike
Carousel / Feed .map(post => <KudosCard
   liked={likedIds.has(post.id)}
   canLike={canLikeKudos(post, currentUser)}
   onToggleLike={onToggleLike} ... />)
```

## Related Code Files
- **Modify:** `app/components/kudos/kudos-page-client.tsx` (state + pass to board)
- **Modify:** `app/components/kudos/kudos-board.tsx` (accept + forward 3 props)
- **Modify:** `app/components/kudos/highlight-kudos-carousel.tsx` (accept + map)
- **Modify:** `app/components/kudos/all-kudos-feed.tsx` (accept + map)
- **Modify:** the co-located `.test.tsx` for each of the 4 files above
- **Create/Delete:** none. (Do NOT edit `page.tsx` — it already passes `currentUser`.)

## Implementation Steps
1. **page-client:** add `likedIds` state + `toggleLike` (useCallback); pass `likedIds`,
   `currentUser`, `onToggleLike={toggleLike}` into `<KudosBoard>`.
2. **board:** extend `KudosBoardProps` with `likedIds: Set<string>`, `currentUser:
   KudosPerson`, `onToggleLike: (postId: string) => void`; forward all three to both
   `HighlightKudosCarousel` and `AllKudosFeed`. Import `KudosPerson` type.
3. **carousel:** add same three props; in the `posts.map`, pass `liked`, `canLike`
   (`canLikeKudos(post, currentUser)`), `onToggleLike` to `KudosCard`. Import
   `canLikeKudos` + `KudosPerson`.
4. **feed:** same as carousel.
5. Update the 4 co-located tests (see below); run full kudos suite.

## Todo List
- [ ] page-client: `likedIds` state + `toggleLike` + wire to board
- [ ] board: 3 props + forward
- [ ] carousel: 3 props + per-card map
- [ ] feed: 3 props + per-card map
- [ ] Update 4 co-located tests
- [ ] `npx vitest run app/components/kudos` green; `tsc --noEmit` clean

## Test Requirements
- **page-client.test.tsx (integration):** ADD "liking a post increments its heart count and
  toggles back on second click" — find the heart button for the existing post, click →
  count +1 / aria-pressed=true, click again → back to base / aria-pressed=false. This is
  the end-to-end proof that owner state + prop drilling + card render agree.
- **board/carousel/feed tests:** update `renderX` helpers to pass the 3 new props
  (`likedIds={new Set()}`, `currentUser`, `onToggleLike={vi.fn()}`); add one assertion each
  that the heart button renders (role button with the like aria-label). For the feed, add a
  case where `currentUser` is a post's sender → that card's heart is disabled.

## Success Criteria
- Clicking a heart in the feed AND in the carousel both toggle the same post consistently.
- Own-post card renders disabled in whichever section shows it.
- Refresh (remount) resets likes (session-only) — implicitly true (no persistence added).
- All co-located tests + full `npx vitest run` green; `tsc --noEmit` clean; eslint clean.

## Risk Assessment
- **Medium.** 4-file prop thread; easy to miss a call site. Mitigation: tsc catches missing
  required props; update each test helper to fail loudly if a prop is dropped.
- **Low:** Set identity bug (mutating in place) → no re-render. Mitigation: new Set each
  toggle; covered by the page-client integration test (second click must revert).
- File-ownership: this phase owns page-client/board/carousel/feed; Phase 02 owns the card.
  No overlap — safe.

## Security Considerations
- None (client mock state; no PII, no network).

## Next Steps
- Phase 04: docs artifact, changelog/roadmap, full DoD gate.
