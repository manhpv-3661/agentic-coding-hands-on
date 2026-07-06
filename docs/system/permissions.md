---
doc: system/permissions
lang: vi
status: active
---

# Phân quyền & Kiểm soát truy cập — SAA 2025

## Time-Gate (Prelaunch) — chạy TRƯỚC auth-gate

Từ F003 (Countdown Prelaunch), một lớp gate **theo thời gian** chạy trong `proxy.ts`, TRƯỚC toàn bộ
ma trận auth-gate mô tả bên dưới:

- Trước mốc `NEXT_PUBLIC_EVENT_START_AT` (đọc bởi `lib/event-countdown.ts`): **mọi** request tới
  **mọi** route — kể cả `/login` — bị redirect 307 về `/prelaunch?next=<path gốc>`. Không phân biệt
  trạng thái đăng nhập; không có ngoại lệ nào khác ngoài `/prelaunch` (và asset dưới nó, vì matcher
  loại trừ theo tiền tố path — xem § Cơ chế thực thi) cùng `_next/static`, `_next/image`,
  `favicon.ico`.
- Sau mốc — hoặc khi env thiếu/không parse được thành ngày hợp lệ
  (`computeCountdown(...).isZero === true`, **fail-open**, cùng triết lý fail-open của Supabase env
  bên dưới) — time-gate ngừng can thiệp; request đi tiếp vào auth-gate hiện có, **không đổi** hành
  vi/ma trận mô tả trong tài liệu này.
- Quan trọng: matcher rộng hơn của time-gate **không** đồng nghĩa mọi request giờ gọi Supabase Auth
  API. Guard `supabase.auth.getUser()` vẫn chỉ chạy cho `/login` + các route được bảo vệ — mọi
  request khác chỉ đi qua `proxy()` để time-gate kiểm tra (predicate cục bộ, so sánh thời gian, không
  network) rồi thoát sớm.

## Vai trò người dùng
| Vai trò | Mô tả |
|---------|-------|
| Khách (unauthenticated) | Chưa đăng nhập. Chỉ truy cập được `/login` và `/auth/callback`. |
| Người dùng (authenticated) | Đã đăng nhập bằng Google qua Supabase. Truy cập được `/` (trang chủ), `/awards`, `/kudos`, `/todo` và trang nội bộ. |

Không phân biệt domain email — **mọi tài khoản Google đều được phép** (theo spec).
Chưa có role system (Admin Dashboard trong account menu bị ẩn cho tới khi có — quyết định F002).

## Ma trận truy cập route
| Route | Khách | Người dùng |
|-------|-------|-----------|
| `/login` | ✅ hiển thị | 🔁 redirect → `/` |
| `/` — Trang chủ (bảo vệ) | 🔁 redirect → `/login` | ✅ hiển thị |
| `/awards` (Hệ thống giải thưởng, F004, bảo vệ) | 🔁 redirect → `/login` | ✅ hiển thị |
| `/kudos` (placeholder, bảo vệ) | 🔁 redirect → `/login` | ✅ hiển thị |
| `/todo` (được bảo vệ) | 🔁 redirect → `/login` | ✅ hiển thị |
| `/auth/callback` | ✅ (xử lý OAuth code) | ✅ |
| `/prelaunch` (F003) | ✅ luôn cho phép — public, không yêu cầu đăng nhập | ✅ luôn cho phép |

Ma trận trên áp dụng **sau** khi time-gate đã mở (mốc `NEXT_PUBLIC_EVENT_START_AT` đã qua, hoặc
env thiếu/không hợp lệ). **Trước** mốc, time-gate (xem § Time-Gate ở trên) ghi đè toàn bộ ma trận
này: mọi route khác `/prelaunch` đều redirect `/prelaunch`, bất kể cột Khách/Người dùng ở đây.

Đích sau đăng nhập: **`/`** (F002 cập nhật từ `/todo`).

## Cơ chế thực thi
- **proxy.ts** (root, thay thế `middleware.ts` từ Next.js 16): chạy time-gate (F003) trước, rồi
  auth-gate; refresh session qua `@supabase/ssr`; redirect theo trạng thái auth. Matcher (từ F003,
  thay allowlist cũ): `/((?!_next/static|_next/image|favicon.ico|prelaunch).*)` — bắt hầu như mọi
  route (cần thiết để time-gate chặn được TẤT CẢ trước launch); loại trừ output tối ưu hoá của
  Next.js, favicon, và bất kỳ path có tiền tố `prelaunch` (bao gồm cả asset tĩnh riêng của trang
  Prelaunch, ví dụ ảnh nền `public/prelaunch/bg-image.png`).
- **Server component guard**: các page bảo vệ kiểm tra session server-side
  (`supabase.auth.getUser()`) như lớp phòng thủ thứ hai, độc lập với proxy.
- **Session**: cookie do Supabase SSR quản lý; proxy giữ session tươi mới mỗi request.
- **Sign out**: account menu trên header trang chủ gọi `supabase.auth.signOut()` → về `/login`.

## Bảo mật
- Không commit secret (`.env.local` đã gitignore).
- `NEXT_PUBLIC_*` là key public (anon) — an toàn để lộ phía client theo thiết kế Supabase.
- Đăng xuất xóa session cookie → truy cập route bảo vệ sẽ bị redirect về `/login`.
- `app/auth/callback/route.ts` chỉ chấp nhận `?next=` là đường dẫn tương đối cùng-origin (chặn open
  redirect kiểu `?next=//evil.com`); mặc định về `/` (F002 cập nhật từ `/todo`).
- Thiếu env Supabase → proxy fail-open (no-op, chỉ log warning) để build/dev không crash; đây là hành
  vi chấp nhận được cho dự án mock, **không phù hợp cho production thật**.
- Time-gate (F003) enforcement thật nằm ở **server** (`proxy.ts` mỗi request) — countdown hiển thị
  trên client (`/prelaunch`) chỉ là UI phụ trợ, không thể "vượt" gate bằng cách chỉnh giờ máy client.
- Thiếu/không parse được env `NEXT_PUBLIC_EVENT_START_AT` → time-gate cũng fail-open (mở khóa), cùng
  triết lý fail-open Supabase ở trên — chấp nhận được cho mock/training repo, **không phù hợp cho
  production thật** nếu áp dụng nguyên trạng.
- Redirect tự động khi countdown về 0 (`hooks/use-prelaunch-auto-redirect.ts`) chỉ chấp nhận `?next=`
  là đường dẫn tương đối cùng-origin (`lib/safe-redirect.ts#sanitizeInternalPath`) — cùng nguyên tắc
  chống open-redirect như `app/auth/callback/route.ts`; giá trị tuyệt đối/ngoài site → về `/`.
