---
phase: 5
title: "Secret Box dialog visual (FR-19-rev, F006)"
status: completed
priority: P2
effort: 2h
depends_on: [1]
parallel_safe_with: [2, 3, 4]
file_ownership:
  - app/components/kudos/open-gift-button.tsx
  - app/components/kudos/kudos-stats-box.tsx   # thread count prop
  - app/components/kudos/open-gift-button.test.tsx
  - app/components/kudos/kudos-stats-box.test.tsx
---

# Phase 5 — Secret Box Dialog Visual (FR-19-rev, F006)

## Context Links

- Spec: `spec/secret-box-momorph-conformance/technical-spec.md` FR-19-rev, BR-1/BR-2; `edge-cases.md`
- Ground truth: MoMorph `J3-4YFIpMM` ("Open secret box- chưa mở", done)
- Current (thin): dialog = small heading + one text line + Close; missing yellow heading, gift
  illustration, large count

## Overview

- **Priority:** P2
- **Status:** pending
- Upgrade the Secret Box dialog's **visual only** to match `J3-4YFIpMM`. Logic unchanged — still no
  reward mechanic, no persistence (BR-1). Fully independent of the F007 phases (different feature,
  different files); shares only the P1 dict prerequisite.

## Key Insights

- **Depends on P1** for `gift.heading/subtitle/unopenedCount/closeAria` keys. No other dependency —
  runs concurrently with P2/P3/P4.
- **Spec field-name correction:** spec drafts say `KUDOS_STATS.secretBoxesUnopened`; the real field
  is `secretBoxUnopened` (`lib/kudos/kudos-types.ts`, value 5). Use the real name (BR-2: no duplicate
  constant, no hardcode).
- **Count is not currently passed to the dialog.** `OpenGiftButton` receives only `labels`.
  `kudos-stats-box.tsx` already has `stats.secretBoxUnopened` in scope → thread it as a new
  `unopenedCount` prop into `OpenGiftButton`. This is the only reason `kudos-stats-box.tsx` is touched.
- Gift illustration = SVG/CSS only (no photo pipeline, spec Assumptions). Sparkle/glow via CSS
  gradient + box-shadow — no canvas/WebGL, no dependency.
- Graceful degradation (edge-case row: SVG fails): heading + count must still be readable
  (illustration is `aria-hidden`, decorative — info never depends 100% on it).

## Requirements (FR-19-rev)

- Dialog shows: yellow heading "KHÁM PHÁ SECRET BOX CỦA BẠN", subtitle "Click vào box để mở",
  a gift-box illustration (bow + glow/sparkle, SVG/CSS), large count line "Secretbox chưa mở {n}"
  where `{n} = stats.secretBoxUnopened`.
- Close affordance: decide X-in-corner vs existing text "Đóng" — follow the dialog-close pattern used
  elsewhere in Kudos. **Decision:** add an X-icon button top-right (`gift.closeAria` label) AND keep
  Escape/close behavior; retire the plain "Đóng" button only if the design has no text close (match
  `J3-4YFIpMM`). Wire close via `useDismissableMenu` for Escape parity (edge-case row 2).
- Count 0 (edge-case row 1): dialog still opens, shows "0", no hidden button, no error.

## Architecture

- `kudos-stats-box.tsx`: pass `unopenedCount={stats.secretBoxUnopened}` to `<OpenGiftButton>`.
- `open-gift-button.tsx`: new `unopenedCount: number` prop; extend `OpenGiftButtonLabels` with
  `heading/subtitle/unopenedCount/closeAria`; restyle dialog body (heading, subtitle, `<GiftIcon>`
  enlarged illustration + sparkle, big count). Migrate open/close to `useDismissableMenu` for Escape.

Data flow: `KUDOS_STATS` → `KudosStatsBox` (`stats` prop) → `OpenGiftButton` (`unopenedCount` +
`labels`). No new data source; `stats` already flows into the box.

## Related Code Files

- **Modify:** `open-gift-button.tsx`, `kudos-stats-box.tsx`
- **Create:** none (tests extended in place)
- **Read for context:** `lib/kudos/kudos-types.ts` (KudosStats), `lib/kudos/kudos-data.ts`
  (KUDOS_STATS), `hooks/use-dismissable-menu.ts`, P1 `gift.*` keys
- **Delete:** none

## Implementation Steps

1. `kudos-stats-box.tsx`: add `unopenedCount={stats.secretBoxUnopened}` on `<OpenGiftButton>`.
2. `open-gift-button.tsx`: extend props/labels; render heading + subtitle + enlarged gift SVG (glow/
   sparkle via CSS) + large count `{unopenedCount}`; add top-right X close (`closeAria`).
3. Migrate open/close to `useDismissableMenu({haspopup:"dialog"})` (Escape closes) — keep the
   trigger button + `role="dialog"` semantics.
4. Keep the gift illustration `aria-hidden`; ensure heading+count readable if SVG absent.
5. Tests: dialog opens with heading/subtitle/count text; count reflects `secretBoxUnopened` (5) and
   renders "0" when 0; Escape closes; no reward/persistence side-effect (BR-1); `stats-box` passes
   the count through.
6. `npx tsc --noEmit` + eslint + `npx vitest run app/components/kudos` green.

## Todo List

- [x] kudos-stats-box.tsx threads unopenedCount (secretBoxUnopened)
- [x] open-gift-button.tsx heading/subtitle/count/gift illustration + X close
- [x] useDismissableMenu Escape parity
- [x] tests: content, count 0/5, Escape, no side-effect
- [x] tsc + eslint + vitest green

## Success Criteria

- In-browser (P6 measures): dialog shows yellow heading, subtitle, illustration, large count = 5.
- Count = 0 case renders "0", dialog still opens.
- No reward logic/persistence added; no hardcoded/duplicate count constant.
- Files < 200 lines; existing open-gift + stats-box tests green.

## Risk Assessment

| Risk | Likelihood | Impact | Countermove |
|------|-----------|--------|-------------|
| Using wrong field name `secretBoxesUnopened` (spec typo) | Med | Med | Correction called out; use `secretBoxUnopened`; tsc catches |
| Accidentally adding reward/persistence logic (BR-1 breach) | Low | High | Visual-only diff; assert no state mutation on open |
| Info lost if SVG fails to render | Low | Low | Illustration decorative/`aria-hidden`; heading+count independent |

## Security Considerations

None — static display, no user input, `/kudos` already gated by `requireUser()`.

## Next Steps

Feeds P6. Independent of P2/P3/P4 (F006 files disjoint from F007 compose files).
</content>
