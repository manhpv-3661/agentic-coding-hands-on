# Phase 00 — Shared primitives foundation

## Context Links
- Plan: [plan.md](plan.md)
- Rules: `.claude/rules/development-rules.md` (KISS/DRY/YAGNI, <200 lines)
- Layout OFF-LIMITS: `.claude/rules/momorph/momorph-layout-system.md`

## Overview
- **Priority:** P1 (blocks 02/03/04)
- **Status:** done
- **Description:** Create the minimal set of shared primitives that the per-directory phases consume, so cross-cutting duplication is removed once, in one owned location. Scope is deliberately tight (YAGNI): only primitives with proven duplication across MORE THAN ONE in-scope directory.

## Key Insights
- **Gold-glow magic string** `0 4px 4px 0 rgba(0,0,0,0.25), 0 0 6px 0 #FAE287` (+ textShadow variant) is hand-copied **6×** across `home/` (nav-link:42, site-footer:45, widget-button:161, award-card:84) and `awards/` (awards-nav-menu:78, award-detail-card:80). Single source of truth needed.
- **`cn()` className-merge idiom** is hand-rolled (`` `${x} ${className ?? ""}` ``) in ~10+ files across all dirs. No shared helper exists. A one-line `cn()` removes the idiom repo-wide and is behavior-identical (string concat).
- Icons that duplicate **only within one directory** are NOT handled here (handled in that dir's phase) — avoids ownership conflict and over-reach.

## Requirements
- Functional: shared helpers produce byte-identical output to the inline code they replace. No behavior change.
- Non-functional: files <200 lines; each new util has unit tests.

## Architecture
Data flow: consuming components import primitive → primitive returns a string (className or style value) → identical render.
- `lib/ui/cn.ts` — `cn(...parts: Array<string | false | null | undefined>): string` — filters falsy, joins with space. (Do NOT pull in `clsx`/`tailwind-merge` — YAGNI; a 3-line join matches current behavior exactly.)
- `lib/ui/gold-glow.ts` — exports `GOLD_GLOW_BOX_SHADOW` and `GOLD_GLOW_TEXT_SHADOW` string constants matching the exact current literals.

## Related Code Files
**Create:**
- `lib/ui/cn.ts`
- `lib/ui/gold-glow.ts`
- `lib/ui/cn.test.ts`
- `lib/ui/gold-glow.test.ts`

**Modify:** none (consumers repoint in their own phases).
**Delete:** none.

## Implementation Steps
1. Create `lib/ui/cn.ts` with the join-filter helper. Match the two existing shapes: `cn(base, className)` and `cn(base, cond && x)`.
2. Create `lib/ui/gold-glow.ts` with the two constants. Copy the exact literal strings verbatim from `home/nav-link.tsx:42` (textShadow) and `home/widget-button.tsx:161` (boxShadow) — do not "clean up" the values.
3. Add `cn.test.ts`: falsy filtering, single arg, no args → "", multiple truthy join, whitespace correctness.
4. Add `gold-glow.test.ts`: assert constants equal the known literal strings (guards against accidental drift).
5. Run `npm run lint && npm run test && npm run build`.

## Todo List
- [x] `lib/ui/cn.ts`
- [x] `lib/ui/gold-glow.ts`
- [x] `lib/ui/cn.test.ts`
- [x] `lib/ui/gold-glow.test.ts`
- [x] lint + test + build green

## Success Criteria
- New utils exist with passing unit tests.
- Build & existing suite unaffected (no consumer changed yet).
- `cn("a", false, "b") === "a b"` and constants match literals exactly.

## Risk Assessment
| Risk | Likelihood | Impact | Countermeasure |
|------|-----------|--------|----------------|
| `cn` output differs subtly (extra/leading space) from inline `${x} ${y??""}` | Med | Med (could shift Tailwind class order but not semantics) | Unit test exact strings; consumers verified per-phase against snapshot/test |
| gold-glow literal transcription error | Low | Med (visual drift) | Test asserts against copied literal; diff-review the copy |
| Scope creep into a full design-token system | Med | Med | HARD LIMIT: only cn + gold-glow this phase. Nothing else. |

## Security Considerations
None — pure presentational string utils, no user input, no I/O.

## Next Steps
Unblocks phases 01–04. They import these utils; they do NOT edit `lib/ui/*`.

## Consolidated unresolved questions (whole plan)
1. `awards-hero.tsx` top offset conflict (80 vs 184) — which is the design-correct value? (layout track owner)
2. `awards/page.tsx` missing eyebrow/heading — intentional removal or regression? (feature owner)
3. Adopt `cn()` everywhere now, or only at duplicate sites? Recommendation: only where the hand-rolled idiom already exists (no green-field churn).
4. Should `montserrat.variable`/`.className` per-component re-application be removed? It relies on ancestor always providing it — verify before removing; otherwise leave (flagged in 03/04).
