---
doc: system/architecture
lang: vi
status: forward-draft
---

# Kiến trúc hệ thống — SAA 2025 Web (forward-draft)

> Bản nháp forward-draft từ Stage 1.5 của tính năng Login. Sẽ được promote vào
> `docs/system/architecture.md` khi bắt đầu implement và reconcile sau forge.

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
  - `middleware.ts` (helper) — refresh session cho SSR.
- **middleware.ts** (root) — refresh session + điều hướng theo trạng thái auth (matcher cho `/login`, `/todo`).
- **i18n (giới hạn)** — cookie `NEXT_LOCALE` do language selector ghi; hạ tầng dịch đầy đủ hoãn sang màn 12.

## Luồng dữ liệu xác thực
```
Browser (Login page)
  -> supabase.auth.signInWithOAuth({ provider:'google', redirectTo:/auth/callback })
  -> Google OAuth consent
  -> /auth/callback?code=... (route handler) -> exchangeCodeForSession -> set cookie session
  -> redirect /todo
middleware: mỗi request refresh session; đã-auth ở /login -> /todo ; chưa-auth ở /todo -> /login
```

## Quyết định kỹ thuật
- Dùng `@supabase/ssr` (không dùng auth-helpers cũ) cho App Router.
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` trong `.env.local` (không commit).
- Code phải degrade gracefully khi thiếu env (build/test không crash).
- **Lưu ý Next.js 16**: API `cookies()`/`headers()`, middleware, route handler có thể khác bản cũ —
  xác minh theo `node_modules/next/dist/docs/` trước khi code (xem report researcher).

## Câu hỏi mở
- Nội dung thực của `/todo` (ngoài placeholder) thuộc màn hình khác.
