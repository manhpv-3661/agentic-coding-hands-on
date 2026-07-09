# Phase 05 — Kudos banner overlay + responsive strip

**Priority:** P1 · **Status:** done · **Effort:** 3h · **Depends on:** P1 · **Parallel-safe with:** P2,P3,P4

## Context Links
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
- Files: `app/kudos/page.tsx`, `app/components/kudos/kudos-banner.tsx` (+ kudos children)

## Numeric Contract (live MoMorph — 1440 only)
| element | box | notes |
|---|---|---|
| Header | 1440×80 | gutter 144 |
| Keyvisual "KV Background" `2940:13432` | 0,0 → **1440×512** | full-bleed |
| Cover gradient | 0,445 → **1440×957** | `linear-gradient(25deg,#00101A 14.74%,rgba(0,19,32,0) 47.8%)` on top |
| Title block "A_KV Kudos" | `144,184 → 1152×160` INSIDE 0–512 band (344<512) | overlay — sits ON banner |
| Composer + search pills | side-by-side | below/within hero |

## Overview
`kudos-banner.tsx` renders the title + wordmark + pills inside a `bg-cover` container via padding
(text is "on" the bg only incidentally). Rebuild the banner as an exactly-sized 1440×512 box with
the title block absolutely positioned at 144,184 over it, keep the Cover gradient in paint order,
and strip responsive across the kudos component set. Substitute asset (`hero-waves.jpg`) → box
sized exactly, crop is a reconstruction (Open Q #2).

## Key Insights
- Title block (184+160=344) sits inside the 512 band → it must overlay the banner, not sit in
  flow above the pills. Current impl stacks title over pills via `flex-col gap-16 py-16`.
- `hero-waves.jpg` is a deliberate artwork-only crop (an earlier full crop baked a duplicate
  search pill) — keep that constraint; size the box, don't re-bake UI into the image.
- `KUDOS` wordmark has heavy responsive type (`text-[64px] sm:text-[96px] lg:text-[140px]` etc.)
  → collapse to the 140px desktop values.
- Responsive to strip: `kudos-banner.tsx` (10), `kudos-board.tsx` (5), `kudos-sidebar.tsx` (2),
  `highlight-kudos-carousel.tsx` (6), `compose/anonymous-toggle.tsx` (1).

## Requirements
- Banner box exactly 1440×512 (full-bleed keyvisual + Cover gradient over it).
- Title block absolutely positioned at 144,184 (1152×160) over the band.
- Pills row placed per design (within/below the band) — no baked-in pill duplication.
- Zero responsive variants in the owned files.

## Architecture / Data Flow
`KudosPage` → `SiteHeader` → `KudosPageClient` → `KudosBanner` (1440×512 band: image → Cover
gradient → absolute title block; pills row) → `KudosBoard` (`ContentFrame 1152`) → `ComposeDialog`
→ `SiteFooter`.

## Related Code Files
- Modify: `kudos-banner.tsx` (fixed 512 band + absolute title overlay + strip responsive type),
  `kudos/page.tsx` (`<main>` `gap-16 pb-16` — already non-responsive, verify), `kudos-board.tsx`,
  `kudos-sidebar.tsx`, `highlight-kudos-carousel.tsx`, `compose/anonymous-toggle.tsx`.
- Do NOT edit: `sun-kudos-section.tsx` (P4-owned; not used here), `site-*` (P1-owned).

## Implementation Steps
1. `kudos-banner.tsx`: wrap the banner in a fixed `h-[512px]` full-bleed box carrying the
   keyvisual image + Cover gradient (`0,445` origin, 25deg) in paint order; absolutely position
   the title/wordmark block at top:184 (within 1152 content width); collapse `KUDOS` wordmark +
   tagline responsive type to desktop (140px). Place the pills row per design without re-baking.
2. Strip responsive from `kudos-board.tsx`, `kudos-sidebar.tsx`, `highlight-kudos-carousel.tsx`,
   `compose/anonymous-toggle.tsx`.
3. Do NOT touch Spotlight name count — see plan Open Q #4 (data-layer, not this phase).
4. Lint + build.

## Todo List
- [ ] Banner fixed 1440×512 (image + Cover gradient, crop labeled reconstruction)
- [ ] Title block absolute-overlaid at 144,184 (1152×160)
- [ ] Pills row placed, no baked-in duplicate
- [ ] Responsive stripped (banner, board, sidebar, carousel, anonymous-toggle)
- [ ] lint + build green

## Success Criteria
- Banner box ~1440×512; title rect ⊆ banner rect; no `sm:`/`lg:` remain.
- P6: header gutter 144, board content 1152, Spotlight names still live DOM (count unchanged).

## Risk Assessment
- Absolute title over a 512 band could overlap the pills row if the band is too short → follow
  Figma y-offsets (title 184–344, pills below).
- Substitute crop can't match Figma (asset auth) → reconstruction, flagged.
- Spotlight name-count (106 vs ~352) is tempting to "fix" by fabricating duplicates → forbidden;
  it is a data-layer Open Question, not a layout defect.

## Next Steps
Feeds P6 kudos + spotlight assertions.
