# Phase 06 — Awards Screen

**Priority:** P1 · **Status:** pending · **Effort:** 3h · **Depends on:** P3 · **Parallel-safe with:** P4,P5,P7

## Context Links
- Report: `research/researcher-03-awards-contract.md` (live MoMorph, MCP reachable)
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
- Files: `app/awards/page.tsx`, `app/components/awards/awards-hero.tsx`

## Overview
Awards matches the design except the **same systemic missing max-width cap**: `awards/page.tsx`
wraps title+catalog in bare `PageGutter` with no `ContentFrame` — coincidentally 1152 at exactly
1440, unbounded above. The in-file comment claiming `ContentFrame` "double-applies padding →
864px" is **mathematically wrong** (`ContentFrame` adds `max-w` + `mx-auto`, zero padding). Fix by
matching the established `PageGutter → ContentFrame` pattern every sibling section already uses.

## Numeric Contract (live MoMorph — only 1440 in design)
| section | w×h | gutter | max-width | padding | gap |
|---|---|---|---|---|---|
| Header | 1440×80 | 144 | n/a | 12/12 | 238 (row) |
| Hero bg (full-bleed) | 1440×547 | 0 | n/a | — | — |
| Hero content (KV logo) | 1152×150 | 144 | 1152 | 104px offset from hero top | 40 |
| "Bìa" wrapper | 1440×6164 | 144 | **1152** | 96/96 | 120 |
| Title | 1152×129 | 144 | 1152 | — | 16 |
| Catalog "mms_B" | 1152×4833 | 144 | 1152 | — | 80 declared / 121 effective (space-between) |
| Sun*Kudos block | 1152×500 | 144 | 1152 | — | 10 |
| Footer | 1440×144 | **90** (intentional) | n/a | 40/40 | — |

**Verdict:** gutter **144px**, max-width **1152px** — matches existing primitive exactly; NO new
primitive value needed, only correct application. 1280/768/375 **not in design** → P8 invariants only.

## Mismatches to fix (classified §5)
1. **Wrong max-width (systemic):** `app/awards/page.tsx:92` bare `PageGutter`, no cap → unbounded
   >1440. → Add `ContentFrame width={1152}`. Delete the incorrect "double-padding → 864px" comment.
2. **Not-in-design:** 1280/768/375 Tailwind classes are convention, not design — do NOT guess-fix.
3. **Verified correct (no touch):** hero full-bleed bg, hero `pt-[104px]` offset, top vertical
   rhythm (`gap-[120px]`/`py-24`), heading text-wrap (auto-sized in Figma).
4. **Out of scope here:** footer 90px vs 144px is a `SiteFooter` matter (P3 owns it; confirmed
   intentional by login + awards researchers — do NOT change footer to 144).

## Related Code Files
- Modify: `app/awards/page.tsx` (add ContentFrame 1152, remove wrong comment).
- Read: `app/components/awards/awards-hero.tsx` (verify hero; edit only if drift). Note awards-hero
  also uses bare `PageGutter` — if its content needs a 1152 cap for >1440, apply same fix.
- Tests: `tests/unit/awards-page.test.tsx` already modified in WIP — keep green, adjust only if the
  ContentFrame wrap legitimately changes a queried structure.

## Implementation Steps
1. Wrap title+catalog block in `ContentFrame width={1152}` under existing `PageGutter`.
2. Remove the mathematically-wrong double-padding comment.
3. Verify awards-hero: cap at 1152 if unbounded >1440; else leave.
4. Lint/build; `tests/unit/awards-page.test.tsx` + `e2e/awards-content.spec.ts` green.

## Todo List
- [ ] awards/page.tsx capped at 1152
- [ ] wrong comment removed
- [ ] awards-hero cap decision recorded
- [ ] footer 90px untouched
- [ ] tests green

## Success Criteria
- Content ≤ 1152 past 1440; gutter 144; sibling-section pattern consistent. P8 awards assertions pass.

## Risk Assessment
- WIP awards-page test may assert old structure → update assertion to match capped structure, document.

## Next Steps
Feeds P8 awards assertions.
