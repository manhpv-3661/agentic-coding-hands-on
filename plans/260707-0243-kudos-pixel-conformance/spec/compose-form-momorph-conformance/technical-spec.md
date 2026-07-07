---
status: draft
authored_by: takumi
created: 2026-07-07
lang: vi
fcode: F007
---

# F007_ComposeFormMomorphConformance

## Overview

Pixel-conformance revision cho F007 (Kudos Compose Form, đã ship, `status: active`). Phát hiện
qua audit trực tiếp MoMorph (fileKey `9ypp4enmFmdK3YAFJLIu6C`) — không phải bằng suy diễn qua
node-tree JSON, mà bằng `get_frame_image` (ảnh render thật) + đối chiếu `getComputedStyle`/
`getBoundingClientRect` thật trên implementation. 3 sai lệch được xác nhận:

1. **Toàn bộ dialog "Viết Kudos" sai theme.** Bản Figma chốt thật là `ihQ26W78P2` ("Viết Kudo",
   `design_status: done`) — khác bản `JsTvi8KVQA` ("Gửi lời chúc Kudos", `in_progress`) mà một
   phiên trước đã nhầm dùng làm ground truth. Đo trực tiếp: `getComputedStyle(dialog)
   .backgroundColor === "rgb(16, 19, 23)"` (tối, `#101317`) — design là card kem `#FFF8E1`.
2. **FR-10 hiện tại sai căn cứ.** Comment trong `community-standards-link.tsx` ghi "no
   community-standards page exists in this mock project" — SAI. Frame `b1Filzi9i6` ("Thể lệ
   UPDATE", `design_status: done`) tồn tại và đã chốt. Xác nhận bằng thực nghiệm: click nút →
   `document.querySelectorAll('[role="dialog"]').length` không đổi (0 dialog mới mở).
3. **"Insert link" chỉ dùng `window.prompt()` 1 ô** — design (`OyDLDuSGEa` "Addlink Box", done)
   là dialog kem 2 field (Nội dung + URL) + Hủy/Lưu.

## Polymorphic Behavior

Không áp dụng — không có role/tenant khác nhau trong scope này.

## Cross-Cutting Logic
### Requirements

- **FR-22** (mới): Dialog "Viết Kudos" và mọi field con (recipient select, title input,
  rich-text editor + toolbar, hashtag input, image upload, anonymous toggle) đổi theme sang
  cream `#FFF8E1` khớp `ihQ26W78P2`: input field nền trắng viền mỏng, tiêu đề lớn căn giữa màu
  tối (không phải "Viết Kudos" nhỏ màu vàng trái như hiện tại), toolbar là 1 dải nền trắng riêng
  với icon-button thật (không phải chữ B/I/S trần). Mọi hành vi/validate/aria hiện có (FR-1..21)
  giữ nguyên — đây là đổi style, không đổi logic.
- **FR-23** (revise FR-10): "Tiêu chuẩn cộng đồng" chuyển từ stub chết sang mở dialog thật, nội
  dung theo `b1Filzi9i6`: heading "Thể lệ"; mục "NGƯỜI NHẬN KUDOS" với 4 bậc huy hiệu (New Hero
  1-4 người gửi, Rising Hero 5-9, Super Hero 10-20, Legend Hero >20) — mỗi bậc 1 dòng điều kiện +
  1 dòng mô tả; mục "NGƯỜI GỬI KUDOS" với 6 icon sưu tập (Revival, Touch of Light, Stay Gold,
  Flow to Horizon, Beyond the Boundary, Root Further) + đoạn văn về việc sưu tập trọn bộ; mục
  "KUDOS QUỐC DÂN" (top 5 theo lượt tim); footer 2 nút "Đóng" + "Viết KUDOS" (nút sau đưa focus
  về/mở lại dialog compose hiện tại, không mở dialog lồng dialog).
- **FR-24** (mới): "Insert link" trong toolbar mở 1 mini-dialog kem 2 field — "Nội dung" (text
  hiển thị của link) + "URL" — thay cho `window.prompt()`. Nút "Lưu" gọi lại đúng luồng
  `exec("createLink", url)` đã có; nút "Hủy" đóng không áp dụng gì. Nếu component rich-text
  editor hiện tại hỗ trợ chèn text hiển thị tùy biến (không chỉ link quanh selection có sẵn) thì
  dùng giá trị "Nội dung" làm text hiển thị — nếu không hỗ trợ rẻ (cheap), giữ hành vi hiện tại
  (link quanh selection) và chỉ field URL là bắt buộc, field "Nội dung" là optional/decorative
  cho khớp design — không over-engineer editor.

### Business Rules

- **BR-1**: Đổi theme (FR-22) không được đổi bất kỳ contract validate/aria nào của FR-1..21 —
  mọi test hiện có (compose-dialog.test.tsx, field-group.test.tsx, hashtag-input.test.tsx,
  image-upload.test.tsx, anonymous-toggle.test.tsx, recipient-select.test.tsx,
  rich-text-editor.test.tsx, rich-text-toolbar.test.tsx) phải xanh sau khi restyle, chỉ update
  assertion màu/class khi test đó tự nó assert màu/class (style-coupled), không xóa assertion
  hành vi.
