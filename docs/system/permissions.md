---
doc: system/permissions
lang: vi
status: active
---

# Phân quyền & Kiểm soát truy cập — SAA 2025

## Vai trò người dùng
| Vai trò | Mô tả |
|---------|-------|
| Khách (unauthenticated) | Chưa đăng nhập. Chỉ truy cập được `/login` và các route công khai. |
| Người dùng (authenticated) | Đã đăng nhập bằng Google qua Supabase. Truy cập được `/todo` và trang nội bộ. |

Không phân biệt domain email — **mọi tài khoản Google đều được phép** (theo spec).

## Ma trận truy cập route
| Route | Khách | Người dùng |
|-------|-------|-----------|
| `/login` | ✅ hiển thị | 🔁 redirect → `/todo` |
| `/todo` (được bảo vệ) | 🔁 redirect → `/login` | ✅ hiển thị |
| `/auth/callback` | ✅ (xử lý OAuth code) | ✅ |

## Cơ chế thực thi
- **proxy.ts** (root, thay thế `middleware.ts` từ Next.js 16): refresh session qua `@supabase/ssr`;
  áp dụng redirect theo trạng thái auth với `matcher: ["/todo/:path*", "/login"]`.
- **Server component guard**: `app/login/page.tsx` và `app/todo/page.tsx` kiểm tra session server-side
  (`supabase.auth.getUser()`) như lớp phòng thủ thứ hai, độc lập với proxy.
- **Session**: lưu trong cookie do Supabase SSR quản lý; proxy giữ session tươi mới mỗi request.

## Bảo mật
- Không commit secret (`.env.local` đã gitignore).
- `NEXT_PUBLIC_*` là key public (anon) — an toàn để lộ phía client theo thiết kế Supabase.
- Đăng xuất xóa session cookie → truy cập route bảo vệ sẽ bị redirect về `/login`.
- `app/auth/callback/route.ts` chỉ chấp nhận `?next=` là đường dẫn tương đối cùng-origin (chặn open
  redirect kiểu `?next=//evil.com`); mặc định về `/todo`.
- Thiếu env Supabase → proxy fail-open (no-op, chỉ log warning) để build/dev không crash; đây là hành
  vi chấp nhận được cho dự án mock, **không phù hợp cho production thật**.
