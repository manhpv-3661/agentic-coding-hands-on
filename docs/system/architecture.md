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
  - `app/kudos/page.tsx` — Sun* Kudos Live Board (F006); nội dung thật (Highlight Kudos carousel,
    Spotlight Board word-cloud, All Kudos feed, lọc hashtag/phòng ban, thống kê + Secret Box, top 10
    Sunner nhận quà); được bảo vệ; thay placeholder tối giản của F002. Từ F007: `page.tsx` (server)
    render thêm `kudos-page-client.tsx` (client wrapper, chủ sở hữu DUY NHẤT state `posts` +
    open/close dialog compose) giữa `page.tsx` và `KudosBanner`/`KudosBoard` — click pill "Ghi
    nhận" (`KudosBanner`) mở dialog "Viết Kudos" (`app/components/kudos/compose/*`: recipient
    dropdown, rich-text editor tự viết qua `document.execCommand`, hashtag chip input, image upload
    preview client-side, anonymous toggle); submit hợp lệ prepend `KudosPost` mới vào "All Kudos" —
    **[Superseded 2026-07-08]** ghi thật vào Supabase Postgres qua Server Action khi đã cấu hình
    (trước đây session-scoped/không backend); xem mục "Kudos — Lớp dữ liệu (Supabase Postgres)"
    bên dưới.
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
- **i18n** (`lib/i18n/`, F005) — dictionary tự viết (không next-intl/react-i18next), cookie-only
  (`NEXT_LOCALE`), không đổi route theo locale.
  - `locale.ts` — `Locale = "vi" | "en"`, `DEFAULT_LOCALE = "vi"`, `isLocale()` type guard.
  - `dictionaries/vi.ts` + `en.ts` — TS object literal lồng namespace theo màn (`shared`, `login`,
    `homepage`, `prelaunch`, `awards`, `kudos`); `dictionary.ts` xuất `type Dictionary = typeof vi`, `en.ts`
    được compile-check khớp shape này (`satisfies Dictionary`) — thiếu key bắt lỗi lúc
    `tsc --noEmit`, không phải runtime.
  - `get-locale.ts` — `async function getLocale(): Promise<Locale>`, server-only, đọc cookie qua
    `await cookies()` (Next.js 16); `get-dictionary.ts` — `function getDictionary(locale):
    Dictionary`, pure/đồng bộ.
  - Mỗi page bảo vệ + `app/login/page.tsx` + `app/prelaunch/page.tsx` (Server Component) gọi
    `getLocale()` + `getDictionary()`, truyền dictionary xuống làm props cho component con (kể cả
    Client Component) — Client Component không tự đọc cookie/dictionary.
  - `LanguageSelector` (`app/login/components/language-selector.tsx`): nhận `initialLocale` làm
    prop (sửa bug hiển thị sai locale sau reload, trước đây state khởi tạo cứng `"vi"`); chọn
    locale mới → ghi cookie `NEXT_LOCALE` → `router.refresh()` (không full page reload) → Server
    Component cha re-fetch với dictionary mới.

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

## Kudos — Lớp dữ liệu (Supabase Postgres)

Pivot từ mock thuần túy (F006/F007/F008 bản gốc) sang **Supabase Postgres làm datastore
thật** cho phần tương tác của Kudos (posts/likes/compose) — full plan + quyết định:
`plans/260708-1407-kudos-supabase-backend/` (`plan.md`, `clarifications.md`). Việc này
**supersede** các quyết định "không có backend" ghi trong `clarifications.md` gốc của
`plans/260706-2200-sun-kudos-live-board/`, `plans/260706-2310-kudos-compose-form/`, và
`plans/260707-0008-kudos-like-toggle/` — lịch sử các quyết định cũ vẫn giữ nguyên trong
các file đó, không xoá.

- **3 bảng** (`supabase/schema.sql`): `profiles` (1:1 `auth.users`; `display_name`/
  `avatar_url` tự điền qua trigger `handle_new_user()` lúc signup; `department`/`stars`
  không có nguồn OAuth — mặc định NULL/0, admin seed tay sau qua SQL editor),
  `kudos_posts` (sender luôn là `profiles` FK thật của user đăng nhập; **recipient là
  free-text snapshot** `recipient_name` + `recipient_department`, KHÔNG có bảng
  directory/FK — vì chưa có employee directory và OAuth không cấp danh sách đồng
  nghiệp), `kudos_likes` (join table, `UNIQUE(user_id, post_id)` chặn like đôi, raise
  `23505` khi đụng race).
- **RLS**: `kudos_posts` **immutable hoàn toàn** — chỉ có policy SELECT (mọi người đã
  đăng nhập) + INSERT-own, KHÔNG có UPDATE lẫn DELETE (quyết định chốt, vì UI không có
  affordance sửa/xoá). `kudos_likes` có thêm DELETE-own (cần cho unlike toggle, khác
  `kudos_posts`). `profiles` có UPDATE-own (SELECT mở cho mọi người đã đăng nhập). Chi
  tiết đầy đủ + checklist verify sau khi chạy schema: `supabase/README.md`.
