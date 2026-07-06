---
feature: F007
phase: 02
title: i18n kudos.compose namespace
status: done
---

# Phase 02 — i18n `kudos.compose.*` namespace

## Context Links
- Spec: NFR-1 (i18n parity), and every user-facing string in FR-1..21.
- Research: `researcher-01-*.md` §7 (dictionary architecture, parity test).
- Existing: `lib/i18n/dictionaries/vi.ts` (kudos namespace ~194-242), `en.ts`,
  `lib/i18n/dictionary.ts` (`type Dictionary = typeof vi`), `parity.test.ts`.

## Overview
- **Priority:** P1 (labels feed every compose component) · **Status:** pending
- Add ONE new sub-namespace `kudos.compose` under the existing `kudos` object in BOTH
  dictionaries. Do not touch existing keys. Parity test must stay green.

## Key Insights
- `Dictionary` type is `typeof vi` — add to `vi.ts` first, then mirror in `en.ts` (which is
  checked `satisfies Dictionary`). Any missing EN key fails `parity.test.ts` + build.
- Components take labels as literal props in tests, so wording here is not test-coupled at the
  component level; only the page/wrapper threads real dict values (Phase 10).

## Requirements
- **NFR-1:** VI + EN key parity. Cover: dialog title/cancel/submit, recipient (label/placeholder/
  search/error), title field (label/placeholder/helper), content (label/placeholder/counter suffix/
  error), toolbar 6 aria-labels, community-standards link, hashtags (label/placeholder/add/max/error),
  images (label/add/max), anonymous (checkbox/nickname label/placeholder/error), success toast.

## Architecture
Add under `kudos:` (both files), same nesting style:
```ts
compose: {
  dialogTitle: "Viết Kudos",
  cancel: "Hủy",
  submit: "Gửi",
  successToast: "Đã gửi Kudos!",
  recipient: { label: "Người nhận", placeholder: "Chọn người nhận", search: "Tìm đồng đội", error: "Vui lòng chọn người nhận." },
  title: { label: "Danh hiệu", placeholder: "Dành tặng một danh hiệu cho đồng đội.", helper: "...2-dòng ví dụ...", error: "Vui lòng nhập danh hiệu." },
  content: { label: "Nội dung", placeholder: "Viết lời cảm ơn...", counterMax: "1.000", error: "Vui lòng nhập nội dung." },
  toolbar: { bold: "In đậm", italic: "In nghiêng", strikethrough: "Gạch ngang", list: "Danh sách", link: "Chèn liên kết", quote: "Trích dẫn" },
  communityStandards: "Tiêu chuẩn cộng đồng",
  hashtags: { label: "Hashtag", placeholder: "Nhập hashtag", add: "+Hashtag", max: "Tối đa 5", error: "Thêm ít nhất 1 hashtag.", remove: "Xóa hashtag" },
  images: { label: "Hình ảnh", add: "+Image", max: "Tối đa 5", remove: "Xóa ảnh" },
  anonymous: { checkbox: "Gửi lời cảm ơn và ghi nhận ẩn danh", nicknameLabel: "Nickname ẩn danh", nicknamePlaceholder: "Doraemon", error: "Vui lòng nhập nickname." },
}
```
EN mirror with English wording (e.g. `dialogTitle: "Write Kudos"`, etc.).

## Related Code Files
- **Modify:** `lib/i18n/dictionaries/vi.ts`, `lib/i18n/dictionaries/en.ts`

## Implementation Steps
1. Insert `compose: { ... }` inside the `kudos` object in `vi.ts` (VI copy, design-verbatim
   where the Figma shows exact text: title placeholder, nickname example "Doraemon", counter "1.000").
2. Mirror the identical key tree in `en.ts` with English strings.
3. Run `npx vitest run lib/i18n/dictionaries/parity.test.ts` — must pass.

## Todo List
- [x] `kudos.compose` added to `vi.ts`
- [x] identical key tree in `en.ts`
- [x] parity test green + `tsc --noEmit` clean

## Success Criteria
- Parity test passes; `Dictionary["kudos"]["compose"]` type available to downstream components.

## Risk Assessment
- **Key drift VI vs EN (Med):** add both in the same edit pass; run parity test immediately.

## Security Considerations
- Static UI strings only. None.

## Next Steps
- Threaded into components via `dictionary.kudos.compose` in Phase 10.
</content>
