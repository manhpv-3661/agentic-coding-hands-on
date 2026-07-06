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
  - `app/page.tsx` — Trang chủ (Homepage SAA, F002); đích sau đăng nhập; được bảo vệ.
  - `app/awards/page.tsx` — Hệ thống giải thưởng (Awards Information, F004); nội dung thật (hero,
    menu scroll-spy, 6 award card, Sun* Kudos promo); được bảo vệ; thay placeholder tối giản của F002.
  - `app/kudos/page.tsx` — placeholder, được bảo vệ (liên kết từ trang chủ).
  - `app/todo/page.tsx` — trang phụ (placeholder ở giai đoạn này; được bảo vệ; không còn là đích sau đăng nhập kể từ F002).
  - `app/auth/callback/route.ts` — route handler đổi OAuth code lấy session, rồi redirect `/` (F002 cập nhật từ `/todo`).
  - `app/prelaunch/page.tsx` — Countdown Prelaunch (F003); đích của time-gate toàn site trước mốc `NEXT_PUBLIC_EVENT_START_AT`; public, không bảo vệ.
- **Supabase client layer** (`lib/supabase/`)
  - `client.ts` — browser client (`createBrowserClient` từ `@supabase/ssr`).
  - `server.ts` — server client đọc/ghi cookie (`createServerClient`), dùng trong server component & route handler.
  - `env.ts` — `isSupabaseConfigured()`, kiểm tra duy nhất một chỗ có đủ 2 env var Supabase hay không (dùng chung bởi client + server).
- **proxy.ts** (root) — chạy time-gate (F003) TRƯỚC, rồi refresh session + điều hướng theo trạng thái
  auth. Matcher (từ F003, thay allowlist cũ): `/((?!_next/static|_next/image|favicon.ico|prelaunch).*)`
  — bắt hầu như mọi route (cần thiết để time-gate chặn được toàn site trước launch); chi tiết đầy đủ
  ở `docs/system/permissions.md` § Time-Gate. Next.js 16 đổi tên `middleware.ts`/`middleware()` →
  `proxy.ts`/`proxy()`; runtime `nodejs` bắt buộc. Không cấu hình env Supabase → fail-open (no-op, log
  warning), không chặn build/dev; thiếu/không hợp lệ env `NEXT_PUBLIC_EVENT_START_AT` cũng fail-open
  tương tự (time-gate tự mở).
- **i18n (giới hạn)** — cookie `NEXT_LOCALE` do language selector ghi; hạ tầng dịch đầy đủ hoãn sang màn 12.

## Luồng dữ liệu xác thực
```
Browser (Login page)
  -> supabase.auth.signInWithOAuth({ provider:'google', redirectTo:/auth/callback })
  -> Google OAuth consent
  -> /auth/callback?code=... (route handler) -> exchangeCodeForSession -> set cookie session
  -> redirect / (hoặc ?next=... nếu là relative path cùng-origin; mặc định / — F002 cập nhật từ /todo; chặn open-redirect)
proxy.ts: [F003] trước mốc NEXT_PUBLIC_EVENT_START_AT -> mọi route (trừ /prelaunch) redirect /prelaunch?next=<path>
proxy.ts: sau mốc (hoặc fail-open) -> refresh session; đã-auth ở /login -> / ; chưa-auth ở route bảo vệ (/, /awards, /kudos, /todo) -> /login
```

## Quyết định kỹ thuật
- Dùng `@supabase/ssr` (không dùng auth-helpers cũ) cho App Router.
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` trong `.env.local` (không commit).
- Code phải degrade gracefully khi thiếu env (build/test không crash) — kiểm tra qua `isSupabaseConfigured()`.
- **Next.js 16**: `cookies()` luôn async (`await cookies()`); `middleware.ts` → `proxy.ts`/`export function proxy()`.

## Câu hỏi mở

- Nội dung thực của `/todo`, `/kudos` (ngoài placeholder) thuộc màn hình khác (`/awards` đã có nội
  dung thật kể từ F004).
