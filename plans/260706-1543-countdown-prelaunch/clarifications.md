# Clarifications — Countdown Prelaunch (F003)

## Session 2026-07-06

- Q: Quan hệ giữa gate thời gian (Prelaunch) và gate auth (F001/F002) — gate nào chạy trước, /login có bị chặn trước giờ launch không? → A: Time-gate chặn TẤT CẢ route, kể cả `/login`, và chạy TRƯỚC auth-gate. Trước khi countdown về 0, mọi request (trừ chính route Prelaunch + static assets) redirect về `/prelaunch`. Sau khi về 0, auth-gate hiện tại (F001/F002) mới có hiệu lực bình thường.
- Q: Route path cho màn Countdown Prelaunch? → A: `/prelaunch`.
- Q: Spec item 0.2 ghi cả bản VI "Sự kiện sẽ bắt đầu sau" và EN "Event starts in" — có cần i18n thật không? → A: Không. Giữ tiền lệ F001/F002: text tiếng Việt tĩnh, cookie NEXT_LOCALE không dịch nội dung. Bản EN trong spec CSV chỉ là tài liệu tham khảo thiết kế.
- Q: TODO spec "thiết kế API endpoint để lấy target datetime"? → A: Dùng CHUNG biến env `NEXT_PUBLIC_EVENT_START_AT` đã có ở F002 (cùng 1 mốc sự kiện) — tái sử dụng `lib/event-countdown.ts`, không thêm API/infra mới.
- Q: Khi countdown về 0 trong lúc người dùng đang ở `/prelaunch` (không có CTA trong design), hệ thống tự động điều hướng đi không? → A: Có — client-side auto-redirect ngay khi `useEventCountdown` báo `isZero: true`.
- Q: Sau khi time-gate mở khóa, người dùng được đưa về đâu? → A: Giữ path gốc qua query `?next=` (giống tiền lệ `app/auth/callback`) — proxy gắn path gốc vào `?next=` khi redirect tới `/prelaunch`, sau khi mở khóa đưa người dùng về đúng path đó; auth-gate hiện tại tiếp tục xử lý bình thường nếu cần.
