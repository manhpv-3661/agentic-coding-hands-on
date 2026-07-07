---
phase: 4
title: "Insert-link 2-field dialog (FR-24)"
status: completed
priority: P2
effort: 2h
depends_on: [1, 2]
parallel_safe_with: [3, 5]
file_ownership:
  - app/components/kudos/compose/rich-text-toolbar.tsx   # sequential after P2 (shared file)
  - app/components/kudos/compose/insert-link-dialog.tsx   # NEW
  - app/components/kudos/compose/rich-text-toolbar.test.tsx
  - app/components/kudos/compose/insert-link-dialog.test.tsx   # NEW
---

# Phase 4 — Insert-link 2-field Dialog (FR-24)

## Context Links

- Spec: `spec/compose-form-momorph-conformance/technical-spec.md` FR-24, BR-3; `edge-cases.md` rows 3–4
- Ground truth: MoMorph `OyDLDuSGEa` ("Addlink Box", done) — cream dialog, 2 fields + Hủy/Lưu
- Current (wrong): link button uses `window.prompt()` (single field, browser-native)

## Overview

- **Priority:** P2
- **Status:** pending
- Replace the toolbar link button's `window.prompt()` with a self-written cream mini-dialog: two
  fields ("Nội dung" + "URL") + Hủy/Lưu. Save calls the existing `exec("createLink", url)` flow.

## Key Insights

- **Depends on P2** (edits `rich-text-toolbar.tsx`, owned by P2 for restyle) — sequential, not
  parallel, with P2. **Depends on P1** for `addLink` dict keys.
- `exec` is already a prop passed into the toolbar (from `rich-text-editor.tsx`); the dialog lives
  **inside the toolbar** and calls `exec("createLink", url)` on Save → **`rich-text-editor.tsx` is
  NOT touched** by this phase (keeps P3/P4 on disjoint files, fully parallel with each other).
- **Editor capability check (spec Unresolved Q #1):** `rich-text-editor.tsx` `exec` only runs
  `document.execCommand("createLink", url)`, which wraps the **current selection** — it cannot set
  custom display text cheaply. Per FR-24's own guidance, do NOT over-engineer the editor:
  - "URL" is **required**; "Nội dung" is **optional/decorative** to match the design.
  - Save = `exec("createLink", url)` (existing behavior, link around selection / at caret).
- No new dependencies (BR-3) — plain React state, same pattern as `ComposeDialog`/secret box.
- Empty-URL guard (edge-case row 4): Save with blank URL → inline error, dialog stays open, do NOT
  call `exec("createLink","")`.

## Requirements (FR-24)

- Toolbar link button opens `<InsertLinkDialog>` (cream, 2 fields, Hủy/Lưu) instead of `window.prompt`.
- Save: validate URL non-empty → `exec("createLink", url)` → close. Blank URL → inline error, stay open.
- Cancel: close, apply nothing.
- No selection present (edge-case row 3): "Nội dung" still typeable; Save still inserts at caret,
  no crash.
- Remove the now-dead `window.prompt` path; `linkPrompt` dict key becomes unused (leave the key —
  P1 owns dict; note it as retired for a later cleanup).

## Architecture

- `insert-link-dialog.tsx`: controlled mini-dialog, local `useState` for content/url + error;
  props `{open, onCancel, onSave(url, content), labels}`. Cream theme.
- `rich-text-toolbar.tsx`: link button now toggles local `open` state and renders
  `<InsertLinkDialog>`; `onSave` calls the existing `exec("createLink", url)`.

Data flow: toolbar `exec` prop (unchanged) ← `rich-text-editor`. Link button → InsertLinkDialog →
`onSave` → `exec("createLink", url)`. Content field currently decorative (documented editor limit).

## Related Code Files

- **Modify:** `rich-text-toolbar.tsx` (link button → dialog; drop `window.prompt`)
- **Create:** `insert-link-dialog.tsx`, `insert-link-dialog.test.tsx`; extend `rich-text-toolbar.test.tsx`
- **Read for context:** `rich-text-editor.tsx` (`exec` definition — confirm createLink limit), P1 dict
- **Delete:** none (keep `linkPrompt` key; mark retired)

## Implementation Steps

1. Build `insert-link-dialog.tsx`: two labeled inputs + Hủy/Lưu, local error state, cream theme,
   `role="dialog"` + aria-label from `addLink.title`.
2. In `rich-text-toolbar.tsx`: replace the `window.prompt` onClick with local `open` state + render
   `<InsertLinkDialog>`; wire `onSave(url) => exec("createLink", url)` and `onCancel`.
3. Empty-URL guard: Save with blank URL sets inline error, keeps dialog open, no `exec` call.
4. Tests: opening dialog (not prompt); Save with URL → `exec("createLink", url)` called once, dialog
   closes; blank URL → error shown, `exec` NOT called; Cancel → no `exec`, closes; no-selection case
   does not throw.
5. `npx tsc --noEmit` + eslint + `npx vitest run app/components/kudos/compose` green.

## Todo List

- [x] insert-link-dialog.tsx (cream, 2 fields, Hủy/Lưu, url-required)
- [x] rich-text-toolbar.tsx link button → dialog; window.prompt removed
- [x] empty-URL inline error (no exec call)
- [x] tests: save/cancel/blank/no-selection
- [x] tsc + eslint + vitest green

## Success Criteria

- Clicking the link button opens the cream 2-field dialog (no `window.prompt`).
- Save with valid URL calls `exec("createLink", url)` exactly once; blank URL blocks and shows error.
- No new dependency; files < 200 lines; existing toolbar behavior/aria tests green.

## Risk Assessment

| Risk | Likelihood | Impact | Countermove |
|------|-----------|--------|-------------|
| Editing P2-owned `rich-text-toolbar.tsx` before P2 done | Med | High | `depends_on: [2]`; forge waits for P2 green |
| Scope-creep into custom display-text in editor | Med | Med | FR-24 guidance honored: content field decorative, editor untouched |
| `window.prompt` remnant left in a test mock | Low | Low | Grep for `window.prompt` in compose tests after removal |

## Security Considerations

`createLink` inserts a user-supplied URL into contentEditable, but only `textContent` is persisted
(`rich-text-editor.tsx` never stores HTML) — no stored-XSS surface. No `javascript:` sanitization
needed for this mock scope (matches existing behavior); note if scope later persists HTML.

## Next Steps

Feeds P6. Parallel-safe with P3 (disjoint files) and P5 (different feature).
</content>
