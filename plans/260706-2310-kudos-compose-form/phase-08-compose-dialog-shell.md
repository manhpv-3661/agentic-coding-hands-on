---
feature: F007
phase: 08
title: Compose dialog shell / orchestrator
status: done
---

# Phase 08 — Compose dialog shell / orchestrator

## Context Links
- Spec: FR-1 (modal `role=dialog` `aria-modal`, overlay, close via Cancel/Escape/outside), FR-4/9/13/19 (validation), FR-20 (Cancel discards), FR-21 (submit builds KudosPost + prepend + toast).
- Depends: Phases 01 (types/timestamp), 02 (labels), 03-07 (field components).
- Existing: `app/components/kudos/open-gift-button.tsx` (dialog shell precedent), `copy-link-button.tsx` (toast pattern).

## Overview
- **Priority:** P1 (integrates all fields) · **Status:** pending
- Presentational-controlled dialog: `open`/`containerRef`/`onClose` come from the Phase 10
  wrapper's `useDismissableMenu`; the shell owns the FORM state + validation + submit.

## Key Insights
- Escape + outside-click close are provided by the wrapper's `useDismissableMenu` (containerRef
  wraps the panel; backdrop click = outside → close) — the shell does NOT re-implement them.
- One `useState` per field + one `errors` object (`useState<Record<string,string>>`), no form lib (KISS).
- Success toast = the exact `copy-link-button.tsx` pattern: local `useState` + `setTimeout(2000)` +
  `role="status"` bubble; NO global toast.
- Content persisted is the editor's plain text; `imageCount = files.length`.

## Requirements
- **FR-1:** panel `role="dialog"` `aria-modal="true"` `aria-label={labels.dialogTitle}`; only render when `open`.
- **FR-20:** Cancel `<button type="button">` → reset all fields + `onClose()`.
- **FR-4/9/13/19:** on submit, validate: recipient set, title non-empty, content non-empty, ≥1 hashtag,
  and (if anonymous) nickname non-empty → populate `errors`; if any, keep open, do not build post.
- **FR-21:** on valid submit → build `KudosPost` → `onSubmit(post)` → reset form → `onClose()` → show toast.

## Architecture
```ts
export interface ComposeDialogProps {
  open: boolean;
  containerRef: RefObject<HTMLDivElement | null>;   // from useDismissableMenu (wrapper)
  onClose: () => void;
  onSubmit: (post: KudosPost) => void;               // wrapper's addPost
  recipientOptions: KudosPerson[];
  mentionNames: string[];                            // recipientOptions.map(p => p.name)
  currentUser: KudosPerson;
  labels: Dictionary["kudos"]["compose"];
}
```
Field state: `recipient: KudosPerson|null`, `title: string`, `content: string`,
`hashtags: string[]`, `images: File[]`, `anonymous: boolean`, `nickname: string`, `errors`.

Submit build:
```ts
const post: KudosPost = {
  id: `kudos-new-${Date.now()}`,
  sender: anonymous ? { name: nickname.trim(), department: "", stars: 0 } : currentUser,
  recipient,                       // non-null after validation
  title: title.trim(),
  timestamp: formatKudosTimestamp(new Date()),
  content: content.trim(),
  hashtags,
  imageCount: images.length,
  hearts: 0,
};
```

## Related Code Files
- **Create:** `app/components/kudos/compose/compose-dialog.tsx`, `compose-dialog.test.tsx`
- **Read for context:** `open-gift-button.tsx`, `copy-link-button.tsx`, all Phase 03-07 components

## Implementation Steps
1. `"use client"`; render overlay `<div className="fixed inset-0 z-50 ... bg-black/60">` only when `open`,
   inner panel `<div ref={containerRef} role="dialog" aria-modal aria-label>` (scrollable, dark theme).
2. Compose the six field components, threading `labels.compose.*` sub-slices + per-field `errors[x]`.
3. `validate()` returns an errors map; `handleSubmit()` runs it, bails if non-empty, else builds post,
   calls `onSubmit`, resets state, `onClose()`, triggers toast.
4. `handleCancel()` resets + `onClose()`.
5. Toast: local state + `setTimeout` cleanup on unmount (copy the `copy-link-button.tsx` guard).
6. Keep <200 lines — extract `validate`/`buildPost` as small local helpers if needed (or a
   `compose-form-helpers.ts` sibling if the file approaches the cap).

## Todo List
- [x] dialog overlay/panel (role, aria, containerRef) rendered only when open
- [x] all six fields wired with state + per-field errors
- [x] validation (recipient/title/content/hashtag, conditional nickname)
- [x] submit builds `KudosPost` (timestamp, hearts:0, imageCount, anonymous sender) + resets + toast
- [x] cancel discards + closes
- [x] test: submit-empty shows errors + no onSubmit; valid submit calls onSubmit with correct post
      shape (spy args), resets, shows toast; anonymous path sets sender name = nickname; cancel closes

## Success Criteria
- Invalid submit blocks + shows inline errors; valid submit emits a correct `KudosPost` once, resets, toasts.

## Risk Assessment
- **File exceeds 200 lines (High):** fields are separate components already; if still large, pull
  `validate`/`buildPost` into `compose-form-helpers.ts` (pure, unit-testable).
- **Focus/scroll on a tall dialog (Med):** panel `max-h-[90vh] overflow-y-auto`; autofocus first field.
- **Double toast/timer leak (Low):** clear timeout on unmount (copy the proven guard).

## Security Considerations
- Only `textContent` persisted (no HTML). Nickname/title are plain text. No network. None beyond gate.

## Next Steps
- Mounted by the Phase 10 wrapper; `onSubmit` = wrapper `addPost` (prepend to feed state).
</content>
