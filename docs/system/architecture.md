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

## Content tables (awards / event / kudos gifts) — Lớp dữ liệu Supabase (mở rộng ngoài Kudos)

Mở rộng nhánh `isSupabaseConfigured()` (mục trên) ra ngoài phạm vi Kudos posts/likes/compose,
sang dữ liệu cấu trúc/số của Awards, thông tin sự kiện Homepage, và các số liệu trang trí của
Kudos — full plan: `plans/260709-0822-supabase-dynamic-data-all-screens/` (phase 1–4 đã triển
khai; phase 5 là đồng bộ docs này).

- **3 bảng nội dung chỉ-đọc mới** (`supabase/schema.sql`, cùng file với 3 bảng Kudos ở trên):
  `award_categories` (PK `slug`, `sort_order`, `thumbnail_src`, `quantity_number`,
  `value_amount_vnd`, `individual_amount_vnd`, `collective_amount_vnd`), `event_settings` (bảng
  singleton, `id smallint primary key default 1 check (id = 1)`, `event_name`, `venue_name`),
  `kudos_gifts` (`id`, `unique(sort_order)`, `recipient_name`, `gift_text`).
- **RLS**: cả 3 bảng đều enable RLS, chỉ có policy SELECT cấp cho CẢ `anon` VÀ `authenticated`
  (khác 3 bảng Kudos ở trên — vốn chỉ cấp `authenticated`, vì Awards/Homepage render trước khi
  đăng nhập) — KHÔNG có policy INSERT/UPDATE/DELETE nào trên bất kỳ bảng nào trong 3 bảng này:
  đây là nội dung chỉ-đọc, sửa duy nhất qua SQL editor, không có admin CRUD UI (quyết định có chủ
  đích, không phải thiếu sót — cùng tinh thần `profiles.department`/`stars` ở trên). Seed một lần
  qua `supabase/seed.sql` (idempotent, `on conflict do nothing`).
- **Nhánh `isSupabaseConfigured()` mở rộng ra 3 repo mới** — cùng hợp đồng "không throw, log lỗi
  rồi fallback về static" như `kudos-repository.ts`:
  - `lib/awards/award-categories-repository.ts` (`getAwardCategories()`) — fallback:
    `award-categories-fallback.ts` (mirror verbatim `seed.sql`). Dùng bởi CẢ `/awards` (F004) và
    lưới giải thưởng Homepage (F002) — trước đây là 2 danh sách hard-code riêng biệt (từng lệch
    nhau — tên hạng mục MVP ngắn/dài), nay 1 nguồn duy nhất.
  - `lib/event/event-settings-repository.ts` (`getEventSettings()`) — fallback nội tuyến
    `EVENT_SETTINGS_FALLBACK`. Dùng bởi thông tin sự kiện Homepage (F002, `event-info.tsx`).
  - `lib/kudos/kudos-aggregates-repository.ts` (`getKudosSidebarStats`, `getSpotlightTotal`,
    `getSpotlightNames`, `getGiftRecipients`) — tách riêng khỏi `kudos-repository.ts` (chủ sở hữu
    file khác nhau) vì đây là dữ liệu TRANG TRÍ (sidebar/spotlight/top-10-quà), không phải
    posts/likes. **Đảo ngược** quyết định "Dữ liệu trang trí không đổi" ở mục trên — xem bullet
    riêng ngay dưới.
- **Biên giới i18n/DB**: cấu trúc locale-agnostic (slug, số, thứ tự) nằm trong Postgres; văn bản
  đã dịch (title/description/unit-caption) VẪN nằm trong `lib/i18n/dictionaries/{en,vi}.ts`, join
  bằng `slug` lúc render (`app/components/awards/award-detail-data.ts`) — i18n KHÔNG migrate sang
  DB (quyết định phạm vi có chủ đích, không phải thiếu sót).
- **Quyết định env-var-vs-DB cho mốc sự kiện** (không đổi, ghi lại để không bị hỏi lại lần sau):
  ngày hiển thị trên Homepage (`lib/event/format-event-date.ts`, `formatEventDate()`) derive qua
  `Intl.DateTimeFormat` từ CÙNG env var `NEXT_PUBLIC_EVENT_START_AT` đang gate `proxy.ts` (mục
  "proxy.ts" ở trên) và drive đồng hồ đếm ngược — KHÔNG đọc từ `event_settings` hay bảng nào khác.
  Lý do: `proxy.ts` chạy trên hầu như mọi request (xem matcher ở mục "proxy.ts" trên) — giữ lookup
  này là 1 env-var read zero-latency, không phải 1 round-trip DB, là quyết định hot-path/fail-open
  có chủ đích, KHÔNG PHẢI thiếu sót — không cần re-litigate. Việc này đồng thời sửa 1 bug thật
  đang tồn tại: env var, dict `en.ts` ("December 26, 2025"), và dict `vi.ts` ("26/12/2025") là 3
  giá trị được gõ tay độc lập, lệch nhau — nay chỉ còn 1 nguồn sự thật.
- **[Đảo ngược 2026-07-09] Dữ liệu trang trí Kudos nay là thật** (đảo ngược mục "Dữ liệu trang
  trí không đổi" ở trên — `KUDOS_STATS`, bộ đếm Spotlight, top-10 nhận quà): sidebar
  sent/received/hearts (FR-18 F006) nay tính bằng `COUNT` query thật scoped theo `auth.uid()`;
  tổng "{n} KUDOS" của Spotlight Board (FR-10 F006) nay là COUNT thật của `kudos`; tên
  trong word-cloud Spotlight nay là `receiver.full_name` thật từ dữ liệu post (bù thêm từ mock
  nếu ít hơn số slot cố định — không vỡ layout geometry); top-10 Sunner nhận quà (FR-20 F006)
  nay đọc bảng `gift_logs`. **Secret Box đã mở/chưa mở cũng không còn là mock thuần**:
  dựa trên rule nghiệp vụ đang hiện trong Community Standards copy, cứ mỗi 5 tim nhận được trên
  Kudos bạn gửi sẽ mở khoá 1 box; `gift_logs` lưu số box đã mở; từ đó suy ra `opened`/`unopened`
  ở sidebar và khi bấm mở box.
- **Không phá build e2e authless**: mọi repo mới đều mirror nhánh fallback y hệt
  `kudos-repository.ts` — chế độ chưa cấu hình trả đúng hằng số mock hiện có, không đổi gì cho
  `e2e/layout-contract.spec.ts` (cổng 3100). Riêng `e2e/homepage-content.spec.ts:91` (assert
  chuỗi ngày cũ `"26/12/2025"`) SẼ fail sau thay đổi ngày ở trên — hậu quả đúng/cố ý của việc sửa
  bug lệch ngày, chưa sửa test ở phiên này (theo standing preference hoãn cập nhật test tới 1
  pass riêng) — xem `docs/project-changelog.md`, mục 2026-07-09.

## Câu hỏi mở

- Nội dung thực của `/todo` (ngoài placeholder) thuộc màn hình khác (`/awards` từ F004, `/kudos` từ
  F006 đã có nội dung thật).
- Secret Box hiện được suy ra từ rule "mỗi 5 tim nhận được trên Kudos bạn gửi mở khóa 1 box"
  kết hợp `gift_logs` (đã mở bao nhiêu box). Nếu sau này nghiệp vụ muốn tách riêng entitlement
  khỏi lịch sử mở quà, khi đó mới cần model/bảng mới.
