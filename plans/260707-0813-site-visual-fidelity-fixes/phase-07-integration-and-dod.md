---
phase: 7
title: "Integration & full-site DoD"
track: —
status: pending
priority: P1
effort: 2h
depends_on: [1, 2, 3, 4, 5, 6]
parallel_safe_with: []
file_ownership:
  - docs/project-changelog.md
  - "any RE-VERIFY@P7 flow-driven height flagged by P3–P6 (in the owning phase's files)"
---

# Phase 7 — Integration & Full-Site DoD

## Context Links

- Method: `references/measurement-method.md`.
- Depends on P1–P6 all green. This is the single cross-screen gate (momorph two-track integration).

## Overview

- **Priority:** P1 — the observable "done" for the PO's complaint.
- With the global Montserrat font (P1) and real images (P2) active, re-verify every
  `RE-VERIFY@P7`-flagged flow-driven measurement across all screens, confirm cross-page chrome
  consistency, and run the full suite. No new features — verification + flagged-height closeout.

## Key Insights

- Track A phases (P3–P6) measured box-model conformance in parallel; only text-flow-driven heights
  needed the real font present. This phase closes exactly those, so parallel execution stayed safe.
- Chrome (P5) is the only cross-page shared surface — verify it renders identically on home, awards,
  and kudos now that all three page audits landed.

## Requirements

- Every `RE-VERIFY@P7` flag from P3–P6 resolved: re-measure the flow-driven height with Montserrat
  active; fix any Δ that reopened (edit occurs in the owning phase's file, coordinated single-writer
  since P3–P6 are complete).
- Cross-page chrome parity: header/footer identical on `/`, `/awards`, `/kudos`.
- Full `npx vitest run` green; `npx tsc --noEmit` clean; `npx eslint app` clean.
- `docs/project-changelog.md` entry (font wiring, image reversal, full-site pixel audit).

## Architecture

- No structural change. Verification + targeted closeout only. Data flows unchanged from P1–P6.

## Related Code Files

- **Modify:** `docs/project-changelog.md`; any flagged flow-driven-height files (in-place, owning
  phase's file, now single-writer).
- **Read for context:** every phase's diff outcomes, `references/measurement-method.md`.
- **Delete:** none.

## Implementation Steps

1. Collect all `RE-VERIFY@P7` flags from P3–P6.
2. Run the app with font + images active; re-measure each flagged element (method doc step 2).
3. Fix any reopened Δ; re-measure to Δ 0.
4. Cross-page chrome parity check on `/`, `/awards`, `/kudos`.
5. Full suite: `npx tsc --noEmit`, `npx eslint app`, `npx vitest run` — all green.
6. Changelog entry; assess docs impact (`Docs impact: [none|minor|major]`).

## Todo List

- [ ] all RE-VERIFY@P7 flags collected + resolved (Δ 0 under font)
- [ ] cross-page chrome parity confirmed
- [ ] `npx tsc --noEmit` clean
- [ ] `npx eslint app` clean
- [ ] full `npx vitest run` green
- [ ] changelog updated; docs impact stated

## Success Criteria (observable "done")

- `getComputedStyle(document.body).fontFamily` = Montserrat on every page; tab titles correct.
- Avatars + gallery show real photos across the board; initials only for anonymous/blank.
- Zero non-zero Δ remaining on any tracked node across home / awards / chrome / kudos (measured,
  not eyeballed).
- Full test suite green; no file > 200 lines; no new npm deps.

## Risk Assessment

| Risk | Likelihood | Impact | Countermove |
|------|-----------|--------|-------------|
| Font shifts reopen many flow-driven heights | Med | Med | P3–P6 pre-flagged them; scope is bounded to those flags |
| Merge friction integrating 6 parallel branches | Med | Med | Disjoint file ownership (plan map) makes merges conflict-free by construction |
| A late Δ fix reintroduces a test failure | Low | Med | Full suite is the gate; fix + re-run before close |

## Security Considerations

None — verification + docs only.

## Next Steps

On green: plan complete. Countdown font (Digital Numbers) and VN subset on Montserrat Alternates are
now IN SCOPE per P1 (user-confirmed against live MoMorph — no longer open questions). Optional
follow-up (out of scope): rename `app/fonts.ts` off `login/`.

## Rollback

Each phase is an independent, presentational commit on disjoint files — revert any single phase's
commit without cascading (font/images/per-screen audits are decoupled). P7 changes are verification
+ changelog only, trivially revertible.
</content>
