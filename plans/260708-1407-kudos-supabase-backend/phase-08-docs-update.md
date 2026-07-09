# Phase 08 — Docs Update

## Context Links
- Depends on: Phase 07 (final code + green suite).
- Docs: `docs/system/architecture.md`, `docs/project-changelog.md`,
  `docs/features/f006-*/`, `f007-*/`, `f008-*/feature.md`.

## Overview
- **Priority:** P3
- **Status:** pending
- **Description:** Record the mock→Supabase pivot across the living docs so
  the "no backend" statements no longer contradict the shipped code.

## Requirements
- `docs/system/architecture.md`: add a "Kudos data layer" subsection — three
  tables, RLS summary, repository branch (`isSupabaseConfigured` → mock vs
  Postgres), Server Actions, and the authless-e2e mock-fallback rationale.
  Update the "Câu hỏi mở" and the F006/F007 kudos descriptions (currently say
  "session-scoped, không có backend/storage thật").
- `docs/project-changelog.md`: entry for the pivot (date 2026-07-08, scope,
  supersedes prior no-backend decisions).
- `docs/features/f006/f007/f008/feature.md`: append a note that persistence
  moved to Supabase Postgres (link this plan) — do not rewrite wholesale;
  flag the superseded "session-only" lines.
- `supabase/README.md`: how to apply `schema.sql`/`seed.sql` (from Phase 01).

## Related Code Files
- **Modify:** `docs/system/architecture.md`, `docs/project-changelog.md`,
  `docs/features/f006-*/feature.md`, `f007-*/feature.md`, `f008-*/feature.md`.
- **Verify present:** `supabase/README.md` (Phase 01), this plan's
  `clarifications.md`.

## Implementation Steps
1. Draft the architecture "Kudos data layer" subsection (vi, matching doc lang).
2. Add changelog entry.
3. Append supersede notes to the three feature.md files.
4. Cross-check links/dates.

## Todo List
- [ ] architecture.md data-layer subsection + fix stale "no backend" prose
- [ ] changelog entry
- [ ] f006/f007/f008 supersede notes
- [ ] verify supabase/README.md + clarifications.md linked

## Success Criteria
- No doc still claims Kudos is backend-less without a supersede pointer.
- A new reader can trace: pivot decision → schema → data layer → tests.

## Risk Assessment
- **[Low] Doc drift** — the f008 clarifications already flagged prior
  doc/code drift; keep feature.md as source-of-truth-for-shipped and link,
  don't silently rewrite history.

## Next Steps
Consider handing to `doc-writer` agent per primary-workflow Step 4.
