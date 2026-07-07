# Phase 6 — Remaining Kudos Pixel Conformance

**Screen:** Sun* Kudos - Live board (`MaZUn5xHXZ`, fileKey `9ypp4enmFmdK3YAFJLIu6C`)
**Method deviation:** Playwright MCP browser was locked by concurrent sibling agents for the
entire session ("Browser is already in use for .../mcp-chrome-74c3f53"), and the running dev
server on :3000 has a real Supabase project configured (redirects `/kudos` → `/login`). Per
policy, I did not attempt to route around the auth gate myself, and a peer-provided authless
server (:3100, built by the orchestrator) was also out of bounds for me to drive. Measurements
below are therefore **analytical**: this codebase inlines Tailwind arbitrary values 1:1
(`px-36`, `text-[57px]`, `bg-[#101317]`), so diffing the className literals directly against
MoMorph `get_node` box-model/typography values is a deterministic (if not browser-rendered)
substitute. Flagging three items below as genuinely unverified without a live browser.

## Diff tables

### Board shell + page-client layout — Δ 0 (verified analytically)

| Property | MoMorph | Rendered (class) | Δ |
|---|---|---|---|
| Highlight→Spotlight vertical gap | 1450−1330 = 120px | `lg:gap-[120px]` (kudos-board.tsx) | 0 |
| Spotlight→All-Kudos vertical gap | 2361−2241 = 120px | same `lg:gap-[120px]` | 0 |
| Content column width | `A_KV Kudos` 1152px | `max-w-[1152px]` | 0 |
| Content gutter | 144px (`padding 0 144px`) | `lg:px-36` (144px) | 0 |

`kudos-page-client.tsx` carries no styling of its own (pure state wrapper) — nothing to diff.

### Banner (`kudos-banner.tsx`) — Δ 0

| Property | MoMorph (`A.1_Button ghi nhận` / `Tìm kiếm sunner`) | Rendered | Δ |
|---|---|---|---|
| Border | `1px solid #998C5F` | `border border-[#998C5F]` | 0 |
| Background | `rgba(255,234,158,0.10)` | `bg-[rgba(255,234,158,0.10)]` | 0 |
| Radius | `68px` (full pill) | `rounded-[68px]` | 0 |
| Padding | `24px 16px` | `px-6 py-4` (24/16 default scale) | 0 |

KV background image already flagged out-of-scope (P2/crop territory) — untouched.

### Sidebar + stats-box + filters

| Property | MoMorph (`D.1_Thống kê tổng quat` → `Nội dung`) | Before | Fixed to | Δ before → after |
|---|---|---|---|---|
| Row/divider gap | `16px` uniform | `gap-3`/`mb-3` (12px) | `gap-4`/`mb-4` (16px) | **4px → 0** |
| Box border/bg/radius/pad | `1px #998C5F` / `#00070C` / `17px` / `24px` | matched already | unchanged | 0 |
| `D.1.8_Button mở quà` (open-gift-button.tsx) | pad 16px, radius 8px, bg `#FFEA9E`, h 60px | `rounded-lg px-4 py-4 bg-[#FFEA9E]` | unchanged | 0 |

| Property | MoMorph (`D.3_10 SUNNER nhận quà`) | Before | Fixed to | Δ before → after |
|---|---|---|---|---|
| Box padding (T/R/B/L) | `24/16/24/24` | `p-6` (24 all sides) | `py-6 pl-6` + existing list `pr-2` = 16 total right | **8px over on right → 0** |
| Title `D.3.1_title` | 22px/28px, gold `#FFEA9E` | `text-[22px] leading-7 text-[#FFEA9E]` | unchanged | 0 |
| Avatar (64px, 1.869px white border) | matches | `size={64} border-[1.869px] border-white` | unchanged | 0 |

