---
phase: 1
title: "i18n dictionary keys (foundation)"
status: completed
priority: P1
effort: 2h
depends_on: []
parallel_safe_with: [2]
file_ownership:
  - lib/i18n/dictionaries/vi.ts
  - lib/i18n/dictionaries/en.ts
  - lib/i18n/dictionaries/parity.test.ts (read/verify only — generic test, no edit expected)
---

# Phase 1 — i18n Dictionary Keys (Foundation)

## Context Links

- Spec: `spec/compose-form-momorph-conformance/technical-spec.md` (FR-23, FR-24),
  `spec/secret-box-momorph-conformance/technical-spec.md` (FR-19-rev)
- Existing dicts: `lib/i18n/dictionaries/vi.ts` (309 lines), `en.ts` (275), parity guard `parity.test.ts`
- i18n convention (memory): self-written dict, cookie-only, no i18n lib, no locale routing

## Overview

- **Priority:** P1 (foundation — unblocks P3/P4/P5)
- **Status:** pending
- Add every new dictionary key the three content phases need, in one pass, so no downstream phase
  edits the shared `vi.ts`/`en.ts`. Additive only — do not alter existing keys.

## Key Insights

- `parity.test.ts` recursively enforces vi/en key-set parity — every key added to `vi.ts` MUST have
  an exact counterpart in `en.ts` or the suite fails. This is the built-in guard; no test edit needed.
- Existing kudos namespaces: `kudos.gift.*` (F006 secret box), `kudos.compose.*` (F007). Extend those,
  do not create new top-level namespaces.
- `kudos.compose.content.communityStandards` is currently a **string** ("Tiêu chuẩn cộng đồng").
  P3 needs a trigger label + full panel content → restructure it into an **object** (see contract).
  This is the one existing key whose shape changes; P3's `rich-text-editor.tsx` wiring consumes it.

## Requirements

- **FR-23 keys** (`kudos.compose.communityStandards` → object): panel title ("Thể lệ"), section
  headings (NGƯỜI NHẬN KUDOS / NGƯỜI GỬI KUDOS / KUDOS QUỐC DÂN), 4 hero-tier rows (each:
  condition line + description line), 6 collection-icon names + the "collect the full set" paragraph,
  national-kudos blurb, footer buttons ("Đóng" / "Viết KUDOS"), and the trigger label itself.
- **FR-24 keys** (`kudos.compose.content.toolbar.addLink` object): dialog title, "Nội dung" label,
  "URL" label, save ("Lưu"), cancel ("Hủy"), empty-URL inline error. Keep existing `linkPrompt`
  key in place until P4 removes its last usage (P4 owns that removal).
- **FR-19-rev keys** (`kudos.gift.*`): heading ("KHÁM PHÁ SECRET BOX CỦA BẠN"), subtitle
  ("Click vào box để mở"), count-line template (e.g. `unopenedCount: "Secretbox chưa mở"` rendered
  beside the numeric value), close-icon aria-label. Keep existing `openButton`/`dialogTitle`/`close`;
  P5 decides which stay used (may retire `dialogBody`).

## Architecture

Data flow: dicts are plain nested TS objects imported by server components and threaded down as
`labels` props (no runtime i18n lib). Adding keys = editing the object literals. Consumers read via
typed `Dictionary["kudos"]["..."]` slices.

### Integration Contract (keys P1 must expose)

```
kudos.gift.heading, .subtitle, .unopenedCount, .closeAria        # → P5
kudos.compose.content.toolbar.addLink.{title,contentLabel,urlLabel,save,cancel,urlError}  # → P4
kudos.compose.communityStandards.{trigger,panelTitle,
  recipientHeading, senderHeading, nationalHeading,
  heroTiers[], collectionIcons[], collectFullSetText,
  nationalText, footerClose, footerCompose}                       # → P3
```

P3/P4/P5 read these paths verbatim. If a downstream phase needs a path not listed, it escalates to
the lead — it must NOT add the key itself (file-ownership rule).

## Related Code Files

- **Modify:** `lib/i18n/dictionaries/vi.ts`, `lib/i18n/dictionaries/en.ts`
- **Read/verify:** `lib/i18n/dictionaries/parity.test.ts`, `lib/i18n/dictionary.ts` (type source)
- **Create:** none

## Implementation Steps

1. In `vi.ts`, add `gift.heading/subtitle/unopenedCount/closeAria` with MoMorph-verbatim VI copy.
2. Add `compose.content.toolbar.addLink` object (6 keys) — VI.
3. Restructure `compose.content.communityStandards` from string → object; move the current string
   value to `.trigger`; add panel content keys. Author VI copy from `b1Filzi9i6` (hero tiers, icons).
4. Mirror every added/changed key in `en.ts` with English copy — same nesting, same array lengths.
5. Run `npx vitest run lib/i18n/dictionaries/parity.test.ts` → must pass.
6. Run `npx tsc --noEmit` → the `communityStandards` shape change will surface any stale string
   consumers; note them for P3 (do NOT edit consumers here — P3 owns `rich-text-editor.tsx`).

## Todo List

- [x] gift keys (vi + en)
- [x] addLink keys (vi + en)
- [x] communityStandards restructured to object (vi + en)
- [x] parity test green
- [x] tsc note-only report of consumers of the changed `communityStandards` key handed to P3

## Success Criteria

- `parity.test.ts` green; all contract paths present in both dicts with matching structure.
- No existing key removed or re-worded (except the documented `communityStandards` string→object).
- `git diff` touches only the two dict files.

## Risk Assessment

| Risk | Likelihood | Impact | Countermove |
|------|-----------|--------|-------------|
| `communityStandards` string→object breaks `rich-text-editor.tsx` compile | High | Med | Expected — P3 depends on P1 and fixes the consumer; flag in handoff, don't fix here |
| vi/en array-length drift (hero tiers, icons) | Med | Low | parity test + manual count check |

## Security Considerations

None — static display strings, no user input, no route/auth change.

## Next Steps

Unblocks P3 (communityStandards + tsc note), P4 (addLink keys), P5 (gift keys).
</content>
