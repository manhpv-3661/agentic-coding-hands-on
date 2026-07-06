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
số lượt tim hiển thị cập nhật ngay (optimistic UI), trạng thái được lưu lại qua
`localStorage` nên còn giữ sau khi reload trang. Không cho phép tự thích Kudos do chính
mình gửi (`sender` = người dùng hiện tại).

**Không thuộc phạm vi phiên này** (per orchestrator instruction — "CHỈ implement
hành vi/logic like, KHÔNG dựng lại UI card đã có"): không đổi layout/spacing của
`KudosCard`, không đổi compose form (F007), không đổi Live board layout, không có
backend/API thật lưu lượt tim.

## 2. Yêu cầu chức năng

- **FR-1**: Click icon tim trên 1 Kudos card (cả `highlight` và `feed` variant) → toggle
  trạng thái đã-thích/chưa-thích cho card đó.
- **FR-2**: Số lượt tim hiển thị = `post.hearts` (số tĩnh có sẵn từ mock data, không đổi)
  cộng thêm 1 nếu người dùng hiện tại đang ở trạng thái đã-thích card đó, cập nhật ngay
  trong cùng lần render với click (optimistic UI — không có network call nên không có
  trạng thái pending).
- **FR-3**: Trạng thái đã-thích được lưu vào `localStorage`
  (`saa2025:kudos:liked-post-ids`), đọc lại khi mount — reload trang vẫn giữ nguyên
  trạng thái tim đã bấm.
- **FR-4**: Không cho thích Kudos mà `sender.name` của post đó là người dùng hiện tại
  (`CURRENT_USER`, F007) — icon tim hiển thị ở trạng thái disabled (giảm opacity), không
  gắn click handler.
- **FR-5**: Toggle là idempotent theo từng click (không có request nào có thể chạy đôi) —
  không cần cờ pending/loading riêng vì không có network call.
- **FR-6**: Trạng thái đã-thích dùng chung 1 màu accent đã có sẵn của card (`#FFEA9E`) để
  tô icon tim khi đã-thích — không thêm token màu mới.

## 3. Ngoài phạm vi

- Backend/API lưu lượt tim thật, đồng bộ nhiều thiết bị/nhiều người dùng.
- Đổi layout/kích thước/spacing của `KudosCard`.
- Đổi hành vi compose form (F007) hoặc Live board layout (F006).
- Thông báo/toast khi like (không có yêu cầu, không có tiền lệ tương tự trong repo cho
  hành động nhẹ như like).

## 4. Ràng buộc kỹ thuật

- Không đổi `KudosPost`/`kudos-data.ts` — `hearts` giữ nguyên là số tĩnh mock; "đã thích"
  là state phía client, không phải field của post.
- State "liked post ids" do `KudosBoard` sở hữu (nơi duy nhất hiện có state chia sẻ giữa
  Highlight carousel và All Kudos feed — theo đúng pattern filter hashtag/department đã
  có, không dùng context).
- Selector thuần `canLikeKudos(post, currentUser)` trong `kudos-selectors.ts` cho rule
  FR-4 — mirror `getDistinctRecipients`'s currentUser-exclusion pattern.
- Không rebuild UI card — chỉ đổi icon tim từ `<span>` tĩnh thành phần tử có thể click
  (khi có `onToggleLike`), giữ nguyên layout/style xung quanh.
