---
status: draft
authored_by: takumi
created: 2026-07-06
lang: vi
---

# Technical Spec — Countdown - Prelaunch page (provisional F003)

**Priority**: P0
**Type**: mixed (UI + cross-cutting navigation gate)
**Generated**: 2026-07-06

## Overview

Countdown - Prelaunch page là một gate điều hướng TOÀN SITE, hiển thị TRƯỚC thời điểm launch
SAA 2025. Trước mốc `NEXT_PUBLIC_EVENT_START_AT`, MỌI request tới MỌI route (kể cả `/login`) bị
chặn và đưa về route mới `/prelaunch`, bất kể trạng thái đăng nhập. Sau mốc, gate tự mở và auth-gate
hiện có (F001/F002, `proxy.ts`) tiếp tục hoạt động không đổi. Màn hình chỉ có 1 tiêu đề tĩnh và 3
khối đếm ngược (DAYS/HOURS/MINUTES) kiểu LED, tái sử dụng logic countdown đã có từ F002
(`lib/event-countdown.ts`, `hooks/use-event-countdown.ts`). MoMorph: fileKey `9ypp4enmFmdK3YAFJLIu6C`,
screenId `8PJQswPZmU` (cùng file Figma F002, frame khác).

## Polymorphic Behavior

N/A — no discriminator fields in Key Entities.

## Cross-Cutting Logic

### Requirements

| Code | Description | Endpoint/Handler | Verifiable |
|------|-------------|------------------|------------|
| FR-001 | Time-gate kiểm tra mốc `NEXT_PUBLIC_EVENT_START_AT` so với thời gian hiện tại; nếu chưa đến mốc, MỌI request (trừ `/prelaunch` và static assets) redirect về `/prelaunch`. Chạy TRƯỚC auth-gate hiện có. | (dự kiến) lớp mới trong/trước `proxy.ts` | yes |
| FR-006 | Redirect sang `/prelaunch` gắn path gốc bị chặn vào query `?next=<path>` (tương tự tiền lệ `app/auth/callback`). | (dự kiến) lớp mới trong/trước `proxy.ts` | yes |
| FR-007 | Khi `hooks/use-event-countdown.ts` báo `isZero: true` trong lúc client đang ở `/prelaunch`, tự động điều hướng (client-side) tới path trong `?next=` (hoặc `/` nếu thiếu/không hợp lệ). | `app/prelaunch/page.tsx` (dự kiến) | yes |

**Source:** TBD (draft) — chưa có code.

### Business Rules

### BR-001_TimeGateExemption
**Linked FR:** FR-001
**Source:** TBD (draft) — chưa có code
**Applies to:** toàn site (mọi route, mọi trạng thái đăng nhập)
**Rule:** Ngoại lệ khỏi time-gate CHỈ gồm: chính route `/prelaunch`, và static assets
(`_next/*`, favicon, ảnh public — theo convention matcher chuẩn của Next.js). Không có ngoại lệ nào
khác — `/login` cũng bị chặn như mọi route khác.

**Pseudocode:**
```text
if now < eventStartAt (hoặc eventStartAt không xác định được — xem Assumptions):
    if path != "/prelaunch" and not isStaticAsset(path):
        redirect "/prelaunch?next=" + encodeURIComponent(path)
# else: bỏ qua time-gate, chuyển tiếp cho auth-gate hiện có (không đổi)
```

### BR-002_AutoUnlockRedirectTarget
**Linked FR:** FR-006, FR-007
**Source:** TBD (draft) — chưa có code
**Applies to:** client tại `/prelaunch` khi countdown chạm 0
**Rule:** Khi `isZero: true`, client đọc query `?next=`; nếu có và là path nội bộ hợp lệ (bắt đầu
bằng `/`, không phải URL tuyệt đối/external — tránh open-redirect) → điều hướng tới đó; nếu thiếu/
không hợp lệ → điều hướng về `/`. Auth-gate hiện có (F001/F002) tiếp tục quyết định đích cuối cùng
như bình thường (ví dụ path đó là route bảo vệ mà chưa đăng nhập → `/login`).

