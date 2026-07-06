---
status: draft
authored_by: takumi
created: 2026-07-06
lang: vi
---

# Edge Cases — Countdown - Prelaunch page (provisional F003)

| Scenario | What Happens | User-Facing Message |
|----------|--------------|---------------------|
| Số ngày còn lại chỉ có 1 chữ số (VD 5 ngày) | Hệ thống pad về đúng 2 ký tự cho cả 3 khối (VD "05") | "Không có — hiển thị đúng định dạng, không phải lỗi." |
| Giá trị giờ/phút tính ra nằm ngoài khung chuẩn | Hệ thống luôn tính lại theo phần dư ngày/giờ để HOURS nằm trong 00-23, MINUTES trong 00-59 | "Không có — giá trị luôn hợp lệ, không hiển thị cho người dùng thấy lỗi." |
| Thời gian trôi qua trong lúc người dùng đứng ở trang | Countdown tự re-render giá trị mới theo chu kỳ cập nhật hiện có, không cần người dùng làm gì | "Không có — cập nhật lặng lẽ." |
| Đồng hồ chạm mốc 0 (mốc sự kiện đã qua) | Cả 3 khối hiển thị "00 00 00" VÀ time-gate mở khóa điều hướng cho các request kế tiếp | "Không có thông báo riêng — người dùng chỉ thấy site hoạt động lại bình thường ở lần truy cập sau." |
| Biến môi trường mốc sự kiện bị thiếu hoặc không parse được thành ngày hợp lệ | Countdown fallback về "00 00 00" (coi như đã tới giờ), cảnh báo console một lần, KHÔNG crash trang; time-gate cũng mở khóa theo giả định fail-open | "Không có — người dùng không thấy lỗi, trải nghiệm như đã tới giờ sự kiện." |
| Người dùng CHƯA đăng nhập truy cập bất kỳ route trong lúc time-gate còn khóa | Bị redirect về Countdown Prelaunch giống người dùng đã đăng nhập — chưa xét tới trạng thái đăng nhập | "Không có màn hình đăng nhập nào xuất hiện trước giờ sự kiện." |
| Người dùng ĐÃ đăng nhập cố truy cập trang đăng nhập trong lúc time-gate còn khóa | Vẫn bị redirect về Countdown Prelaunch — time-gate chạy trước, không quan tâm trạng thái đăng nhập | "Không có — người dùng không thấy trang đăng nhập, chỉ thấy trang đếm ngược." |
| Người dùng mở lại chính Countdown Prelaunch sau khi giờ sự kiện đã qua | Trang vẫn tải được (route luôn được phép), hiển thị "00 00 00" trong khoảnh khắc rồi client tự điều hướng tới `?next=` (hoặc `/` nếu thiếu/không hợp lệ) | "Không có message — người dùng được đưa đi tiếp ngay, không cần bấm gì." |
| `?next=` chứa URL tuyệt đối/ngoài site (VD `?next=https://evil.example`) | Client coi là không hợp lệ (không bắt đầu bằng `/`) → điều hướng về `/` thay vì theo giá trị đó (chống open-redirect) | "Không có — người dùng không bị đưa ra ngoài site." |
