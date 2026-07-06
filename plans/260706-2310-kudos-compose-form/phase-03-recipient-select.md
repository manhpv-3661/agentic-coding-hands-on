---
feature: F007
phase: 03
title: Recipient searchable dropdown
status: done
---

# Phase 03 — Recipient searchable dropdown

## Context Links
- Spec: FR-3 (searchable, filter by case-insensitive substring, excludes CURRENT_USER), FR-4 (required → inline error).
- Research: `researcher-02-*.md` §3 (`use-dismissable-menu` is the right primitive, `haspopup:"listbox"`).
- Existing: `hooks/use-dismissable-menu.ts`, `app/components/kudos/avatar.tsx` (optional, for option rows).

## Overview
- **Priority:** P1 · **Status:** pending
- Hand-built searchable single-select over `KudosPerson[]`. No combobox library.

## Key Insights
- Reuse `useDismissableMenu({ haspopup: "listbox" })`: gives Escape + outside-pointerdown close,
  `containerRef`, `triggerProps`, `open`/`setOpen` — do NOT reinvent (DRY).
- Controlled component: parent (Phase 08 shell) owns `value`/`error`; this renders + emits `onChange`.
- Options are `KudosPerson[]` (from `getDistinctRecipients`) — emit the full person object on select
  (the shell needs `{name,department,stars}` to build `KudosPost.recipient`).

## Requirements
- **FR-3:** text input filters options by `name.toLowerCase().includes(query.toLowerCase())`.
- **FR-4:** when `error` prop set, render inline error text below the field, `role`-discoverable.
- Selecting an option sets value, closes list, shows selected name in the trigger.

## Architecture
```ts
export interface RecipientSelectLabels { label: string; placeholder: string; search: string; error: string; }
export interface RecipientSelectProps {
  options: KudosPerson[];
  value: KudosPerson | null;
  onChange: (person: KudosPerson) => void;
  error?: string;                 // shell passes labels.recipient.error when invalid
  labels: RecipientSelectLabels;
}
```
- Trigger `<button>` spreads `triggerProps`; shows `value?.name ?? placeholder`.
- Panel wrapped by `containerRef`: a search `<input>` (auto-focus on open) + filtered `<ul role="listbox">`
  of `<li><button role="option">`.
- Error `<p>` shown when `error` truthy (e.g. `text-red-400 text-xs`).

## Related Code Files
- **Create:** `app/components/kudos/compose/recipient-select.tsx`, `recipient-select.test.tsx`
- **Read for context:** `hooks/use-dismissable-menu.ts`, `app/components/kudos/kudos-filters.tsx`

## Implementation Steps
1. Build the controlled component per interface above; `"use client"`.
2. Local `useState` for the search query only; reset query when list closes.
3. Filter options live; render `role="listbox"`/`role="option"`.
4. On option click: `onChange(person)`, `setOpen(false)`.
5. Render inline error when `error` set. Keep <200 lines.

## Todo List
- [x] component with `useDismissableMenu` listbox
- [x] substring filter (case-insensitive)
- [x] emits full `KudosPerson` on select
- [x] inline error render
- [x] test: opens on trigger, filters by typing, selecting calls `onChange` with the person,
      shows error text when `error` prop set, closes on Escape

## Success Criteria
- Typing narrows options; selection emits the person; error text appears when passed.

## Risk Assessment
- **Trigger click vs outside-close race (Low):** listeners attach only while open; the opening
  click precedes attach. Verified pattern (same as header menus).

## Security Considerations
- No injection surface (names are static mock strings). None.

## Next Steps
- Consumed by the dialog shell (Phase 08) as the "Người nhận" field.
</content>
