---
feature: F007
phase: 04
title: Rich-text editor + toolbar + mentions
status: done
---

# Phase 04 — Rich-text editor + toolbar + mentions

## Context Links
- Spec: FR-6 (6-button toolbar via execCommand), FR-7 (@mention inline suggestions → plain `@Name`),
  FR-8 (live `{n}/1.000` counter, hard cap 1000), FR-9 (empty → error), FR-10 (community-standards stub).
- Research: `researcher-01-*.md` §8-9 (no rich-text lib; build minimal), `researcher-02-*.md` §3.
- Clarifications: contentEditable + `document.execCommand`; `@mention` inserts plain text (content stays string).

## Overview
- **Priority:** P1 (largest component) · **Status:** pending
- Split into 4 files to stay <200 lines each; editor orchestrates toolbar + mention list + counter.

## Key Insights
- `KudosPost.content` is a plain `string` — the shell reads the editor's **text** (`textContent`),
  not HTML. `onChange(text)` emits current plain text; formatting is visual-only in the mock.
- Char cap enforced in the input handler against `textContent.length` (block, not just validate).
- `@` detection: on input, if the token under the caret starts with `@`, show `mention-suggestions`
  filtered by the people-name list; selecting inserts `@Name ` as plain text.
- execCommand is deprecated but present in jsdom + browsers; acceptable for this mock (no dep).

## Requirements
- **FR-6:** toolbar buttons Bold/Italic/Strikethrough/UnorderedList/Link/Quote → `document.execCommand`
  (`bold`,`italic`,`strikeThrough`,`insertUnorderedList`,`createLink`,`formatBlock` blockquote).
- **FR-7:** `@` + typing → suggestion list (names from Phase 01 people list); select → insert `@Name`.
- **FR-8:** counter `{n}/1.000` live; block input past 1000 chars.
- **FR-9:** shell validates non-empty (component surfaces `error` prop).
- **FR-10:** `community-standards-link` = non-navigating `<button type="button">` stub, no-op.

## Architecture
```ts
// rich-text-editor.tsx (orchestrator, "use client")
export interface RichTextEditorProps {
  value: string; onChange: (text: string) => void;
  mentionNames: string[]; maxLength?: number;   // default 1000
  error?: string; labels: RichTextEditorLabels;  // placeholder, counterMax, toolbar{}, error, communityStandards
}
// rich-text-toolbar.tsx — 6 buttons, prop: onCommand(cmd, arg?) or exec(cmd); aria-labels from labels.toolbar
// mention-suggestions.tsx — { names, query, onSelect(name), open } → role="listbox"
// community-standards-link.tsx — { label } → static button stub (code comment: no target page)
```
- Editor holds a `contentEditable` div ref + `count` state. `onInput`: read `textContent`; if
  length > max, restore previous value (or `slice`), else emit `onChange(text)` + update count + run @detect.
- Counter `<span>` shows `${count}/${labels.counterMax}`.

## Related Code Files
- **Create:** `app/components/kudos/compose/rich-text-editor.tsx` + test
- **Create:** `app/components/kudos/compose/rich-text-toolbar.tsx` + test
- **Create:** `app/components/kudos/compose/mention-suggestions.tsx` + test
- **Create:** `app/components/kudos/compose/community-standards-link.tsx` + test

## Implementation Steps
1. `rich-text-toolbar.tsx`: 6 `<button type="button" aria-label={...}>` calling an `exec(cmd, arg?)`
   prop; parent wires `exec` to `document.execCommand(cmd, false, arg)`.
2. `mention-suggestions.tsx`: controlled list; filters `names` by `query` (case-insensitive);
   `onSelect(name)` on click; render nothing when closed/empty.
3. `community-standards-link.tsx`: static styled `<button>`, no handler (comment: stub, no target).
4. `rich-text-editor.tsx`: contentEditable div + counter; input handler enforces cap + emits text +
   detects `@token`; renders toolbar, mention list, community link, and inline error when `error` set.
5. Guard: `typeof document.execCommand === "function"` before calling (jsdom-safe).

## Todo List
- [x] toolbar (6 buttons, execCommand wiring) + test (spy `document.execCommand`)
- [x] mention-suggestions filter + select + test
- [x] community-standards stub (no navigation) + test
- [x] editor: contentEditable, live counter, 1000 hard cap, @detect+insert, inline error + test
- [x] all four files <200 lines

## Success Criteria
- Typing updates counter; input blocked at 1000; toolbar buttons invoke execCommand; `@` shows
  suggestions and selecting inserts `@Name`; empty-content error renders when `error` passed.

## Risk Assessment
- **contentEditable caret/mention complexity (High):** keep mention detection to the trailing
  `@\w*` token via a simple regex on `textContent`; insert plain text and let the browser place
  caret at end — no range gymnastics. Countermove: if caret-precise insertion proves fragile,
  append `@Name ` at the end (acceptable for mock; documented).
- **jsdom execCommand no-op (Med):** tests assert the call happened (spy), not the DOM effect.
- **Counter vs multibyte (Low):** use `textContent.length` (UTF-16 units) — matches Figma "0/1.000".

## Security Considerations
- contentEditable can hold pasted HTML; since only `textContent` is persisted to `content`
  (a string), no HTML is stored/rendered downstream — `KudosCard` renders `content` as text.
  Note this explicitly in a code comment.

## Next Steps
- Consumed by the dialog shell (Phase 08) as the "Nội dung" field.
</content>
