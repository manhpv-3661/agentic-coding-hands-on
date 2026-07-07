---
feature: F008
name: Like Kudos — Thả tim / Bỏ tim — SAA 2025
lang: vi
screen: Sun* Kudos - Live board
momorph:
  fileKey: 9ypp4enmFmdK3YAFJLIu6C
  screenId: MaZUn5xHXZ
status: active
notes: Không có spec/test-case riêng cho hành vi like trên MoMorph — F006 đã ghi nhận icon
  tim là static/out-of-scope có chủ đích (clarifications.md), đây là follow-up chính
  thức hoá hành vi đó. Yêu cầu suy ra từ mô tả người giao việc + UX chuẩn của một nút
  like (toggle, optimistic, no double-submit). Xem clarifications.md.
---

# F008 — Like Kudos (Thả tim / Bỏ tim)

## 1. Tổng quan

Chính thức hoá tương tác cho icon ❤️ tĩnh trên mỗi Kudos card (Highlight carousel + All
Kudos feed) mà F006 build có chủ đích là không tương tác được
(`plans/260706-2200-sun-kudos-live-board/clarifications.md`). F008 nối logic toggle
like/unlike thật: click vào icon tim trên 1 card → đổi trạng thái đã-thích/chưa-thích,
số lượt tim hiển thị cập nhật ngay (optimistic UI), trạng thái là session-only (mất khi
F5 — cùng tinh thần state `posts` của F007, không có `localStorage`/backend). Không cho
phép tự thích Kudos do chính mình gửi (`sender` = người dùng hiện tại).

**Không thuộc phạm vi phiên này**: không đổi layout/spacing tổng thể của `KudosCard`
(chỉ icon tim đổi từ tĩnh sang có thể click), không đổi compose form (F007), không đổi
Live board layout, không có backend/API thật lưu lượt tim.

## 2. Yêu cầu chức năng

- **FR-1**: Click icon tim trên 1 Kudos card (cả `highlight` và `feed` variant) → toggle
  trạng thái đã-thích/chưa-thích cho card đó.
- **FR-2**: Số lượt tim hiển thị = `post.hearts` (số tĩnh có sẵn từ mock data, không đổi)
  cộng thêm 1 nếu người dùng hiện tại đang ở trạng thái đã-thích card đó, cập nhật ngay
  trong cùng lần render với click (optimistic UI — không có network call nên không có
  trạng thái pending).
- **FR-3**: Trạng thái đã-thích là session-only (React state trong `KudosPageClient`) —
  mất khi F5, không có `localStorage`/backend, cùng tinh thần state `posts` của F007.
- **FR-4**: Không cho thích Kudos mà `sender.name` của post đó là người dùng hiện tại
  (`CURRENT_USER`, F007) — icon tim hiển thị ở trạng thái disabled (giảm opacity), không
  gắn click handler.
- **FR-5**: Toggle là idempotent theo từng click (không có request nào có thể chạy đôi) —
  không cần cờ pending/loading riêng vì không có network call.
- **FR-6**: Trạng thái đã-thích tô icon tim màu đỏ `#D4271D` (đã sửa từ `#FFEA9E` — đo thật theo
  MoMorph TC `7a7ec63e`, "toggles... gray to red") khi đã-thích, xám `#999999` khi chưa — không thêm
  token màu mới ngoài 2 giá trị này.
- **FR-7**: Icon tim có `aria-label` mô tả hành động ("Thả tim" / "Bỏ thả tim", i18n) và
  `aria-pressed` phản ánh trạng thái đã-thích, thay cho số lượt tim làm accessible name.

## 3. Ngoài phạm vi

- Backend/API lưu lượt tim thật, đồng bộ nhiều thiết bị/nhiều người dùng.
- Đổi layout/kích thước/spacing tổng thể của `KudosCard` (ngoài icon tim).
- Đổi hành vi compose form (F007) hoặc Live board layout (F006).
- Thông báo/toast khi like.

## 4. Kiến trúc & vị trí state

- `KudosPost`/`kudos-data.ts` không đổi — `hearts` giữ nguyên là số tĩnh mock; "đã thích"
  là state phía client, không phải field của post.
- `KudosPageClient` (cùng nơi sở hữu `posts`/dialog state từ F007) sở hữu thêm
  `likedIds: Set<string>` (`useState`, session-only) + `toggleLike(postId)` (`useCallback`),
  forward `likedIds`/`onToggleLike`/`currentUser` xuống `KudosBoard` → carousel/feed →
  `KudosCard` — không dùng hook/context riêng, mirror đúng pattern prop-drilling
  `onHashtagClick` đã có.
- Selector thuần `canLikeKudos(post, currentUser)` trong `kudos-selectors.ts` cho rule
  FR-4 — mirror `getDistinctRecipients`'s currentUser-exclusion pattern.
- `KudosCard` nhận 3 prop mới, đều optional (additive, backward-compatible): `liked?`,
  `canLike?`, `onToggleLike?`. Không truyền `onToggleLike` → icon tim giữ nguyên
  `<span>` tĩnh như F006 (không có regression cho các call site chưa wire).

## 5. Kiểm thử (Definition of Done)

- `npx vitest run`: 426/426 tests xanh (73 test files), gồm unit cho `canLikeKudos`,
  component test cho 3 nhánh heart (interactive/disabled/static-fallback) ở cả
  `KudosCard`/`AllKudosFeed`/`HighlightKudosCarousel`, và 1 integration test ở
  `KudosPageClient` xác nhận like/unlike đồng bộ qua cả 2 nơi hiển thị.
- `npx tsc --noEmit`: 0 lỗi (bao gồm parity dictionary vi/en).
- `npx eslint` trên các file đã đổi: clean.
- Review: `plans/reports/reviewer-260707-0052-f008-like-kudos-review.md`.

## Unresolved Questions

- Rule "không cho tự thích Kudos của chính mình" là một giả định được thêm vào ngoài
  4 câu hỏi clarification ban đầu (persist/toggle-direction/tracking/scope) — hợp lý về
  UX nhưng chưa được user xác nhận trực tiếp. Dễ revert (chỉ cần bỏ nhánh `canLike`).