- **Nhánh `isSupabaseConfigured()`** (`lib/kudos/kudos-repository.ts`,
  `app/kudos/actions.ts`): đã cấu hình đủ 2 env Supabase → đọc/ghi Postgres thật, map
  row → `KudosPost` view-model hiện có (không đổi contract cho selectors/card/board);
  CHƯA cấu hình → đọc trả mock `KUDOS_POSTS` y hệt trước pivot, ghi no-op (`{ok:true,
  skipped:true}`, client giữ optimistic state phiên như cũ). Lý do giữ nhánh này: bảo
  toàn **authless e2e build** (cổng 3100, không set env Supabase) vẫn render đúng mock
  — `e2e/layout-contract.spec.ts` (gồm test spotlight-name-cloud) không cần đổi gì và
  vẫn xanh.
- **Server Actions** (`app/kudos/actions.ts`): `createKudosAction`, `toggleLikeAction`
  — cả hai tự re-check `auth.uid()` bên trong hàm (không tin RLS là chốt chặn duy nhất,
  vì Server Action bản chất là POST endpoint public/defense-in-depth), chặn tự thích
  bài của chính mình ở server (`self_like_forbidden`) dù UI đã ẩn nút, và coi race
  `23505` (2 lượt insert like đồng thời) là thành công idempotent thay vì lỗi.
- **Không migrate dữ liệu cũ**: 12 bài Kudos mock ban đầu của F006 VẪN ở lại
  `lib/kudos/kudos-data.ts` làm mock fallback, không insert thành hàng Postgres thật —
  chỉ bài viết MỚI qua compose flow thật (F007) mới ghi vào Postgres.
- **[Superseded 2026-07-09 — xem mục "Content tables (awards / event / kudos gifts)" dưới]
  Dữ liệu trang trí không đổi**: sidebar thống kê (`KUDOS_STATS`, kể cả Secret Box), bộ đếm
  Spotlight name-cloud, danh sách top-10 nhận quà — quyết định "vẫn mock" ghi ở đây (dựa theo
  `clarifications.md` của plan Kudos-backend, Q5) đã bị **ĐẢO NGƯỢC** bởi
  `plans/260709-0822-supabase-dynamic-data-all-screens/phase-03-kudos-aggregates-real.md`: mọi số
  liệu trên nay đọc thật từ Postgres, TRỪ Secret Box đã mở/chưa mở (chưa có nguồn dữ liệu, vẫn
  mock, câu hỏi mở thật chưa chốt). Chi tiết đầy đủ ở mục "Content tables (awards / event / kudos
  gifts)" dưới.
- **CHƯA CHẠY trên Supabase thật**: `supabase/schema.sql` (cách chạy + checklist verify
  đầy đủ ở `supabase/README.md`) **chưa được apply** lên project Supabase live — chưa
  có phiên nào trong repo có service_role/DB credentials để chạy DDL. Tới khi một người
  có quyền Dashboard chạy tay file này, app vẫn hành xử y hệt trước pivot (mock
  fallback toàn phần), đúng theo thiết kế của nhánh `isSupabaseConfigured()` ở trên.

## Content tables (awards / event / kudos gifts) — thực tế đã xác minh (2026-07-10)

> **Đã sửa sau code review pre-submission** — mục này từng mô tả 1 migration Postgres đầy đủ cho
> Awards/Event (xem `docs/project-changelog.md`, mục "2026-07-09"); review trực tiếp code hiện
> tại phát hiện phần Awards/Event của migration đó **không tồn tại trong code** — đã sửa lại đây
> cho khớp thực tế, chi tiết + lý do xem đúng mục changelog "2026-07-10 — Correction" ở trên.

