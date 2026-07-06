---
doc: system/permissions
lang: vi
status: draft
note: Forward-draft từ F002 Homepage — promote khi implement-start, reconcile post-forge.
---

# Phân quyền & Kiểm soát truy cập — SAA 2025

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
| `/awards`, `/kudos` (placeholder, bảo vệ) | 🔁 redirect → `/login` | ✅ hiển thị |
| `/todo` (được bảo vệ) | 🔁 redirect → `/login` | ✅ hiển thị |
| `/auth/callback` | ✅ (xử lý OAuth code) | ✅ |

Đích sau đăng nhập: **`/`** (F002 cập nhật từ `/todo`).

## Cơ chế thực thi
- **proxy.ts** (root, thay thế `middleware.ts` từ Next.js 16): refresh session qua `@supabase/ssr`;
  redirect theo trạng thái auth. Matcher mở rộng: `/`, `/awards`, `/kudos`, `/todo/:path*`, `/login`.
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
