# Phase 01 — Numeric Contract Audit

**Priority:** P1 · **Status:** pending · **Effort:** 3h · **Depends on:** researcher reports

## Context Links
- Rule: `.claude/rules/momorph/momorph-layout-system.md` (§2 audit, §4 contract table, §5 classify)
- Researcher reports: `../260707-2337-site-layout-system-audit-fixes/research/researcher-0{1..4}-*.md`
- Current primitives: `app/components/layout/page-layout.tsx`
- All usage sites: see plan.md File Ownership Map

## Overview
Consolidate the four live-MoMorph researcher contract tables into ONE audit doc that becomes the
source of truth for P2–P8. No source edits in this phase — it is measurement + classification only.

## Key Insights (from WIP inspection)
- Gutter primitive: `w-full px-6 sm:px-10 lg:px-36` — 24 / 40 / 144px. Unverified vs design.
- Content widths offered: 1120 / 1152 / 1224px. Which screen uses which is inconsistent.
- `sun-kudos-section.tsx` nests `ContentFrame` (1224) INSIDE another `ContentFrame` → double
  container / potential double gutter. Classify.
- `app/awards/page.tsx` uses `PageGutter` with NO `ContentFrame` → no max-width owner. Classify.
- `spotlight-crop.png` bakes text/UI — asset-rule violation candidate.

## Requirements
- One consolidated table per screen (login/home/awards/kudos+spotlight) at 1440/1280/768/375.
- For each: the SINGLE gutter value + SINGLE content max-width the design implies.
- Every mismatch classified per §5: wrong gutter / max-width / breakpoint / image crop /
  text-wrap width / spacing token / viewport constraint.
- A cross-screen verdict: does one gutter + one max-width serve all screens, or are per-screen
  content widths genuinely different (documented reason)?

## Architecture / Data Flow
```
researcher reports (live MoMorph numbers)
        │
        ▼
consolidated contract tables (this phase)  ──► feeds P2 primitive values
        │                                  ──► feeds each screen phase's inline table
        ▼
mismatch classification list  ──► becomes the fix backlog for P3–P7
```

## Related Code Files
- Read: `app/components/layout/page-layout.tsx`, every file in plan.md ownership map.
- Create: `phase-01` appendix tables inline here (fill from reports).
- Delete: none.

## Implementation Steps
1. Read all four researcher reports.
2. Paste each screen's contract table into the appendix below.
3. Reconcile the three max-widths (1120/1152/1224): map each to the screen(s) that need it; delete
   any width no screen actually needs (YAGNI).
4. Decide the canonical gutter: does the design use one gutter across screens? Record px per breakpoint.
5. Build the mismatch backlog: one row per (screen, component, classified cause, target number).
6. Mark any reconstruction (MCP-unavailable) screens explicitly.

## Todo List
- [ ] All 4 reports read
- [ ] 4 contract tables consolidated
- [ ] Canonical gutter decided (px @ 1440/1280/768/375)
- [ ] Max-width set reduced to what's actually used
- [ ] Mismatch backlog complete + classified
- [ ] Reconstruction screens flagged

## Success Criteria
- One doc from which P2 can set exact primitive values and each screen phase can copy its table.
- Zero "TBD" numbers except explicitly-flagged reconstructions.

## Risk Assessment
- Reports disagree on gutter across screens → then gutter is genuinely responsive/per-screen;
  document it rather than forcing one value.

## Next Steps
Feeds P2 (primitive values) and P4–P7 (inline tables).

## Appendix — Consolidated Contract Tables (all 4 reports in; MCP reachable, live data)

### Cross-screen verdict (the headline result)
- **Gutter = 144px** — confirmed independently on login, home, awards, kudos. Matches existing
  primitive `lg:px-36`. **No change needed.**
- **Content max-width is a legitimate 3-tier system, all values real & used:** 1224 (home
  hero/awards/kudos-outer), 1152 (login main, awards, kudos-board, home root-further), 1120 (home
  sun-kudos inner card). `CONTENT_WIDTH_CLASS {1120,1152,1224}` is correct — **keep all three**.
- **Footer gutter = 90px, intentional**, lives outside `PageGutter` — do NOT normalize to 144.
- **Native design frames are large-only:** login/awards 1440, home 1512, kudos 1440. **No
  1280/768/375 frames exist** → those breakpoints are convention-based, NOT design-verifiable;
  assert invariants only (P8), never fabricate numbers.

### The ONE systemic bug (drives P4 + P6)
Bare `PageGutter` with **no `ContentFrame` cap** → content unbounded past the native frame:
- `app/login/page.tsx` (main) — fix in P4
- `app/awards/page.tsx:92` (title+catalog) — fix in P6 (+ delete the false "double-padding→864px" comment)
- `app/components/awards/awards-hero.tsx` — verify/fix in P6
- `app/prelaunch/page.tsx` — verify in P2 (not one of the 4 screens)
`ContentFrame` adds only `max-w`+`mx-auto` (zero padding) → adding it is safe, never double-pads.

### The ONE asset bug (drives P7)
`public/kudos/spotlight-crop.png` = flattened screenshot with ~120 names baked in, under the correct
DOM name-cloud → duplicate names + baked interactive content. Fix = decorative-only backdrop (P7).
**Blocked** for the ideal clean re-export by Figma image-export auth (500/401).

### Per-screen tables
- **Login:** see `phase-04-login-screen.md` (1440-only; gutter 144, max-width 1152, footer 90).
- **Home:** see `phase-05-home-screen.md` (1512-only; 3-tier 1224/1152/1120; NO mismatch — verify-only).
- **Awards:** see `phase-06-awards-screen.md` (1440-only; gutter 144, max-width 1152; missing cap bug).
- **Kudos + Spotlight:** see `phase-07-kudos-spotlight-screen.md` (1440-only; gutter 144, max-width
  1152 correct; Spotlight is section `B.7` inside `MaZUn5xHXZ`, not a separate screenId; crop defect).

### Reconstruction flags
None — all four screens sourced from live MoMorph MCP. Only caveat: sub-native-frame breakpoints
(1280/768/375) have no design source on any screen; treat responsive CSS there as unverified.
