# Phase 04 — Hashtag catalog dropdown + group preset

## Context Links
- Audit: `plans/reports/audit-260709-1522-kudos-i18n-and-features.md` → "Hashtag input trong compose dialog"
- File: `app/components/kudos/compose/hashtag-input.tsx` (current: free-text + removable chips + max 5)
- Reference pattern for hardcoded catalog: `lib/awards/award-categories-fallback.ts`
- Limits: `lib/kudos/kudos-compose-limits.ts` (`KUDOS_HASHTAGS_MAX_COUNT = 5`)
- Wiring: `app/components/kudos/compose/compose-dialog-fields.tsx:92-98` (`FieldGroup` → `HashtagInput`, labels from `compose.hashtags`)
- MoMorph: file `9ypp4enmFmdK3YAFJLIu6C`, screens `JsTvi8KVQA` (empty) / `RO7O6QOhfJ` (filled). No downloadable spec CSV — live frame only.

## ⚠️ Content is INVENTED per user request — not design-sourced
Live MoMorph frame data was pulled (`get_frame_node_tree`/`get_node` on both screens). **The design does NOT contain this upgrade:** no predefined-hashtag dropdown, no checkmark selection, no "Hashtag group" preset. The Hashtag section (`Frame 536` → `Tag Group` `662:8595`) is exactly 4 sample chips + a "+Hashtag / Tối đa 5" trigger + free-text add + per-chip remove + max 5 — which the current code already matches. The 4 chip strings are design mock data, verbatim: `#BE OPTIMISTIC`, `#WASSHOI`, `#BE A TEAM`, `High-perorming` (chip 4 has the design's own typo, no leading `#`).

**RESOLVED (user decision, 2026-07-09):** build the dropdown + checkmark selection + hashtag-group preset ANYWAY — explicit override of the design-fidelity finding. Because the design defines no catalog, **all catalog + group content in this phase is INVENTED placeholder data, not design-sourced.** It is isolated in one constants file and flagged so it is trivial to swap when a real catalog spec arrives. This is a deliberate, user-authorized exception to the MoMorph "never invent" rule — record that in the constants file's doc-comment.

## Overview
- Priority: P2
- Status: pending (unblocked — decisions resolved)
- Additively add: (a) a dropdown/popover of predefined hashtags with checkmarks on selected ones, and (b) a named "Hashtag group" preset selector that bulk-applies a group's tags. Preserve ALL existing behavior (free-text entry, chips, remove, max-5) — the dropdown is additive, NOT a replacement for free-text.

## Data source — decided: hardcoded constants file (no Supabase table)
New file `lib/kudos/kudos-hashtag-catalog.ts`, mirroring `lib/awards/award-categories-fallback.ts`'s hardcoded-catalog pattern. Justification (YAGNI/KISS):
- Precedent: this single-event app already hardcodes catalog-like structural data (`award-categories-fallback.ts`).
- No admin UI, no runtime mutation, no per-tenant variance → a DB table adds migration + query + fallback surface for zero dynamic benefit.
- The compose *filter's* distinct hashtags stay Supabase-derived from real posts (`getDistinctHashtags`) — unchanged. The *authoring suggestion* catalog is a curated static list, a separate concern, correctly static.

### Placeholder catalog + groups (INVENTED — swap later)
Seed values below; flag as placeholder in the file's doc-comment. Chip-4 typo fixed to `#HIGH-PERFORMING`. Extra values use Sun*-culture-style language — replace when a real spec lands.

```ts
export const KUDOS_HASHTAG_CATALOG: string[] = [
  "#BE OPTIMISTIC", "#WASSHOI", "#BE A TEAM", "#HIGH-PERFORMING",
  "#OWNERSHIP", "#CUSTOMER FIRST", "#INNOVATION", "#GRATITUDE",
  "#TEAMWORK", "#LEADERSHIP",
];

// Group `name` is an i18n KEY (or a label resolved via the dictionary),
// not a raw display string — see i18n note below. `tags` reference catalog entries.
export const KUDOS_HASHTAG_GROUPS: { id: string; tags: string[] }[] = [
  { id: "cultureValues", tags: ["#BE OPTIMISTIC", "#WASSHOI", "#BE A TEAM"] },
  { id: "performance",   tags: ["#HIGH-PERFORMING", "#OWNERSHIP", "#INNOVATION"] },
  { id: "teamwork",      tags: ["#TEAMWORK", "#LEADERSHIP", "#GRATITUDE"] },
];
```

Note: the hashtag STRINGS themselves are proper nouns / brand-style culture tags and stay as literals (same rationale as award-category names being exception content); only the GROUP display names and UI captions are localized (below).

### i18n
Group display names + UI captions ("Add from list" / "Choose a group") go into `compose.hashtags.*` in BOTH dictionaries (keyed by group `id`: `compose.hashtags.groups.cultureValues`, etc.). Coordinate with Phase 01 on the shared dictionary file — see plan.md ownership rule (Phase 01 owns the file; hand it these keys, or serialize the edit).

## Requirements
Functional:
- Preserve exactly: free-text add, `#` auto-prefix, case-insensitive dedupe, per-chip remove, `KUDOS_HASHTAGS_MAX_COUNT` cap, the "+Hashtag / Tối đa 5" trigger.
- Add a dropdown/popover listing `KUDOS_HASHTAG_CATALOG`; already-selected tags show a checkmark; clicking a row toggles chip membership (add if absent, remove if present).
- Add a group preset selector; choosing a group bulk-adds its tags.
- Dropdown selection and free-typing converge on the same `value: string[]` state and the same case-insensitive dedupe rule.

Non-functional:
- Server re-validation in `createKudosAction` unchanged and still authoritative — catalog is a UI convenience only, NOT a server allow-list; free-text tags outside the catalog remain valid (Q4 resolved below).
- `hashtag-input.tsx` stays < 200 lines; extract the dropdown into `hashtag-catalog-dropdown.tsx` if it grows past that.
- `tsc --noEmit` + lint clean; dictionary parity intact.

## Resolved sub-decisions (KISS defaults — override if desired)
- **Group overflow (was Q3):** applying a group adds its tags in order up to `KUDOS_HASHTAGS_MAX_COUNT`, silently dropping the rest (no error). Simplest, matches the existing cap behavior. Dedupe applies first (already-selected tags don't re-count).
- **Server allow-list (was Q4):** NO. The catalog is UI-only; the server keeps max-5-only validation and still accepts free-text tags. Avoids coupling the server to invented placeholder data that will be swapped.

## Architecture / Data flow
`kudos-hashtag-catalog.ts` (static) → imported by `hashtag-input.tsx` (client) → dropdown renders `KUDOS_HASHTAG_CATALOG` with checkmarks derived from `value`; group selector maps `id → tags`, merged into `value` via the existing `onChange` + dedupe path (capped). No server / Supabase change. `compose-dialog-fields.tsx` passes new labels via the existing `labels.hashtags` object; group display names resolved from the dictionary by `id`.

## Related Code Files
Create:
- `lib/kudos/kudos-hashtag-catalog.ts` (with the "INVENTED placeholder" doc-comment)
- (optional) `app/components/kudos/compose/hashtag-catalog-dropdown.tsx` if `hashtag-input.tsx` exceeds 200 lines
Modify:
- `app/components/kudos/compose/hashtag-input.tsx` — add dropdown + group selector; keep ALL existing logic
- `app/components/kudos/compose/compose-dialog-fields.tsx` — pass new labels (dropdown/group captions + group names)
- `lib/i18n/dictionaries/en.ts` + `vi.ts` — `compose.hashtags.*` captions + `compose.hashtags.groups.*` names (coordinate w/ Phase 01)
- extend `HashtagInputLabels` interface with the new label fields

## Implementation Steps
1. Create `lib/kudos/kudos-hashtag-catalog.ts` with the seed catalog + groups above; doc-comment flags content as INVENTED placeholder per user request (not design-sourced), easy to swap.
2. Add dropdown UI to `hashtag-input.tsx`: a toggle reveals the catalog list; each row shows a checkmark when `value` (case-insensitive) includes it; click toggles via the existing `onChange` + dedupe (respecting max — if at max and adding, no-op like the current trigger).
3. Add the group preset selector (small select/menu of groups by localized name); on pick, merge `group.tags` into `value` with dedupe, capped at max (drop overflow silently).
4. Preserve the free-text row + all existing behavior; both entry paths share dedupe + cap.
5. Add dictionary captions + group names (both locales); extend `HashtagInputLabels`.
6. Keep `hashtag-input.tsx` < 200 lines (extract dropdown component if needed).
7. `tsc --noEmit` + lint. Manual: free-text add, dropdown toggle add/remove, checkmark reflects state, group apply (incl. overflow drop), per-chip remove, dedupe, max-5 all correct.

## Todo List
- [ ] Create `lib/kudos/kudos-hashtag-catalog.ts` (seed catalog + groups, INVENTED-placeholder doc-comment)
- [ ] Add checklist dropdown to `hashtag-input.tsx` (checkmarks reflect `value`, toggle add/remove)
- [ ] Add group preset selector (bulk-add, dedupe, cap-with-silent-overflow-drop)
- [ ] Preserve free-text + chip + dedupe + max-5 (additive only)
- [ ] Add dictionary captions + group names (en + vi), keyed by group `id`
- [ ] Extend `HashtagInputLabels`
- [ ] `hashtag-input.tsx` < 200 lines (extract dropdown if needed)
- [ ] `tsc --noEmit` + lint clean

## Success Criteria
- Dropdown lists the catalog; checkmarks reflect current selection; clicking toggles chips.
- Group preset bulk-adds its tags respecting dedupe + max-5 (overflow dropped silently).
- All prior free-text / chip / remove / max behavior intact (dropdown is additive).
- Static catalog only (no new DB table, no server allow-list); dictionaries stay parity-valid.

## Risk Assessment
- Medium: catalog/group content is invented placeholder — wrong values may ship. Countermove: isolated in one flagged file, swappable; server does not depend on it.
- Medium: shared dictionary file with Phase 01 → serialize edits or hand keys to Phase 01 (plan.md ownership rule).
- Low: `hashtag-input.tsx` file-size creep → extract dropdown component.

## Decisions (RESOLVED — no blockers)
- **Proceed:** build the upgrade despite absence from design (user override, 2026-07-09).
- **Data source:** hardcoded `kudos-hashtag-catalog.ts` (not Supabase).
- **Catalog content:** invented placeholder (design mock values + culture-language extras), flagged for later swap.
- **Group overflow:** add up to cap, drop rest silently.
- **Server allow-list:** none — catalog is UI-only; free-text still valid.

## Unresolved
- None blocking. Open follow-up (non-blocking): replace the invented catalog + group content with a real product-owned spec when one exists — the constants file is the single swap point.
