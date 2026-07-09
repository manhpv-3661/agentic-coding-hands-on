# Phase 02 — Awards Data Layer + /awards Page

## Context Links
- Pattern to mirror: `lib/kudos/kudos-repository.ts` (guard-clause fallback), `app/kudos/page.tsx` (server fetch → props)
- Research: R3 (award field shapes, 3-file split, icon/color are shared not per-record), R2 (triplication + priority ranking)
- Depends on: phase-01 (`award_categories` table + seed)

## Overview
- **Priority:** P1 · **Status:** pending
- **Description:** Create an award-categories repository reading `award_categories` from Postgres (fallback to a static list), and rewire the `/awards` detail page to consume it. Join DB structural/numeric data with the i18n dict (by slug) at render.

## Key Insights
- `awards-catalog.tsx` is `"use client"` → the server page `app/awards/page.tsx` must fetch and pass props (same as Kudos).
- Icons (`Icon-Target/Diamond/License.svg`) and gold color `#FFEA9E` are SHARED across all cards, NOT per-category (R3) → stay hardcoded UI chrome, no DB column.
- `imageSide` is `index % 2` (R3) → stays computed, not stored.
- Award **prose stays in the dict** keyed by slug; the repo supplies slug + numbers + thumbnail + order. Render merges the two.
- `award-detail-data.ts`'s `STATIC_ENTRY_META` (index-aligned) and the numeric data smuggled into the dict `detail.entries.*` are what this phase replaces as the *source*; the dict retains only the localized strings.

## Requirements
Functional:
- `getAwardCategories()` returns ordered category structural records (slug, sort_order, thumbnail_src, quantity_number, value amounts). Postgres when configured; static fallback list (verbatim current 6) otherwise.
- `/awards` detail page renders identically to today (numbers formatted via `Intl.NumberFormat("vi"/"en", { style:"currency", currency:"VND" })` → matches current "7.000.000 VNĐ" / "7,000,000 VND").
- The dual-value outlier (signature-2025-creator) rendered from `individual_amount_vnd` / `collective_amount_vnd`.

Non-functional:
- Repo never throws; Supabase error → console.error + fallback (mirror `kudos-repository.ts:57-60`).
- Server-only import guard comment (like `kudos-repository.ts:1-3`).

## Architecture
```
app/awards/page.tsx (server)
  ├─ getAwardCategories()            → award_categories rows (or fallback)
  ├─ getDictionary(locale)           → localized titles/descriptions/units (unchanged path)
  └─ merge by slug → props → awards-catalog.tsx ("use client") → award-detail-card.tsx
```
- Merge helper maps `{ dbRow, dictEntry }` per slug into the existing `award-detail-*` view-model so `award-detail-card.tsx` / `award-value-section.tsx` stay unchanged in shape.
- A slug present in DB but missing from the dict (or vice-versa) → skip + console.warn (don't crash render).

## Related Code Files (OWNERSHIP: phase-02 only)
- Create: `lib/awards/award-categories-repository.ts` (server-only; `getAwardCategories()`)
- Create: `lib/awards/award-categories-fallback.ts` (static 6-row list = current values, used in unconfigured/error mode) — OR co-locate in the existing `lib/awards/award-categories.ts`
- Modify: `lib/awards/award-categories.ts` (keep slug list or re-point; avoid duplicate source)
- Modify: `app/awards/page.tsx` (fetch + merge + pass props)
- Modify: `app/components/awards/award-detail-data.ts` (consume merged data instead of `STATIC_ENTRY_META`; keep dict-key mapping)
- Modify (if needed): `app/components/awards/award-detail-card.tsx`, `award-value-section.tsx` (render numeric amounts via Intl; only if the value string shape changes)
- Create: `lib/awards/format-prize-amount.ts` (Intl VND formatter, locale-aware) — DRY, reused by phase-04 grid
- **NOT** touched here: `app/page.tsx`, `app/components/home/*` (phase-04 owns homepage grid rewiring)

## Implementation Steps
1. Create `award-categories-repository.ts`: `isSupabaseConfigured()` guard → fallback list; else `createClient()`, `select(...).order("sort_order")`; on `error||!data` → console.error + fallback.
2. Create `format-prize-amount.ts`: `formatVnd(amount, locale)` via `Intl.NumberFormat`. Verify output matches current dict strings for both locales.
3. Rewire `award-detail-data.ts` to build entries from `getAwardCategories()` + dict, keyed by slug (drop `STATIC_ENTRY_META` as the source of numbers/thumbnails; keep dict-key map).
4. Update `app/awards/page.tsx` to fetch, merge, pass props.
5. Render numeric amounts through `formatVnd`; wire signature dual-value from the two int columns.
6. Compile check (`tsc`/build); confirm `/awards` renders unchanged in unconfigured mode.

## Todo List
- [ ] award-categories-repository.ts with fallback branch
- [ ] format-prize-amount.ts (Intl VND, both locales, matches current strings)
- [ ] Rewire award-detail-data.ts to merged source (drop STATIC_ENTRY_META numbers/thumbnails)
- [ ] app/awards/page.tsx fetch + merge + props
- [ ] Signature dual-value from individual/collective int columns
- [ ] Compile + visual parity check (unconfigured mode)

## Success Criteria
- `/awards` visually identical at 1440/1280/768/375 in unconfigured mode (mock fallback) — `e2e/layout-contract.spec.ts` unchanged and green.
- With Supabase configured + seeded, the 6 cards render from DB rows; editing a seed amount changes the page after `revalidate`.
- No award numbers remain in component TS literals (they come from DB/fallback); localized labels still from dict.
- `tsc` clean.

## Risk Assessment
- **Intl output ≠ current strings (High/Med):** "7.000.000 VNĐ" vs Intl default. Mitigation: unit-verify formatter against current dict values per locale; adjust `Intl` options (or a thin custom formatter) until byte-match. Rollback: revert to dict string temporarily.
- **Slug mismatch DB↔dict (Med/Med):** dropped card. Mitigation: skip+warn, and a dev-time assertion that DB slugs ⊆ dict keys.
- **Two title variants (Low/known):** short vs long "MVP" — both remain in dict; no DB decision forced. Carried as unresolved Q3.

## Security Considerations
- Read-only, anon-readable (page renders pre-login). No auth logic changes.

## Next Steps
- Exposes `getAwardCategories()` + `formatVnd()` for phase-04 homepage grid (removes the triplicated `AWARDS` array).
