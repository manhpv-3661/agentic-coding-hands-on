---
phase: 3
title: "Community Standards real panel (FR-23)"
status: completed
priority: P2
effort: 4h
depends_on: [1, 2]
parallel_safe_with: [4, 5]
file_ownership:
  - app/components/kudos/compose/community-standards-link.tsx
  - app/components/kudos/compose/community-standards-panel.tsx   # NEW
  - app/components/kudos/compose/community-standards-content.ts   # NEW (static tier/icon key data)
  - app/components/kudos/compose/community-standards-link.test.tsx
  - app/components/kudos/compose/community-standards-panel.test.tsx  # NEW
  - app/components/kudos/compose/rich-text-editor.tsx   # wiring only — sequential after P2
---

# Phase 3 — Community Standards Real Panel (FR-23, revises FR-10)

## Context Links

- Spec: `spec/compose-form-momorph-conformance/technical-spec.md` FR-23, BR-2; `edge-cases.md` rows 1–2
- Ground truth: MoMorph `b1Filzi9i6` ("Thể lệ UPDATE", done)
- Current (wrong): `community-standards-link.tsx` is a dead `<button>` stub; clicking opens 0 dialogs

## Overview

- **Priority:** P2
- **Status:** pending
- Turn the dead "Tiêu chuẩn cộng đồng" stub into a real dialog opener that shows the rules panel
  (hero tiers, collection icons, national kudos). **Static content only** (BR-2) — no real badge
  computation.

## Key Insights

- **Depends on P1** for the `communityStandards` object keys and **P2** because it edits
  `rich-text-editor.tsx` (owned by P2 for the restyle) — sequential, not parallel, with P2.
- Panel is a **2nd-layer modal** opened from inside the compose dialog. Escape must close **only the
  panel**, leaving the compose dialog open (edge-case row 2). `useDismissableMenu` already implements
  a topmost-only Escape stack (`hooks/use-dismissable-menu.ts`) → reuse it, do not hand-roll.
- Draft preservation (edge-case row 1): the panel is a sibling overlay, not a remount of compose —
  opening/closing it must not touch compose form state. Since compose state lives in `ComposeDialog`
  and the panel only reads static content, this holds by construction; add a test asserting it.
- "Viết KUDOS" footer button just closes the panel (compose dialog stays open beneath) — no
  nested-dialog reopen logic (spec Assumptions).
- Content volume is large (4 tiers + 6 icons + 3 sections) → keep panel < 200 lines by holding the
  **structural keys** (tier ids, icon ids) in `community-standards-content.ts` and mapping them to
  P1 dict strings at render. Split further into section sub-components only if still > 200.

## Requirements (FR-23)

- `CommunityStandardsLink` becomes a trigger that owns `open` state via `useDismissableMenu({haspopup:"dialog"})`.
- Panel content per `b1Filzi9i6`: title "Thể lệ"; **NGƯỜI NHẬN KUDOS** — 4 tiers (New Hero 1–4,
  Rising Hero 5–9, Super Hero 10–20, Legend Hero >20), each a condition line + description line;
  **NGƯỜI GỬI KUDOS** — 6 collection icons (Revival, Touch of Light, Stay Gold, Flow to Horizon,
  Beyond the Boundary, Root Further) + full-set paragraph; **KUDOS QUỐC DÂN** — top-5-by-hearts blurb.
- Footer: "Đóng" (close) + "Viết KUDOS" (close panel, return focus to compose content).
- Cream theme consistent with FR-22.

## Architecture

- `community-standards-link.tsx`: trigger button + renders `<CommunityStandardsPanel>` when open.
  New prop shape = the `communityStandards` object (trigger + panel labels) from P1.
- `community-standards-panel.tsx`: presentational dialog; maps `community-standards-content.ts`
  ids → P1 dict strings; footer handlers via props (`onClose`, `onCompose`).
- `rich-text-editor.tsx` (P2-owned, edited here sequentially): change
  `<CommunityStandardsLink label={labels.communityStandards} />` → pass the whole
  `labels.communityStandards` object. This is the ONE line P3 changes in a P2 file.

Data flow: `rich-text-editor` → `CommunityStandardsLink` (owns open state) → `CommunityStandardsPanel`
(reads static content + dict). No compose state crosses into the panel (draft-safe by construction).

## Related Code Files

- **Modify:** `community-standards-link.tsx`, `rich-text-editor.tsx` (wiring line only)
- **Create:** `community-standards-panel.tsx`, `community-standards-content.ts`,
  `community-standards-panel.test.tsx`; extend `community-standards-link.test.tsx`
- **Read for context:** `hooks/use-dismissable-menu.ts`, `lib/i18n/dictionary.ts`, P1 dict output
- **Delete:** none

## Implementation Steps

1. Add `community-standards-content.ts`: arrays of tier ids and icon ids (keys only, no display text).
2. Build `community-standards-panel.tsx`: dialog shell (cream), 3 sections mapped from content ids +
   P1 dict strings, footer buttons. Keep < 200 lines (split sections out if needed).
3. Refactor `community-standards-link.tsx`: `useDismissableMenu({haspopup:"dialog"})`, render panel
   on open, wire `onClose`/`onCompose` (both just close; compose stays open).
4. Update `rich-text-editor.tsx` wiring line to pass the `communityStandards` object.
5. Tests: click trigger → exactly one new `[role="dialog"]` opens; Escape closes only the panel
   (compose dialog still present); "Viết KUDOS" closes panel; compose draft (title/content) unchanged
   across open/close (edge-case row 1); panel renders 4 tiers + 6 icons.
6. `npx tsc --noEmit` + eslint + `npx vitest run app/components/kudos/compose` green.

## Todo List

- [x] community-standards-content.ts (tier/icon ids)
- [x] community-standards-panel.tsx (< 200 lines, cream)
- [x] community-standards-link.tsx → dialog opener via useDismissableMenu
- [x] rich-text-editor.tsx wiring line updated (object prop)
- [x] tests: open/close, Escape-only-panel, draft-preserved, tier/icon counts
- [x] tsc + eslint + vitest green

## Success Criteria

- Clicking "Tiêu chuẩn cộng đồng" opens exactly one new dialog (was 0).
- Escape closes only the panel; compose dialog remains open; draft intact.
- Panel shows all 4 tiers + 6 icons + national section per `b1Filzi9i6`.
- No badge computation added (BR-2); no file > 200 lines.

## Risk Assessment

| Risk | Likelihood | Impact | Countermove |
|------|-----------|--------|-------------|
| Escape closes both layers (edge-case row 2) | Med | High | Reuse `useDismissableMenu` topmost-only stack; explicit test |
| Panel > 200 lines from content volume | High | Low | ids-in-content-module + dict strings; split sections if needed |
| Editing P2-owned `rich-text-editor.tsx` before P2 done | Med | High | `depends_on: [2]` — forge must not start P3 until P2 green |
| Draft reset on panel open | Low | High | Panel never touches compose state; regression test |

## Security Considerations

Static content, no user input, no navigation. No auth/route change.

## Next Steps

Feeds P6 integration. Parallel-safe with P4 (different files) and P5 (different feature).
</content>
