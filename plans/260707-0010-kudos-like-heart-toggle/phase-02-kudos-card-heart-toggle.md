# Phase 02 — KudosCard interactive heart toggle

## Context Links
- Plan: [plan.md](plan.md) · Depends on [Phase 01](phase-01-foundation-selector-i18n.md)
- File: `app/components/kudos/kudos-card.tsx` (heart at lines 54-70, 153-157)
- Test: `app/components/kudos/kudos-card.test.tsx` (static-span assertion lines 31-37)
- Pattern refs: `onHashtagClick?` optional-prop gate (lines 22, 131-150); `CopyLinkButton`
  DIY button styling; carousel chevron `disabled:opacity-30` for disabled visual.

## Overview
- **Priority:** P2
- **Status:** pending
- **Description:** Make the heart icon+count an interactive toggle button when a
  `onToggleLike` prop is wired; keep the static `<span>` when it is not (server-safe /
  F006 fallback). Own post → disabled. Filled heart when liked, outline when not.

## Key Insights
- `KudosCard` is pure-presentational (no hooks, no `"use client"`). Keep it that way — it
  renders a button but state lives in the owner (Phase 03). Same as `onHashtagClick`.
- Three heart states: (a) no toggle wired → static span (unchanged F006); (b) likeable →
  interactive button; (c) own post → disabled button, reduced opacity.
- `hearts` is NOT mutated — display count derived: `post.hearts + (liked ? 1 : 0)`.
- `HeartIcon` needs a `filled` param: liked → `fill="currentColor"`; not liked →
  `fill="none" stroke="currentColor" strokeWidth`.

## Requirements
- **FR-1:** New props `liked?: boolean` (default false), `canLike?: boolean` (default true),
  `onToggleLike?: (postId: string) => void`.
- **FR-2:** `KudosCardLabels` gains `like: string; unlike: string`.
- **FR-3:** When `onToggleLike` present and `canLike !== false`: render
  `<button type="button" aria-pressed={liked} aria-label={liked ? labels.unlike :
  labels.like} onClick={() => onToggleLike(post.id)}>` with filled/outline heart +
  displayHearts.
- **FR-4:** When `onToggleLike` present and `canLike === false`: same button but `disabled`,
  reduced opacity (`opacity-50` or existing `disabled:opacity-*` token), no aria-pressed
  toggle expectation (still render current count, outline heart).
- **FR-5:** When `onToggleLike` omitted: render the current static `<span>` (unchanged) so
  server usage and legacy call sites keep working.
- **NFR:** File <200 lines; no new deps; reuse existing Tailwind tokens only.

## Architecture
```
KudosCardProps += { liked?, canLike?, onToggleLike? }
KudosCardLabels += { like, unlike }
const likeInteractive = Boolean(onToggleLike);
const isOwnPost = likeInteractive && canLike === false;
const displayHearts = post.hearts + (liked ? 1 : 0);
// footer left slot: likeInteractive ? <LikeButton/> : <span static/>
```
- Extract a small internal `LikeControl` sub-component OR inline conditional — keep card
  <200 lines. Prefer inline ternary in the footer to avoid a new file (KISS).

## Related Code Files
- **Modify:** `app/components/kudos/kudos-card.tsx`
- **Modify:** `app/components/kudos/kudos-card.test.tsx`
- **Create/Delete:** none

## Implementation Steps
1. Extend `KudosCardLabels` with `like`/`unlike`; extend `KudosCardProps` with `liked?`,
   `canLike?`, `onToggleLike?` (JSDoc each, matching `onHashtagClick` comment style).
2. Update `HeartIcon` to accept `{ filled }`: outline path uses `fill="none"
   stroke="currentColor" strokeWidth="2"`, filled keeps `fill="currentColor"`.
3. Replace the footer heart `<span>` (lines 153-157) with a conditional:
   - `likeInteractive` → button (interactive or disabled per `isOwnPost`), aria-pressed,
     aria-label, `HeartIcon filled={liked}`, `{displayHearts}`. Liked accent color optional
     (reuse `text-[#FFEA9E]` used for hashtags/title — keep to existing tokens).
   - else → existing static `<span>` with `HeartIcon filled` + `{post.hearts}`.
4. Update the JSDoc block above `HeartIcon` (currently says "never a button") to describe
   the new toggle + fallback behavior.
5. Update tests (see below).

## Todo List
- [ ] Extend `KudosCardLabels` + `KudosCardProps`
- [ ] `HeartIcon` filled/outline variants
- [ ] Footer conditional (interactive / disabled / static-fallback)
- [ ] Update stale JSDoc
- [ ] Rewrite `kudos-card.test.tsx` heart assertions (below)
- [ ] `npx vitest run app/components/kudos/kudos-card.test.tsx` green

## Test Requirements (update kudos-card.test.tsx)
- **CHANGE** the existing "renders the heart count as a static span, never a button" test
  (lines 31-37): reframe to "renders heart as a static span when no onToggleLike is wired"
  — assert the fallback path only (do NOT delete; it documents server-safe default).
- **ADD** "renders an interactive heart button when onToggleLike is wired": `getByRole
  ("button", { name: labels.like })`, `aria-pressed=false`, count = `post.hearts`.
- **ADD** "toggles liked state / count via onToggleLike": click → `onToggleLike` called with
  `post.id`; re-render with `liked` → aria-pressed=true, aria-label = unlike, count =
  `hearts + 1`.
- **ADD** "disables the heart for own post (canLike=false)": button is `disabled`,
  click does not call `onToggleLike`.
- Add `like`/`unlike` to the test `labels` literal.

## Success Criteria
- Interactive, disabled, and static-fallback branches each covered by a passing test.
- No regression in the other `kudos-card.test.tsx` cases (copy link, hashtags, title, CTA).
- `tsc --noEmit` clean.

## Risk Assessment
- **Medium.** Behavior change to a shared component used by two variants. Mitigation:
  keep the static-span fallback for the no-prop path so nothing that omits `onToggleLike`
  changes; cover all three branches with tests.
- Risk: displayHearts vs `post.hearts` divergence confuses `getByText` in other tests →
  fallback path still shows `post.hearts`, so existing highlight tests (no onToggleLike)
  are unaffected.

## Security Considerations
- None (presentational, no external input beyond callback).

## Next Steps
- Phase 03 wires the owner state and prop-drills `liked`/`canLike`/`onToggleLike`.
