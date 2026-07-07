# Phase 08 — Playwright Visual-Contract Tests + Full-Site DoD

**Priority:** P1 · **Status:** pending · **Effort:** 4h · **Depends on:** P4,P5,P6,P7

## Context Links
- Rule: `.claude/rules/momorph/momorph-layout-system.md` §7 (numeric verification, not vibes)
- P1 consolidated contract tables (the assertion source)
- Infra: `playwright.config.ts`, `e2e/*.spec.ts` (existing suite pattern)

## Overview
Lock the corrected layout system with tests that MEASURE real DOM
(`getBoundingClientRect`/`getComputedStyle`) at 1440/1280/768/375 and assert against the numeric
contracts. Screenshot diff is optional last confirmation, never the gate.

## Key Insights
- `@playwright/test` already installed; `npm run e2e` wired; existing specs cover content/access.
- Design frequently defines ONLY 1440 (confirmed for login). For viewports the design omits,
  assert the invariant that survives (gutter is single-owner, content ≤ max-width, no double
  padding) rather than a design number that doesn't exist. Document which is which.

## Requirements
- New spec `e2e/layout-contract.spec.ts` covering all 4 screens.
- Per screen, per available viewport, assert: left/right gutter px, content max-width px, header
  height, footer height — within ±1px (Assumption #4).
- Assert single-owner invariant: measure that no element inside `ContentFrame` re-applies the
  gutter padding (computed paddingLeft on inner containers == 0 unless design-documented).
- For screens with only a 1440 design frame: at 1280/768/375 assert **structural invariants**
  (content never exceeds max-width; gutter is present once) not fabricated numbers.

## Architecture / Data Flow
```
P1 contract numbers ──► test fixtures (viewport → expected px map)
        │
        ▼
Playwright launches dev build ──► page.evaluate(getBoundingClientRect/getComputedStyle)
        │
        ▼
assert measured == expected ±tol   ──► DoD gate
```

## Related Code Files
- Create: `e2e/layout-contract.spec.ts`
- Modify (only if needed): `playwright.config.ts` (viewport projects)
- No source edits.

## Implementation Steps
1. Encode contract numbers from P1 as a per-screen fixture map.
2. Write measurement helper: `measure(selector) => {rect, computed}` via `page.evaluate`.
3. For each screen × viewport: navigate, measure gutter/max-width/header/footer, assert ±tol.
4. Add single-owner invariant check (no nested gutter padding).
5. Add Spotlight assertion: name/text nodes exist as DOM (not baked in crop) — assert count of
   text tiles > 0 in the live DOM.
6. Run `npm run e2e -- layout-contract`; fix real drift by looping back to the owning screen phase.

## Todo List
- [ ] Fixture map from P1
- [ ] Measurement helper
- [ ] 4 screens × available viewports asserted
- [ ] Single-owner invariant test
- [ ] Spotlight DOM-text-present test
- [ ] Suite green + Vitest + lint green

## Success Criteria
- `npm run e2e -- layout-contract` green. `npm test` + `npm run lint` green. Every screen has a
  passing numeric or invariant assertion — no screen marked done on vibes.

## Risk Assessment
- Flow-driven heights vary by platform font metrics → use documented per-metric tolerance, assert
  gutter/max-width strictly (±1px) but heights loosely.
- Missing design viewports → assert invariants, never fabricated pixels (document).

## Rollback
Delete the spec; no source impact.

## Next Steps
Final gate. On green, plan DoD (plan.md) is satisfied.
