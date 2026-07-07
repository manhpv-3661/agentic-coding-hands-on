---
status: draft
authored_by: takumi
created: 2026-07-07
lang: vi
fcode: F007
---

| Scenario | Input | Expected | Severity |
|----------|-------|----------|----------|
| Mở panel Thể lệ khi dialog Viết Kudos đang có draft chưa gửi | Bấm "Tiêu chuẩn cộng đồng" giữa lúc đã nhập title/content | Draft giữ nguyên khi đóng panel Thể lệ (không reset compose state) | high |
| Đóng panel Thể lệ bằng Escape | Escape khi panel Thể lệ đang mở, dialog Viết Kudos ở dưới vẫn mở | Chỉ panel Thể lệ đóng; dialog Viết Kudos vẫn mở (Escape không đóng cả 2 lớp cùng lúc) | high |
| Mini-dialog Insert-link mở khi chưa chọn (select) text nào trong content | Bấm icon link, không có selection | Field "Nội dung" cho phép nhập tự do; Lưu vẫn chèn link tại vị trí con trỏ (không lỗi/crash) | medium |
| Insert-link: URL rỗng, bấm Lưu | Nội dung có, URL trống | Không chèn link (validate tối thiểu), giữ dialog mở kèm lỗi inline — không gọi `exec("createLink","")` | high |
| Restyle không phá validate hiện có | Bấm Gửi khi thiếu Người nhận/Danh hiệu/Nội dung/Hashtag sau khi đổi theme | Thông báo lỗi inline hiển thị đúng vị trí, đúng màu chữ đọc được trên nền kem (không phải chữ trắng-trên-trắng) | high |
| Toolbar restyle: nút Bold/Italic/Strikethrough vẫn giữ trạng thái active/inactive đọc được | Bấm B rồi gõ chữ | Chữ in đậm hiển thị đúng trên nền kem, nút B có state active rõ ràng (không mất contrast) | medium |
