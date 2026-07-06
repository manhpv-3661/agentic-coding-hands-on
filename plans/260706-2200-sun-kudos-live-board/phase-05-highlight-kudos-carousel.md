---
feature: F006
phase: 05
title: Highlight Kudos carousel
status: done
---

# Phase 05 — Highlight Kudos carousel

## Context Links
- Spec: FR-5 (header + filter placement), FR-6 (card fields — via Phase 04 card), FR-7
  (carousel nav: arrows + "N/5" pagination, disable at ends, center prominent + sides faded),
  FR-8 (empty state "Hiện tại chưa có Kudos nào.").
- Clarifications: custom carousel, no lib; top 5 by hearts from the *filtered* dataset.
- Depends: **01** (types/selectors), **03** (`use-carousel`, `kudos-section-heading`),
  **04** (`kudos-card`).

## Overview
- **Priority:** P1 · **Status:** pending
- Client carousel showing the top-5 (by hearts) of the currently filtered posts. Receives
  already-filtered posts from the board (Phase 08); it does NOT own filter state.

## Key Insights
- Carousel receives `posts` = filtered top-5 (board applies `getTopKudosByHearts(filtered,5)`),
  so this component just paginates whatever it's given (0–5 cards).
- Center-prominent / sides-faded is a visual treatment (scale/opacity by distance from
  `index`) — pure CSS transforms driven by `use-carousel` index. No measurement needed.
- Empty state (FR-8) when `posts.length === 0` → render the empty message, no arrows.
- The filter dropdowns (FR-5) render in this section's header ROW but are OWNED by the board
  (Phase 08). This component exposes a `filtersSlot?: ReactNode` prop (board passes
  `<KudosFilters/>`) so the section owns layout while the board owns state. Keeps filter
  state in one place (see plan.md boundary decision).

## Requirements
- **FR-5:** section heading (subtitle "Sun* Annual Awards 2025" + "HIGHLIGHT KUDOS") + the two
  filter dropdowns (rendered via `filtersSlot`).
- **FR-6:** each slide is `<KudosCard variant="highlight" .../>`.
- **FR-7:** left/right arrows (disabled at ends via `canPrev`/`canNext`), "N/5" pagination
  label, active slide centered/prominent, neighbors faded.
- **FR-8:** empty → "Hiện tại chưa có Kudos nào." (from `kudos.empty.kudos`).
- **NFR-2/4:** <200 lines; no new dep.

## Architecture / boundary
- `app/components/kudos/highlight-kudos-carousel.tsx` — **`"use client"`**.
  Props: `{ posts: KudosPost[]; cardLabels; emptyLabel: string; filtersSlot?: ReactNode }`.
  Uses `useCarousel(posts.length)`. Renders: `<KudosSectionHeading/>` + `filtersSlot`, then
  either empty message or the track (cards with per-index transform) + arrows + "N/5".
- If layout + track logic pushes >200 lines, extract the slide-track into
  `highlight-carousel-track.tsx` (presentational, receives `posts` + `activeIndex`).

Data flow: board → filtered top-5 posts → carousel → per-index styled `KudosCard`s.

## Related Code Files
- **Create:** `app/components/kudos/highlight-kudos-carousel.tsx`
- **Create (if split):** `app/components/kudos/highlight-carousel-track.tsx`
- **Create:** `app/components/kudos/highlight-kudos-carousel.test.tsx`
- **Read for context:** `hooks/use-carousel.ts`, `app/components/kudos/{kudos-card,kudos-section-heading}.tsx`, `lib/kudos/kudos-types.ts`

## Implementation Steps
1. `"use client"`; `const { index, next, prev, canPrev, canNext } = useCarousel(posts.length)`.
2. Render `<KudosSectionHeading subtitle="Sun* Annual Awards 2025" title="HIGHLIGHT KUDOS" />`
   + `{filtersSlot}` in the header row.
3. If `posts.length === 0` → render `emptyLabel`, return early (no arrows).
4. Render the track: map posts → `<KudosCard variant="highlight" post ... />` with transform/
   opacity by `i - index` (center = active, neighbors faded).
5. Arrows: `<button onClick={prev} disabled={!canPrev}>` / `next`; pagination `${index+1}/${posts.length}`.
6. Split track out if >200 lines.

## Todo List
- [x] `highlight-kudos-carousel.tsx` (`"use client"`)
- [x] top-5 cards render (highlight variant), center prominent + sides faded
- [x] arrows disable at both ends; "N/5" pagination correct
- [x] empty state message when 0 posts
- [x] `filtersSlot` renders in header
- [x] test: N cards render; arrow disabled at start; next advances pagination; empty state
- [x] `npx tsc --noEmit` + vitest run

## Success Criteria
- Renders ≤5 highlight cards with active-centered styling; arrows clamp at ends; "N/5" tracks
  index; empty state shows FR-8 message; file(s) <200 lines; tests green.

## Risk Assessment
- **Carousel index stale after filter change (High/Med):** solved in `use-carousel` (resets on
  count change, Phase 03) — verify with a test that changing `posts` length resets to slide 1.
- **Track transform math off (Med/Low):** keep transform a pure function of `i - index`; test
  focuses on nav/pagination/count, not pixel transforms.

## Security Considerations
- Static content. None beyond existing gate.

## Next Steps
- Board (Phase 08) passes filtered top-5 posts + `<KudosFilters/>` as `filtersSlot`.
