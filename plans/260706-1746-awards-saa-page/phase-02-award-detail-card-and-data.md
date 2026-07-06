# Phase 02 — Award detail card + data

## Context Links
- Spec: FR-11, FR-12 (content table), FR-13 (images)
- Data source of truth: `lib/awards/award-categories.ts` (order + slug/title)
- Pattern refs: `app/components/home/award-card.tsx` (bg+overlay image technique, Montserrat scoping, `mm:` comments), `app/components/home/awards-section.tsx` (data-array-in-module pattern)
- **MoMorph:** Hệ thống giải — https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
- Clarifications: `../clarifications.md`

## Overview
- **Priority:** P2 · **Status:** done
- Presentational card (image-left / content-right) + a typed data module holding
  all 6 cards' verbatim copy. NOT the homepage grid card — different layout, full
  (non-truncated) descriptions, metadata rows with icons.

## Key Insights
- Reuse the exact bg+overlay technique from `award-card.tsx` for the 336×336
  Picture-Award, but the OUTER layout is horizontal (image left, text right),
  stacking on mobile — do not import `award-card.tsx`, it stays homepage-only.
- Same `Award-BG.png` for all 6 (intentional, not a data bug — see award-card.tsx docstring) + per-award `Award-Name-*.png` overlay.
- Icons: `public/awards-saa/Icon-Target.svg` (title), `Icon-Diamond.svg`
  (Số lượng), `Icon-License.svg` (Giá trị). Render as `<img>` (fixed color) —
  no `currentColor` recolor needed on the card.
- Card owns `AwardDetailCardProps`; the data module imports that type → keeps a
  single prop contract, avoids a separate types file.

## Requirements
- **Functional (FR-11):** each card renders — Picture-Award (336×336, `Award-BG.png` bg + `Award-Name-*.png` overlay, alt = title) · Target icon + title (accessible heading) · full description (no ellipsis, `whitespace-pre-line` if multi-para) · Diamond icon + "Số lượng giải thưởng: {quantity}" · License icon + "Giá trị giải thưởng: {value}".
- **Data (FR-12):** 6 entries, order === `AWARD_CATEGORIES`. Title/quantity/value from the spec table. **Description = verbatim MoMorph copy** (see Risk).
- **Non-functional:** files <200 lines, Montserrat scoped per-file, `mm:` node-id comments, image alt text, responsive stack on tablet/mobile.

## Architecture
- `award-detail-card.tsx` (presentational, server-renderable, no `"use client"`):
  props `{ slug, title, description, quantity, value, titleImageSrc }`. Renders a
  `<div>` (image + content) — NOT the `<section id>` wrapper (the catalog owns the
  `<section id={slug}>` so scroll-spy observes it, Phase 05). Heading level `h3`
  (page has one `h1`/section `h2`; keeps a11y order; see Phase 05).
- `award-detail-data.ts`: `AwardDetailEntry[]` (imports `AwardDetailCardProps` +
  `AWARD_CATEGORIES`), one per slug, in order.

Data flow: `award-detail-data` (static) → Phase 05 maps entries → `<section id=slug><AwardDetailCard {...}/></section>`.

## Related Code Files
- **Create:** `app/components/awards/award-detail-card.tsx`
- **Create:** `app/components/awards/award-detail-data.ts`
- **Create:** `app/components/awards/award-detail-card.test.tsx`
- **Read for context:** `award-card.tsx`, `awards-section.tsx`, `lib/awards/award-categories.ts`
- **Assets:** `public/homepage-saa/Award-BG.png`, `Award-Name-{TopTalent,TopProject,TopProjectLeader,BestManager,Signature2025Creator,MVP}.png`; `public/awards-saa/Icon-{Target,Diamond,License}.svg`

## Implementation Steps
1. ~~Fetch verbatim descriptions from MoMorph~~ **RESOLVED** — verbatim descriptions are now in `spec/awards-page/feature.md` §2.5 (FR-12): Top Talent/Top Project/Top Project Leader/Best Manager/MVP share one identical paragraph (unfinished Figma copy, reproduce as-is); Signature 2025 - Creator has its own distinct paragraph. Copy both blockquotes verbatim into `award-detail-data.ts` — do not re-fetch MoMorph, do not reuse `awards-section.tsx`'s shorter homepage strings.
2. Build `award-detail-card.tsx`: export `AwardDetailCardProps`; horizontal flex (`flex-col lg:flex-row`), 336×336 image block (reuse bg+overlay markup from award-card.tsx), content column with title row (Target icon + `<h3>`), description `<p>`, two metadata rows (Diamond / License icon + label + value).
3. Build `award-detail-data.ts`: 6 entries in `AWARD_CATEGORIES` order; `titleImageSrc` per award; quantity/value from FR-12 table; description verbatim.
4. Verify data order/slug alignment against `AWARD_CATEGORIES` (add a length + slug-parity assertion in the test).

## Todo List
- [x] Pull 6 verbatim descriptions from MoMorph
- [x] `award-detail-card.tsx` (<200 lines)
- [x] `award-detail-data.ts` (order matches AWARD_CATEGORIES)
- [x] Test: renders title, full description (untruncated), quantity+value with labels for a sample entry
- [x] Test: data array length 6, slugs === AWARD_CATEGORIES slugs in order
- [x] Test: image alt = title; both `Award-BG.png` bg + correct `Award-Name-*.png` present
- [x] `npx tsc --noEmit` + vitest run

## Success Criteria
- 6 data entries, correct FR-12 title/quantity/value, verbatim descriptions.
- Card renders all metadata rows with icons; description not clamped.
- Order parity with `AWARD_CATEGORIES` proven by test.

## Risk Assessment
- **Missing description copy — RESOLVED:** verbatim descriptions now live in
  `spec/awards-page/feature.md` §2.5. Do NOT reuse the homepage's short/
  placeholder strings (`awards-section.tsx` has truncated + duplicated copy)
  and do NOT invent.
- **Layout drift from grid card (Low/Med):** different layout intentionally;
  validate against MoMorph frame, not the homepage grid.

## Security Considerations
- Static read-only content; no user input. Alt text present for a11y.

## Next Steps
- Consumed by Phase 05 (wrapped in `<section id={slug}>`).
</content>
