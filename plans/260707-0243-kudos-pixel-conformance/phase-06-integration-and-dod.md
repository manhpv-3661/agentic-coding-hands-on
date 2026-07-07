---
phase: 6
title: "Integration & Definition of Done"
status: completed
priority: P1
effort: 2h
depends_on: [2, 3, 4, 5]
parallel_safe_with: []
file_ownership:
  - docs/features/f006-sun-kudos-live-board/feature.md   # FR-19 text
  - docs/features/f007-kudos-compose-form/feature.md      # FR-10 text
---

# Phase 6 — Integration & Definition of Done

## Context Links

- All prior phases (2–5) + specs `spec/compose-form-momorph-conformance/`, `spec/secret-box-momorph-conformance/`
- MoMorph: `ihQ26W78P2`, `b1Filzi9i6`, `OyDLDuSGEa`, `J3-4YFIpMM` (fileKey `9ypp4enmFmdK3YAFJLIu6C`)
- **Cautionary note:** the earlier miss came from eyeballing scaled thumbnails. This phase verifies
  by **measured computed styles**, not by looking at pictures.

## Overview

- **Priority:** P1 (release gate)
- **Status:** pending
- Full-suite verification, browser pixel-measurement against MoMorph, and doc-text updates for the
  two revised FRs. No feature-code changes — only docs + verification.

## Key Insights

- Runs only after P2–P5 are all green (each already ran its scoped suite; this is the whole-repo pass
  that catches cross-phase interaction — e.g. the P1 `communityStandards` shape change rippling
  through P2/P3).
- Doc edits are **in-place** to existing implemented-feature docs — revise FR text, do **not** create
  new F### entries or change FR ids.
- Pixel verification is the acceptance gate; capture the measured numbers in the completion report.

## Requirements

- `npx tsc --noEmit` clean (whole repo).
- `npx eslint app/components/kudos lib/kudos lib/i18n` clean.
- `npx vitest run` clean (full suite — every pre-existing test still green, new tests green).
- Browser pixel verification (measured, not eyeballed) for each screen vs MoMorph `get_node`:
  - `ihQ26W78P2`: `getComputedStyle(dialog).backgroundColor` ≈ `rgb(255, 248, 225)` (`#FFF8E1`);
    inputs white; error/hint text contrast passes on cream.
  - `b1Filzi9i6`: clicking "Tiêu chuẩn cộng đồng" adds exactly one `[role="dialog"]`; 4 tiers + 6
    icons present; Escape closes only the panel.
  - `OyDLDuSGEa`: link button opens the cream 2-field dialog (no `window.prompt`); blank-URL blocks.
  - `J3-4YFIpMM`: Secret Box dialog heading/subtitle/illustration present; count = `secretBoxUnopened`.
- Doc updates: `f006 feature.md` FR-19 → revised visual text (logic unchanged); `f007 feature.md`
  FR-10 → now a real Community Standards panel (revised by FR-23).

## Architecture

Verification pipeline: static (tsc/eslint) → unit/integration (vitest) → runtime pixel measurement
(dev server + `getComputedStyle`/`getBoundingClientRect` in the browser console or a Playwright-style
measurement snippet) → docs sync. No production code path changes here.

## Related Code Files

- **Modify:** `docs/features/f006-sun-kudos-live-board/feature.md` (FR-19),
  `docs/features/f007-kudos-compose-form/feature.md` (FR-10)
- **Read for context:** all phase outputs; specs; MoMorph node values
- **Create/Delete:** none

## Implementation Steps

1. `npx tsc --noEmit` — resolve any cross-phase type breakage (esp. `communityStandards` shape).
2. `npx eslint app/components/kudos lib/kudos lib/i18n` — clean.
3. `npx vitest run` — whole suite green; investigate any regression before proceeding.
4. Start dev server; for each of the 4 screens, measure computed styles/rects and compare to MoMorph
   `get_node`. Record actual measured values (bg color, input fills, dialog counts) in the report.
5. Update FR-19 text in f006 `feature.md` and FR-10 text in f007 `feature.md` to the revised behavior;
   keep FR ids, note "revised 2026-07-07 (pixel-conformance)".
6. Update `docs/project-changelog.md` if present (per documentation-management rules) — flag Docs
   impact in the completion message.

## Todo List

- [x] tsc clean (repo)
- [x] eslint clean (kudos/lib scopes)
- [x] vitest full suite green
- [x] measured pixel verification for all 4 screens (values recorded)
- [x] f006 FR-19 + f007 FR-10 doc text revised in place
- [x] changelog note + Docs impact flagged

## Success Criteria

- All three static/test gates clean.
- Every measured value within tolerance of MoMorph ground truth (numbers in the report, not "looks right").
- Docs reflect revised FR-19 / FR-10; no new F### entries created.

## Risk Assessment

| Risk | Likelihood | Impact | Countermove |
|------|-----------|--------|-------------|
| Cross-phase type/interaction break only visible in full suite | Med | High | This phase is the whole-repo gate; run before any merge |
| Re-eyeballing instead of measuring | Med | High | Mandatory measured-value capture in report (explicit in steps) |
| Doc drift (new entry vs in-place edit) | Low | Med | Edit existing FR text only; ids unchanged |

## Security Considerations

None new. Confirm no HTML persistence introduced by FR-24 (only `textContent` stored — verify).

## Next Steps

Rollback: each phase is an isolated commit on disjoint files → revert the offending phase's commit
without disturbing the others. On green + measured, plan status → completed.
</content>