- **BR-2**: FR-23 KHÔNG cần logic huy hiệu Hero thật (tính số người gửi Kudos cho 1 người, gán
  badge tương ứng) — đó là 1 feature riêng chưa có trong scope 8 features hiện tại. Panel chỉ
  hiển thị NỘI DUNG TĨNH mô tả luật (matching design), không tính toán badge thật cho user hiện
  tại. Badge pill "Rising Hero"/... đã có sẵn trên KudosCard (F008) render tĩnh từ mock data —
  không đổi.
- **BR-3**: FR-24 không thêm dependency mới (không rich-text-editor library) — mini-dialog tự
  viết bằng React state, cùng pattern với `ComposeDialog`/secret-box dialog hiện có.

### Decision Logic

Không có decision-tree phức tạp mới — 3 fix đều là "đổi visual/behavior của 1 element cụ thể",
không rẽ nhánh logic nghiệp vụ.

### State Machines

Không có state machine mới. `CommunityStandardsLink` thêm 1 state boolean (`open`) theo đúng
pattern `useState` + `useDismissableMenu` đã dùng cho compose dialog/secret box.

### Algorithms

Không có.

### External Integrations

Không có (không backend, không API mới — giữ nguyên mock-only scope của F006/F007).

### Verification

`npx tsc --noEmit`, `npx eslint app/components/kudos/compose lib/kudos lib/i18n`, `npx vitest run`
— tất cả phải sạch. Verify pixel bằng `getComputedStyle`/`getBoundingClientRect` thật trên
browser (KHÔNG bằng cách xem ảnh chụp thu nhỏ qua mắt — bài học từ phiên trước) đối chiếu giá trị
đo được từ MoMorph `get_node`.

**Client behavior:** see behavior-logic.md, permissions.md, screen-flow.md

## User Stories

- Là một Sunner đang soạn Kudos, tôi thấy dialog "Viết Kudos" đúng màu sắc/kiểu chữ như thiết kế
  chốt, để trải nghiệm nhất quán với phần còn lại của hệ thống Kudos (card đã đổi kem ở phiên
  trước).
- Là một Sunner tò mò về luật thưởng, tôi bấm "Tiêu chuẩn cộng đồng" và thấy panel giải thích đầy
  đủ (bậc Hero, icon sưu tập, Kudos Quốc Dân) — không phải bấm vào 1 nút không làm gì.
- Là một Sunner đang viết nội dung Kudos, tôi bấm nút chèn link và được nhập cả text hiển thị +
  URL trong 1 dialog rõ ràng, không phải 1 ô prompt trần của browser.

### Edge Cases

See edge-cases.md.

## Key Entities

Không có entity mới (không đổi `KudosPost`/`KudosPerson` shape) — Community Standards content là
dữ liệu tĩnh (danh sách hero-tier + icon tile), sống trong 1 module `lib/kudos/*` hoặc constant
nội bộ component, không phải domain entity.

## Artifact References

- MoMorph fileKey `9ypp4enmFmdK3YAFJLIu6C`:
  - `ihQ26W78P2` — "Viết Kudo" (compose dialog, done) — theme ground truth cho FR-22.
  - `b1Filzi9i6` — "Thể lệ UPDATE" (done) — content ground truth cho FR-23.
  - `OyDLDuSGEa` — "Addlink Box" (done) — layout ground truth cho FR-24.
- `plans/reports/reviewer-260707-0202-full-app-verification-and-fixes.md` — báo cáo audit trước
  (đã fix một phần, nhưng dùng node-tree suy diễn cho phần lớn — đây là spec revision dựa trên
  ảnh + đo thật, chính xác hơn).

## Assumptions

- Panel Community Standards (FR-23) là 1 dialog độc lập, không nested trong compose dialog —
  cùng cấp với secret-box dialog hiện có, quản lý state riêng ở component cha gần nhất
  (`ComposeDialog` hoặc `KudosPageClient` — quyết định ở Blueprint stage theo state đã có).
- "Viết KUDOS" button trong panel Thể lệ chỉ cần đóng panel Thể lệ (compose dialog ở dưới vẫn mở
  sẵn, vì panel này chỉ mở được TỪ TRONG compose dialog qua toolbar) — không cần logic mở lại
  compose dialog từ đầu.

## Source Code References

- `app/components/kudos/compose/compose-dialog.tsx`
- `app/components/kudos/compose/field-group.tsx`
- `app/components/kudos/compose/hashtag-input.tsx`
- `app/components/kudos/compose/image-upload.tsx`
- `app/components/kudos/compose/anonymous-toggle.tsx`
- `app/components/kudos/compose/recipient-select.tsx`
- `app/components/kudos/compose/rich-text-editor.tsx`
- `app/components/kudos/compose/rich-text-toolbar.tsx`
- `app/components/kudos/compose/community-standards-link.tsx` (sẽ đổi tên/refactor thành dialog)
- `lib/i18n/dictionaries/vi.ts`, `lib/i18n/dictionaries/en.ts` (thêm key cho Thể lệ + Addlink)

## Unresolved Questions

1. Field "Nội dung" trong Addlink Box (FR-24) có set được text hiển thị của link hay chỉ dùng
   selection hiện có trong contentEditable? Cần đọc `rich-text-editor.tsx` trước khi Blueprint
   quyết định (đã note trong FR-24 — không over-engineer nếu editor không hỗ trợ rẻ).
