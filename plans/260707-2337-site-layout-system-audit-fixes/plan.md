---
title: "Site-wide Layout System Audit & Fix (single-owner gutter/max-width, numeric contracts)"
description: "Kill systemic layout drift across login/home/awards/kudos by auditing the shared PageGutter/ContentFrame primitives numerically against live MoMorph, fixing top-down (primitives → shell → screens), and locking it with Playwright DOM-measurement tests."
status: pending
priority: P1
effort: 24h
branch: main
work_type: fix
tags: [layout-system, momorph, gutter, max-width, pixel-conformance, playwright]
created: 2026-07-07
---

# Site-wide Layout System Audit & Fix

A senior reviewer diagnosed the recurring layout drift across the SAA 2025 site (login, home,
awards, kudos). Root cause is **systemic, not per-screen**:

1. **No single owner of gutter / max-width.** Components each decided their own container
   width/padding. WIP introduced shared primitives `PageGutter` + `ContentFrame`
   (`app/components/layout/page-layout.tsx`) but they were **partially wired without a numeric
   audit** — some sites nest `ContentFrame` twice (double-padding candidate: `sun-kudos-section`),
   some pages carry no max-width at all (`app/awards/page.tsx`).
2. **Primitives never audited against live Figma before being applied.** Gutter class
   `w-full px-6 sm:px-10 lg:px-36` and content widths `1120/1152/1224px` are unverified guesses.
3. **Image crop used where DOM was required.** Untracked `public/kudos/spotlight-crop.png`
   (1205×596) is a flattened board crop that — by its own source comment — bakes in text/UI that
   the asset rule requires to be live DOM (`spotlight-collage-backdrop.tsx`).

This plan follows the **mandatory pre-code audit protocol** in
`.claude/rules/momorph/momorph-layout-system.md`: connect the live design source first, audit the
whole layout system, produce a per-screen numeric contract table, classify every mismatch, fix
**top-down** (primitives → shell → section/page → components), and **verify with numeric DOM
measurement (Playwright), not screenshot vibes**.

This is a **remediation over existing uncommitted WIP**, not a greenfield build. Planning only —
no implementation here; `implementer` agents run later via `tkm:takumi`.

## MoMorph two-track note (why the standard A/B split does not apply)

`.claude/rules/momorph/momorph-development.md` models Track A (UI) ∥ Track B (backend/logic). This
task has **no backend track** — it is pure presentational layout remediation. The binding ordering
is therefore the **layout-system top-down fix order** (primitives → shell → screens), which is an
intentional hard sequence, not the parallel A/B shape. Screen phases (P4–P7) are parallel-runnable
among themselves (disjoint file ownership) once primitives+shell land. See Assumptions.

## Phases

| # | Phase | Status | Effort | Depends on | Parallel-safe with |
|---|-------|--------|--------|-----------|--------------------|
| 1 | [Numeric contract audit](phase-01-numeric-contract-audit.md) | pending | 3h | — (feeds on researcher reports) | — |
| 2 | [Correct shared primitives](phase-02-correct-shared-primitives.md) | pending | 2h | 1 | — |
| 3 | [Fix site shell](phase-03-fix-site-shell.md) | pending | 3h | 2 | — |
| 4 | [Login screen](phase-04-login-screen.md) | pending | 2h | 3 | 5,6,7 |
| 5 | [Home screen (verify-only)](phase-05-home-screen.md) | pending | 2h | 3 | 4,6,7 |
| 6 | [Awards screen](phase-06-awards-screen.md) | pending | 3h | 3 | 4,5,7 |
| 7 | [Kudos + Spotlight screen](phase-07-kudos-spotlight-screen.md) | pending | 5h | 3 | 4,5,6 |
| 8 | [Playwright visual-contract tests + DoD](phase-08-visual-contract-tests.md) | pending | 4h | 4,5,6,7 | — |

## Dependency Graph

```
P1 (audit) ──► P2 (primitives) ──► P3 (shell) ──► ┌─ P4 (login)  ─┐
                                                   ├─ P5 (home)   ─┤
                                                   ├─ P6 (awards) ─┼──► P8 (playwright + DoD)
                                                   └─ P7 (kudos)  ─┘
```

Execution waves:
- **Wave 1:** P1 (consolidate live contracts, classify every mismatch).
- **Wave 2:** P2 (one atomic primitives correction) → verified before proceeding.
- **Wave 3:** P3 (shell) → verified before screens.
- **Wave 4:** P4 ∥ P5 ∥ P6 ∥ P7 (disjoint file ownership; recommended review order login→home→awards→kudos).
- **Wave 5:** P8 numeric DOM tests across 1440/1280/768/375 + full-site DoD gate.

