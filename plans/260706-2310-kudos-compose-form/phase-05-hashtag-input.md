---
feature: F007
phase: 05
title: Hashtag chip input
status: done
---

# Phase 05 — Hashtag chip input

## Context Links
- Spec: FR-11 (chip input, max 5, auto-`#`, dedupe case-insensitive, remove X), FR-12 (hide/disable add at 5), FR-13 (empty → error).
- Research: `researcher-02-*.md` §3 (no tag-input lib; mirror `kudos-filters.tsx` controlled style).

## Overview
- **Priority:** P1 · **Status:** pending
- Controlled chip input; parent owns `value: string[]` + `error`.

## Key Insights
- Auto-prefix `#` if the user omits it; dedupe by lowercase comparison; cap at 5.
- Enter key OR "+Hashtag" button commits the current text; empty/whitespace ignored.

## Requirements
- **FR-11:** add via Enter or button; normalize (`trim`, prefix `#`, collapse inner spaces per design
  examples like `#BE A TEAM` keep spaces); reject case-insensitive duplicates; each chip has an X remove.
- **FR-12:** at 5 chips, disable/hide the add control (label switches to `labels.max`, e.g. "Tối đa 5").
- **FR-13:** shell validates ≥1 (component surfaces `error` prop, renders inline).

## Architecture
```ts
export interface HashtagInputLabels { label: string; placeholder: string; add: string; max: string; error: string; remove: string; }
export interface HashtagInputProps {
  value: string[]; onChange: (tags: string[]) => void;
  max?: number;                    // default 5
  error?: string; labels: HashtagInputLabels;
}
```
- Local `useState` for the current text field only.
- `commit()`: normalize → if not blank, not dup (lowercase), and `value.length < max` → `onChange([...value, tag])`; clear text.
- Chips: `value.map(tag => <span>{tag}<button aria-label={labels.remove} onClick=removeAt/></span>)`.

## Related Code Files
- **Create:** `app/components/kudos/compose/hashtag-input.tsx`, `hashtag-input.test.tsx`
- **Read for context:** `app/components/kudos/kudos-filters.tsx`

## Implementation Steps
1. Build controlled component per interface; `"use client"`.
2. `onKeyDown` Enter → `commit()` (prevent default form submit); add button → `commit()`.
3. Normalize: `const t = raw.trim(); tag = t.startsWith("#") ? t : "#" + t;`
4. Dedupe check via `value.some(v => v.toLowerCase() === tag.toLowerCase())`.
5. At `value.length >= max`: disable input+button, show `labels.max`. Inline error when `error` set.

## Todo List
- [x] chip add via Enter + button
- [x] auto-`#` prefix, case-insensitive dedupe
- [x] max-5 disable + `labels.max`
- [x] remove chip (X)
- [x] inline error
- [x] test: adds chip, auto-prefixes, ignores dup, caps at 5, removes chip, shows error

## Success Criteria
- Chips add/remove correctly; duplicates ignored; add disabled at 5; error renders when passed.

## Risk Assessment
- **Enter submits the surrounding form (Med):** `preventDefault()` on Enter in the field.
  The dialog shell also uses `<button type="button">` for non-submit actions to avoid accidental submit.

## Security Considerations
- User strings rendered as text chips (no HTML). None.

## Next Steps
- Consumed by the dialog shell (Phase 08) as the "Hashtag" field.
</content>
