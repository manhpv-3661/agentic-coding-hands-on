---
status: draft
authored_by: takumi
created: 2026-07-07
lang: vi
fcode: F006
---

# F006_SecretBoxMomorphConformance

## Overview

Revise FR-19 của F006 (Sun* Kudos Live Board, `status: active`). FR-19 hiện tại: "Nút mở dialog
tĩnh tối giản (không có logic thưởng)" — quyết định đó chỉ chốt phần LOGIC (đúng, giữ nguyên),
nhưng phần VISUAL bị làm tối giản quá mức so với thiết kế thật. Đối chiếu MoMorph `J3-4YFIpMM`
("Open secret box- chưa mở", `design_status: done`) — ảnh render thật lấy qua `get_frame_image`,
không suy diễn — dialog hiện tại chỉ có heading nhỏ + 1 câu text + nút Đóng, thiếu toàn bộ phần
visual của thiết kế: heading vàng lớn, ảnh hộp quà 3D + hiệu ứng sparkle, số đếm lớn.

## Polymorphic Behavior

Không áp dụng.

## Cross-Cutting Logic
### Requirements

- **FR-19-rev** (thay thế FR-19's mô tả visual, giữ nguyên phần logic "không có logic thưởng
  thật"): Dialog "Mở Secret Box" hiển thị: heading vàng "KHÁM PHÁ SECRET BOX CỦA BẠN", dòng phụ
  "Click vào box để mở", 1 hình ảnh/minh họa hộp quà (bọc nơ vàng, hiệu ứng glow/sparkle — SVG
  hoặc CSS, không cần asset ảnh thật theo yêu cầu FR gốc "không có photo pipeline"), dòng đếm lớn
  "Secretbox chưa mở **{n}**" lấy từ `KUDOS_STATS` hiện có (đã có số liệu, chỉ chưa hiển thị ở
  đây), nút đóng dạng X ở góc trên phải (thêm, cạnh nút "Đóng" chữ đang có — hoặc thay bằng 1
  trong 2, quyết định ở Blueprint theo pattern đóng dialog đã dùng ở nơi khác trong Kudos).

### Business Rules

- **BR-1**: KHÔNG thêm reward logic/persistence thật — giữ đúng quyết định gốc FR-19 ("không có
  logic thưởng"). Chỉ sửa phần render tĩnh.
- **BR-2**: Số đếm hiển thị trong dialog phải lấy từ `KUDOS_STATS.secretBoxesUnopened` (nguồn dữ
  liệu hiện có ở sidebar) — không hardcode số khác, không duplicate constant.

### Decision Logic

Không có.

### State Machines

Không đổi — dialog vẫn dùng đúng open/close state hiện có (`useDismissableMenu` hoặc tương đương
đang implement trong `open-gift-button.tsx`).

### Algorithms

Không có.

### External Integrations

Không có.

### Verification

`npx tsc --noEmit`, `npx eslint app/components/kudos`, `npx vitest run app/components/kudos` sạch.
Verify bằng đo `getBoundingClientRect`/`getComputedStyle` thật trên browser sau khi build, đối
chiếu ảnh `get_frame_image(J3-4YFIpMM)` — không chỉ xem ảnh chụp qua mắt.

**Client behavior:** see behavior-logic.md, permissions.md, screen-flow.md

## User Stories

- Là một Sunner đã tích lũy lượt tim, tôi bấm "Mở Secret Box" và thấy 1 dialog đẹp, đúng không
  khí "khám phá phần thưởng bí ẩn" như thiết kế — không phải 1 hộp thoại text trần trụi.

### Edge Cases

See edge-cases.md.

## Key Entities

Không có entity mới — dùng lại `KudosStats.secretBoxesUnopened` đã có trong `lib/kudos/kudos-types.ts`.

## Artifact References

- MoMorph fileKey `9ypp4enmFmdK3YAFJLIu6C`, screenId `J3-4YFIpMM` ("Open secret box- chưa mở",
  done).

## Assumptions

- Không cần animation/particle effect thật (canvas/WebGL) — CSS gradient + box-shadow đủ để gợi
  hiệu ứng "sparkle" tĩnh, giữ đúng tinh thần "mock project, không over-engineer".

## Source Code References

- `app/components/kudos/open-gift-button.tsx`
- `lib/kudos/kudos-types.ts` (đọc `KudosStats`, không đổi shape)
- `lib/i18n/dictionaries/vi.ts`, `en.ts` (thêm key heading/subtitle nếu chưa có)

## Unresolved Questions

Không có — mọi giá trị cần thiết đã đo được từ MoMorph trong phiên audit trước.
