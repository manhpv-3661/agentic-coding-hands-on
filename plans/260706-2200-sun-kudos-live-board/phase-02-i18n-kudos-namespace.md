---
feature: F006
phase: 02
title: i18n kudos namespace
status: done
---

# Phase 02 — i18n `kudos` namespace

## Context Links
- Spec: NFR-1 (i18n via `lib/i18n/`, new `kudos` namespace, VI+EN parity), plus every
  user-facing label in FR-3, FR-4, FR-5, FR-8, FR-10, FR-13, FR-14, FR-18, FR-19, FR-20, FR-21.
- Pattern refs: `lib/i18n/dictionaries/vi.ts` (canonical shape), `en.ts` (`satisfies Dictionary`),
  `dictionary.ts` (`Dictionary = typeof vi`), `parity.test.ts` (runtime key-parity guard).
- Clarifications: filter labels/copy verbatim; brand/English design labels stay untranslated.

## Overview
- **Priority:** P1 (page + sections read labels) · **Status:** pending
- Add ONE new top-level `kudos` namespace to BOTH `vi.ts` and `en.ts` in the same change.
  Do NOT touch `homepage.kudos` (still owned by the teaser block, reused on `/awards`).

## Key Insights
- `vi` is canonical (shape = `typeof vi`); `en` must have byte-identical key set or `tsc`
  AND `parity.test.ts` fail. **No partial rollout.**
- English design labels stay HARDCODED in components, NOT in the dictionary:
  section subtitle "Sun* Annual Awards 2025", "HIGHLIGHT KUDOS", "SPOTLIGHT BOARD",
  "ALL KUDOS", the "KUDOS" wordmark, and the "{n} KUDOS" counter suffix "KUDOS" — same
  precedent as `awards/page.tsx` keeping "Sun* annual awards 2025" hardcoded.
- `parity.test.ts` also has explicit top-level assertions listing `shared/login/homepage/
  prelaunch/awards` — **add `kudos` assertions there too** (both VI and EN blocks).

## Requirements
Add `kudos: { ... }` to `vi` and `en`. Proposed key tree (VI values verbatim from FR list;
EN = direct translation of the same short UI label):

```
kudos: {
  meta: { description }                    // page <meta> (mirror awards.meta.description)
  banner: { title }                        // FR-3: "Hệ thống ghi nhận và cảm ơn"  (wordmark "KUDOS" stays hardcoded)
  composer: { placeholder }                // FR-4: "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?"
  filters: { hashtagLabel, departmentLabel, allOption }  // FR-5/15: "Hashtag" / "Phòng ban" / default "Tất cả"
  card: { viewDetail, copyLink, copied }   // FR-6/13: "Xem chi tiết" / "Copy Link" / toast "Đã sao chép liên kết"
  empty: { kudos, recipients }             // FR-8/14: "Hiện tại chưa có Kudos nào." ; FR-21: "Chưa có dữ liệu"
  spotlight: { searchPlaceholder, panZoom }// FR-10: "Tìm kiếm" / "Pan/Zoom"
  stats: { received, sent, hearts, secretBoxOpened, secretBoxUnopened }  // FR-18 (verbatim VI from design)
  gift: { openButton, dialogTitle, dialogBody }  // FR-19: "Mở quà" (confirm vs "Mở Secret Box"); minimal placeholder dialog copy
  recent: { heading }                      // FR-20: "10 Sunner nhận quà mới nhất"
}
```

## Architecture
- No new files. Edit `vi.ts` (add `kudos` block, keep alphabetic-ish position consistent with
  the file — append as a new top-level sibling like `awards`) and `en.ts` (same keys).
- Components receive their dictionary *slice* as props (e.g. `dictionary.kudos.filters`),
  matching the awards/home prop-threading contract — no component imports the dictionary directly.

## Related Code Files
- **Modify:** `lib/i18n/dictionaries/vi.ts`
- **Modify:** `lib/i18n/dictionaries/en.ts`
- **Modify:** `lib/i18n/dictionaries/parity.test.ts` (add `kudos` to both top-level assertion lists)
- **Read for context:** `lib/i18n/dictionary.ts`

## Implementation Steps
1. Add the `kudos` block to `vi.ts` with exact Vietnamese copy from the FR list (do NOT
   paraphrase user-facing strings). Where a label is not verbatim in the FR text (stats
   rows, gift dialog body), take the Vietnamese wording directly from the design; keep it minimal.
2. Add the identical key tree to `en.ts` with English values; keep `satisfies Dictionary`.
3. Add `expect(vi).toHaveProperty("kudos")` and `expect(en).toHaveProperty("kudos")` to the
   two top-level-category tests in `parity.test.ts`.
4. Resolve the two OPEN copy items: `stats` row count (4 per FR-18 vs 5 per screenshot — key
   all 5; Phase 07 renders what data provides) and `gift.openButton` ("Mở quà" vs "Mở Secret
   Box") — pick the design-verbatim string, note choice in a code comment.

## Todo List
- [x] `kudos` block added to `vi.ts` (verbatim VI)
- [x] `kudos` block added to `en.ts` (same keys, EN values, `satisfies` holds)
- [x] `parity.test.ts` top-level assertions include `kudos`
- [x] `npx tsc --noEmit` (catches key drift) + `npm run test` (parity.test green)

## Success Criteria
- VI and EN `kudos` key sets identical (parity test green).
- `tsc --noEmit` clean (no missing/extra key in `en`).
- `homepage.kudos` untouched.

## Risk Assessment
- **Key drift VI↔EN (High/High):** the whole point of the parity test. **Countermove:** author
  both blocks together, run parity test before handoff.
- **Over-translating brand labels (Med/Low):** keep English design labels hardcoded in
  components, not in the dictionary (documented above).

## Security Considerations
- None. Static UI strings only.

## Next Steps
- Phase 08 threads `dictionary.kudos.*` slices into board/sections; Phase 09 page test uses
  both locales for spot-checks.
