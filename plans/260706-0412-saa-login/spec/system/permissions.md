---
doc: system/permissions
lang: vi
status: forward-draft
---

# Phân quyền & Kiểm soát truy cập — SAA 2025 (forward-draft)

> Bản nháp forward-draft từ Stage 1.5 (Login). Promote vào `docs/system/permissions.md` khi implement.

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
- **middleware.ts** (root): refresh session qua `@supabase/ssr`; áp dụng redirect theo trạng thái auth
  với `matcher` cho `/login`, `/todo`.
- **Server component guard**: `app/login/page.tsx` và `app/todo/page.tsx` kiểm tra session server-side
  (`supabase.auth.getUser()`) như lớp phòng thủ thứ hai.
- **Session**: lưu trong cookie do Supabase SSR quản lý; middleware giữ session tươi mới.

## Bảo mật
- Không commit secret (`.env.local` đã gitignore).
- `NEXT_PUBLIC_*` là key public (anon) — an toàn để lộ phía client theo thiết kế Supabase.
- Đăng xuất xóa session cookie → truy cập route bảo vệ sẽ bị redirect về `/login`.
