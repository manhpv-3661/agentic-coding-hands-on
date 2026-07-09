# Phase 06 — e2e layout-contract rewrite + DoD

**Priority:** P1 · **Status:** pending · **Effort:** 3h · **Depends on:** P2,P3,P4,P5 · **Serial (final gate)**

## Context Links
- Files: `e2e/layout-contract.spec.ts`, `e2e/layout-contract-helpers.ts`
- Rule: `.claude/rules/momorph/momorph-layout-system.md` §7 (numeric DOM verification)

## Overview
The current suite tests each screen at its native width (numeric contract) PLUS a "structural
invariants" sweep at sub-native widths (login/awards/kudos: 1280/768/375; home: 1440/1280/768/375).
With responsive removed there is no responsive contract to test — delete the sub-native sweeps,
keep exactly one native-width numeric contract per screen, and add banner-size + text-overlay
containment assertions.

## Key Insights
- Keep: Login/Awards/Kudos native test @1440; Home native test @1512.
- Delete: every `for (viewport of VIEWPORTS.filter(v => v.width !== 1440))` block (login/awards/
  kudos) and the home `for (viewport of VIEWPORTS)` sweep block.
- Helpers going unused after deletion: `VIEWPORTS`, `expectedGutterForWidth`, `expectNeverExceeds`,
  `assertStructuralInvariants` → remove them (DRY; keep `measureBox`, `expectClose`,
  `expectNoDoubleGutter`, `expectNoNestedGutterClass`).
- New helper: `expectContains(inner, outer, label)` — asserts inner bounding rect ⊆ outer rect
  (±TOLERANCE): `inner.top>=outer.top`, `inner.bottom<=outer.bottom`, left/right likewise.
- Banner size assertions per the ground-truth boxes: Login 1441×1022, Awards 1440×547, Home photo
  1512×1392, Kudos 1440×512 (measure at native viewport; width may equal viewport for full-bleed).
- The Spotlight "names are live DOM" test stays (count unchanged; do not assert 352 — Open Q #4).

## Requirements
- Exactly one native-width numeric contract test per screen (gutter 144 / caps / header height).
- Per screen: banner box measures its native size (±HEIGHT_TOLERANCE for flow) + title/text rect
  ⊆ banner rect (Awards: assert the KV-logo rect, NOT the gold heading — heading is below band).
- No sub-native viewport assertions remain.

## Architecture / Data Flow
Playwright (chromium-authless, port 3100) → `page.goto(screen)` at native viewport →
`measureBox` (getBoundingClientRect + getComputedStyle) → `expectClose` (gutter/width) +
`expectContains` (overlay) vs the ground-truth numbers.

## Related Code Files
- Modify: `e2e/layout-contract.spec.ts` (delete sweeps, add banner/overlay asserts),
  `e2e/layout-contract-helpers.ts` (drop unused viewport helpers, add `expectContains`).
- Follow-up note (NOT this phase): `e2e/homepage-content.spec.ts` + `e2e/login.spec.ts` set
  viewports — audit for sub-native assumptions separately (task scopes P6 to layout-contract).

## Implementation Steps
1. `layout-contract-helpers.ts`: remove `VIEWPORTS`, `expectedGutterForWidth`, `expectNeverExceeds`,
   `assertStructuralInvariants`; add `expectContains(inner, outer, label)`; add a banner selector
   convention (e.g. `data-banner` attr set by each hero, or a stable class selector).
2. `layout-contract.spec.ts`: for each screen keep the single native numeric test; delete the
   sub-native loops; add `banner box size` + `title rect ⊆ banner rect` assertions.
3. Awards: assert KV-logo overlay ⊆ hero band; assert gold heading is BELOW band (top >=
   band.bottom) to lock the "not overlaid" decision.
4. Keep the Spotlight live-DOM test (`span[data-spotlight-index]` count > 0).
5. `npm run e2e -- layout-contract` → green. `npm run lint` + `npm run build` → green.

## Todo List
- [ ] Sub-native sweeps deleted (login/awards/kudos/home)
- [ ] One native numeric contract test per screen retained
- [ ] `expectContains` helper added; unused viewport helpers removed
- [ ] Banner-size + title-⊆-banner assertions per screen
- [ ] Awards heading asserted below band (not overlaid)
- [ ] Spotlight live-DOM test retained
- [ ] e2e + lint + build green

## Success Criteria (plan DoD gate)
- `npm run e2e -- layout-contract` passes with native-only + overlay assertions.
- Zero `sm:`/`md:`/`lg:`/`xl:` across primitives + 4 screens + owned components (grep clean).
- `npm run lint` + `npm run build` green.
- Deferred (tracked, non-gating per user pref): Vitest unit-test reconciliation
  (`page-layout.test.tsx` + component tests asserting stripped classes).

## Risk Assessment
- Full-bleed banners make `banner.width == viewport.width` → assert against native viewport width,
  not a separate number, to avoid a false mismatch.
- Flow-driven banner heights need `HEIGHT_TOLERANCE_PX`, not strict ±1.

## Next Steps
Final gate. On green, report DoD status + the deferred unit-test follow-up to the lead.
