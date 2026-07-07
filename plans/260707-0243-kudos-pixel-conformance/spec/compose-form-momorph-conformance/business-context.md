---
status: draft
authored_by: takumi
created: 2026-07-07
lang: vi
fcode: F007
---

## Why It Matters

Dialog "Viết Kudos" hiện đang tối màu (`#101317`) trong khi thiết kế chốt (Figma "done") là card
kem sáng — cùng tông với KudosCard đã sửa ở phiên trước. Trải nghiệm lệch tông giữa phần "đọc
Kudos" (đã kem) và "viết Kudos" (còn tối) làm sản phẩm trông thiếu hoàn thiện. Nút "Tiêu chuẩn
cộng đồng" hiện không làm gì — người dùng bấm vào một liên kết trông như link nhưng không có
phản hồi, gây cảm giác lỗi/thiếu tin tưởng. "Insert link" dùng popup trình duyệt trần, không kiểm
soát được giao diện, không khớp phần còn lại của form.

## Who Uses It

Toàn bộ Sunner đã đăng nhập, khi mở dialog "Viết Kudos" từ nút "Ghi nhận" trên trang `/kudos`.

## What They Do

- Mở dialog, thấy giao diện kem sáng nhất quán với card Kudos đã đọc trước đó.
- Bấm "Tiêu chuẩn cộng đồng" để xem luật huy hiệu Hero + icon sưu tập trước khi gửi lời cảm ơn.
- Khi soạn nội dung, bấm nút chèn link và điền cả text hiển thị + URL trong 1 dialog rõ ràng.
