# Phase 01 — Kudos compose dedup (group a)

## Context Links
- Plan: [plan.md](plan.md) · Foundation: [phase-00](phase-00-shared-primitives-foundation.md)
- Specs: f007-kudos-compose-form (behavior unchanged)

## Overview
- **Priority:** P1 (highest coupling area)
- **Status:** done · **Depends on:** 00
- **Description:** Remove dead surface, dedup icons/styles, fold the one over-split data file — inside `app/components/kudos/compose/` only.

## Key Insights
Single clean import DAG, no cycles. Fragmentation mostly justified; the concrete safe wins are dead code + local icon/style dedup + one merge.

### Dead code (confirmed via app-wide grep)
- `rich-text-toolbar.tsx:13` `linkPrompt` field — self-comment says unused (FR-24 retired window.prompt). Delete field + dict entries `lib/i18n/dictionaries/en.ts:294` & `vi.ts:378`.
- Exported-but-only-local types (drop `export`, keep type): `ComposeFormErrorMessages` (compose-form-helpers.ts:36), `CollectionIconMeta` (community-standards-content.ts:18), `RichTextEditorLabels` (rich-text-editor.tsx:16), `ComposeDialogFieldsProps` (compose-dialog-fields.tsx:11), `HashtagCatalogDropdownLabels` (hashtag-catalog-dropdown.tsx:16).

### Duplication
- **`PlusIcon` identical SVG** in `hashtag-input.tsx:42-48` and `image-upload.tsx:10-16` → extract `plus-icon.tsx` (mirror existing `chevron-down-icon.tsx` pattern), delete both copies.
- **"+chip" trigger button block** near-identical in `hashtag-input.tsx:158-179` & `image-upload.tsx:112-131` → shared `chip-add-trigger.tsx` `{id?, ariaLabel, onClick, label, max}`.
- **Input-field class cluster** (`h-14 w-full rounded-lg border border-[#998C5F] ...`) verbatim in `anonymous-toggle.tsx:49` & `compose-dialog-fields.tsx:74` → shared const (align with `insert-link-dialog.tsx`'s local `FIELD_CLASS`).
- **Field-error paragraph** rendered 2 inconsistent ways (`text-sm ... #D4271D` ×2 vs `text-xs ... #CF1322` ×4). Extract `field-error.tsx`. **Behavior note:** current red/size DIFFERS between sites — unifying = visual change. Preserve each site's current style via a `tone`/variant prop OR keep as-is and only dedup the identical group. Default: dedup only the byte-identical `text-xs ... #CF1322` group (4 sites); leave the 2 divergent ones untouched to guarantee zero visual change. Flag divergence as unresolved.
- **`isSelected()` (hashtag-catalog-dropdown.tsx:45-47)** duplicates `isDuplicateTag()` in `lib/kudos/kudos-hashtag-merge.ts:12` → import & reuse.
- `cn()` idiom sites here → adopt `lib/ui/cn` (phase-00).

### Merge candidate
- `community-standards-content.ts` (58 lines, single consumer, data+`splitHeadingAndBody`) → fold into `community-standards-panel.tsx`. Re-measure: 139+58 may fit <200; if not, keep split (document reason).

### Keep-as-is (do NOT merge — legit SRP or multi-use)
`chevron-down-icon.tsx` (2 consumers), `field-group.tsx` (4 in-file uses), `mention-suggestions.tsx`, `insert-link-dialog.tsx`, `rich-text-toolbar.tsx`, `hashtag-catalog-dropdown.tsx` (size-driven, parent at 199), `compose-form-helpers.ts` (2 independent callers).

## Requirements
- No behavior change; compose dialog flow identical.
- Preserve public exports consumed outside dir: `buildKudosPost`, `toCreateKudosInput`, `EMPTY_COMPOSE_FORM_STATE`, `ComposeFormState` (used by `../use-kudos-optimistic-posts.ts`).

## Architecture
Import DAG unchanged. New leaves: `plus-icon.tsx`, `chip-add-trigger.tsx`, `field-error.tsx` (consumed within dir). `community-standards-content.ts` removed after fold.

## Related Code Files
**Modify:** hashtag-input.tsx, image-upload.tsx, anonymous-toggle.tsx, compose-dialog-fields.tsx, hashtag-catalog-dropdown.tsx, rich-text-toolbar.tsx, rich-text-editor.tsx, community-standards-panel.tsx, compose-form-helpers.ts, `lib/i18n/dictionaries/en.ts`, `lib/i18n/dictionaries/vi.ts` (linkPrompt removal — owned by this phase).
**Create:** plus-icon.tsx, chip-add-trigger.tsx, field-error.tsx.
**Delete:** community-standards-content.ts (after fold, if size allows).

## Implementation Steps
1. Delete `linkPrompt` field + 2 dict entries; confirm no reader (grep).
2. Drop `export` on the 5 local-only type interfaces.
3. Create `plus-icon.tsx`; repoint hashtag-input & image-upload; delete inline copies.
4. Create `chip-add-trigger.tsx`; adopt in hashtag-input & image-upload.
5. Add shared input-field class const; adopt in anonymous-toggle & compose-dialog-fields.
6. Create `field-error.tsx`; adopt at the 4 identical `#CF1322` sites only.
7. Replace `isSelected()` with `isDuplicateTag` import.
8. Fold community-standards-content into panel (or keep + document).
9. Adopt `cn()` at existing merge sites.
10. `npm run lint && npm run test && npm run build`.

## Todo List
- [x] linkPrompt + dict entries removed
- [x] 5 exports de-exported
- [x] plus-icon extracted, copies gone
- [x] chip-add-trigger adopted
- [x] input-field const adopted
- [x] field-error extracted (identical group only)
- [x] isDuplicateTag reused
- [x] community-standards-content folded/decided
- [x] cn() adopted
- [x] tests + lint + build green

## Success Criteria
- `compose-dialog.test.tsx`, `hashtag-input.test.tsx`, `image-upload.test.tsx`, `anonymous-toggle.test.tsx`, `mention-suggestions.test.tsx`, `rich-text-editor.test.tsx`, `rich-text-toolbar.test.tsx`, `insert-link-dialog.test.tsx`, `recipient-select.test.tsx`, `community-standards-*.test.tsx`, `compose-form-helpers.test.ts` all pass unchanged.
- Compose dialog renders/behaves identically (manual smoke at 1440/375).

## Tests (add/update)
- **New:** `plus-icon.test.tsx`, `chip-add-trigger.test.tsx`, `field-error.test.tsx` (render + props).
- **New:** `rich-text-caret-helpers.test.ts` — currently NO dedicated test; if the file stays split it MUST earn tests (caret/Range logic). Cover token boundary, empty selection, mention insertion offset.
- **Update:** `compose-form-helpers.test.ts` if the `isDuplicateTag` reuse changes any code path.

## Risk Assessment
| Risk | L | I | Countermeasure |
|------|---|---|----------------|
| field-error unification shifts a field's red/size | Med | Med | Only dedup byte-identical group; leave divergent 2 alone |
| Removing dict `linkPrompt` breaks a lazy dict-shape check | Low | Low | grep confirms no reader; type shape updated in both locales |
| community fold pushes panel >200 | Med | Low | Re-measure; keep split if over |
| Breaking `compose-form-helpers` public export used by hook (phase 02) | Low | High | Only de-export local-only types; never touch build*/toCreate*/EMPTY_* |

## Security Considerations
No auth/data-path change. Rich-text/mention input sanitization logic must remain byte-identical — do not touch parsing while deduping.

## Next Steps
Parallel-safe with 02/03/04. Notify phase 02 owner that compose public exports are preserved.
