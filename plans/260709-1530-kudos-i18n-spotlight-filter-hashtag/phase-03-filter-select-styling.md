# Phase 03 — Filter select styling bug

## Context Links
- Audit: `plans/reports/audit-260709-1522-kudos-i18n-and-features.md` → "Vấn đề 3 → Filter hashtag/phòng ban"
- File: `app/components/kudos/kudos-filters.tsx`
- MoMorph: Sun* Kudos board `https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ` — filter pills `Frame 483` INSTANCE `186:2757`, chevron `I2940:13459;186:2761`

## Overview
- Priority: P2
- Status: pending
- Pure styling fix. `text-white` on a near-transparent light fill (`bg-[rgba(255,234,158,0.10)]`) makes select text and chevron invisible (white-on-white). No hover state. Fix color + add hover. Filter DATA is already Supabase-backed and correct — NO data-layer change.

## Key Insights
- Two spots share the bug: `PILL_SELECT_CLASSNAME` (line 55, `text-white` on the `<select>`) and `ChevronDownIcon` (line 33, `text-white` on the SVG).
- `text-[#00101A]` is the established dark text token already used elsewhere in this codebase (e.g. `hashtag-input.tsx` chips) — reuse it, do not invent a new color.
- The select options themselves render with the browser's native option styling; the invisibility is the closed/resting select display text + chevron. Verify the fix against the design's resting state (field label shown as dark text on the translucent gold pill).

## Requirements
Functional:
- Resting select text is legible (dark) on the translucent gold pill.
- Chevron glyph is legible (dark).
- A hover state exists (e.g. darker text or subtle bg shift) on both pills.

Non-functional:
- No change to filter behavior, options source, or `ALL_VALUE` reset semantics.
- Matches MoMorph pill chrome (border `#998C5F`, translucent gold fill, 4px radius) — only the text/icon color changes.

## Architecture / Data flow
No data-flow change. `kudos-board.tsx` still owns filter state and passes `value`/`onChange`/options/labels. This phase edits only Tailwind class strings inside `kudos-filters.tsx`.

## Related Code Files
Modify:
- `app/components/kudos/kudos-filters.tsx`:
  - Line 33 `ChevronDownIcon`: `text-white` → `text-[#00101A]`
  - Line 55 `PILL_SELECT_CLASSNAME`: `text-white` → `text-[#00101A]`, add a hover class (e.g. `hover:bg-[rgba(255,234,158,0.20)]` and/or `hover:text-[#00101A]` if a hover recolor is wanted). Confirm the exact hover treatment against MoMorph if a hover variant exists; otherwise a subtle bg darken is the KISS default.

## Implementation Steps
1. Edit the two class strings (chevron + select) to dark text.
2. Add a hover class to the select pill.
3. Verify at 1440: closed selects show dark, legible label text + chevron; open dropdown options readable; hover gives feedback.
4. Lint.

## Todo List
- [ ] Chevron icon color → dark
- [ ] Select text color → dark
- [ ] Add hover state to select pill
- [ ] Visual verify at 1440 (closed + open + hover)
- [ ] Lint clean

## Success Criteria
- Filter labels/values and chevron visibly readable on the gold pill in both locales.
- Hover feedback present.
- No behavioral/data regression (options still from `getDistinctHashtags`/`getDistinctDepartments`).

## Risk Assessment
- Low. Isolated CSS class change in one file.

## Unresolved
- Exact hover treatment (bg darken vs text recolor) — check MoMorph for a hover/focus variant; default to `hover:bg-[rgba(255,234,158,0.20)]` if none specified.
