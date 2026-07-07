---
phase: 4
title: "Awards pixel conformance (F004)"
track: A
status: pending
priority: P2
effort: 3h
depends_on: []
parallel_safe_with: [1, 2, 3, 5, 6]
screen: "Awards (Hệ thống giải) — zFYDgyj_pD"
file_ownership:
  - app/awards/page.tsx
  - app/components/awards/awards-hero.tsx
  - app/components/awards/awards-nav-menu.tsx
  - app/components/awards/awards-catalog.tsx
  - app/components/awards/award-detail-card.tsx
  - "app/components/awards/*.test.tsx (co-located, awards-owned only)"
---

# Phase 4 — Awards Pixel Conformance (F004)

## Context Links

- Method: `references/measurement-method.md`.
- Screen: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
- **Out of scope (owned elsewhere):** `SiteHeader`/`SiteFooter` (rendered here) → **P5**;
  `SunKudosSection` (rendered here, reused from home) → **P3**; font → **P1**.

## Overview

- **Priority:** P2 — a secondary but full page. Measure the awards hero, inline title section,
  nav menu (scroll-spy), and the 6 detail-card sections against ground truth; close each Δ.
  Layout/spacing/type only. Track A, parallel-safe with all.

## Requirements

- Diff tables for: `awards-hero`, the inline title block in `awards/page.tsx` (eyebrow + gold
  `text-[57px]` heading + divider), `awards-nav-menu`, `awards-catalog` container, and
  `award-detail-card` (all 6 entries share the component). Every tracked Δ === 0.
- Scroll-spy behavior (`IntersectionObserver` in `awards-catalog`) unchanged — style only.
- Flag flow-driven heights `RE-VERIFY@P7`.

## Architecture

- Presentational Tailwind adjustments. `awards/page.tsx` stays a server component; only
  `awards-catalog` is `"use client"` — do not change that boundary.
- The page renders shared chrome + `SunKudosSection` — edit neither (P5/P3 own them).

## Related Code Files

- **Modify:** the `file_ownership` list (className/JSX spacing + the inline title block in
  `awards/page.tsx`).
- **Read for context:** `references/measurement-method.md`, `award-detail-data.ts` (data only,
  unchanged), existing MoMorph doc-header comments.
- **Delete:** none.

## Implementation Steps

1. `get_frame` on `zFYDgyj_pD`; map hero / title / nav / catalog / detail-card to nodes.
2. Per element: diff table → fix non-zero Δ → re-measure to Δ 0.
3. Split any file crossing 200 lines (`awards-section` is home's; here `award-detail-card` is 156).
4. Update only style-coupled test assertions.
5. `npx tsc --noEmit` + `npx eslint app/components/awards app/awards` + `npx vitest run app/components/awards`.

## Todo List

- [ ] node map for `zFYDgyj_pD`
- [ ] awards-hero Δ 0
- [ ] inline title block (eyebrow/heading/divider) Δ 0
- [ ] awards-nav-menu Δ 0 (scroll-spy untouched)
- [ ] awards-catalog container + award-detail-card Δ 0
- [ ] flow-driven heights flagged RE-VERIFY@P7
- [ ] tsc + eslint + vitest green

## Success Criteria

- Every tracked awards node matches `get_node` (Δ 0). Scroll-spy still selects the active section.
- All pre-existing awards tests pass (only style-coupled assertions changed).
- No awards component exceeds 200 lines.

## Risk Assessment

| Risk | Likelihood | Impact | Countermove |
|------|-----------|--------|-------------|
| Editing shared chrome / SunKudosSection | Med | High | Ownership excludes them; render-only here |
| Breaking scroll-spy while restyling nav | Low | High | Style-only diffs; keep IntersectionObserver + client boundary |
| Flow-driven height churn after font | Med | Low | Flag RE-VERIFY@P7 |

## Security Considerations

Route is auth-gated (`requireUser()` + proxy) — unchanged; presentational edits only.

## Next Steps

Feeds P7.
</content>
