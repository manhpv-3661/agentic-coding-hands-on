---
status: draft
authored_by: takumi
created: 2026-07-06
lang: vi
---

# Business Context — Countdown - Prelaunch page (provisional F003)

## Why It Matters

Giữ bí mật toàn bộ nội dung SAA 2025 và tạo cảm giác chờ đợi trước giờ công bố — cho tới đúng thời
điểm sự kiện, không ai (kể cả người đã có tài khoản) xem được nội dung thật của site; mọi người chỉ
thấy một trang đếm ngược duy nhất.

## Who Uses It

- **Nhân viên Sun*** — mọi người dùng, đã hoặc chưa đăng nhập — đều chỉ thấy trang đếm ngược cho
  tới giờ sự kiện.
- **Ban tổ chức SAA 2025** — kiểm soát chính xác thời điểm site "mở cửa" chỉ bằng một cấu hình thời
  gian duy nhất, không cần thao tác thủ công lúc launch.

## What They Do

1. Người dùng mở bất kỳ đường dẫn của site trước giờ sự kiện — được đưa thẳng tới trang đếm ngược.
2. Người dùng nhìn thấy tiêu đề "Sự kiện sẽ bắt đầu sau" cùng ba khối số đếm lùi theo ngày, giờ,
   phút — tự chạy, không cần làm gì thêm.
3. Khi đồng hồ chạm mốc 0, cửa site tự mở — người dùng quay lại trải nghiệm bình thường: chưa đăng
   nhập thì được mời đăng nhập, đã đăng nhập thì vào thẳng trang chủ.
4. Toàn bộ quá trình "mở cửa" diễn ra tự động, ban tổ chức không cần bấm nút thủ công.

## Unresolved Questions

None. (Các câu hỏi còn mở thuộc phần kỹ thuật/UX — xem `technical-spec.md` § Unresolved Questions
và `## Gaps for Clarification` do researcher trả về.)
