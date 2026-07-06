---
status: draft
authored_by: takumi
created: 2026-07-06
lang: vi
---

# Screens — Countdown - Prelaunch page (provisional F003)

## Screen List

| Screen Name | What User Sees | What User Can Do |
|-------------|----------------|------------------|
| Countdown Prelaunch | Nền tối họa tiết hữu cơ nhiều màu toàn màn hình với lớp phủ tối tăng độ tương phản; tiêu đề "Sự kiện sẽ bắt đầu sau"; ba khối số kiểu LED (ngày / giờ / phút), mỗi khối 2 chữ số, kèm nhãn viết hoa bên dưới | Không có hành động nào — màn hình chỉ hiển thị, không có nút bấm; tự động ngừng chặn khi tới giờ sự kiện |

## User Journey

1. Người dùng mở bất kỳ liên kết của site → bị redirect tới Countdown Prelaunch, path gốc được gắn
   vào query `?next=` (không phân biệt đã đăng nhập hay chưa, không phân biệt route định vào là gì).
2. Người dùng đứng yên tại Countdown Prelaunch, quan sát các khối số giảm dần theo ngày/giờ/phút.
3. Khi các khối số chạm "00 00 00", client tự động điều hướng (không cần thao tác) tới path trong
   `?next=` (hoặc `/` nếu thiếu/không hợp lệ) — luồng bình thường của site (đăng nhập hoặc trang chủ,
   tuỳ trạng thái) tiếp quản từ đó.
