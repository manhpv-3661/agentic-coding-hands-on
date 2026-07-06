---
feature: F006
phase: 06
title: Spotlight Board
status: done
---

# Phase 06 — Spotlight Board

## Context Links
- Spec: FR-9 (header), FR-10 (static name cloud + "{total} KUDOS" counter + Pan/Zoom toggle
  (visual state only) + search substring filter/highlight), FR-11 (search maxLength 100).
- Clarifications: NO canvas/word-cloud lib — static CSS-positioned name cloud; Pan/Zoom is a
  decorative toggle (visual state only, no real transform); search does a REAL client-side
  substring filter, highlighting matching names.
- Depends: **01** (spotlight names + total), **03** (`kudos-section-heading`).
- Isolated: independent of card/carousel/feed → parallel-runnable with Phases 05/07.

## Overview
- **Priority:** P2 · **Status:** pending
- Client, self-contained section: owns its OWN search + pan/zoom state (does NOT touch the
  hashtag/department filter). Dark card with counter, search box, toggle, scattered names.

## Key Insights
- "388 KUDOS" counter is `SPOTLIGHT_TOTAL` (a number), NOT a count of rendered names.
- Name cloud is static CSS positioning: assign each name a deterministic position/size from a
  fixed layout table or index-derived math (no physics, no measuring). Vary font-size for the
  word-cloud look.
- Search: lowercase substring match; matching names get a highlighted style, non-matching are
  dimmed (or hidden) — "làm nổi tên khớp" per FR-10. Empty query → all normal.
- Pan/Zoom toggle: boolean `useState`, flips a class (e.g. scale wrapper) — visual only, no
  real pan gesture.

## Requirements
- **FR-9:** heading (subtitle "Sun* Annual Awards 2025" + "SPOTLIGHT BOARD").
- **FR-10:** counter "{SPOTLIGHT_TOTAL} KUDOS"; Pan/Zoom toggle (label `kudos.spotlight.panZoom`);
  search input (placeholder `kudos.spotlight.searchPlaceholder`); substring filter highlights
  matches client-side.
- **FR-11:** search input `maxLength={100}`.
- **NFR-2/4:** <200 lines; no new dep.

## Architecture / boundary
- `app/components/kudos/spotlight-board.tsx` — **`"use client"`**. Owns `query` + `panZoom`
  state. Props: `{ names: string[]; total: number; labels: { searchPlaceholder; panZoom } }`.
  Renders heading, counter, search input (maxLength 100), Pan/Zoom toggle, and
  `<SpotlightNameCloud names query panZoom />`.
- `app/components/kudos/spotlight-name-cloud.tsx` — presentational. Props: `{ names: string[];
  query: string; panZoom: boolean }`. Deterministic per-name position + size; applies
  highlight/dim by substring match against `query`; applies scale class when `panZoom`.

Data flow: page passes `SPOTLIGHT_NAMES` + `SPOTLIGHT_TOTAL` → board holds query → cloud
styles matches.

## Related Code Files
- **Create:** `app/components/kudos/spotlight-board.tsx` (`"use client"`)
- **Create:** `app/components/kudos/spotlight-name-cloud.tsx`
- **Create:** `app/components/kudos/spotlight-board.test.tsx`
- **Create:** `app/components/kudos/spotlight-name-cloud.test.tsx`
- **Read for context:** `lib/kudos/kudos-data.ts`, `app/components/kudos/kudos-section-heading.tsx`

## Implementation Steps
1. `spotlight-board.tsx`: `"use client"`; `useState("")` query, `useState(false)` panZoom.
2. Render heading + counter (`{total} KUDOS`, "KUDOS" hardcoded literal) + search input
   (`maxLength={100}`, controlled) + Pan/Zoom toggle button.
3. `spotlight-name-cloud.tsx`: for each name compute a stable position (index-derived) + size;
   highlight when `query` non-empty and `name.toLowerCase().includes(query.toLowerCase())`,
   dim otherwise; empty query → neutral.
4. Wire `panZoom` to a scale/wrapper class (visual only).

## Todo List
- [x] `spotlight-board.tsx` (`"use client"`, search + panZoom state)
- [x] counter shows `{total} KUDOS`
- [x] search input `maxLength={100}`
- [x] substring search highlights matching names (case-insensitive)
- [x] Pan/Zoom toggle flips visual state (no real transform required)
- [x] `spotlight-name-cloud.tsx` deterministic layout
- [x] tests: counter renders total; typing a substring highlights matching name; maxLength=100
- [x] `npx tsc --noEmit` + vitest run

## Success Criteria
- Counter shows the total; search highlights matches (case-insensitive substring); input
  capped at 100 chars; Pan/Zoom toggles a visual state; files <200 lines; tests green.

## Risk Assessment
- **Name-cloud overlap/ugliness (Low/Low):** acceptable for mock; deterministic layout keeps
  it stable. Not a blocker — visual polish only.
- **Search perf (Low/Low):** ≤~24 names, trivial. No memoization needed (YAGNI).

## Security Considerations
- Client-side search over static names; no user data persisted. None beyond existing gate.

## Next Steps
- Page (Phase 08) renders `<SpotlightBoard/>` between Highlight and All Kudos (passed to the
  board as the `spotlight` slot).