**Why top-down is a hard sequence here (not parallel).** Per layout-system rule §6, a component
must never be fixed before its parent primitives are correct — otherwise screen fixes chase a
moving gutter/max-width and regress each other (the exact failure this plan exists to end).
P2 and P3 are therefore serial gates. Screens parallelize only *after* the shared contract is frozen.

## Key Architectural Decisions

1. **Single owner of gutter (PageGutter) and max-width (ContentFrame) — enforced, not just
   introduced.** After P2, no screen/component adds its own horizontal container when a parent
   provides one. Nested `ContentFrame` is removed unless the design explicitly calls for a second
   column (documented inline in the screen phase).
2. **Numbers come from live MoMorph, never memory.** P1 consolidates researcher contract tables
   (fileKey `9ypp4enmFmdK3YAFJLIu6C`). If MCP was unavailable, the affected screen is labeled a
   *reconstruction* and flagged as an open risk, not claimed pixel-perfect.
3. **Crop only for pure decorative background; text/names become DOM.** P7 resolves
   `spotlight-crop.png` per the researcher's layer split — baked text moves to the DOM name-cloud
   layer; only the non-textual wave/network geometry may remain a background crop.
4. **Verification is numeric.** P8 measures real `getBoundingClientRect`/`getComputedStyle` in
   Playwright at 4 viewports and asserts against the contract tables. Screenshot diff is a last
   confirmation, never the gate.
5. **Operate on the WIP as baseline.** The uncommitted primitives WIP is the starting point; P2
   corrects it in place — no parallel "enhanced" copies (DRY, and repo rule).

## File Ownership Map (no two parallel phases share a file)

| Phase | Owns (edits) |
|-------|--------------|
| P1 | audit doc only (`phase-01` + this plan); no source edits |
| P2 | `app/components/layout/page-layout.tsx`, `app/prelaunch/page.tsx` (primitive consumer, verify/adjust) |
| P3 | `app/layout.tsx`, `app/globals.css`, `app/components/home/site-header.tsx`, `app/components/home/site-footer.tsx` |
| P4 | `app/login/page.tsx`, `app/login/components/login-header.tsx` |
| P5 | `app/page.tsx`, `app/components/home/{hero-section,awards-section,sun-kudos-section,root-further-content}.tsx` |
| P6 | `app/awards/page.tsx`, `app/components/awards/awards-hero.tsx` (+ awards children if drift) |
| P7 | `app/kudos/page.tsx`, `app/components/kudos/{kudos-board,spotlight-collage-backdrop,spotlight-name-cloud,highlight-kudos-carousel}.tsx`, `lib/kudos/{kudos-spotlight-data,spotlight-name-cloud-slots}.ts`, `public/kudos/spotlight-crop.png` |
| P8 | `e2e/layout-contract.spec.ts` (new), `playwright.config.ts` (only if viewport projects needed); no source edits |

P4/P5/P6/P7 are disjoint → parallel-safe. Site-header/footer are owned only by P3; screens render
them but never edit them.

## Global Constraints

- No new npm dependencies. Files < 200 lines (split otherwise). YAGNI / KISS / DRY, kebab-case.
- Every existing Vitest+RTL test stays green; update assertions only where the corrected contract
  legitimately changes a measured value (document the change in the phase).
- Never guess layout numbers — live MoMorph is source of truth (layout-system §1).
- Follow `docs/` code standards and all `.claude/rules/momorph/*` rules.

## Risk Assessment (High-impact first)

