# Phase 01 — Schema Additions + Seed SQL

## Context Links
- Existing schema/style to mirror: `supabase/schema.sql` (table comments explaining WHY, RLS, indexes)
- Run convention: `supabase/README.md` (run ONCE via Dashboard SQL editor + verification checklist)
- Research: R1 (schema/RLS/aggregate reality), R2 (award triplication, event date drift), R3 (award field shapes verbatim)

## Overview
- **Priority:** P1 (blocks P2/P3/P4)
- **Status:** pending
- **Description:** Add read-only content tables (`award_categories`, `event_settings`, `kudos_gifts`) plus a seed file, in the exact style of `supabase/schema.sql`. Additive DDL only — no changes to the 3 existing Kudos tables, no data backfill (schema not yet run in prod).

## Key Insights
- Nearly all *prose* lives in the i18n dict and stays there (i18n out of scope). These tables hold **locale-agnostic data only**: slugs, thumbnail paths, numeric amounts, ordering, timestamps, venue/name.
- Award numeric amounts are currently pre-formatted strings in the dict (`"7.000.000 VNĐ"`, R3 `en.ts:143-176`). Store as **integer VND**; format at render via `Intl.NumberFormat`. Kills the vi/en number-format duplication.
- Award data is triplicated across 3 files with proven drift (R2: MVP short vs long title). One table becomes the single structural source.
- Aggregate philosophy already set by `schema.sql:11-14`: prefer live `COUNT()` over trigger counters/materialized views at this scale → **no materialized view** (YAGNI). Phase-03 uses live queries; this phase only seeds the non-computable *content* (gift list).

## Requirements
Functional:
- `award_categories`: one row per current category (6), single structural source for `/awards` + homepage grid.
- `event_settings`: singleton row — `event_name`, `venue_name` (locale-agnostic facts). NO `starts_at` column (single timestamp source stays the env var — see phase-04 + R4).
- `kudos_gifts`: seeded top-10 gift list content (no organic source; verbatim mock).
- Seed every table with the CURRENT real values (no invented data).

Non-functional:
- RLS: public read (anon + authenticated), NO insert/update/delete policy (read-only content; edits via SQL editor).
- Style parity with `schema.sql` (comment WHY, `create table if not exists`, indexes where a query needs them).

## Architecture
Data flow: SQL editor (human) → Postgres tables → repositories (P2/P3/P4) read → components render.

### Table: `award_categories`
```
slug text primary key                     -- URL slug, matches lib/awards/award-categories.ts (top-talent, ...)
sort_order smallint not null              -- display order (replaces index coupling, R2/R3)
thumbnail_src text not null               -- /awards-saa/thumbnails/<slug>.png
quantity_number smallint not null         -- prize count (was string "10"/"02"/... R3)
value_amount_vnd integer                  -- prize VND as int (nullable for the dual-value outlier)
individual_amount_vnd integer             -- signature-2025-creator only (else null)
collective_amount_vnd integer             -- signature-2025-creator only (else null)
```
- Localized `short_title`, `long_title`, `quantity_unit`, `value_unit`, `*_suffix`, `short_description`,
  `long_description` are DELIBERATELY NOT columns — they stay in the i18n dict, joined by `slug`
  at render (i18n out of scope). Document this in the table comment.
- No index needed beyond the PK at 6 rows.

### Table: `event_settings`
```
id smallint primary key default 1 check (id = 1)   -- singleton guard
event_name text not null                           -- "Sun* Annual Awards 2025"
venue_name text not null                           -- "Âu Cơ Art Center" (was hardcoded, event-info.tsx:48)
```

### Table: `kudos_gifts`
```
id uuid primary key default gen_random_uuid()
sort_order smallint not null            -- top-10 order
recipient_name text not null            -- "Huỳnh Dương Xuân"
gift_text text not null                 -- "Nhận được 1 áo phông SAA"
```
- Index `kudos_gifts (sort_order)` for ordered read.

### RLS (all three tables, identical shape)
```sql
alter table public.<t> enable row level security;
create policy "<t>_select_all" on public.<t> for select to anon, authenticated using (true);
-- NO insert/update/delete policy: read-only content, edited via SQL editor.
```
Note: read tables are `select` to **anon AND authenticated** (unlike Kudos which is authenticated-only), because awards/homepage render pre-login.

## Related Code Files
- Modify: `supabase/schema.sql` (append 3 tables + RLS + indexes, same section headers)
- Create: `supabase/seed.sql` (seed rows for all 3; "run once after schema.sql" header like README convention)
- Modify: `supabase/README.md` (add the 3 tables + seed step to the run + verification checklist)

## Implementation Steps
1. Append `award_categories`, `event_settings`, `kudos_gifts` to `schema.sql` under a new
   `-- Content tables (awards / event / kudos gifts)` section, each with a WHY comment.
2. Add RLS blocks (public-read, no write) for the 3 tables in the RLS section.
3. Add the `kudos_gifts (sort_order)` index.
4. Create `supabase/seed.sql`: insert 6 award rows (values verbatim from R3 —
   amounts as ints: topTalent 7000000/qty 10, topProject 15000000/qty 2, topProjectLeader
   7000000/qty 3, bestManager 10000000/qty 1, signatureCreator individual 5000000 +
   collective 8000000/qty 1, mvp 15000000/qty 1); 1 event_settings row; 10 kudos_gifts rows
   (all `"Huỳnh Dương Xuân"` / `"Nhận được 1 áo phông SAA"`, sort_order 1–10, per R1).
   Use `on conflict do nothing` so re-runs are idempotent.
5. Update `README.md` run steps + verification `select count(*)` checks.

## Todo List
- [ ] Append 3 tables to schema.sql (with WHY comments)
- [ ] Add public-read RLS (anon+authenticated), no write policy
- [ ] Add kudos_gifts sort_order index
- [ ] Create seed.sql with verbatim current values, idempotent inserts
- [ ] Update README run + verification checklist
- [ ] Verify SQL parses (paste into a scratch Postgres / Supabase linter if available)

## Success Criteria
- Schema + seed apply cleanly on a fresh Postgres with the existing Kudos schema present.
- `select count(*)` = 6 award rows, 1 event row, 10 gift rows.
- No changes to the 3 existing Kudos tables; existing Kudos policies untouched.
- Every seeded value traceable to a researcher file:line (no invented data).

## Risk Assessment
- **RLS too open (High impact / Low likelihood):** write policy accidentally added → content editable by anon. Mitigation: assert NO insert/update/delete policy exists; verification step greps the file. Rollback: `drop policy` / tables are additive, `drop table` reverts with no dependents until P2–P4 wire them.
- **anon read on award/event tables (Medium/Med):** these render pre-login so anon SELECT is required; confirm no sensitive columns (none — all public marketing data).
- **Seed drift from source (Med/Low):** amounts mis-transcribed. Mitigation: cross-check each against R3 table before commit.

## Security Considerations
- Read-only by RLS; no PII (award/event/gift content is public marketing data).
- `event_settings` singleton `check (id = 1)` prevents accidental multi-row ambiguity.

## Next Steps
- Unblocks P2 (awards repo), P3 (gift-list read), P4 (event repo). Hand table names/columns forward.
