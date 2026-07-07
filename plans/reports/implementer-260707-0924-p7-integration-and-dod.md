# Phase 7 — Integration & Full-Site DoD — Implementation Report

Method: entirely analytical/static (browser-driving and authless builds were
off-limits this session per explicit instruction). Ground truth pulled directly
via `mcp__momorph__get_node` / `get_frame` / `get_frame_node_tree` /
`query_by_type` and diffed against the Tailwind/CSS classes actually in the
source files — same class-vs-`get_node` method P4/P5/P6 used successfully.

## 1. P1 font work — verified correct

Read `app/fonts.ts`, `app/components/home/countdown-timer.tsx`,
`app/prelaunch/components/countdown-led-unit.tsx` directly (not just P1's
report, which chronicles three blocked attempts before the coordinator
finished the wiring in the main session):

- `app/fonts.ts` exports `digitalNumbers` via `next/font/local`, sourced from
  `app/fonts/digital-numbers/DigitalNumbers-Regular.ttf` (verified present on
  disk, SIL OFL 1.1 per `OFL.txt`), weight `"400"`.
- Both countdown components import `digitalNumbers` and apply
  `digitalNumbers.className` to the digit `<span>` (not Orbitron — grepped,
  zero remaining Orbitron references in either file).
- Cross-checked against MoMorph via `query_by_type` (screenId `8PJQswPZmU`,
  itemType `TEXT`): digit nodes report `fontFamily: "Digital Numbers"`,
  `fontSize: 73.72799682617188px`, `fontWeight: "400"` — matches
  `countdown-led-unit.tsx`'s `lg:text-[73.728px]` exactly. Also checked the
  Homepage's smaller hero variant (`get_node` on `i87tDx10uM`,
  `I2167:9040;186:2617`): `fontSize: 49.152000427246094px`, same family/weight
  — matches `countdown-timer.tsx`'s `text-[49.152px]` exactly.
- Digit box size (51.2×81.92px / 76.8×122.88px) and font size are Figma-paired
  values authored together, so glyph fit has zero drift risk — this closes
  P3's `RE-VERIFY@P7` flag (see §2).

**P1 conclusion: FR-F5 is done and ground-truth-conformant.** The report's own
account of the download/auto-mode saga is historical; current on-disk state is
correct.

## 2. RE-VERIFY@P7 flags collected and resolved

Grepped all 6 phase reports for the literal tag — exactly two hits:

| # | Source | Flag | Resolution |
|---|---|---|---|
| 1 | P3 | Countdown digit glyph fit, pending Digital Numbers swap | **Resolved, Δ0.** Confirmed in §1 — font size and box size are the same Figma-authored pair on both screens, no reflow possible. |
| 2 | P4 | `awards-catalog` nav(178)+gap(80)+content(853) vs current flexible 894 | **Δ found and fixed** — see §3. |

P5 and P6 explicitly flagged **zero** `RE-VERIFY@P7` items (grep confirms —
P5: "None flagged... every measured box-model property... is fixed-size"; P6:
"no flow-driven heights... all fixed-size chrome"). Re-read both reports'
reasoning: it holds — every P5/P6 fix this phase touched was box-model
(padding/gap/radius/color), not text-flow height, so Montserrat activation
doesn't reopen anything there.

## 3. Awards page — independent second pass (not just trusting P4)

Re-read `app/awards/page.tsx`, `awards-hero.tsx`, `awards-nav-menu.tsx`,
`award-detail-card.tsx`, `awards-catalog.tsx` against fresh `get_node`/
`get_frame_node_tree` calls on screen `zFYDgyj_pD` (not reusing P4's stated
numbers uncritically):

