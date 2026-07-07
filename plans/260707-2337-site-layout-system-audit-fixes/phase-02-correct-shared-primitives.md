# Phase 02 — Correct Shared Primitives

**Priority:** P1 · **Status:** pending · **Effort:** 2h · **Depends on:** P1

## Context Links
- Rule: `.claude/rules/momorph/momorph-layout-system.md` §3 (ownership), §6.1 (primitives first)
- P1 audit: `phase-01-numeric-contract-audit.md` (canonical gutter + max-width set)
- File: `app/components/layout/page-layout.tsx`

## Overview
Make `PageGutter` the SINGLE owner of viewport gutter and `ContentFrame` the SINGLE owner of
max-width. **Live-MoMorph verdict (login+home+awards researchers, all MCP-reachable): the current
primitive VALUES are already correct** — gutter `lg:px-36` = 144px is confirmed 3× independently,
and the three widths `{1120,1152,1224}` are a legitimate three-tier system all actually used
(home 1224/1152/1120, login+awards 1152). So P2's real job is **NOT changing values** — it is
locking the primitive as the sole owner and making it robust for viewports >1512 (no cap today).

## Key Insights
- Current: `GUTTER_CLASS = "w-full px-6 sm:px-10 lg:px-36"`; widths `{1120,1152,1224}` — **KEEP ALL**.
- Design has only large native frames (login/awards 1440, home 1512). Sub-frame breakpoints
  (1280/768/375) are NOT in design → `px-6 sm:px-10` are convention, not design-verifiable; leave
  as-is (do not fabricate design numbers for them).
- Footer's 90px gutter is intentional and lives OUTSIDE `PageGutter` (P3) — do not fold into it.
- The recurring real bug is **missing max-width application** (login, awards, awards-hero use bare
  `PageGutter` with no `ContentFrame`) → content unbounded past the native frame. That is fixed in
  the SCREEN phases (P4/P6), not by changing the primitive.

## Requirements
- Keep `GUTTER_CLASS` and `CONTENT_WIDTH_CLASS` values unchanged (verified correct).
- Public API of `PageGutter`/`ContentFrame` unchanged (polymorphic `as`, `className`, `width`).
- Only substantive change to consider: whether `ContentFrame` should be the single place that also
  guards >native-frame growth (it already does via `mx-auto` + `max-w`). Confirm no page relies on
  an un-capped `PageGutter` for its width — if it does, that's a screen-phase fix, not here.
- If P1 (or the kudos report) surfaces a genuinely NEW width not in the map, add it; otherwise no
  value edits.

## Architecture / Data Flow
```
P1 canonical numbers ──► GUTTER_CLASS + CONTENT_WIDTH_CLASS constants
                          │
                          ▼
        every consumer (P3 shell, P4–P7 screens) inherits corrected values automatically
```

## Related Code Files
- Modify: `app/components/layout/page-layout.tsx`
- Verify (own, edit only if regressed): `app/prelaunch/page.tsx`
- Create/Delete: none.

## Implementation Steps
1. Set `GUTTER_CLASS` to P1 gutter (e.g. `w-full px-{a} sm:px-{b} lg:px-{c}` or arbitrary px).
2. Rewrite `CONTENT_WIDTH_CLASS` to the reduced, verified width set from P1.
3. Keep `joinClasses` + polymorphic typing intact.
4. `npm run lint` + `npx tsc --noEmit` (or `npm run build`) to catch type breaks in consumers.
5. Visually smoke prelaunch (only consumer outside the 4 screens) — adjust only if regressed.

## Todo List
- [ ] GUTTER_CLASS matches P1
- [ ] CONTENT_WIDTH_CLASS reduced to verified widths
- [ ] Type/lint/build green
- [ ] prelaunch not regressed

## Success Criteria
- Compile clean. Consumers unchanged in signature. Values traceable to P1 contract.

## Risk Assessment
- **High:** every screen shifts at once. Mitigation: this is the gate; P8 tests + P3/P4–P7 verify
  before merge; do NOT proceed to screens until build is green and prelaunch smoke passes.

## Rollback
Revert this single file to WIP state. Because screens consume it, roll back screens first if
reverting after they land.

## Next Steps
Unblocks P3 (shell).
