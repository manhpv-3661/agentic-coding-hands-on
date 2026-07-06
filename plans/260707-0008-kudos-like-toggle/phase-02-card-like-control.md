# Phase 02 — Card like control (`KudosCard` heart becomes a toggle)

## Context Links
- Spec: `spec/kudos-like-toggle/feature.md` (FR-1, FR-2, FR-6)
- Decisions: `clarifications.md` (backward-compat span, disabled own-post, `#FFEA9E` fill, test-update note lines 72-78)
- Source: `app/components/kudos/kudos-card.tsx` (current `HeartIcon` + static footer span L153-157), `kudos-card.test.tsx` (heart "never a button" assertion L31-37 — UPDATE)

## Overview
- **Priority:** P2 · **Status:** pending
- Extract the heart+count into a new presentational `kudos-like-button.tsx` and add three optional,
  additive props to `KudosCard`. Only the heart control changes; layout/spacing untouched.
- Extraction keeps `kudos-card.tsx` under 200 lines (currently 170) and gives the tri-state logic
  one home (DRY/KISS).

## Key Insights
- **Tri-state gate is `canLike`, not `onToggleLike`** — this reconciles the two rules in
  `clarifications.md`: "own post → disabled button + reduced opacity, onToggleLike omitted" AND
  "no like props → static span (backward compat)". `canLike === undefined` distinguishes
  "feature off" (static span) from `canLike === false` "own post" (disabled button). This is the
  one interpretive call in the feature; documented here so the implementer does not wobble.
- `HeartIcon` uses `fill="currentColor"` → text color drives the fill; liked = `text-[#FFEA9E]`,
  default = `text-white/70`. No new SVG, no new token.
- Displayed count is always `post.hearts + (liked ? 1 : 0)`; in the static-span path `liked` is
  undefined → just `post.hearts` (existing "45" test still passes).

## Requirements
- **FR-1:** clicking the heart (both variants) fires `onToggleLike`.
- **FR-2:** count updates in the same render as the click (synchronous state → free optimistic UI).
- **FR-6:** liked heart filled with `#FFEA9E`; disabled = reduced opacity, no new visual system.
- Backward compatible: cards with no like props render exactly as before (static span).

## Architecture
```
KudosLikeButton (new, presentational, no hooks)
  props: { hearts: number; liked?: boolean; canLike?: boolean; onToggle?: () => void }
  count = hearts + (liked ? 1 : 0)
  canLike === undefined -> <span> ... </span>                         (backward compat)
  canLike === true       -> <button aria-pressed={!!liked} onClick={onToggle}>  (enabled)
  canLike === false      -> <button aria-pressed={false} disabled>             (dimmed own-post)

KudosCard footer renders <KudosLikeButton hearts={post.hearts} liked={liked}
                                          canLike={canLike} onToggle={onToggleLike} />
```

## Related Code Files
- **Create:** `app/components/kudos/kudos-like-button.tsx` — moves `HeartIcon` here + tri-state render.
- **Modify:** `app/components/kudos/kudos-card.tsx` — add `liked?`/`canLike?`/`onToggleLike?` to `KudosCardProps`; remove local `HeartIcon` + static footer span; render `<KudosLikeButton/>`.
- **Modify:** `app/components/kudos/kudos-card.test.tsx` — update the "never a button" test; add toggle/disabled tests.

## Implementation Steps
1. Create `kudos-like-button.tsx`:
   - Move the existing `HeartIcon()` SVG verbatim into this file (keep `fill="currentColor"`, `aria-hidden`).
   - Export `KudosLikeButton({ hearts, liked, canLike, onToggle })`.
   - Compute `const count = hearts + (liked ? 1 : 0);`.
   - `canLike === undefined` → render current static `<span className="flex items-center gap-1 text-sm text-white/70"><HeartIcon />{count}</span>`.
   - else render `<button type="button" aria-pressed={!!liked} disabled={!canLike} onClick={canLike ? onToggle : undefined} className={"flex items-center gap-1 text-sm transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 " + (liked ? "text-[#FFEA9E]" : "text-white/70 hover:text-white")}><HeartIcon />{count}</button>`.
2. In `kudos-card.tsx`: delete the local `HeartIcon` function and the footer `<span>…{post.hearts}</span>`; import and render `<KudosLikeButton hearts={post.hearts} liked={liked} canLike={canLike} onToggle={onToggleLike} />` in its place.
3. Add to `KudosCardProps`: `liked?: boolean; canLike?: boolean; onToggleLike?: () => void;` with doc comments mirroring the existing optional `onHashtagClick` style. Destructure them in the signature.
4. Update `kudos-card.test.tsx`:
   - Change the L31 test: assert that with NO like props the heart count is a static span (`closest("button")` is null) — i.e. backward-compat default.
   - Add: with `canLike onToggleLike` + `liked={false}`, heart is a `button[aria-pressed=false]`; clicking calls `onToggleLike`; with `liked` the button shows `hearts+1` and has the `#FFEA9E` text class / aria-pressed=true.
   - Add: with `canLike={false}`, heart is a `disabled` button and click does not call `onToggleLike`.
5. Run `npm run test -- kudos-card` + `npx tsc --noEmit`.

## Todo List
- [ ] `kudos-like-button.tsx` created (tri-state, HeartIcon moved)
- [ ] `KudosCardProps` extended; card renders `KudosLikeButton`; old span/HeartIcon removed
- [ ] `kudos-card.test.tsx` updated (span-default + enabled + disabled cases)
- [ ] `kudos-card.tsx` under 200 lines
- [ ] Typecheck + card tests green

## Success Criteria
- No like props → identical DOM to today (static span, count = `post.hearts`).
- `canLike + onToggleLike` → clickable button, `aria-pressed` reflects `liked`, count = `hearts + (liked?1:0)`, liked fill `#FFEA9E`.
- `canLike={false}` → disabled button, dimmed, click is a no-op.
- All pre-existing `kudos-card.test.tsx` assertions unrelated to the heart still pass.

## Risk Assessment
- **Contradiction in source docs (Med/Med):** "onToggleLike omitted → static span" vs "own-post disabled button" — resolved by the `canLike` tri-state gate (see Key Insights). Implementer must not gate on `onToggleLike` presence.
- **Line-count creep in `kudos-card.tsx` (Low/Low):** mitigated by extraction.
- **Accessibility (Low/Med):** use `aria-pressed` (toggle semantics) + native `disabled`; keep `HeartIcon` `aria-hidden`.

## Security Considerations
- None — pure presentational; no data access, no user input beyond the click callback.

## Next Steps
- Independent of Phase 01. Together with Phase 01 it unblocks Phase 03 (board supplies the props).
