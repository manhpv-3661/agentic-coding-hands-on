---
status: draft
authored_by: takumi
created: 2026-07-07
lang: vi
fcode: F006
---

## Screen List

Không có route mới — dialog overlay trong `/kudos`, mount point giữ nguyên (`open-gift-button.tsx`).

## User Journey

1. Sunner ở `/kudos`, thấy sidebar hiển thị "Secret Box chưa mở: {n}".
2. Bấm nút "Mở Secret Box" → dialog mở với visual mới (heading vàng, ảnh hộp quà, số đếm).
3. Bấm "Đóng" (hoặc X góc) → dialog đóng, số liệu sidebar không đổi (không có logic mở/trừ thật).