`kudos-filters.tsx` (hashtag/department `<select>`s) has **no corresponding visual node** in
this MoMorph frame — FR-15/16/17 filtering exists as pure function, no Figma counterpart (same
"no precedent → build minimal, document it" pattern as F006's original clarifications). Left
as-is; not a pixel-conformance item.

### All-Kudos-feed + Highlight-carousel — Δ 0

Both are thin composition wrappers around `KudosCard` (verify-only group, see below) +
`KudosSectionHeading`. `HighlightKudosCarousel`'s full-bleed row (`lg:-mx-[50vw] lg:w-screen`)
and 528px card width already match MoMorph `2940:13463`'s three-528px-card row per existing
`mm:` comments — no drift found.

### `kudos-section-heading.tsx` — Δ 0

`text-2xl` (24px) subtitle, 1px `#2E3940` divider, `text-[57px]/leading-[64px]` title — matches
prior researcher-260707-0110 measurement; unchanged this pass.

### Spotlight board + name-cloud + ticker

| Property | MoMorph (`B.7.1_388 KUDOS`, `3007:17482`) | Before | Fixed to | Δ before → after |
|---|---|---|---|---|
| Font size / line height | `36px` / `44px` | `text-2xl` (24px, default leading) | `text-[36px] leading-11` (44px) | **12px/~20px → 0** |
| Fill color | `rgba(255,255,255,1)` (white) | `text-[#FFEA9E]` (gold) | `text-white` | **wrong hue → 0** |

| Property | MoMorph (`B.7_Spotlight`) | Rendered | Δ |
|---|---|---|---|
| Border | `1px #998C5F` | `border border-[#998C5F]` | 0 |
| Radius | `47.14px` | `rounded-[47px]` | 0.14px (sub-pixel, within rounding allowance) |

`B.7.3_Tìm kiếm sunner` search-pill node (`2940:14833`) carries fractional values (`0.682px`
border, `46.404px` radius, `16.378px/10.919px` padding) that are a uniform ~0.68× Figma-instance
scale of the base pill component (738/72/68/24-16 × 0.68 ≈ these numbers) — a Figma-authoring
artifact from resizing an instance, not a distinct design token. Matching it to fractional CSS
px would be over-fitting; left as the existing `rounded-full border border-[#998C5F]
bg-[rgba(255,234,158,0.10)]` chrome (correct hue/border/radius family, approximate padding).

`spotlight-name-cloud.tsx`'s golden-angle placement and `spotlight-ticker.tsx`'s 6-line fade
stack are algorithmic/JS-positioned, not literal box-model properties — **not verifiable
without a live browser** (flagging below).

### `kudos-card` / icons / `copy-link-button` — verify-only, Δ 0 (re-measured under Montserrat)

Cross-checked `kudos-card.tsx` against `C.3_KUDO Post` (3127:21871): `#FFF8E1` bg, `24px`
radius, `40px 40px 16px 40px` padding (`pt-10 px-10 pb-4`), `#FFEA9E` 1px dividers — all match
byte-for-byte. `kudos-card-icons.tsx` and `copy-link-button.tsx` are unchanged (no font-driven
height dependency, no box-model drift found). No flow-driven heights in this group needing
`RE-VERIFY@P7` — all fixed-size chrome.

## Fixes applied

1. `app/components/kudos/kudos-stats-box.tsx` — row/divider gap `gap-3`/`mb-3` (12px) →
   `gap-4`/`mb-4` (16px), matching MoMorph's uniform-16px `Nội dung` frame.
2. `app/components/kudos/recent-gift-recipients.tsx` — box padding `p-6` (uniform 24px) →
   `py-6 pl-6` + existing list `pr-2` (16px total right edge), matching MoMorph's asymmetric
   `24/16/24/24` padding.
3. `app/components/kudos/spotlight-board.tsx` — "388 KUDOS" counter `text-2xl` gold (24px,
   `#FFEA9E`) → `text-[36px] leading-11` white (`text-white`), matching MoMorph node
   `3007:17482` (36px/44px, white fill).

No other owned files needed changes — the group was already substantially conformant from
prior work (mm:-node-commented, careful padding/radius/color matches throughout banner, board
shell, card, and stats-box structure).

## Unverified without a live browser (flag for P7 or a dedicated re-pass)

1. **Highlight carousel** drag/window-slide visual behavior and the gradient-fade mask zones
   (`2940:13469`/`2940:13467`) — box-model values match statically, but the masking gradient's
   visual blend was not screen-verified.
2. **Spotlight name-cloud** golden-angle spiral placement — algorithmic positions (`top%/left%`
   per name index), not literal design coordinates; cannot be diffed against a single design
   snapshot at all (design shows one static arrangement, code generates one deterministically —
   never byte-identical to the Figma layout by design, per the file's own doc comment). Visual
   plausibility (no obvious out-of-bounds/overlap) unverified without rendering.
3. **`B.7.3_Tìm kiếm sunner` sub-pixel scale values** (0.682px border, 46.404px radius) — treated
   as a Figma-instance-resize artifact, not re-created pixel-for-pixel (see above); a live
   screenshot would confirm whether the approximation reads correctly at the small pill size.

## Tests / static checks

- `npx tsc --noEmit` — clean (whole repo).
- `npx eslint app/components/kudos app/kudos` — clean, no warnings/errors.
- `npx vitest run app/components/kudos` — 31 files / 181 tests passed.
- `npx vitest run` (full repo) — 79 files / 491 tests passed, no regression (compose/secret-box
  suites from the 0243 conformance pass still green).
- All 3 edited files remain under the 200-line cap (73 / 54 / 80 lines).

## Behavior preserved

No behavior changed — every fix was a className-only spacing/typography adjustment. Board
filtering, carousel next/prev, spotlight search/pan-zoom toggle, copy-link, and like-toggle
were not touched and their existing tests (behavior/aria assertions) still pass unmodified.
