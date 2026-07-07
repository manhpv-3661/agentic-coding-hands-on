# Phase 07 — Kudos + Spotlight Screen

**Priority:** P1 · **Status:** pending · **Effort:** 5h · **Depends on:** P3 · **Parallel-safe with:** P4,P5,P6

## Context Links
- Report: `research/researcher-04-kudos-spotlight-contract.md` (live MoMorph, MCP reachable)
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
- Files: `app/components/kudos/{kudos-board,spotlight-collage-backdrop,spotlight-name-cloud,highlight-kudos-carousel}.tsx`,
  `lib/kudos/{kudos-spotlight-data,spotlight-name-cloud-slots}.ts`, `public/kudos/spotlight-crop.png`

## Overview
Page-level gutter/max-width is **already correct** (kudos-board uses `PageGutter`+`ContentFrame 1152`
= design 144/1152). The real defect is the **Spotlight backdrop asset**: `spotlight-crop.png`
(1205×596) is a manually-screenshotted flattened bitmap with names/UI **baked in**, placed UNDER
the correct DOM name-cloud → **names render twice**, and baked interactive content violates the
asset rule.

## Numeric Contract (live MoMorph — 1440-only; Spotlight is a SECTION, not a separate screen)
| element | node | w×h | gutter | max-width | notes |
|---|---|---|---|---|---|
| Live-board frame | MaZUn5xHXZ | 1440×5862 | 144 | 1152 | section bg flat navy `rgba(0,16,26,1)` |
| Header row | 2940:13476 | — | 144 | 1152 | padding `0 144` |
| Spotlight board | 2940:14174 | 1157×548 | (in 1152 col) | 1152 | border 1px `#998C5F`, radius 47.14px, x142→1299 (border overhang, not a gutter divergence) |

**Verdict:** gutter **144**, max-width **1152** — no mismatch. There is **no separate Spotlight
screenId**; it is section `B.7_Spotlight` inside `MaZUn5xHXZ`. 1280/768/375 not in design.

## Spotlight background layer stack (bottom→top, from live design)
1. `image 24` (1098×617, plain) — decorative
2. `image 25` (1100×618, `background-blend-mode: screen`, real photo/texture) — decorative
3. `Root further mo rong 1` (1819×618, oversized, 70%-black gradient + photo) — decorative, feeds Pan/Zoom expand
4. **~120 individual TEXT nodes** (name-cloud) + counter + search + Pan/Zoom button + ticker — **real DOM/text, interactive (hover tooltip, click-to-open)**

## Mismatches to fix (classified §5)
1. **Wrong image crop (CONFIRMED defect):** `spotlight-collage-backdrop.tsx` uses
   `public/kudos/spotlight-crop.png` — a flattened screenshot (aspect 2.022 matches NO single design
   layer) with names/UI baked in, under the DOM name-cloud → duplicate names + baked interactive
   content. Must become **decorative-only** background.
2. **Correct already — keep:** `spotlight-name-cloud.tsx` + `lib/kudos/spotlight-name-cloud-slots.ts`
   render the ~120 names as real interactive DOM (matches design). Do NOT change the DOM layer.
3. **No gutter/max-width mismatch:** `kudos-board.tsx` is correct — verify-only.
4. **Board 1157 vs 1152:** 1px border overhang, not a mismatch — leave.

## BLOCKER (must resolve before ideal fix)
Clean decorative background layers (`image 24`/`image 25`/`Root further`) cannot be re-exported —
`get_figma_image`/`get_media_file` return **500/401** (credential gap, not a code issue). Ideal fix
(swap crop → clean decorative export) is BLOCKED on that auth.

## Fix strategy (two-step: interim now, ideal on unblock)
- **Interim (this phase, unblocked):** stop the baked text from showing. Since names already exist
  as DOM, the backdrop only needs decorative texture. Either (a) push the crop far enough into the
  background that baked names are illegible (heavy blur + lower opacity + darken) so it reads as
  pure texture, or (b) replace the crop with the existing CSS gradient/radial layers already in
  `spotlight-collage-backdrop.tsx` and drop the bitmap entirely. Prefer (b) if it holds the
  wave/network feel — cleanest, removes the asset-rule violation outright (KISS).
- **Ideal (follow-up, after Figma export auth restored):** export `image 24`/`image 25`/`Root
  further` as clean decorative PNGs, compose them as the backdrop, remove `spotlight-crop.png`.
  Tracked as an open question in plan.md.

## Related Code Files
- Modify: `app/components/kudos/spotlight-collage-backdrop.tsx` (remove/neutralize baked-text crop).
- Verify-only: `kudos-board.tsx` (gutter/width correct), `spotlight-name-cloud.tsx`,
  `lib/kudos/spotlight-name-cloud-slots.ts` (DOM names correct), `highlight-kudos-carousel.tsx`.
- Asset: commit `public/kudos/spotlight-crop.png` first (rollback), then remove/replace per strategy.
- Tests: `kudos-board.test.tsx`, `spotlight-name-cloud.test.tsx` (WIP-modified) stay green.

## Implementation Steps
1. Commit current WIP incl. untracked crop + slots so rollback is possible (plan Assumption #1).
2. Neutralize baked text: apply strategy (b) if gradient backdrop holds the look; else (a).
3. Confirm names render exactly once (DOM only), interactive (hover/click) intact.
4. Verify board border/radius (1px `#998C5F`, r47.14) and 1152 column intact.
5. Lint/build; kudos tests + `e2e` green.

## Todo List
- [ ] WIP committed (crop tracked for rollback)
- [ ] Baked-text crop removed/neutralized → decorative-only
- [ ] Names render once (DOM), interactivity intact
- [ ] Board geometry + 1152 column verified
- [ ] Tests green
- [ ] Follow-up logged: clean decorative re-export once Figma auth fixed

## Success Criteria
- No baked names visible; name-cloud is single-source DOM; asset-rule satisfied. P8 asserts DOM
  name nodes present (>0) and no duplicate baked layer. Gutter 144 / max-width 1152 measured.

## Risk Assessment
- **Blocker (High):** clean re-export needs Figma auth. Mitigation: interim decorative-only fix
  ships now; ideal export is a follow-up, non-blocking for the asset-rule violation removal.
- Dropping the bitmap could flatten the wave/network feel → verify gradient reconstruction reads
  acceptably; if not, use interim (a) heavy-blur until clean export.

## Next Steps
Feeds P8 Spotlight DOM-text-present assertion.