| Risk | Likelihood | Impact | Countermove |
|------|-----------|--------|-------------|
| ~~MoMorph MCP unavailable~~ (RESOLVED: all 4 reachable, live data) | — | — | N/A — no reconstructions needed |
| Figma **image-export** auth broken (500/401) blocks clean Spotlight re-export | Confirmed | Med | P7 ships decorative-only interim now; clean export is a non-blocking follow-up (see Open Questions #1) |
| Changing shared gutter (`lg:px-36`=144px) / max-width regresses ALL screens at once | High | High | P2 is one atomic gated phase; P8 numeric tests catch regression; screens don't start until P2+P3 green |
| Nested-ContentFrame removal shrinks/grows content column unexpectedly | Med | Med | P1 classifies each nesting as intended vs double-padding before P5/P7 act |
| Crop→DOM rework loses wave/network geometry | Med | Med | Only baked *text* becomes DOM; pure decorative background may remain crop per researcher split |
| WIP tree shifts under the plan (uncommitted) | Med | Med | Commit WIP as baseline before P2 (Assumption #1) |
| Parallel screen phases touch shared file | Low | High | Ownership map above; site chrome isolated to P3 |

## Compatibility / Migration

- **Data:** none — pure presentational; no schema/user-data migration.
- **Users:** visual-only; no route or behavior change intended (login redirect copy already fixed).
- **Integrations:** none. i18n untouched (F005 convention preserved).
- **Tests already in WIP** (`kudos-board.test`, `spotlight-name-cloud.test`, `awards-page.test`)
  must survive; P2/P7 update only assertions tied to a corrected contract value.

## Rollback

Each phase is a discrete commit. Revert order is reverse-dependency: P8→P7→…→P2. P2 (primitives)
revert restores the WIP primitives; because screens (P4–P7) only *consume* the primitive, reverting
P2 without reverting screens is unsafe → roll back screens first if P2 is reverted. Crop asset
(P7) is restorable from git (currently untracked → commit it in P7 baseline so revert is possible).

## Definition of Done (observable)

- Every one of login/home/awards/kudos+spotlight has a filled numeric contract table with a
  single documented gutter + single max-width.
- No component adds horizontal padding/max-width its parent already owns (grep audit clean).
- `public/kudos/spotlight-crop.png` contains no baked text that should be DOM (per P7 verdict).
- `npm run e2e -- layout-contract` passes: measured DOM at 1440/1280/768/375 matches contract
  within ±1px tolerance for gutter/max-width, documented tolerance for flow-driven heights.
- `npm test` (Vitest) and `npm run lint` green.

## Assumptions (proceeding without blocking, per autonomous mode)

1. **Commit the current WIP as the baseline** before P2 begins, so the plan operates on a stable
   tree and rollback works (crop asset gets tracked). If the user prefers a fresh branch, branch
   from that commit.
2. **The layout-system top-down order overrides the momorph A/B parallel model** for this task,
   since there is no backend track. Screens parallelize only after primitives+shell freeze.
3. **RESOLVED by research (all 4 reports, live MCP):** `lg:px-36` (144px) gutter and the 3-tier
   1120/1152/1224 max-widths are **VERIFIED CORRECT** — keep them. The real work is correct
   *application* (missing `ContentFrame` caps on login/awards), not changing primitive values. See
   `phase-01` appendix for the cross-screen verdict.
4. **±1px tolerance** for gutter/max-width numeric assertions; heights driven by text flow get a
   documented per-metric tolerance (font metrics vary by platform).
5. **prelaunch** (F003) consumes `PageGutter` but is not one of the 4 audited screens; it is
   verify-only under P2 ownership, edited only if the primitive correction regresses it.
6. **Spotlight screenId** is discovered by the kudos researcher via `list_frames`; if none exists
   separately, the Spotlight board is treated as a region of the live-board frame `MaZUn5xHXZ`.

## Research Findings (all 4 researchers complete — live MoMorph MCP, no reconstructions)

- **Primitives already correct:** gutter 144px + widths 1120/1152/1224 confirmed on every screen.
  The plan shifts from "fix primitives" to "fix APPLICATION + one asset." Scope shrank; home is now
  verify-only (2h). Total effort 24h.
- **Native frames are large-only** (login/awards/kudos 1440, home 1512); **no 1280/768/375 frames
  exist** anywhere → those breakpoints are not design-verifiable; P8 asserts invariants there.
- **Two real defects:** (1) missing `ContentFrame` cap on login + awards (unbounded content past
  native frame); (2) `spotlight-crop.png` bakes ~120 interactive names into a bitmap under the
  correct DOM name-cloud (duplicate names, asset-rule violation).
- **Footer 90px gutter is intentional** — do not normalize to 144.

## Open Questions / Decisions Needed (defaults chosen, not blocking)

1. **Figma image-export auth is broken (500/401)** → cannot re-export clean Spotlight decorative
   layers (`image 24/25`, `Root further`). **Default:** ship P7 interim (decorative-only backdrop
   via existing CSS gradients / heavy-blurred texture, remove baked-text bitmap) now; log a
   follow-up to swap in clean exports once auth is restored. *Needs human:* restore Figma/MoMorph
   media credentials.
2. **>native-frame growth (viewport >1512):** default is to cap all pages at their design content
   width via `ContentFrame` (login/awards get the missing cap). Accept if product wants centered
   content on ultrawide; flag if unbounded growth is actually desired.
3. **`max-w-[600px]` in `LoginHeroContent`** matches no Figma node (inert today) → default remove.
4. **Sub-1512 responsive CSS** (`sm:`/base classes) has no design source → kept as-is, tested by
   invariant only. Confirm with design whether tablet/mobile web frames are coming.

## MoMorph refs

- fileKey: `9ypp4enmFmdK3YAFJLIu6C`
- Login `GzbNeVGJHz` · Home `i87tDx10uM` · Awards `zFYDgyj_pD` · Kudos live-board `MaZUn5xHXZ`
- Spotlight: enumerate via `mcp__momorph__list_frames`
- Researcher contract reports: `plans/260707-2337-site-layout-system-audit-fixes/research/`
