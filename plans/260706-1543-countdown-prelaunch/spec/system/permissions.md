---
status: draft
authored_by: takumi
created: 2026-07-06
lang: vi
---

# Phân quyền & Kiểm soát truy cập — SAA 2025 (Delta: Time-Gate Prelaunch)

> Bản dự thảo (draft) mô tả lớp gate MỚI thêm vào phía TRƯỚC ma trận hiện có tại
> `docs/system/permissions.md` (status: active). Không thay thế tài liệu đó — chỉ mô tả thay đổi sẽ
> được hợp nhất (reconcile) khi tính năng Countdown Prelaunch (provisional F003) được implement.

## Lớp gate mới: Time-Gate (Prelaunch)

Chạy TRƯỚC auth-gate hiện có (mô tả tại `docs/system/permissions.md` § Cơ chế thực thi), trong cùng
`proxy.ts` hoặc một lớp compose riêng ngay trước nó (quyết định implementation, không phải spec).

- Trước mốc `NEXT_PUBLIC_EVENT_START_AT` (đọc bởi `lib/event-countdown.ts`): MỌI request tới MỌI
  route (kể cả `/login`) → redirect `/prelaunch`. Không phân biệt trạng thái đăng nhập.
- Ngoại lệ khỏi time-gate: chính route `/prelaunch`, và static assets (`_next/*`, favicon, ảnh
  public — theo convention matcher chuẩn của Next.js).
- Sau mốc (hoặc khi env thiếu/không hợp lệ — coi như "đã đến giờ", xem Assumptions trong
  `technical-spec.md` của F003 tại `plans/260706-1543-countdown-prelaunch/spec/countdown-prelaunch/`):
  time-gate ngừng can thiệp; request đi tiếp vào auth-gate hiện có, KHÔNG có thay đổi gì với ma trận
  auth-gate đang active.

## Route mới: `/prelaunch`

| Route | Time-gate | Auth-gate |
|-------|-----------|-----------|
| `/prelaunch` | Luôn cho phép (đây chính là đích của time-gate) | Không áp dụng — public, không yêu cầu đăng nhập, dù trước hay sau mốc sự kiện |

`ROUTE###` cho `/prelaunch`: TBD (draft) — mã thật cấp lúc reconcile.

## Composition với ma trận hiện có

Ma trận truy cập route hiện tại (`docs/system/permissions.md` § Ma trận truy cập route) KHÔNG đổi
sau khi mốc sự kiện đã qua — time-gate chỉ là một lớp chặn THÊM phía trước, có hiệu lực CHỈ trong
khung thời gian trước launch. Một khi countdown về 0, hành vi route `/`, `/awards`, `/kudos`,
`/todo`, `/login` trở lại đúng như tài liệu active đã mô tả (redirect theo trạng thái đăng nhập,
không còn liên quan gì tới time-gate).

Matcher hiện tại của `proxy.ts` (`/`, `/awards`, `/kudos`, `/todo/:path*`, `/login`) là ALLOWLIST —
với time-gate, matcher cần mở rộng để bắt được hầu như MỌI route (trừ `/prelaunch` và static
assets), vì trước launch không route nào được miễn trừ ngoài `/prelaunch`. Pattern matcher cụ thể là
quyết định implementation.

## Vai trò & mã

Không có role/permission mới — time-gate không phân biệt vai trò, chỉ phân biệt THỜI ĐIỂM. Không
cấp `PERM###` nào cho lớp gate này (chặn theo thời gian, không theo quyền). `PERM###`, `SCR###`,
`ROUTE###` liên quan tới `/prelaunch`: TBD (draft) — cấp thật lúc reconcile.

## Bảo mật

- Enforcement thật nằm ở SERVER (kiểm tra tại `proxy.ts` mỗi request) — hiển thị countdown trên
  client chỉ là UI phụ trợ; người dùng không thể "vượt" gate bằng cách chỉnh đồng hồ máy client.
- Thiếu/không hợp lệ env mốc sự kiện → fail-open (mở khóa), nhất quán với triết lý fail-open đã có
  của `proxy.ts` cho biến môi trường Supabase (chấp nhận được cho mock/training repo, KHÔNG phù hợp
  production thật nếu áp dụng nguyên trạng).
