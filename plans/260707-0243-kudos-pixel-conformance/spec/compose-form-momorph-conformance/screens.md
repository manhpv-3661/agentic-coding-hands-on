---
status: draft
authored_by: takumi
created: 2026-07-07
lang: vi
fcode: F007
---

## Screen List

Không có route mới — cả 3 sửa đổi đều là dialog/overlay bên trong `/kudos` (đã protected bởi
`requireUser()`).

| Element | Route/vị trí | Loại |
|---|---|---|
| Dialog "Viết Kudos" (restyle) | `/kudos`, mở từ pill "Ghi nhận" | Modal, giữ nguyên mount point |
| Panel "Thể lệ" (mới) | `/kudos`, mở từ toolbar trong dialog Viết Kudos | Modal lồng trong modal (2 lớp) |
| Mini-dialog "Thêm đường dẫn" (mới) | `/kudos`, mở từ toolbar rich-text | Modal lồng trong modal (2 lớp) |

## User Journey

1. Sunner mở `/kudos` → bấm pill "Ghi nhận" → dialog "Viết Kudos" mở (nay kem sáng, đúng theme).
2. Trong dialog, Sunner có thể:
   - Bấm "Tiêu chuẩn cộng đồng" → panel "Thể lệ" mở đè lên, đọc luật → bấm "Đóng" quay lại dialog
     Viết Kudos (vẫn giữ draft đã nhập), hoặc bấm "Viết KUDOS" (đóng panel, focus lại nội dung).
   - Trong ô nội dung, bấm icon chèn link → mini-dialog "Thêm đường dẫn" mở → điền Nội dung + URL
     → "Lưu" chèn link vào vị trí con trỏ, "Hủy" đóng không đổi gì.
3. Điền đủ field, bấm "Gửi" → hành vi validate/submit giữ nguyên như F007 hiện tại (không đổi).