### Decision Logic

N/A — no user-facing decision logic beyond DISC-### Polymorphic Behavior. (So sánh thời gian đơn
predicate → xử lý như Business Rule, không phải DEC theo ranh giới DISC/DEC của contract.)

### State Machines

None. (Có 2 trạng thái hiển thị — "đang đếm" / "đã về 0" — nhưng chỉ 1 transition, dưới ngưỡng
≥3 states hoặc ≥2 transitions để tách thành SM-### riêng; giữ ngầm định trong BR-001/FR-005.)

### Algorithms

None — tái sử dụng nguyên trạng `lib/event-countdown.ts` (`parseEventStart`, `computeCountdown`,
`pad2`) đã có từ F002; không thiết kế thuật toán mới cho F003.

### External Integrations

None — không có API/service mới; toàn bộ dựa vào biến môi trường `NEXT_PUBLIC_EVENT_START_AT`
đã có.

### Verification

- **SC-001** Trước mốc, mọi truy cập route bất kỳ (kể cả `/login`) đều thấy `/prelaunch`, không
  bao giờ thấy nội dung route khác (covers FR-001, BR-001).
- **SC-002** Ngay sau khi qua mốc, request MỚI tới route bất kỳ không còn bị redirect về
  `/prelaunch`; auth-gate hiện có (F001/F002) quyết định tiếp, không thay đổi hành vi của nó
  (covers FR-001, FR-005).

---

**Client behavior:** see
[`permissions.md`](../system/permissions.md) (delta draft — time-gate layer, composition với
auth-gate hiện có), `lib/event-countdown.ts` + `hooks/use-event-countdown.ts` (countdown hiện có,
tái sử dụng nguyên trạng).

## User Stories

### US001_ViewPrelaunchCountdown — Xem trang Countdown Prelaunch (Priority: P0)

**What happens:** Người dùng (đã hoặc chưa đăng nhập) bị time-gate chặn truy cập bất kỳ route nào
trước mốc sự kiện, được đưa tới `/prelaunch`; trang hiển thị nền tối họa tiết hữu cơ nhiều màu toàn
viewport (lớp phủ bán trong suốt tăng tương phản), tiêu đề tĩnh "Sự kiện sẽ bắt đầu sau", và 3 khối
đếm ngược kiểu LED (DAYS/HOURS/MINUTES), mỗi khối 2 chữ số 0-padded kèm nhãn viết hoa bên dưới, tự
cập nhật theo thời gian thực.
**Why this priority:** Đây là gate chặn TOÀN site — không có nó, không route nào khả dụng trước
launch; ưu tiên cao nhất (P0), tương đương mức access-control của F001/F002.
**Independent Test:** Set `NEXT_PUBLIC_EVENT_START_AT` ở tương lai, truy cập `/`, `/login`,
`/awards` bất kỳ → tất cả redirect về `/prelaunch`; quan sát 3 khối số đếm lùi theo thời gian.

**Acceptance Scenarios:**

1. **Given** thời gian hiện tại trước mốc event, **When** người dùng (bất kỳ trạng thái đăng nhập)
   truy cập `/`, **Then** hệ thống redirect về `/prelaunch` và hiển thị countdown.
2. **Given** đang ở `/prelaunch`, **When** thời gian trôi qua, **Then** các khối DAYS/HOURS/MINUTES
   tự cập nhật giá trị 2 chữ số 0-padded tương ứng (phạm vi HOURS 00-23, MINUTES 00-59).
3. **Given** mốc `NEXT_PUBLIC_EVENT_START_AT` thiếu hoặc không hợp lệ, **When** người dùng vào
   `/prelaunch`, **Then** cả 3 khối hiển thị "00", không crash (kế thừa hành vi `parseEventStart` /
   `computeCountdown`).

**Requirements fulfilled:**
- **FR-002** Nền tối họa tiết hữu cơ nhiều màu toàn viewport + lớp phủ bán trong suốt (cover,
  no-repeat), tĩnh, không tương tác.
  **Source:** TBD (draft) — chưa có code
- **FR-003** Tiêu đề tĩnh "Sự kiện sẽ bắt đầu sau" (VI, không dịch theo cookie `NEXT_LOCALE` — tiền
  lệ F001/F002; bản EN trong spec CSV MoMorph chỉ là tài liệu tham khảo thiết kế).
  **Source:** TBD (draft) — chưa có code
- **FR-004** 3 khối đếm ngược DAYS/HOURS/MINUTES: 2 chữ số kiểu LED, nhãn viết hoa bên dưới; DAYS
  00-99, HOURS 00-23, MINUTES 00-59; tự cập nhật qua `hooks/use-event-countdown.ts` (độ phân giải
  phút, kế thừa nguyên trạng từ F002 — xem Assumptions).
  **Source:** TBD (draft) — chưa có code

**Rules enforced:** BR-001 (see Cross-Cutting Logic) — `/prelaunch` chính là ngoại lệ khai báo
trong BR-001.

**Verification:**
- **SC-003** DAYS luôn hiển thị đúng 2 ký tự numeric (00-99); HOURS trong 00-23; MINUTES trong
  00-59 (covers FR-004).

---

### US002_AutoUnlockAtZero — Time-gate tự mở khóa khi countdown về 0 (Priority: P0)

**What happens:** Khi mốc `NEXT_PUBLIC_EVENT_START_AT` đã qua (hoặc thiếu/không hợp lệ — coi như đã
qua, xem Assumptions), time-gate ngừng redirect; các request tiếp theo tới route bất kỳ được chuyển
tiếp cho auth-gate hiện có (F001/F002) xử lý như bình thường, không còn ưu tiên `/prelaunch`.
**Why this priority:** Nếu gate không tự mở, sản phẩm bị chặn vĩnh viễn sau launch — lỗi nghiêm
trọng nhất có thể xảy ra; P0.
**Independent Test:** Set `NEXT_PUBLIC_EVENT_START_AT` ở quá khứ (hoặc xóa env) → truy cập `/` →
không bị redirect về `/prelaunch`; hành vi auth-gate F001/F002 áp dụng lại (chưa đăng nhập →
`/login`, đã đăng nhập → trang chủ).

**Acceptance Scenarios:**

1. **Given** mốc event đã qua, **When** truy cập `/` chưa đăng nhập, **Then** redirect `/login`
   (không phải `/prelaunch`).
2. **Given** mốc event đã qua, **When** truy cập `/` đã đăng nhập, **Then** hiển thị trang chủ bình
   thường, không có gì thay đổi so với hành vi F002 hiện có.
3. **Given** đang xem `/prelaunch` đúng lúc countdown chạm 0, **When** người dùng không thao tác gì
   thêm, **Then** client tự động điều hướng (router.replace) tới path trong `?next=` (hoặc `/` nếu
   thiếu/không hợp lệ) — không cần refresh thủ công (FR-007).

**Requirements fulfilled:**
- **FR-005** Khi `computeCountdown` trả `isZero: true` (mốc đã qua, hoặc thiếu/không hợp lệ), time-
  gate coi mốc "đã đến giờ" và KHÔNG redirect request đó về `/prelaunch`.
  **Source:** TBD (draft) — chưa có code
- **FR-006** Redirect sang `/prelaunch` gắn path gốc vào `?next=`.
  **Source:** TBD (draft) — chưa có code
- **FR-007** Client tại `/prelaunch` tự động điều hướng tới `?next=` (hoặc `/`) ngay khi
  `isZero: true` — không cần thao tác người dùng.
  **Source:** TBD (draft) — chưa có code

**Rules enforced:** BR-001 (see Cross-Cutting Logic)

**Verification:**
- **SC-004** Sau khi qua mốc, không route nào (trừ chính `/prelaunch`) còn trả về nội dung
  Prelaunch (covers FR-005, FR-001).

## Key Entities

N/A — tính năng không đọc/viết bảng dữ liệu nào. Toàn bộ trạng thái đến từ biến môi trường
`NEXT_PUBLIC_EVENT_START_AT` (không phải DB) và state tạm trên client (đồng hồ đếm ngược). Không
có entity cần định nghĩa.

## Artifact References

| Artifact | File | Codes Used | Reviewed |
|----------|------|------------|----------|
| System Overview | [system-overview.md](../../../../docs/system/system-overview.md) | TBD (draft) | [ ] |
| Architecture | [architecture.md](../../../../docs/system/architecture.md) | TBD (draft) | [ ] |
| Feature List | [feature-list.md](../../../../docs/generated/feature-list.md) | F003 | [ ] |
| API Map | [api-map.md](../../../../docs/generated/api-map.md) | TBD (draft) | [ ] |
| Entities | [entities.md](../../../../docs/generated/entities.md) | TBD (draft) | [ ] |
| Screens | [screens.md](screens.md) | TBD (draft) | [ ] |
| Behavior Logic | [behavior-logic.md](../../../../docs/system/behavior-logic.md) | TBD (draft) | [ ] |
| Permissions Matrix | [permissions.md (delta draft)](../system/permissions.md) | TBD (draft) | [ ] |
| User Stories | [user-stories.md](../../../../docs/generated/user-stories.md) | TBD (draft) | [ ] |

**Rule:** Every code listed in Codes Used MUST exist in its source artifact. Orphan refs = reviewer
critical.

## Assumptions

- **Fail-open khi thiếu/lỗi env**: nếu `NEXT_PUBLIC_EVENT_START_AT` thiếu/không hợp lệ,
  `computeCountdown` trả `isZero: true` (00:00:00) → giả định time-gate coi đây là "đã đến giờ" và
  MỞ khóa điều hướng, nhất quán với triết lý fail-open hiện có của `proxy.ts` (thiếu env Supabase →
  no-op) cho mock/training repo. Đây là giả định kỹ thuật, KHÔNG phải xác nhận nghiệp vụ — không phù
  hợp production thật nếu áp dụng nguyên trạng.
- **Static asset exemption theo convention**: `_next/*`, favicon, ảnh public được loại khỏi time-
  gate theo pattern matcher chuẩn của Next.js (negative-lookahead), không cần liệt kê route tường
  minh trong spec.
- **Độ phân giải phút, không phải giây**: `hooks/use-event-countdown.ts` hiện tại tick mỗi phút, dù
  mô tả MoMorph ghi "tự cập nhật mỗi giây" — giữ nguyên hành vi lib hiện có theo quyết định
  clarification (tái sử dụng, không thiết kế lại); chấp nhận sai khác nhỏ so với text mô tả gốc.
- **Không có entity/bảng dữ liệu** nào được đọc/viết bởi tính năng này (xem `## Key Entities`).

## Source Code References

Chưa có code — xem `## User Stories` cho endpoint/logic dự kiến.

Cơ chế dự kiến (mô tả ý định, KHÔNG phải trích dẫn source cho code chưa tồn tại):
- Time-gate: thêm logic vào `proxy.ts` (hoặc một lớp riêng compose ngay trước nó) — kiểm tra
  `NEXT_PUBLIC_EVENT_START_AT` trước khi chạy auth-gate hiện có.
- Hiển thị countdown: tái sử dụng nguyên trạng `lib/event-countdown.ts` và
  `hooks/use-event-countdown.ts` (đã tồn tại, viết cho F002) — không viết lại logic.
- Trang `/prelaunch`: page mới dưới cấu trúc Next.js App Router hiện có (`app/prelaunch/`).

## Unresolved Questions

_None._ (Auto-unlock UX và redirect target đã chốt 2026-07-06 — xem `clarifications.md`: auto-
redirect client-side khi `isZero: true`, giữ path gốc qua `?next=`. Đã gộp vào FR-006/FR-007/BR-002.)

## Gaps for Clarification

_None._
