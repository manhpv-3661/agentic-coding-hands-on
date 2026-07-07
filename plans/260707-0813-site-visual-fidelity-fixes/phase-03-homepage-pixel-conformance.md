---
phase: 3
title: "Homepage pixel conformance (F002)"
track: A
status: pending
priority: P1
effort: 4h
depends_on: []
parallel_safe_with: [1, 2, 4, 5, 6]
screen: "Homepage SAA — i87tDx10uM"
file_ownership:
  - app/page.tsx
  - app/components/home/hero-section.tsx
  - app/components/home/hero-cta-buttons.tsx
  - app/components/home/awards-section.tsx
  - app/components/home/award-card.tsx
  - app/components/home/sun-kudos-section.tsx
  - app/components/home/countdown-timer.tsx
  - app/components/home/event-info.tsx
  - app/components/home/widget-button.tsx
  - app/components/home/root-further-content.tsx
  - "app/components/home/*.test.tsx (co-located, home-owned only)"
---

# Phase 3 — Homepage Pixel Conformance (F002)

## Context Links

- Method: `references/measurement-method.md` (getComputedStyle/getBoundingClientRect vs `get_node`).
- Screen: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
- **Out of scope (owned elsewhere):** `site-header`/`site-footer` + their children → **P5**;
  Montserrat wiring → **P1**; avatar/gallery images → **P2**.

## Overview

- **Priority:** P1 — the landing screen; drift here is what the PO sees first.
- Measure every homepage section against MoMorph ground truth and close each non-zero Δ. Layout /
  spacing / color / typography only — no behavior changes. Track A, parallel-safe with all.

## Requirements

- Per-section diff tables (hero, countdown, event-info, awards-section + award-card, sun-kudos,
  widget-button, root-further-content) with every tracked box-model + type property Δ === 0.
- Flag text-flow-driven heights `RE-VERIFY@P7` (font lands in P1).
- No new deps; files < 200 lines (split if a fix pushes one over — `widget-button.tsx` is 186).

## Architecture

- Presentational Tailwind adjustments only. Data flow (dictionary props → sections) unchanged.
- The page RENDERS `SiteHeader`/`SiteFooter` (P5) and applies `montserrat.variable` (kept, P1) —
  do not edit those; only edit the section components + `app/page.tsx` layout wrappers.

## Related Code Files

- **Modify:** the `file_ownership` list (className/JSX spacing only).
- **Read for context:** `references/measurement-method.md`, existing `mm:<nodeId>` comments.
- **Delete:** none.

## Implementation Steps

1. `list_frames`/`get_frame` on `i87tDx10uM`; map each rendered section to its node(s).
2. For each section: build the diff table (method doc step 3), fix non-zero Δ, re-measure to Δ 0.
3. Split any file that crosses 200 lines during a fix.
4. Update only style-coupled test assertions; leave behavior/aria assertions untouched.
5. `npx tsc --noEmit` + `npx eslint app/components/home app/page.tsx` + `npx vitest run app/components/home`.

## Todo List

- [ ] node map for `i87tDx10uM` sections
- [ ] hero + CTA buttons Δ 0
- [ ] countdown + event-info Δ 0
- [ ] awards-section + award-card Δ 0
- [ ] sun-kudos-section Δ 0
- [ ] widget-button + root-further-content Δ 0
- [ ] flow-driven heights flagged RE-VERIFY@P7
- [ ] tsc + eslint + vitest green

## Success Criteria

- Every tracked homepage node: rendered `getComputedStyle`/`getBoundingClientRect` matches
  `get_node` (Δ 0, sub-pixel tolerance on lengths).
- All pre-existing home tests pass (only style-coupled assertions changed).
- No home component exceeds 200 lines.

## Risk Assessment

| Risk | Likelihood | Impact | Countermove |
|------|-----------|--------|-------------|
| Editing chrome by mistake (shared with P5) | Med | High | Ownership list excludes header/footer; do not touch them |
| Flow-driven height churn after font lands | High | Low | Flag RE-VERIFY@P7 rather than chasing pre-font |
| A spacing fix pushes a file > 200 lines | Med | Low | Split within this phase |

## Security Considerations

None — presentational.

## Next Steps

Feeds P7 (full-site re-verify with font + images active).
</content>
