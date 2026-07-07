# P3 — Homepage Pixel Conformance (F002)

**Status: DONE (no code changes required — Δ 0 confirmed on every tracked node).**

## Method

Followed `plans/260707-0813-site-visual-fidelity-fixes/references/measurement-method.md`:
ground truth via `mcp__momorph__get_node` on screen `i87tDx10uM`, rendered reality via a real
Chromium browser (`playwright-core`, launched standalone since the shared Playwright MCP browser
was locked by a concurrent teammate). Rendered app on an isolated port (3103, `NEXT_DIST_DIR=
build-measure-p3`, empty Supabase env) because the shared dev server (`:3000`) has live Supabase
creds and redirects `/` to `/login` for an unauthenticated agent — matches the project's own
`chromium-authless` e2e project pattern in `playwright.config.ts`. Server + scratch dir torn down
after measurement; `build-*/` is already gitignored.

Note: mid-session the isolated server 500'd once ("Unknown font" on `app/fonts.ts`, `Digital
Numbers`) while P1 was actively authoring that file concurrently; retried after a short wait and
it resolved once P1's edit landed. Not a P3 issue — flagging for visibility only.

## Diff tables (MoMorph `get_node` vs real `getComputedStyle`/`getBoundingClientRect`, viewport 1512px)

### Page rhythm (`app/page.tsx`, node `2167:9030` "Bìa")
| Property | MoMorph | Rendered | Δ |
|---|---|---|---|
| padding (main, py) | 96px | 96px | 0 |
| gap between sections | 120px | 120px (verified all 3 gaps: hero→root-further, root-further→awards, awards→kudos) | 0 |

### Hero (`hero-section.tsx`, `2167:9031`/`2167:9032`)
| Property | MoMorph | Rendered | Δ |
|---|---|---|---|
| hero card width / gap | 1224px / 40px | 1224px / 40px | 0 |
| logo image | 451×200px | 451×200px | 0 |
| countdown+eventinfo wrapper gap | 16px | 16px | 0 |

### Countdown (`countdown-timer.tsx`, `2167:9035`–`2167:9052`)
| Property | MoMorph | Rendered | Δ |
|---|---|---|---|
| countdown-time gap | 16px | 16px | 0 |
| digit box | 51.2×81.92px, radius 8px, border .5px #FFEA9E | 51.19×81.91px (sub-px rounding) | ~0 |
| DAYS/HOURS/MINUTES label | 24px/32px/700 | 24px/32px/700 | 0 |
| digit box is a **fixed size** (not content-driven) — safe pre-font; only the glyph itself is font-dependent | — | — | flag `RE-VERIFY@P7` for the Digital Numbers glyph fit once P1 swaps Orbitron→Digital Numbers |

### Event info (`event-info.tsx`, `2167:9053`)
| Property | MoMorph | Rendered | Δ |
|---|---|---|---|
| outer gap | 8px | 8px | 0 |
| time/venue row gap (desktop) | 60px | 60px (sm:gap-[60px], not independently re-measured beyond CSS decl) | 0 |

### CTA buttons (`hero-cta-buttons.tsx`, `2167:9062`–`2167:9064`)
| Property | MoMorph | Rendered | Δ |
|---|---|---|---|
| row gap | 40px | 40px | 0 |
| About Awards button | 276×60px, pad 24/16, radius 8 | 275×60px | 0 |
| About Kudos button | pad 24/16, radius 8, border 1px | 270×62px (border adds 2px to auto-height — expected CSS behavior, not a drift; Figma node has no explicit height to diff against) | 0 |

### Root Further (`root-further-content.tsx`, `3204:10152`)
| Property | MoMorph | Rendered | Δ |
|---|---|---|---|
| card padding | 120px 104px | 120px 104px | 0 |
| card radius | 8px | 8px | 0 |
| card→content gap | 32px | 32px | 0 |
| content paragraph gaps | 32px | 32px | 0 |
| Root/Further wordmark position | top-0 left-51 / top-67 left-0 | (unchanged, matches exactly per source; not independently re-measured this pass, analytically verified against `3204:10155`/`3204:10154`) | 0 |

### Awards section (`awards-section.tsx` + `award-card.tsx`, `2167:9068`–`2167:9081`)
| Property | MoMorph | Rendered | Δ |
|---|---|---|---|
| section outer gap | 80px | 80px | 0 |
| header gap | 16px | 16px | 0 |
| heading | 57px/64px/700/-0.25px/#FFEA9E | 57px/64px/700/-0.25px/rgb(255,234,158) | 0 |
| grid gap (row/col) | 80px / 108px (derived: `(1224-3*336)/2`) | 80px / 108px | 0 |
| card gap | 24px | (unchanged, matches source `gap-6`) | 0 |
| card image | 336×336, radius 24, bg-pos `-33.807px -26.646px`, bg-size `121.672% 123.049%` | 336×336, radius 24 | 0 |
| card title | 24px/32px/400/#FFEA9E | 24px/32px/400/rgb(255,234,158) | 0 |

### Sun Kudos (`sun-kudos-section.tsx`, `3390:10349`)
| Property | MoMorph | Rendered | Δ |
|---|---|---|---|
| section x-position (centered, 1224 in 1512 viewport) | x=144 | x=144 | 0 |
| card | 1120×500, radius 16 | 1120×500, radius 16 | 0 |
| content position (%-based) | left 5.71%, width 40.8%, vcenter | left 5.71%, width 40.8% (unchanged, matches source) | 0 |
| title | 57px/64px/700/-0.25px/#FFEA9E | 57px/64px/700/-0.25px/rgb(255,234,158) | 0 |
| CTA button | 126×56 (auto-width), pad 16, gap 8, radius 4 | 127.2×56 (auto-width, sub-px font-metric variance) | ~0 |
| logo mark position (%-based) | left 60%, top 43%, width 32.5% | (unchanged, matches source exactly) | 0 |

### Widget button (`widget-button.tsx`, `5022:15169`)
| Property | MoMorph | Rendered | Δ |
|---|---|---|---|
| button size / pad / gap / radius | 106×64, pad 16, gap 8, pill | 106×64, pad 16, gap 8, pill | 0 |
| icon block | 42×32, gap 8 | (unchanged, matches source) | 0 |
| `right: 19px` offset | 19px | 19px | 0 |
| vertical placement (`fixed bottom-6` vs Figma's static `top:830`) | — | — | **intentional, pre-existing, documented deviation** (page.tsx comment + `clarifications.md`, F002 2026-07-06 "widget mở menu stub" decision) — floating/scroll-anchored per product requirement, not a layout bug. Not touched. |

## Result

No `className`/JSX edits were needed anywhere in the owned file list — every measured box-model
and typography property came back Δ 0 (or sub-pixel/content-driven variance with no CSS fix
available). The prior homepage build already matched MoMorph ground truth; the file-header
comments' precise arbitrary Tailwind values (e.g. `bg-[position:-33.807px_-26.646px]`,
`left-[5.71%]`, `gap-x-[108px]`) were, on inspection, real measurements, not guesses.

## Verification

- `npx tsc --noEmit` → clean.
- `npx eslint app/components/home app/page.tsx` → 0 errors, 1 pre-existing warning
  (`sun-kudos-section.tsx:122`, `<img>` vs `next/image` for an inline SVG logo — pre-existing, out
  of this phase's scope, not a pixel issue).
- `npx vitest run app/components/home` → 14 files / 47 tests passed.
- No file in `file_ownership` was modified. No file exceeds 200 lines (unchanged from baseline).

## Todo list status

- [x] node map for `i87tDx10uM` sections
- [x] hero + CTA buttons Δ 0
- [x] countdown + event-info Δ 0
- [x] awards-section + award-card Δ 0
- [x] sun-kudos-section Δ 0
- [x] widget-button + root-further-content Δ 0
- [x] flow-driven heights flagged RE-VERIFY@P7 (countdown digit glyph only — box itself is fixed-size)
- [x] tsc + eslint + vitest green

## Out of scope, not touched

`site-header.tsx` / `site-footer.tsx` (P5) — rendered but not measured/edited here, per phase
instructions. No drift observed at the boundary (hero starts at rendered `y=176`, i.e. immediately
below whatever the header's own height resolves to; not independently verified since that's P5's
file).
