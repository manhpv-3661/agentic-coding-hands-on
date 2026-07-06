---
feature: F007
phase: 06
title: Image upload / preview
status: done
---

# Phase 06 — Image upload / preview

## Context Links
- Spec: FR-14 (real `<input type=file multiple accept=image/*>`, thumbnail preview + X), FR-15 (max 5, disable add at 5, not required), FR-16 (persist `imageCount` only).
- Research: `researcher-01-*.md` §6 (`KudosImageGallery` renders a count only; no real URLs anywhere).

## Overview
- **Priority:** P2 (optional field) · **Status:** pending
- Real client-side file selection + `URL.createObjectURL` preview; only the **count** is persisted upstream.

## Key Insights
- Object URLs must be revoked on remove/unmount to avoid leaks.
- Guard `typeof URL.createObjectURL === "function"` (jsdom-safe; mirrors clipboard guard style).
- Parent needs only the count → emit via `onChange(files)` and let the shell read `files.length`.

## Requirements
- **FR-14:** hidden `<input type="file" accept="image/*" multiple>` triggered by an add button;
  each selected file → thumbnail `<img>` (objectURL) with a round red X remove button.
- **FR-15:** cap at 5; at 5, disable/hide add (`labels.max`). Not required (no validation error).

## Architecture
```ts
export interface ImageUploadLabels { label: string; add: string; max: string; remove: string; }
export interface ImageUploadProps {
  value: File[]; onChange: (files: File[]) => void;
  max?: number;                    // default 5
  labels: ImageUploadLabels;
}
```
- Derive preview URLs from `value` via `useMemo(() => value.map(f => createObjectURL(f)))` and
  revoke in a cleanup effect when the URL list changes/unmounts.
- On file input change: append up to `max - value.length` new files → `onChange`.
- Remove: `onChange(value.filter((_, i) => i !== idx))`.

## Related Code Files
- **Create:** `app/components/kudos/compose/image-upload.tsx`, `image-upload.test.tsx`

## Implementation Steps
1. `"use client"`; ref the hidden file input, add-button triggers `input.click()`.
2. `onChange` handler reads `e.target.files`, slices to remaining capacity, appends, emits.
3. Build/revoke object URLs safely (guarded); render thumbnails + remove buttons.
4. At capacity: disable add, show `labels.max`.

## Todo List
- [x] hidden file input + add button
- [x] append up to max-5 files
- [x] objectURL preview + revoke on remove/unmount (guarded)
- [x] remove thumbnail
- [x] test: selecting files renders thumbnails, remove drops one, capped at 5
      (stub `URL.createObjectURL`/`revokeObjectURL` with `vi.stubGlobal`)

## Success Criteria
- Files preview + remove; count capped at 5; no objectURL leak (revoke verified in test).

## Risk Assessment
- **jsdom lacks `createObjectURL` (Med):** guard in code + stub in test.
- **File construction in tests (Low):** use `new File([""], "a.png", { type: "image/png" })`.

## Security Considerations
- No upload/transmission; files never leave the browser and are not persisted. None.

## Next Steps
- Consumed by the dialog shell (Phase 08); shell persists `imageCount = files.length`.
</content>
