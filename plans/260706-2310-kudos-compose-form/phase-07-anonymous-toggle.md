---
feature: F007
phase: 07
title: Anonymous toggle + nickname
status: done
---

# Phase 07 — Anonymous toggle + nickname

## Context Links
- Spec: FR-17 (checkbox reveals required "Nickname ẩn danh"), FR-18 (anonymous → sender from nickname), FR-19 (checked + empty nickname → error).
- Research: `researcher-02-*.md` §3 (no checkbox-reveals-field pattern exists — build minimal).

## Overview
- **Priority:** P1 · **Status:** pending
- Controlled checkbox + conditional nickname text field. Parent owns state; sender substitution
  happens in the shell (Phase 08), not here.

## Key Insights
- When unchecked, nickname field is hidden AND not required; when checked it is required.
- This component only collects `checked` + `nickname`; the shell decides the final `sender`.

## Requirements
- **FR-17:** checkbox "Gửi lời cảm ơn và ghi nhận ẩn danh"; when checked, render nickname input
  (label + placeholder "Doraemon").
- **FR-19:** shell validates nickname non-empty when checked; component renders `nicknameError` inline.

## Architecture
```ts
export interface AnonymousToggleLabels { checkbox: string; nicknameLabel: string; nicknamePlaceholder: string; error: string; }
export interface AnonymousToggleProps {
  checked: boolean; onCheckedChange: (checked: boolean) => void;
  nickname: string; onNicknameChange: (value: string) => void;
  nicknameError?: string; labels: AnonymousToggleLabels;
}
```
- `<label><input type="checkbox" checked onChange />{labels.checkbox}</label>`.
- When `checked`: render nickname `<input>` (controlled) + inline error when `nicknameError` set.

## Related Code Files
- **Create:** `app/components/kudos/compose/anonymous-toggle.tsx`, `anonymous-toggle.test.tsx`

## Implementation Steps
1. Build controlled component per interface; `"use client"`.
2. Toggle checkbox → `onCheckedChange(e.target.checked)`.
3. Conditionally render nickname field only when `checked`.
4. Render `nicknameError` inline when present.

## Todo List
- [x] checkbox toggles (`onCheckedChange`)
- [x] nickname field shown only when checked
- [x] inline nickname error
- [x] test: checkbox reveals field, unchecking hides it, error text renders when passed,
      `getByRole("checkbox")` + `getByRole("textbox")` assertions

## Success Criteria
- Checking reveals the required nickname field; unchecking hides it; error renders when passed.

## Risk Assessment
- **Stale nickname after unchecking (Low):** shell ignores nickname when unchecked; optionally
  clear on uncheck — document the chosen behavior (recommend: keep value, ignore on submit).

## Security Considerations
- Nickname rendered as text (sender name). None.

## Next Steps
- Consumed by the dialog shell (Phase 08); shell maps to `sender` per FR-18.
</content>
