---
title: "UI component tree refactor & cleanup (no behavior change)"
description: "Dead-code removal + DRY merges across kudos/awards/home components; zero behavior change"
status: pending
priority: P2
effort: 12h
branch: main
tags: [refactor, cleanup, dry, ui, no-behavior-change]
created: 2026-07-09
---

# UI Refactor & Cleanup

## Work type & spec status
**REFACTOR-ONLY. NO behavior/logic/layout change.** UI output must stay pixel-identical.
No new spec content. Existing feature specs (f002-homepage, f004-awards, f006-live-board,
f007-compose-form, f008-like-kudos) already describe current behavior and DO NOT change.
Delivery-stage doc-writer/project-manager: treat as "refactor, no behavior change" — no spec edits expected.

## Goal (constrains every phase)
1. NO behavior change — structural cleanup only.
2. Remove dead/duplicate code (unused exports/props/state, repeated inline styles, redundant helpers).
3. Merge what logically belongs together (DRY/KISS/YAGNI): fold single-consumer data files, dedup icons/styles.
4. DO NOT touch PageGutter/ContentWidth layout primitives (`app/components/layout/page-layout.tsx`) — separate audited concern.
5. Refresh unit tests for LOGIC touched (helpers, hooks, data builders). Keep existing behavior tests green untouched. Add tests only where refactor extracts/merges uncovered logic.
6. Files stay ~<200 lines; split only for genuine SRP (rule 3 wins over rule 6 in conflict — do not over-fragment).
7. No `-enhanced`/`-v2` files. Edit in place; delete files emptied by a merge.

## Verification
`npm run test` (vitest) green, `npm run lint` clean, `npm run build` passes — before & after each phase.
Existing `*.test.tsx` are the behavior contract: they MUST pass unchanged.

## Phases

| # | Phase | Group | Status | Depends on |
|---|-------|-------|--------|-----------|
| 00 | [Shared primitives foundation](phase-00-shared-primitives-foundation.md) | — | done | — |
| 01 | [Kudos compose dedup](phase-01-kudos-compose-dedup.md) | (a) | done | 00 |
| 02 | [Kudos components dedup](phase-02-kudos-components-dedup.md) | (b) | done | 00 |
| 03 | [Awards components dedup](phase-03-awards-components-dedup.md) | (c) | done | 00 |
| 04 | [Home components dedup](phase-04-home-components-dedup.md) | (d) | done | 00 |
| 05 | [Awards page cleanup](phase-05-awards-page-cleanup.md) | (e) | done | 03 |

## Dependency notes
- **00 blocks all** — it creates the shared `cn()` helper + gold-glow style constant that 02/03/04 consume.
- **01–04 run in parallel** after 00 — strict directory-scoped file ownership, no shared writes.
- **05 depends on 03** — awards/page.tsx consumes the re-export repoint & data-meta util done in 03.
- **Integration contract (01↔02):** `use-kudos-optimistic-posts.ts` (owned by 02) imports `buildKudosPost`/`toCreateKudosInput`/`EMPTY_COMPOSE_FORM_STATE` from `compose-form-helpers.ts` (owned by 01). Phase 01 MUST preserve those public exports.

## Out of scope / do NOT fix here (behavior/layout — separate track)
- `awards-hero.tsx` inline `top:80px` vs class `top-[184px]` conflict → layout bug, defer to layout-audit track.
- Cross-app icon consolidation into a global icon module (login/ etc.) → deferred; each dir dedups its own icons only.

## Session outcome

**All 6 phases completed.** Tests: 613 passing (604→613 after 3 reviewer-fix items; 22 pre-existing unrelated failures, verified via baseline diff). Lint: clean. Typecheck: 0 errors.

**Reviewer findings (3 items, all fixed):**
- TS18048 type-narrowing bug in `app/login/page.test.tsx` — fixed
- Missing next/font/local mocks in 3 home test files — added
- Text-message drift in `lib/awards/award-category-meta.ts` warn message — corrected

**Additional work (user-approved):**
- Deleted 18 confirmed-unused public assets (public/homepage-saa/Icon-*.svg, Award-*.png, public/kudos/group/group.jpg, public/{next,vercel,globe,window,file}.svg)
- Deleted ~50 untracked root-level screenshot PNGs (gitignored disk clutter)
- Corrected false-positive "regression" finding: `awards/page.tsx` stale comment block incorrectly described a title section already moved to `awards-hero.tsx` by an earlier commit — cleaned up comment to correctly attribute ownership, no functional change

## Unresolved questions
See each phase's Risk Assessment; consolidated at bottom of phase-00.
