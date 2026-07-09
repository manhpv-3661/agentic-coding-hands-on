# Phase 03 — Awards components dedup (group c)

## Context Links
- Plan: [plan.md](plan.md) · Foundation: [phase-00](phase-00-shared-primitives-foundation.md)
- Specs: f004-awards-information (behavior unchanged)

## Overview
- **Priority:** P2 · **Status:** done · **Depends on:** 00
- **Description:** Kill the type re-export hop, collapse the 3× value-block render, dedup the per-slug meta map & gold-glow — inside `app/components/awards/` only.

## Key Insights

### Dead / redundant
- `award-detail-card.tsx:71` re-applies `${montserrat.variable}` per card (×6) though ancestor `app/awards/page.tsx:77` already applies it. **Verify ancestor always provides it**, then drop. (Same app-wide pattern; only awards handled here.)
- Re-export hop: `award-detail-card.tsx:10` re-exports `AwardValueVariant`/`AwardMetric`/`AwardDetailEntry` from `award-detail-types.ts` so `award-detail-data.ts:5`, `awards-catalog.tsx:6`, `award-value-section.tsx:1` import "via the card." → repoint those 3 to import `./award-detail-types` directly; delete the re-export block.

### Duplication
- **Value-row markup 3× in `award-value-section.tsx`**: `ValueVariantBlock` (34-53, used 2×) + fallback branch (87-106) render the same icon+label+number+unit. Collapse to ONE internal block component. **Behavior note:** fallback has a `unit &&` empty-guard that `ValueVariantBlock` lacks — unifying could newly hide/show an empty `<p>`. Preserve current behavior: pass the guard as a prop so each call site keeps today's output exactly.
- **Per-slug meta map duplicated**: `award-detail-data.ts:25-35` `CATEGORY_META` vs `home/awards-section.tsx:32-39` `AWARD_CARD_META` — same 6 slugs, same hardcoded titles. Plus duplicated **skip-and-warn guard** (`award-detail-data.ts:68-73` vs `home/awards-section.tsx:61-66`). → extract shared `lib/awards/award-category-meta.ts` (title map + `resolveAwardCategoryMeta(slug, meta)` guard helper). **Cross-dir:** awards-section.tsx (home) also consumes it — but home's edit is done in **phase 04** (it only IMPORTS the new lib file; the lib file is CREATED here). Coordinate: phase 03 creates lib file + repoints awards/; phase 04 repoints home/. No shared write.
- **Gold-glow literal** in `award-detail-card.tsx:80` & `awards-nav-menu.tsx:78` → use `GOLD_GLOW_*` from phase-00.

### Keep-as-is
- `award-detail-card.tsx` vs `home/award-card.tsx` — NOT duplicated (different layouts; prior merge investigation documented "keep separate"). No action.
- `award-detail-types.ts` — do NOT inline into card (would push card ~225 lines); just fix import paths.
- `award-value-section.tsx` — 1:1 coupling with card is fine structurally.

## Requirements
- No behavior change; awards catalog, nav, detail cards, value numbers render identically.
- Shared meta lib must yield the exact same titles currently hardcoded in both maps (verify string-for-string, incl. `"MVP (Most Valuable Person)"`).

## Architecture
Type flow simplified: `award-detail-types.ts` imported directly by its 4 consumers (no card hop). New `lib/awards/award-category-meta.ts` becomes single source of per-slug display meta, consumed by `award-detail-data.ts` (here) and `home/awards-section.tsx` (phase 04).

## Related Code Files
**Modify:** award-detail-card.tsx, award-detail-data.ts, awards-catalog.tsx, award-value-section.tsx, awards-nav-menu.tsx.
**Create:** `lib/awards/award-category-meta.ts`.
**Delete:** none.
**Do NOT touch:** `awards-hero.tsx` (layout offset bug → out of scope, separate track).

## Implementation Steps
1. Create `lib/awards/award-category-meta.ts`: title map (verbatim titles) + `resolveAwardCategoryMeta` guard helper.
2. Repoint `award-detail-data.ts` to the shared meta + guard; remove local `CATEGORY_META` + inline guard.
3. Delete re-export block in `award-detail-card.tsx:10`; repoint the 3 importers to `./award-detail-types`.
4. Collapse `award-value-section.tsx` 3 render sites to one guarded block component.
5. Adopt `GOLD_GLOW_*` in card + nav-menu.
6. Verify ancestor font var; if confirmed, drop redundant `montserrat.variable` on card root.
7. `npm run lint && npm run test && npm run build`.

## Todo List
- [x] shared meta lib created (titles verbatim)
- [x] award-detail-data uses shared meta+guard
- [x] re-export hop removed, imports repointed
- [x] value-block collapsed with guard prop
- [x] gold-glow constant adopted
- [x] redundant font var dropped (if ancestor confirmed)
- [x] tests + lint + build green

## Success Criteria
- `award-detail-card.test.tsx`, `awards-catalog.test.tsx`, `awards-hero.test.tsx`, `awards-nav-menu.test.tsx` pass unchanged.
- Awards page renders identical titles/values/icons; nav gold-glow identical.

## Tests (add/update)
- **New:** `lib/awards/award-category-meta.test.ts` — every slug resolves to the exact prior title; unknown slug → guard returns skip/undefined + warns (match old console.warn behavior).
- **Update:** any awards test asserting titles — should still pass (titles unchanged); if a test imported types via the card re-export, repoint the import.
- Value-block: add a case where `suffix`/`unit` is empty to lock the guard behavior.

## Risk Assessment
| Risk | L | I | Countermeasure |
|------|---|---|----------------|
| Shared meta title drifts from one of the two originals | Med | High (wrong award title) | Copy titles verbatim; test asserts each; diff both old maps first |
| Value-block guard unified wrongly → empty `<p>` appears/disappears | Med | Med | Guard passed per call site; empty-value test |
| Dropping font var changes rendered font (ancestor doesn't cover a case) | Med | Med | Verify ancestor coverage before removing; else keep |
| home (phase 04) not yet repointed → two meta sources temporarily | High | Low | Acceptable interim; lib is additive; phase 04 finishes migration |

## Security Considerations
None — presentational/data-shaping only; no change to DB repository or dictionary lookups.

## Next Steps
Blocks phase 05 (awards/page.tsx). Signals phase 04 that `lib/awards/award-category-meta.ts` is ready to consume.
