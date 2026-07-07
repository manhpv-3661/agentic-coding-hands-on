---
phase: 2
title: "Compose-dialog cream restyle (FR-22)"
status: completed
priority: P1
effort: 4h
depends_on: []
parallel_safe_with: [1, 5]
file_ownership:
  - app/components/kudos/compose/compose-dialog.tsx
  - app/components/kudos/compose/compose-dialog-fields.tsx  # NEW (split)
  - app/components/kudos/compose/field-group.tsx
  - app/components/kudos/compose/hashtag-input.tsx
  - app/components/kudos/compose/image-upload.tsx
  - app/components/kudos/compose/anonymous-toggle.tsx
  - app/components/kudos/compose/recipient-select.tsx
  - app/components/kudos/compose/rich-text-editor.tsx
  - app/components/kudos/compose/rich-text-caret-helpers.ts  # NEW (split)
  - app/components/kudos/compose/rich-text-toolbar.tsx
  - "app/components/kudos/compose/*.test.tsx (co-located, style-coupled assertions only)"
---

# Phase 2 — Compose-dialog Cream Restyle (FR-22)

## Context Links

- Spec: `spec/compose-form-momorph-conformance/technical-spec.md` FR-22, BR-1; `edge-cases.md` rows 5–6
- Ground truth: MoMorph `ihQ26W78P2` ("Viết Kudo", done) — cream card `#FFF8E1`
- Current (wrong): `getComputedStyle(dialog).backgroundColor === "rgb(16, 19, 23)"` (`#101317`)

## Overview

- **Priority:** P1 (broad base other F007 phases build on)
- **Status:** pending
- Pure visual restyle of the "Viết Kudos" dialog + every field sub-component from the dark theme to
  the cream `#FFF8E1` design. **No logic/validate/aria contract changes** (BR-1).

## Key Insights

- This is **style-only**. Every behavior test (FR-1..21) must stay green; only assertions that
  themselves assert a color/class (style-coupled) may change. Never delete a behavior assertion.
- Contrast is the trap: error text is `text-red-400`, mention hint/counter `text-white/50`, inputs
  `bg-[#101317] text-white`. On cream these become white-on-cream (invisible). Every foreground color
  must be re-checked for readability on `#FFF8E1` (edge-cases rows 5–6).
- Two touched files already exceed the 200-line cap → must split (see steps 1, 6).
- Toolbar: replace bare `B`/`I`/`S`/`•≡`/`🔗`/`""` glyphs with real icon-buttons on a white strip
  (design), preserving each button's existing `aria-label` and `exec(...)` call.

## Requirements (FR-22)

- Dialog panel: `#101317` → cream `#FFF8E1`; heading large + centered + dark text (not small yellow
  left-aligned).
- Inputs (title, hashtag, image, recipient trigger, contentEditable): white fill + thin border,
  dark text, readable placeholder.
- Toolbar: its own white strip with real icon-buttons; Bold/Italic/Strikethrough active/inactive
  state readable on cream (edge-case row 6).
- Anonymous toggle, field labels, helper text, error text, mention hint, counter: dark/readable
  palette on cream.
- Submit/Cancel buttons restyled to match `ihQ26W78P2`.

## Architecture

- Container/presenter split for `compose-dialog.tsx`: keep state + handlers (validate, submit,
  focus-trap, draft-reset) in `compose-dialog.tsx`; move the field-stack JSX (lines ~189–269) into
  a new presentational `compose-dialog-fields.tsx` receiving `{state, errors, updateState, labels,
  recipientOptions, mentionNames}`. Brings both files < 200 lines.
- `rich-text-editor.tsx` split: extract `getCaretMentionToken`, `placeCaretAt`, `placeCaretAtEnd`,
  `MENTION_TOKEN_REGEX`, and the `CaretMentionToken` type into `rich-text-caret-helpers.ts`. If the
  editor is still > 200 after that, also extract the mention keyboard/select handlers into the same
  helpers module as pure functions. Do **not** change `CommunityStandardsLink` usage here — P3 owns
  that wiring line.

Data flow unchanged: `KudosPageClient` → `ComposeDialog` (state owner) → field components (controlled,
presentational). Restyle only rewrites `className` strings + the toolbar's button internals.

## Related Code Files

- **Modify:** all 8 files in `file_ownership` (className/JSX only, except the two splits)
- **Create:** `compose-dialog-fields.tsx`, `rich-text-caret-helpers.ts`
- **Read for context:** `compose-form-helpers.ts` (unchanged), `mention-suggestions.tsx`
- **Delete:** none

## Implementation Steps

1. Split `compose-dialog.tsx` → extract field-stack JSX into `compose-dialog-fields.tsx`; verify
   focus-trap (`handlePanelKeyDown`) and draft-reset still live in the shell. Run tsc.
2. Restyle dialog panel + heading (cream bg, dark centered heading).
3. Restyle each field sub-component: `field-group.tsx`, `recipient-select.tsx`, `hashtag-input.tsx`,
   `image-upload.tsx`, `anonymous-toggle.tsx` — white inputs, dark text, readable errors.
4. Rebuild `rich-text-toolbar.tsx` as a white strip of icon-buttons; keep every `aria-label` +
   `exec(...)` call and the `linkPrompt` link behavior intact (P4 replaces the link behavior later).
5. Restyle `rich-text-editor.tsx` contentEditable region + counter/hint colors for cream.
6. Split `rich-text-editor.tsx` caret helpers into `rich-text-caret-helpers.ts`; confirm < 200 lines.
7. Update **only style-coupled assertions** in co-located tests (e.g. a test asserting
   `bg-[#101317]`); leave behavior/aria assertions untouched. Add a contrast/readability assertion
   where a test already checks error visibility.
8. `npx tsc --noEmit` + `npx eslint app/components/kudos/compose` + `npx vitest run app/components/kudos/compose` green.

## Todo List

- [x] compose-dialog split (< 200 lines each)
- [x] dialog panel + heading cream
- [x] all field sub-components cream + readable
- [x] toolbar white strip with icon-buttons (aria + exec preserved)
- [x] editor region + counter/hint cream; caret helpers extracted (< 200 lines)
- [x] style-coupled test assertions updated; behavior assertions untouched
- [x] tsc + eslint + vitest green

## Success Criteria

- In-browser (P6 measures): `getComputedStyle(dialog).backgroundColor` matches `#FFF8E1`; inputs
  white; error/hint/counter text all pass contrast on cream.
- All pre-existing compose behavior tests pass unchanged (aside from style-coupled color assertions).
- No file in the folder exceeds 200 lines.

## Risk Assessment

| Risk | Likelihood | Impact | Countermove |
|------|-----------|--------|-------------|
| Container/presenter split regresses focus-trap or draft-reset | Med | High | Keep state+handlers in shell only; rely on existing focus-trap + draft-reset tests (must stay green) |
| White-on-cream invisible error/helper text | High | Med | Explicit contrast pass (step 3/5); edge-case rows 5–6 assertions |
| Editor still > 200 after caret extraction | Med | Low | Extract mention handlers too (step 6) |
| Accidentally changing validate/aria (BR-1 breach) | Low | High | Style-only diffs; behavior tests unchanged catch it |

## Security Considerations

None — presentational; no new input surface, no auth/route change.

## Next Steps

Unblocks P3 (wires panel into restyled `rich-text-editor.tsx`) and P4 (link button in restyled
`rich-text-toolbar.tsx`). Both depend on this phase completing (shared files).
</content>
