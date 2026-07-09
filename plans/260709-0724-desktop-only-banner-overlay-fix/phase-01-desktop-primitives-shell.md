# Phase 01 — Primitives + shared shell → desktop-only

**Priority:** P1 · **Status:** done · **Effort:** 3h · **Depends on:** — · **Serial gate (blocks P2–P5)**

## Context Links
- Layout rule: `.claude/rules/momorph/momorph-layout-system.md` (single-owner gutter/max-width)
- Files read: `app/components/layout/page-layout.tsx`, `site-header.tsx`, `site-footer.tsx`

## Overview
Top-down gate. Convert the shared layout surface to desktop-only BEFORE any screen work, so
screens don't chase a moving gutter. Flatten `PageGutter` to a constant 144px gutter and strip
breakpoints from site chrome + the other primitive consumer (prelaunch).

## Key Insights
- `PageGutter` is `w-full px-6 sm:px-10 lg:px-36` — the ONLY owner of viewport gutter. Flatten to
  `w-full px-36` (144px always). `ContentFrame` max-width caps (1120/1152/1224) stay unchanged.
- Footer's 90px gutter is intentional design, hardcoded OUTSIDE `PageGutter` — do NOT touch it.
- Login header/footer have zero responsive variants (confirmed) → no work there.
- `prelaunch/page.tsx` consumes `PageGutter` + `ContentFrame(1224)` → inherits the flat gutter;
  strip its own `sm:`/`lg:` variants too (F003, desktop-only per user's "whole site" intent).

## Requirements
- Functional: gutter renders 144px at all widths; content caps unchanged; no reflow classes remain
  in the owned files.
- Non-functional: single-owner architecture preserved; files <200 lines; no new deps.

## Architecture / Data Flow
`PageGutter` (144px flat) → `ContentFrame` (max-width cap, `mx-auto`) → content. Every screen
composes this same pair; changing the primitive here propagates to all of them (the gate).

## Related Code Files
- Modify: `app/components/layout/page-layout.tsx` (flatten gutter class), `site-header.tsx`,
  `site-footer.tsx`, `nav-link.tsx`, `app/prelaunch/page.tsx`,
  `app/prelaunch/components/{prelaunch-content,countdown-led-unit}.tsx`.
- Do NOT edit: footer 90px hardcode; any screen page/hero (owned by P2–P5).

## Implementation Steps
1. `page-layout.tsx`: `GUTTER_CLASS` `w-full px-6 sm:px-10 lg:px-36` → `w-full px-36`. Leave
   `CONTENT_WIDTH_CLASS` map + `ContentFrame` untouched. Update the docblock (gutter no longer
   breakpoint-scaled; footer-90 exception note stays).
2. `site-header.tsx`, `site-footer.tsx`, `nav-link.tsx`: remove every `sm:`/`md:`/`lg:` variant,
   collapsing each to its desktop (largest-breakpoint) value.
3. `prelaunch/page.tsx` + its two components: same breakpoint collapse to desktop values.
4. `npm run lint` + `npm run build` (typecheck). Do NOT run/fix Vitest here (deferred pass).

## Todo List
- [ ] `PageGutter` gutter flattened to `px-36`
- [ ] `ContentFrame` widths unchanged
- [ ] site-header / site-footer / nav-link breakpoints stripped (footer 90 preserved)
- [ ] prelaunch (page + 2 components) breakpoints stripped
- [ ] lint + build green

## Success Criteria
- Grep `\b(sm|md|lg|xl):` returns zero hits in the six owned files.
- Header gutter measures 144px; footer 90px; content caps intact (verified in P6).

## Risk Assessment
- Flattening the shared gutter regresses all screens at once → this atomic phase is gated before
  screens; P6 numeric test is the backstop.
- `page-layout.test.tsx` (asserts `px-6`/`sm:px-10`/`lg:px-36`) will fail → deferred unit pass.

## Next Steps
Unblocks P2–P5 (parallel). Feeds P6 gutter/max-width assertions.
