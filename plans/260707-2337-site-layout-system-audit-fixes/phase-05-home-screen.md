# Phase 05 — Home Screen (verify-only unless drift)

**Priority:** P2 · **Status:** pending · **Effort:** 2h · **Depends on:** P3 · **Parallel-safe with:** P4,P6,P7

## Context Links
- Report: `research/researcher-02-home-contract.md` (live MoMorph, MCP reachable)
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
- Files: `app/page.tsx`, `app/components/home/{hero-section,awards-section,sun-kudos-section,root-further-content}.tsx`
  (site-header/footer owned by P3 — do NOT edit here)

## Overview
**Home has NO numeric mismatch** — the researcher confirmed every gutter, max-width, section
padding/gap, and sampled typography matches ground truth (prior commits `ce016b0`/`266c38e`/`a6414a3`
already drove it there). This phase is **verify-only**: re-measure under the P2/P3-corrected
primitives (which for home change nothing) and confirm no regression. Edit ONLY on confirmed drift.

## Numeric Contract (live MoMorph — native frame is 1512px, sole real target)
| section | node | w×h | gutter | max-width | padding | gap | key typography |
|---|---|---|---|---|---|---|---|
| site-header (P3) | 2167:9091 | 1512×80 | 144 | n/a | 12/12 | row 238 | — |
| Hero card | 2167:9031 | 1224×596 | 144 (inherited) | **1224** | 0/0 | 40 | — |
| Root-further | 3204:10152 | 1152×1219 | eff.180 | **1152** | 120/120 | 32 | body 24/32/700, quote 20/32/700 |
| Awards | 2167:9068 | 1224×1353 | 144 | **1224** | 0/0 | 80 | caption 24/32/700, heading 57/64/-0.25/700 |
| Award grid | 5005:14974 | 1224×1144, 336 cards | — | — | — | **h 108 (measured), v 80** | — |
| Sun-kudos | 3390:10349 | 1224 outer / **1120** card | 144/eff.196 | 1224/1120 | 0/0 | — | eyebrow 24/32/700, title 57/64/-0.25/700, body 16/24/700 |
| Bìa (vertical rhythm owner) | 2167:9030 | 1512×4220 | 144 | — | 96/96 | **120** | section-to-section rhythm |

1440/1280/768/375 are **NOT in design** (only the 1512 frame exists) → P8 asserts invariants at
those widths, not fabricated numbers.

## Confirmed CORRECT — do NOT "fix" (classified §5)
1. **Three-tier content width is legitimate:** 1224 (hero/awards/kudos-outer), 1152 (root-further),
   1120 (kudos inner card) — exactly the three values in `CONTENT_WIDTH_CLASS`. Keep all three.
2. **Sun-kudos nested `ContentFrame(1224)→(1120)` is correct**, not double-padding — mirrors the
   real two-level Figma structure (196px offset verified). Keep.
3. **Gutter 144** confirmed 3× (header, Bìa, children). Matches `lg:px-36`.
4. **Vertical rhythm 120px** owned by `<main lg:gap-[120px] lg:py-24>` — matches Bìa exactly.
5. **Award grid trap:** raw `styles.gap=80` but `justify-content:space-between` → effective 108px.
   Code already uses 108. Do NOT "correct" 108→80 trusting the raw field.

## Implementation Steps
1. Playwright-measure home at 1512 (and invariants at 1440/1280/768/375) after P2/P3.
2. If any value drifted from the table (e.g. P2 accidentally changed a shared width) → fix that
   section only; otherwise no code change.
3. Home tests + `e2e/homepage-content.spec.ts` stay green.

## Todo List
- [ ] Re-measured post-P2/P3, matches table
- [ ] Three-tier widths intact
- [ ] Nested ContentFrame intact
- [ ] Award-grid 108px gap intact
- [ ] Tests green

## Success Criteria
- No regression from ground truth; P8 home assertions pass. Zero edits unless drift is measured.

## Risk Assessment
- Main risk is a P2 primitive change accidentally shifting home's 1224/1152/1120 → P2 must NOT
  change primitive values (see P2), only application on login/awards.

## Next Steps
Feeds P8 home assertions.