- **KHÔNG có 3 bảng `award_categories`/`event_settings`/`kudos_gifts`** — không xuất hiện trong
  `supabase/schema.sql`, không có migration nào tạo chúng, và `supabase/seed.sql` không hề nhắc
  tới. Awards + thông tin sự kiện Homepage vẫn nằm hard-code trong source, đúng như scope ghi rõ
  ở đầu `supabase/schema.sql`.
  - `lib/awards/award-categories-repository.ts` (`getAwardCategories()`) — hard-code thuần
    (comment trong file: *"Awards content is in the agreed hardcode scope for this mock
    project"*), không gọi Supabase. Vẫn là 1 nguồn duy nhất dùng chung bởi CẢ `/awards` (F004)
    và lưới giải thưởng Homepage (F002) — phần dedup 2 danh sách hard-code cũ (từng lệch tên MVP
    ngắn/dài) là thật, chỉ là nguồn hợp nhất vẫn ở code, không phải Postgres.
  - `lib/event/event-settings-repository.ts` (`getEventSettings()`) — hard-code thuần (comment:
    *"Homepage event facts stay in the agreed hardcode scope"*), không gọi Supabase.
- **`lib/kudos/kudos-aggregates-repository.ts` — phần NÀY thật, đã xác minh trực tiếp**:
  `getKudosSidebarStats`/`getGiftRecipients` là `COUNT`/`SELECT` query thật lên 3 bảng gốc đã có
  sẵn từ pivot Kudos 2026-07-08 (`kudos`, `kudos_likes`, `gift_logs`) — KHÔNG cần bảng mới nào.
  `getSpotlightTotal`/`getSpotlightNames` là hard-code (đúng như file tự ghi chú: "Spotlight
  Board: hardcoded local content, not DB-backed") — chưa từng đổi.
- **Biên giới i18n/dữ liệu Awards**: cấu trúc locale-agnostic (slug, số, thứ tự) nằm trong
  `lib/awards/award-categories-fallback.ts` (hard-code, KHÔNG phải Postgres — xem sửa lại ở trên);
  văn bản đã dịch (title/description/unit-caption) nằm trong
  `lib/i18n/dictionaries/{en,vi}.ts`, join bằng `slug` lúc render
  (`app/components/awards/award-detail-data.ts`).
- **Quyết định env-var-vs-DB cho mốc sự kiện** (không đổi, ghi lại để không bị hỏi lại lần sau):
  ngày hiển thị trên Homepage (`lib/event/format-event-date.ts`, `formatEventDate()`) derive qua
  `Intl.DateTimeFormat` từ CÙNG env var `NEXT_PUBLIC_EVENT_START_AT` đang gate `proxy.ts` (mục
  "proxy.ts" ở trên) và drive đồng hồ đếm ngược — KHÔNG đọc từ `event_settings` hay bảng nào khác.
  Lý do: `proxy.ts` chạy trên hầu như mọi request (xem matcher ở mục "proxy.ts" trên) — giữ lookup
  này là 1 env-var read zero-latency, không phải 1 round-trip DB, là quyết định hot-path/fail-open
  có chủ đích, KHÔNG PHẢI thiếu sót — không cần re-litigate. Việc này đồng thời sửa 1 bug thật
  đang tồn tại: env var, dict `en.ts` ("December 26, 2025"), và dict `vi.ts` ("26/12/2025") là 3
  giá trị được gõ tay độc lập, lệch nhau — nay chỉ còn 1 nguồn sự thật.
- **Dữ liệu trang trí Kudos — MỘT PHẦN thật, đã xác minh trực tiếp** (sửa lại 2026-07-10: bullet
  gốc lẫn cả phần thật lẫn phần chưa từng thật): sidebar sent/received/hearts (FR-18 F006) VÀ
  top-10 Sunner nhận quà (FR-20 F006, đọc bảng `gift_logs`) là `COUNT`/`SELECT` query thật, scoped
  theo `auth.uid()` — xác nhận đúng. Ngược lại, tổng "{n} KUDOS" của Spotlight Board (FR-10) và
  tên trong word-cloud Spotlight VẪN là hard-code (`SPOTLIGHT_TOTAL`, `SPOTLIGHT_NAMES` trong
  `lib/kudos/kudos-data.ts`) — KHÔNG phải COUNT/`receiver.full_name` thật như bullet gốc từng ghi;
  `kudos-aggregates-repository.ts` tự chú thích rõ điều này ("Spotlight Board: hardcoded local
  content, not DB-backed"). Secret Box đã mở/chưa mở đọc thật từ `gift_logs`, dựa trên rule "mỗi
  5 tim nhận được trên Kudos bạn gửi mở khoá 1 box" — xác nhận đúng.
- **e2e authless**: mọi repo mới đều mirror nhánh fallback y hệt `kudos-repository.ts` — chế độ
  chưa cấu hình trả đúng hằng số mock hiện có, không đổi gì cho `e2e/layout-contract.spec.ts`
  (cổng 3100). `e2e/homepage-content.spec.ts` đã được cập nhật khớp `Intl.DateTimeFormat` (xem
  comment ngay trong file) — claim "sẽ fail, chưa sửa" ở bản ghi 2026-07-09 đã lỗi thời; toàn bộ
  suite hiện xanh (635/635, xác nhận lúc review 2026-07-10).

## Câu hỏi mở

- Nội dung thực của `/todo` (ngoài placeholder) thuộc màn hình khác (`/awards` từ F004, `/kudos` từ
  F006 đã có nội dung thật).
- Secret Box hiện được suy ra từ rule "mỗi 5 tim nhận được trên Kudos bạn gửi mở khóa 1 box"
  kết hợp `gift_logs` (đã mở bao nhiêu box). Nếu sau này nghiệp vụ muốn tách riêng entitlement
  khỏi lịch sử mở quà, khi đó mới cần model/bảng mới.
