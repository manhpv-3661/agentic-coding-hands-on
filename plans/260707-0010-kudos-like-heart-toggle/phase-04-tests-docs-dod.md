# Phase 04 — Tests hardening + docs + DoD gate

## Context Links
- Plan: [plan.md](plan.md) · Depends on Phases 01, 02, 03
- Docs convention: `docs/features/f00X-*/feature.md` (single file, `lang: vi` frontmatter);
  see `docs/features/f007-kudos-compose-form/feature.md` for shape (Tổng quan / Yêu cầu
  chức năng / phi chức năng / Kiểm thử DoD / Ghi chú / Unresolved Questions).
- Docs mgmt: `.claude/rules/documentation-management.md` (changelog + roadmap updates).

## Overview
- **Priority:** P2
- **Status:** completed
- **Description:** Author the F008 feature spec, update changelog/roadmap, and run the full
  Definition-of-Done gate (vitest + tsc + eslint) matching F006/F007.

## Key Insights
- F008 is the next contiguous feature id (F001–F007 used; F008 free — confirmed).
- Feature docs are Vietnamese-first (`lang: vi`), FR-numbered, with a DoD section listing
  the exact commands. Mirror that, do not invent a new shape.
- No MoMorph screen/spec for this feature (pure follow-up) — note that in the spec like
  F007 did ("no test case uploaded → coverage derived from FRs").

## Requirements
- **FR-1:** `docs/features/f008-like-kudos/feature.md` exists, mirrors F007 structure,
  documents FRs (toggle, session-only, own-post-disabled, both variants, a11y contract).
- **FR-2:** Record the hearts-static decision + own-post assumption in the spec.
- **FR-3:** Changelog + roadmap updated per documentation-management.md.
- **FR-4:** Full DoD gate green.

## Architecture
- Docs only + verification. No source changes here (unless the gate surfaces a fix, which
  loops back to the owning phase's files).

## Related Code Files
- **Create:** `docs/features/f008-like-kudos/feature.md`
- **Modify:** `docs/project-changelog.md` (if present), `docs/development-roadmap.md`
  (if present) — check existence first; only update what exists.
- **Create/Delete:** none in source.

## Implementation Steps
1. Write `docs/features/f008-like-kudos/feature.md`:
   - Frontmatter: `feature: F008`, `name`, `lang: vi`, `status: active`, note "follow-up
     from F006/F007, no MoMorph spec".
   - §Tổng quan: static F006 heart → interactive toggle; where it renders.
   - §Yêu cầu chức năng: FR list — click like (+1 filled), click unlike (−1 outline),
     session-only (mất khi refresh), keyed by `CURRENT_USER`, both variants sync, own-post
     disabled, aria-pressed/aria-label contract, hearts base count static (display derived).
   - §Phi chức năng: no new deps, files <200 lines, i18n `card.like`/`card.unlike` vi+en.
   - §Kiểm thử (DoD): `npx vitest run` 100%, `tsc --noEmit` 0, eslint clean; list the
     covered components.
   - §Unresolved Questions: own-post rule = assumption (revertable).
2. Update changelog (add F008 entry) + roadmap progress if those docs exist.
3. Run the DoD gate (see below); fix + re-run until green.

## Todo List
- [x] Author `docs/features/f008-like-kudos/feature.md`
- [x] Update changelog / roadmap (only if files exist) — neither file exists in this repo (confirmed); skipped, consistent with F006/F007 not creating them either
- [x] `npx vitest run` → 100% green (426/426, 73 files)
- [x] `npm run build` (or `npx tsc --noEmit`) → 0 type errors
- [x] `npx eslint` on changed files → clean
- [x] Hand off to reviewer (`plans/reports/reviewer-260707-0052-f008-like-kudos-review.md`)

## Success Criteria (Definition of Done)
- `npx vitest run`: all green (new like tests + no regressions).
- `tsc --noEmit`: 0 errors (dictionary parity + card props typed).
- eslint: clean on all created/modified files.
- Spec doc present and matches F006/F007 convention.
- Manual smoke: like/unlike works in both carousel and feed; own post disabled; refresh
  resets.

## Risk Assessment
- **Low.** Docs + verification. If the gate fails, the fix belongs to the owning source
  phase (02/03), not here — loop back rather than patch blindly.

## Security Considerations
- None.

## Next Steps
- Reviewer pass, then journal entry (matches F005/F006/F007 delivery-session journals).
