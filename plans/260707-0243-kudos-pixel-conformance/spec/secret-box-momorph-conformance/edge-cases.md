---
status: draft
authored_by: takumi
created: 2026-07-07
lang: vi
fcode: F006
---

| Scenario | Input | Expected | Severity |
|----------|-------|----------|----------|
| Số Secret Box chưa mở = 0 | `KUDOS_STATS.secretBoxesUnopened === 0` | Dialog vẫn mở, hiển thị "0" — không ẩn nút, không lỗi (giữ hành vi mock hiện tại, chỉ đổi visual) | medium |
| Đóng dialog bằng Escape | Escape khi dialog Secret Box đang mở | Dialog đóng, đúng pattern `useDismissableMenu` đã dùng nơi khác | medium |
| Ảnh/hiệu ứng hộp quà không render được (SVG lỗi) | Trình duyệt chặn hoặc lỗi asset | Heading + số đếm vẫn đọc được (graceful — không phụ thuộc 100% vào ảnh để truyền thông tin) | low |
