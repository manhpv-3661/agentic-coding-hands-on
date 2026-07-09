# Phase 05 — Docs Sync

## Context Links
- Rules: `.claude/rules/documentation-management.md` (changelog/architecture triggers)
- Reverses the note at `docs/project-changelog.md:76-77`
- Depends on: phase-02, phase-03, phase-04

## Overview
- **Priority:** P2 · **Status:** pending
- **Description:** Record the migration in the project docs: new content tables, the Kudos-aggregate reversal, the deferred-scope decisions, and the deliberate env-var-gating choice.

## Key Insights
- The 2026-07-08 changelog explicitly said decorative aggregates "stay mock" — P3 reverses that; the changelog must state the reversal and why (user decision #2), not silently contradict itself.
- The env-var-vs-DB gating decision (R4) is an architectural choice worth recording so it is not re-litigated.
- i18n-stays-dict and admin-CRUD-deferred are decisions to capture as scope notes.

## Requirements
- Update changelog, architecture, and affected feature docs. No code changes.

## Related Code Files (OWNERSHIP: phase-05 only — docs)
- Modify: `docs/project-changelog.md` (new dated entry)
- Modify: `docs/system/architecture.md` (content-tables + data-layer subsection)
- Modify: `docs/features/f002-*/feature.md`, `f004-*/feature.md` (award/event now DB-backed)
- Modify: `docs/features/f006-*/feature.md`, `f007-*/feature.md`, `f008-*/feature.md` (aggregate reversal note)
- Modify: `supabase/README.md` (already updated in P1; confirm consistency)

## Implementation Steps
1. Changelog entry (dated 2026-07-09): summarize the 3 new tables + seed, the repos added, the Kudos-aggregate reversal (explicitly superseding `:76-77`), and the scope deferrals (admin CRUD, i18n→DB).
2. Architecture: add a "Content tables (awards / event / kudos gifts)" subsection describing the read-only public-RLS tables + the `isSupabaseConfigured()` fallback extension across screens; record the env-var-gating decision (R4) and the i18n/DB boundary.
3. Feature docs: append notes (do not rewrite) flagging f002/f004 as DB-backed for structural/numeric data and f006/7/8 aggregates as now-real; note prose stays in dict.
4. Cross-check links/dates.

## Todo List
- [ ] Changelog entry (reversal explicitly noted)
- [ ] architecture.md content-tables + decisions subsection
- [ ] f002/f004 feature-doc notes
- [ ] f006/f007/f008 aggregate-reversal notes
- [ ] Link/date cross-check

## Success Criteria
- Changelog no longer self-contradicts (aggregate reversal stated).
- Architecture documents the new tables, the fallback pattern extension, and the env-var-gating + i18n-boundary decisions.
- Feature docs annotated (appended, not rewritten), matching the shipped code.

## Risk Assessment
- **Doc drift (Low/Med):** docs describe intended not shipped state. Mitigation: write P5 only after P2–P4 land; reflect actual table/column/function names.

## Security Considerations
- None (docs only). Do not document secrets or DB credentials.

## Next Steps
- Plan complete. Ready for `tkm:takumi` / implementer execution starting at phase-01.
