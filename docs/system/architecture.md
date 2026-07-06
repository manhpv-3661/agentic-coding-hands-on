---
doc: system/architecture
lang: vi
status: active
---

# Kiến trúc hệ thống — SAA 2025 Web

## Tổng quan
Ứng dụng front-end **Next.js 16 (App Router, Turbopack)** + **React 19** + **Tailwind v4**,
xác thực người dùng qua **Supabase Auth** (Google OAuth). Đây là dự án mock/training AIDD;
backend do Supabase quản lý (managed auth), không tự viết server auth.

## Thành phần chính (liên quan Login)
- **App Router routes**
  - `app/login/page.tsx` — màn hình đăng nhập (server component check session → redirect nếu đã auth; render UI client).
  - `app/todo/page.tsx` — trang chính sau đăng nhập (placeholder ở giai đoạn này; được bảo vệ).
  - `app/auth/callback/route.ts` — route handler đổi OAuth code lấy session, rồi redirect `/todo`.
- **Supabase client layer** (`lib/supabase/`)
  - `client.ts` — browser client (`createBrowserClient` từ `@supabase/ssr`).
  - `server.ts` — server client đọc/ghi cookie (`createServerClient`), dùng trong server component & route handler.
  - `env.ts` — `isSupabaseConfigured()`, kiểm tra duy nhất một chỗ có đủ 2 env var Supabase hay không (dùng chung bởi client + server).
- **proxy.ts** (root) — refresh session + điều hướng theo trạng thái auth (`matcher: ["/todo/:path*", "/login"]`). Next.js 16 đổi tên `middleware.ts`/`middleware()` → `proxy.ts`/`proxy()`; runtime `nodejs` bắt buộc. Không cấu hình env Supabase → fail-open (no-op, log warning), không chặn build/dev.
- **i18n (giới hạn)** — cookie `NEXT_LOCALE` do language selector ghi; hạ tầng dịch đầy đủ hoãn sang màn 12.

## Luồng dữ liệu xác thực
```
Browser (Login page)
  -> supabase.auth.signInWithOAuth({ provider:'google', redirectTo:/auth/callback })
  -> Google OAuth consent
  -> /auth/callback?code=... (route handler) -> exchangeCodeForSession -> set cookie session
  -> redirect /todo (hoặc ?next=... nếu là relative path cùng-origin; mặc định /todo, chặn open-redirect)
proxy.ts: mỗi request refresh session; đã-auth ở /login -> /todo ; chưa-auth ở /todo -> /login
```

## Quyết định kỹ thuật
- Dùng `@supabase/ssr` (không dùng auth-helpers cũ) cho App Router.
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` trong `.env.local` (không commit).
- Code phải degrade gracefully khi thiếu env (build/test không crash) — kiểm tra qua `isSupabaseConfigured()`.
- **Next.js 16**: `cookies()` luôn async (`await cookies()`); `middleware.ts` → `proxy.ts`/`export function proxy()`.

## Câu hỏi mở
- Nội dung thực của `/todo` (ngoài placeholder) thuộc màn hình khác.
