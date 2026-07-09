# Phase 03 — Awards banner overlay + responsive strip

**Priority:** P1 · **Status:** done · **Effort:** 3h · **Depends on:** P1 · **Parallel-safe with:** P2,P4,P5

## Context Links
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
- Files: `app/awards/page.tsx`, `app/components/awards/awards-hero.tsx`

## Numeric Contract (live MoMorph — 1440 only)
| element | box | notes |
|---|---|---|
| Header | 1440×80 | gutter 144 |
| Keyvisual "image 20" `2167:5138` | 0,80 → **1440×547** | crop pos `-0.163 -858.967`, scale `101.245% 367.889%` |
| Cover gradient `313:8439` | over keyvisual | `linear-gradient(0deg,#00101A -4.85%,rgba(0,19,32,0) 60.51%)` (already tuned) |
| KV logo "Bìa/KV" | `144,184 → 1152×150` INSIDE the 547 band | overlay |
| Gold title "Hệ thống…SAA 2025" | y≈519, own 703px zone | **BELOW hero — NOT overlaid** |

## Overview
`awards-hero.tsx` already overlays the KV logo (z-10 `ContentFrame`) on the keyvisual, but the
band uses responsive heights (`h-[280px] sm:h-[380px] lg:h-[547px]`) and `Image fill object-cover`
(approximate crop). Hardcode the band to exactly 1440×547 with the exact crop, keep the logo
overlay at 144,184, strip responsive across the awards component set. The gold heading in
`page.tsx` STAYS in normal flow below the hero (design places it in its own zone).

## Key Insights
- Uses the real asset `public/homepage-saa/Keyvisual-BG.png` → exact box + crop achievable
  (unlike login/kudos).
- KV logo overlay already exists and is correct in structure — the fix is exact band size +
  crop, not re-architecting the overlay.
- Do NOT overlay the gold title — verified it belongs below the 547 hero band.
- Responsive to strip: `awards-hero.tsx` (10), `page.tsx` `<main>` gaps + title-block ContentFrame
  gaps (5), `awards-catalog.tsx` (8), `award-detail-card.tsx` (4), `awards-nav-menu.tsx` (2).

## Requirements
- Keyvisual band exactly 1440×547 with the exact crop transform (`object-position`/scale).
- KV logo block absolutely positioned at 144,184 (1152×150) over the band.
- Gold heading remains in flow below the band.
- Zero responsive variants in the owned files.

## Architecture / Data Flow
`AwardsPage` → `SiteHeader` → `AwardsHero` (547px band: image → Cover gradient → KV logo overlay)
→ in-flow title section (`ContentFrame 1152`) → `AwardsCatalog` → `SunKudosSection` → `SiteFooter`.

## Related Code Files
- Modify: `awards-hero.tsx` (fixed 547 band + exact crop + strip responsive), `awards/page.tsx`
  (`<main>` `gap-16 py-12 sm:… lg:gap-[120px] lg:py-24` → desktop values; title ContentFrame
  `gap-10 lg:gap-[120px]` → `gap-[120px]`), `awards-catalog.tsx`, `award-detail-card.tsx`,
  `awards-nav-menu.tsx` (strip responsive).
- Do NOT edit: `sun-kudos-section.tsx` (P4-owned; rendered here only).

## Implementation Steps
1. `awards-hero.tsx`: replace `h-[280px] sm:h-[380px] lg:h-[547px]` (+ responsive `pt-*`) with a
   fixed `h-[547px]`; give the `Image` the exact crop (`object-position`/scale per contract) or a
   sized wrapper instead of bare `object-cover`; make the KV-logo `ContentFrame` an absolute
   overlay at top:184 within the band; strip logo responsive widths → `w-[338px]`.
2. `awards/page.tsx`: collapse `<main>` + title-block responsive gap/pad to desktop values. Leave
   the gold heading in flow (do NOT move into the hero band).
3. Strip responsive from `awards-catalog.tsx`, `award-detail-card.tsx`, `awards-nav-menu.tsx`.
4. Lint + build.

## Todo List
- [ ] Keyvisual band fixed 1440×547 + exact crop
- [ ] KV logo absolute-overlaid at 144,184 (1152×150)
- [ ] Gold heading kept in flow below hero
- [ ] Responsive stripped (hero, page, catalog, card, nav-menu)
- [ ] lint + build green

## Success Criteria
- Band measures ~1440×547; KV-logo rect ⊆ band rect; heading below band; no `sm:`/`lg:` remain.
- P6: header gutter 144, hero + title/catalog content 1152.

## Risk Assessment
- Exact crop scale (367.889% vertical) may over-zoom the asset → verify against ground truth; the
  band is decorative so minor crop drift is acceptable, box size is the hard contract.
- Awards footer wraps to 2 rows at 1440 (pre-existing, documented in old contract) — out of scope.

## Next Steps
Feeds P6 awards assertions.