**Confirmed correct (P4's fixes hold):**
- No double-applied gutter (`w-full` + `lg:px-36`, no `max-w`/`mx-auto`).
- Title/eyebrow centered (`w-full text-center`).
- Nav menu `font-bold` + `tracking-[0.25px]`.
- `award-detail-card.tsx`: background-position `-33.807px -30.765px` (checked
  against `I313:8467;214:2525;81:2442` directly — exact match), description
  `16px/24/700/justify/0.5px` (checked `I313:8467;214:2531` — exact match),
  content gaps `gap-8`/`gap-6`/`gap-4` at every level (checked `214:2526`
  gap:32px, `214:2527` gap:24px, `214:2528` gap:16px — all exact), label
  typography `24px/32/700` gold (checked `214:2536` — exact match).
- Quantity/value single-size approximation (36px/14px split not reproduced)
  and the two-card-variant plan tension: re-confirmed both are genuine,
  documented, out-of-scope-data-model / plan-level constraints, not something
  a CSS-only fix can close. Left as-is.

**Two new Δs found and fixed this pass (P4 missed these):**

1. **`awards-catalog.tsx` two-column gap** (this *is* the flagged
   `RE-VERIFY@P7` item, #2 above) — P4 left it unfixed, citing "text-flow
   risk." On direct measurement it isn't text-flow at all: MoMorph's
   `mms_B_Hệ thống giải thưởng` (`313:8458`) declares `gap: 80px` but also
   `justify-content: space-between` on exactly two fixed-width children (nav
   178px @ `313:8459`, content 853px @ `313:8466`, container 1152px) — with
   `space-between` and two items, the declared `gap` is not what actually
   renders; the effective gap is `1152 - 178 - 853 = 121px` (confirmed via
   the nodes' own position deltas: nav ends x=322, content starts x=443, gap
   121px exactly). Changed `lg:gap-20` → `lg:gap-[121px]` in
   `awards-catalog.tsx`, keeping the content column flexible (`w-full
   min-w-0`) rather than hard-coding 853px, so it self-produces the correct
   853px effective width from the corrected gap without losing responsive
   behavior at other breakpoints.

2. **`awards-hero.tsx` cover gradient stops** — P4's own re-derivation has a
   math error. Ground truth `linear-gradient(0deg, #00101A -4.23%, rgba(0,
   19, 32, 0) 52.79%)` is authored against the Cover rectangle's full 627px
   box (confirmed via `get_node` on `313:8439`: height 627px), which spans
   the 80px header (position startY=0..80 relative to the same canvas) plus
   the 547px hero (`mms_3_Keyvisual`, `313:8437`, confirmed startY=80,
   endY=627). Since `<header>` is `position: sticky` (occupies its own 80px
   in normal flow at rest, doesn't overlap the hero — confirmed in
   `site-header.tsx`), the correct re-expression is: convert each stop to an
   absolute px offset from the top of the 627px box, subtract the 80px
   header height, then divide by the hero's own 547px: `stop1 = (-4.23% ×
   627 − 80) / 547 = −19.47%`, `stop2 = (52.79% × 627 − 80) / 547 = 45.89%`.
   P4's code instead scaled the raw percentages directly by `627/547`
   (`-4.84%`/`60.51%`) without subtracting the 80px offset first — that
   formula is what you'd use if the header overlapped the hero (fixed/
   absolute), not what you use when the header consumes its own space. The
   old values pushed the fade line roughly 170px too far down the hero.
   Fixed to `-19.47%`/`45.89%` in `awards-hero.tsx`, with the math spelled
   out in a code comment so a future pass doesn't need to re-derive it.

## 4. Site chrome cross-page parity

Grepped `SiteHeader`/`SiteFooter` imports in `app/page.tsx`, `app/awards/
page.tsx`, `app/kudos/page.tsx`: all three import the identical
`app/components/home/site-header.tsx` / `site-footer.tsx` (relative-path
differences only — same file). Parity is structural, not something 3x
measurement can improve on — stated explicitly rather than re-measuring.

## 5. Full suite

- `npx tsc --noEmit` — clean, 0 errors.
- `npx eslint app` — 0 errors, 4 pre-existing `no-img-element` warnings
  (unrelated files: `award-detail-card.tsx` ×3, `sun-kudos-section.tsx` ×1 —
  none introduced this pass).
- `npx vitest run` — 79 files / 491 tests, all green (includes
  `awards-catalog`'s existing test suite, unaffected by the gap-class-only
  change).
- Both edited files stay well under the 200-line cap: `awards-catalog.tsx`
  85 lines, `awards-hero.tsx` 73 lines.

## 6. Changelog

Created `docs/project-changelog.md` (did not exist before this phase) with a
single dated entry covering: Montserrat + Digital Numbers font wiring (incl.
VN subset), the avatar/gallery real-photo reversal, the full-site pixel audit
per screen, and the accepted known gaps. **Docs impact: minor** — new file,
no architecture/API docs changed.

## Files Modified

- `app/components/awards/awards-catalog.tsx` (85 lines) — `lg:gap-20` →
  `lg:gap-[121px]` (RE-VERIFY@P7 closeout) + doc-comment correction.
- `app/components/awards/awards-hero.tsx` (73 lines) — cover gradient stops
  corrected (`-4.23%/52.79%` re-derivation math fix) + doc-comment.
- `docs/project-changelog.md` (new) — phase changelog entry.

## Answer to the product owner's question

**What's now fully closed since the "80% matching" observation:**
- Global Montserrat font (was Geist/Arial fallback) — every page.
- Countdown digits now render in the actual "Digital Numbers" font Figma
  specifies (was Orbitron), self-hosted, verified pixel-exact against ground
  truth on both the Homepage and Prelaunch screens.
- Real avatar/gallery photos (was initials-only assumption) — confirmed the
  correct, final, ground-truth-conformant state.
- Homepage: was already Δ0 across every measured node; still is.
- Awards page: gutter double-apply, title alignment, nav weight/tracking,
  card background position/description/typography/dividers — all closed by
  P4, independently re-verified true here. **Plus two additional Δs this
  phase's fresh pass caught that P4 missed**: the catalog's two-column gap
  (121px, not 80px) and the hero's cover-gradient math (both now fixed and
  pixel-exact against `get_node`).
- Site chrome: footer nav-link border-radius fixed (was 4px, is 0px);
  header/footer are structurally identical across all three pages by shared
  component reuse.
- Kudos: stats-box spacing, gift-recipients box padding, and the Spotlight
  "388 KUDOS" counter typography/color — all fixed and re-confirmed.

**What is still a known, named gap (not closed, and won't be closed by more
analytical passes):**
1. Awards quantity/value metadata typography — Figma splits the number
   (36px) from its unit/qualifier phrase (14px) as two separate text nodes;
   the current data model holds each as one combined string. Needs a
   data-model change (`award-detail-data.ts`, out of this plan's scope) to
   close fully. Currently rendered as one 24px size — a reasonable
   approximation, not a byte-exact match.
2. Awards catalog: Figma uses two visually distinct card sub-layouts across
   the 6 entries; the plan mandates one shared component, so full per-variant
   Δ0 isn't achievable simultaneously with that constraint. This is a
   plan-level tension, not a bug.
3. Three Kudos items are genuinely unverifiable without a live browser (not
   because of missing effort, but because they aren't static box-model
   properties at all): the Highlight carousel's gradient-fade mask visual
   blend, the Spotlight name-cloud's algorithmic (non-Figma-literal)
   placement, and one sub-pixel search-pill scale artifact treated as a
   Figma-authoring artifact rather than a real design token.

**No other analytically-detectable gaps remain.** Everything else that could
be checked via `get_node`/class-diffing has been checked (including a fresh,
skeptical second pass on Awards specifically) and is now Δ0. Anything beyond
items 1-3 above would only surface via actual browser rendering, which was
unavailable this session.

---

**Status:** DONE
**Summary:** Verified P1's font wiring is correct and ground-truth-exact;
resolved both `RE-VERIFY@P7` flags (one already Δ0 by construction, one
genuinely reopened and fixed in `awards-catalog.tsx`); ran an independent
second pass on the Awards page that caught and fixed one additional Δ P4
missed (`awards-hero.tsx` gradient math); confirmed cross-page chrome parity
is structural; full `tsc`/`eslint`/`vitest` suite is green; changelog written.
**Concerns/Blockers:** None blocking. Three Kudos items and the two
documented Awards data-model/plan-tension items remain open by design — they
require either a live browser or a scope decision beyond this phase, not
missed analytical work.
