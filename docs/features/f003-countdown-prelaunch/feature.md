---
feature: F003
name: Countdown - Prelaunch page — SAA 2025
lang: vi
screen: Countdown Prelaunch
momorph:
  fileKey: 9ypp4enmFmdK3YAFJLIu6C
  screenId: 8PJQswPZmU
status: active
---

# F003 — Countdown Prelaunch (Time-Gate toàn site)

## 1. Tổng quan

Prelaunch là gate điều hướng **TOÀN SITE**, route `/prelaunch`, hiển thị TRƯỚC mốc sự kiện
`NEXT_PUBLIC_EVENT_START_AT`. Trước mốc, MỌI request tới MỌI route (kể cả `/login`) bị chặn tại
`proxy.ts` và redirect về `/prelaunch?next=<path-gốc>`, không phân biệt trạng thái đăng nhập. Time-
gate này chạy **TRƯỚC** auth-gate hiện có (F001/F002); sau khi qua mốc — hoặc khi env thiếu/không
hợp lệ (fail-open) — time-gate ngừng can thiệp và auth-gate tiếp quản, không đổi hành vi.

Bố cục màn hình: nền tối họa tiết hữu cơ nhiều màu toàn viewport + lớp phủ gradient tăng tương phản
→ tiêu đề tĩnh "Sự kiện sẽ bắt đầu sau" → 3 khối đếm ngược kiểu LED (DAYS/HOURS/MINUTES), tái sử dụng
nguyên trạng logic countdown đã có từ F002. Không có nút bấm hay hành động nào trên màn hình.

## 2. Yêu cầu chức năng

### 2.1 Time-gate (`proxy.ts`)
- **FR-1**: Trước mốc `NEXT_PUBLIC_EVENT_START_AT`, mọi request tới route bất kỳ (trừ chính
  `/prelaunch` — bao gồm asset dưới nó như ảnh nền — và `_next/static`, `_next/image`,
  `favicon.ico`) → redirect 307 về `/prelaunch`, gắn path + query gốc vào `?next=`.
- **FR-2**: Time-gate chạy **TRƯỚC** auth-gate hiện có, không phân biệt trạng thái đăng nhập —
  `/login` cũng bị chặn giống mọi route khác.
- **FR-3**: Sau mốc — hoặc khi env `NEXT_PUBLIC_EVENT_START_AT` thiếu/không hợp lệ
  (`computeCountdown(...).isZero === true`, fail-open, nhất quán với triết lý fail-open Supabase đã
  có) — time-gate ngừng chặn; request đi tiếp vào auth-gate hiện có (F001/F002) y như trước, không
  thay đổi hành vi của auth-gate.
- **FR-4**: Guard gọi Supabase `auth.getUser()` **chỉ** chạy cho `/login` + các route được bảo vệ
  (`/`, `/awards`, `/kudos`, `/todo`) — matcher của time-gate rộng hơn không đồng nghĩa mọi request
  giờ gọi Supabase Auth API; mọi request chỉ đi qua `proxy()` để time-gate kiểm tra trước (predicate
  cục bộ, rẻ, không gọi network).

### 2.2 Trang Countdown Prelaunch (`app/prelaunch/page.tsx`)
- **FR-5**: Nền tối họa tiết hữu cơ nhiều màu toàn viewport (`public/prelaunch/bg-image.png`) + lớp
  phủ gradient bán trong suốt tăng tương phản; tĩnh, `aria-hidden`, không tương tác.
- **FR-6**: Tiêu đề tĩnh "Sự kiện sẽ bắt đầu sau" (VI, không dịch theo cookie `NEXT_LOCALE` — tiền lệ
  F001/F002; bản EN trong spec CSV MoMorph chỉ là tài liệu tham khảo thiết kế).
- **FR-7**: 3 khối đếm ngược kiểu LED (DAYS/HOURS/MINUTES), mỗi khối 2 chữ số 0-padded (DAYS 00-99,
  HOURS 00-23, MINUTES 00-59) kèm nhãn viết hoa bên dưới; tái sử dụng nguyên trạng
  `lib/event-countdown.ts` + `hooks/use-event-countdown.ts` (đã có từ F002, độ phân giải phút).
- **FR-8**: Khi countdown báo hết giờ (`showComingSoon === false`, tương đương `isZero: true`) trong
  lúc client đang ở `/prelaunch` → tự động `router.replace` tới path trong `?next=`
  (`hooks/use-prelaunch-auto-redirect.ts`); `?next=` thiếu hoặc không hợp lệ (không bắt đầu bằng `/`,
  hoặc bắt đầu bằng `//`) → về `/` (chống open-redirect, `lib/safe-redirect.ts#sanitizeInternalPath`).

## 3. Yêu cầu phi chức năng
- Pixel-perfect theo Figma (MoMorph screenId `8PJQswPZmU`); fonts Montserrat (tái sử dụng
  `app/login/fonts.ts`) + Orbitron cho chữ số LED (tiền lệ từ `countdown-timer.tsx` của F002 —
  "Digital Numbers" trong Figma không có trên Google Fonts).
- `PrelaunchCountdownClient` cần `useSearchParams()` nên được bọc `<Suspense>` với fallback tĩnh
  "00 00 00" (SSR-safe, không nhấp nháy nội dung sai trước hydrate).
- Enforcement thật nằm ở **SERVER** (`proxy.ts` mỗi request); countdown hiển thị trên client chỉ là
  UI phụ trợ — người dùng không thể "vượt" gate bằng cách chỉnh giờ máy client.
- Files < 200 lines, kebab-case; không viết lại logic countdown/redirect đã có sẵn từ F002.

## 4. Kiểm thử (DoD như F001/F002)
- Unit (Vitest + Testing Library, 30 test mới trong tổng 181): time-gate trong `proxy.ts` (mọi route
  redirect khi env ở tương lai, không tự loop `/prelaunch`, fail-open khi env quá khứ/thiếu/không hợp
  lệ, `?next=` giữ đúng path + query gốc); `sanitizeInternalPath` (relative path giữ nguyên,
  `//evil`/URL tuyệt đối → `/`); `usePrelaunchAutoRedirect` (còn đếm → không redirect; hết giờ →
  redirect đúng theo `?next=` hoặc `/` khi giá trị không hợp lệ).
- E2E (Playwright, 52/52 tổng — 3 projects: chromium, chromium-authless, chromium-prelaunch):
  pre-launch (mọi route → `/prelaunch`, giữ `?next=`, 3 khối countdown hiển thị); post-launch (không
  còn redirect `/prelaunch`, auth-gate F001/F002 hoạt động lại — regression); open-redirect bị chặn;
  `/auth/callback` vẫn hoạt động bình thường sau launch (không bị time-gate bắt).
- Nguồn test case: spec MoMorph (screenId `8PJQswPZmU`) + `clarifications.md` (2026-07-06).

## 5. Unresolved Questions
_Không còn — auto-unlock UX và redirect target đã chốt 2026-07-06, xem
`plans/260706-1543-countdown-prelaunch/clarifications.md`._
