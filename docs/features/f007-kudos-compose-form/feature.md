---
feature: F007
name: Viết Kudos — Compose Form — SAA 2025
lang: vi
screen: Gửi lời chúc Kudos
momorph:
  fileKey: 9ypp4enmFmdK3YAFJLIu6C
  screenId: JsTvi8KVQA
  screenIdAlt: RO7O6QOhfJ
status: active
notes: MoMorph có 2 screenId cùng tên "Gửi lời chúc Kudos" — xác nhận là 1 form (cùng component instance "Viết KUDO"), chỉ khác nội dung ví dụ hiển thị (rỗng/đã điền). Không có spec/test case nào được upload cho cả 2 screenId trên MoMorph (spec_status/dev_status đều "none") — yêu cầu được suy ra từ ảnh chụp thiết kế (get_frame_image) + node tree + mô tả chi tiết của người giao việc. Xem clarifications.md.
---

# F007 — Form "Viết Kudos" (Gửi lời chúc Kudos)

## 1. Tổng quan

Nối logic thật cho thanh "Ghi nhận" (pill composer) trên `/kudos` — vốn được F006 build
static/no-op có chủ đích (xem `plans/260706-2200-sun-kudos-live-board/clarifications.md`).
F007 build dialog "Viết Kudos": form gửi lời cảm ơn/ghi nhận đến đồng đội. Click vào pill
"Ghi nhận" ở `KudosBanner` → mở dialog chứa form:

1. **Người nhận** — dropdown search (chọn 1 đồng nghiệp từ danh sách suy ra từ dữ liệu
   Kudos hiện có).
2. **Danh hiệu** — input text, hiển thị làm tiêu đề Kudos khi render trong feed.
3. **Nội dung** — rich text editor tối giản (bold/italic/strikethrough/list/link/quote),
   hỗ trợ `@mention` đồng nghiệp, tối đa 1.000 ký tự.
4. **Hashtag** — tối đa 5, dạng chip, tự thêm dấu `#` nếu thiếu.
5. **Image** — tối đa 5 ảnh, upload thật (preview client-side), không lưu file thật (chỉ
   lưu `imageCount` — không có backend/storage).
6. **Gửi ẩn danh** — checkbox; khi bật hiện thêm field "Nickname ẩn danh" (bắt buộc).
7. Link tĩnh "Tiêu chuẩn cộng đồng" (không điều hướng — không có trang đích trong mock
   project này).
8. Nút Hủy (đóng dialog, huỷ draft) / Gửi (validate → tạo `KudosPost` mới → đóng dialog →
   hiện toast thành công).

Submit thành công tạo một `KudosPost` mới, hiển thị **ngay đầu** danh sách "All Kudos" đã
build ở F006 (session-scoped — mất khi refresh, không có backend, xem
`clarifications.md`).

**Ngoài phạm vi của phiên này** (đã chốt tại
`plans/260706-2310-kudos-compose-form/clarifications.md`): toggle thả tim (vẫn giữ
nguyên `<span>` tĩnh của F006, không đổi), trang chi tiết Kudos, trang profile Sunner,
trang "Tiêu chuẩn cộng đồng" thật, backend/API lưu trữ thật.

## 2. Yêu cầu chức năng

### 2.1 Điểm vào (Entry point)
- **FR-1**: Click pill "Ghi nhận" trong `KudosBanner` → mở dialog "Viết Kudos" (modal,
  `role="dialog"`, `aria-modal="true"`, overlay tối, đóng bằng nút Hủy / phím Escape /
  click ngoài overlay).
- **FR-2**: Dialog mở dưới dạng client-mounted component trong `/kudos` (không tạo route
  mới — theo quy ước flat-routing hiện có của repo).

### 2.2 Người nhận (mms — dropdown search)
- **FR-3**: Dropdown search, bắt buộc (`*`). Danh sách người suy ra từ tập hợp
  sender+recipient duy nhất trong `KUDOS_POSTS` (loại trừ `CURRENT_USER`). Gõ để lọc
  theo chuỗi con (không phân biệt hoa/thường).
- **FR-4**: Không chọn Người nhận mà bấm Gửi → hiện lỗi inline dưới field, không submit.

### 2.3 Danh hiệu
- **FR-5**: Input text, bắt buộc (`*`), placeholder "Dành tặng một danh hiệu cho đồng
  đội.", helper text 2 dòng ví dụ (theo đúng thiết kế). Giá trị này hiển thị làm tiêu đề
  Kudos khi render trong feed (thêm 1 dòng tiêu đề mới trên `KudosCard`, không đổi field
  nào có sẵn của `KudosPost`/`KudosCard` variant khác).

### 2.4 Nội dung (rich text)
- **FR-6**: Toolbar 6 nút tĩnh: Bold, Italic, Strikethrough, List (**ordered/numbered** — đã sửa từ
  "unordered" theo ground truth MoMorph, componentId `662:10338`), Link, Quote — thao tác qua
  `document.execCommand` trên vùng `contentEditable`. Không dùng thư viện rich-text ngoài (không có
  dependency phù hợp trong `package.json`).
- **FR-7**: `@` + gõ tên → hiện gợi ý inline (lọc theo cùng danh sách người ở FR-3), chọn
  1 gợi ý → chèn `@Tên` dạng text thường vào nội dung (không phải object mention — giữ
  `KudosPost.content` là string như hợp đồng hiện có).
- **FR-8**: Bộ đếm ký tự `{n}/1.000` cập nhật realtime; chặn nhập thêm khi đã đạt 1000
  ký tự (không chỉ chặn lúc submit).
- **FR-9**: Nội dung rỗng mà bấm Gửi → lỗi inline, không submit.
- **FR-10**: "Tiêu chuẩn cộng đồng" cạnh toolbar, mở panel "Thể lệ" (2nd-layer dialog, đóng
  bằng Escape/nút Đóng/"Viết KUDOS" — Escape chỉ đóng panel, dialog Viết Kudos ở dưới vẫn mở).
  **Revised 2026-07-07 (pixel-conformance):** quyết định cũ ("stub, không có trang đích") sai
  căn cứ — frame MoMorph `b1Filzi9i6` ("Thể lệ UPDATE") tồn tại và đã `design_status: done`.
  Panel hiển thị nội dung tĩnh (không tính badge thật): 4 bậc huy hiệu Hero (New/Rising/Super/
  Legend, mỗi bậc kèm điều kiện + mô tả), 6 icon sưu tập (Revival/Touch of Light/Stay Gold/Flow
  to Horizon/Beyond the Boundary/Root Further), mục "Kudos Quốc Dân". Theme đo trực tiếp qua
  MoMorph `get_node` là **tối `#00070C`** (không phải kem như phần còn lại của dialog compose —
  khác biệt xác nhận qua đo thật, không phải lỗi).

### 2.4.1 Chèn liên kết (mms — Addlink Box)

- **FR-10b** (mới, 2026-07-07): Nút "Chèn liên kết" trong toolbar mở dialog kem 2 field ("Nội
  dung" + "URL") + Hủy/Lưu, thay cho `window.prompt()` cũ (MoMorph `OyDLDuSGEa`, done). URL bắt
  buộc — rỗng thì lỗi inline, không gọi `exec("createLink")`. "Nội dung" là optional/decorative
  (editor hiện tại chỉ hỗ trợ rẻ việc bọc link quanh selection có sẵn qua
  `document.execCommand("createLink")`, không hỗ trợ set text hiển thị tùy biến — không
  over-engineer editor cho field này).

### 2.5 Hashtag
- **FR-11**: Chip input, tối đa 5 (bắt buộc ít nhất 1, `*`). Nhập text + Enter (hoặc nút
  "+Hashtag") → thêm chip; tự thêm `#` nếu người dùng không nhập. Trùng hashtag (không
  phân biệt hoa/thường) bị bỏ qua. Mỗi chip có nút xoá (X).
- **FR-12**: Đã có 5 hashtag → ẩn/disable nút "+Hashtag" (nút hiển thị "Tối đa 5" theo
  thiết kế).
- **FR-13**: Không có hashtag nào mà bấm Gửi → lỗi inline, không submit.

### 2.6 Image
- **FR-14**: Input file thật (`accept="image/*"`, `multiple`), tối đa 5 ảnh. Mỗi ảnh
  hiển thị thumbnail preview (`URL.createObjectURL`) + nút xoá (X) tròn đỏ theo thiết kế.
- **FR-15**: Đã có 5 ảnh → ẩn/disable nút "+Image" ("Tối đa 5"). Không bắt buộc (không có
  `*` trong thiết kế).
- **FR-16**: Submit chỉ lưu `imageCount` (số lượng, 0–5) vào `KudosPost` mới — không lưu
  file/URL thật (không có storage/backend trong mock project này, đồng nhất với
  `KudosImageGallery` hiện tại của F006 chỉ render placeholder theo số lượng).

### 2.7 Gửi ẩn danh
- **FR-17**: Checkbox "Gửi lời cảm ơn và ghi nhận ẩn danh". Khi tick → hiện thêm field
  "Nickname ẩn danh" (input text, bắt buộc `*`, ví dụ thiết kế: "Doraemon"). Khi bỏ tick
  → field này ẩn và không bắt buộc.
- **FR-18**: Khi ẩn danh + submit hợp lệ → `sender` của `KudosPost` mới =
  `{ name: nickname, department: "", stars: 0 }` (thay cho `CURRENT_USER`) — không đổi
  field nào của `KudosPost`/`KudosCard`.
- **FR-19**: Tick ẩn danh nhưng để trống Nickname mà bấm Gửi → lỗi inline, không submit.

### 2.8 Hủy / Gửi
- **FR-20**: Nút "Hủy" → đóng dialog, huỷ toàn bộ draft ngay (không hỏi xác nhận).
- **FR-21**: Nút "Gửi" → validate toàn bộ field bắt buộc (FR-4, FR-9, FR-13, FR-19). Hợp
  lệ → tạo `KudosPost` mới (id mới, `timestamp` định dạng `HH:mm - MM/DD/YYYY` tại thời
  điểm submit, `hearts: 0`), prepend vào đầu danh sách "All Kudos" (session-scoped state
  — xem `clarifications.md`), đóng dialog, reset form, hiện toast thành công ngắn (mẫu
  giống `copy-link-button.tsx`, tự ẩn sau ~2s). Không hợp lệ → giữ dialog mở, hiện lỗi
  inline ở (các) field sai.

## 3. Yêu cầu phi chức năng
- **NFR-1**: i18n — namespace mới `kudos.compose.*` trong `lib/i18n/dictionaries/{vi,en}.ts`
  (song song `kudos.banner`/`kudos.composer` có sẵn của F006; không đổi key cũ). VI + EN
  đủ key như nhau (parity test hiện có).
- **NFR-2**: File <200 dòng, kebab-case, tách nhỏ theo field
  (`app/components/kudos/compose/*`), mỗi component 1 file test Vitest + RTL tương ứng
  (theo đúng quy ước F006).
- **NFR-3**: Không thêm dependency mới (rich-text/tag-input/combobox/upload) — tự build
  tối giản, tái dùng `hooks/use-dismissable-menu.ts` cho hành vi Escape/outside-click của
  dropdown Người nhận và của dialog.
- **NFR-4**: Không đổi hợp đồng `KudosPost`/`KudosPerson`/`KudosCard` hiện có của F006 —
  chỉ thêm 1 selector mới (`getDistinctRecipients`) + 1 field mock mới (`CURRENT_USER`)
  trong `lib/kudos/kudos-data.ts`, và 1 dòng tiêu đề "Danh hiệu" mới trong `KudosCard`
  (optional, chỉ render khi có giá trị — không phá vỡ các post cũ của F006 vốn không có
  danh hiệu).
- **NFR-5**: Không đổi/đụng tới toggle thả tim (`<span>` tĩnh) — vẫn ngoài phạm vi theo
  chỉ đạo của người giao việc.

## 4. Kiểm thử (Definition of Done)
- Mỗi component mới có test Vitest + RTL (dual-locale không bắt buộc ở cấp component —
  theo đúng style hiện có, labels truyền qua props literal).
- `getDistinctRecipients` có test đơn vị kiểu `kudos-selectors.test.ts` (không mutate
  input, an toàn với input rỗng, loại trừ `CURRENT_USER`).
- `npx vitest run`: 100% xanh. `npx tsc --noEmit` (qua `npm run build`): 0 lỗi.
  `npx eslint`: sạch trên toàn bộ file mới/sửa.
- Test case tham chiếu: không có test case MoMorph nào cho screen này (spec/test case
  rỗng trên MoMorph) — test coverage tự viết bám theo 21 FR ở §2, dùng
  `docs/features/f006-sun-kudos-live-board/feature.md`'s FR-4 (điểm nối) làm precondition.

## 5. Ghi chú triển khai (implementation notes)
- Kiến trúc: thêm 1 client wrapper mới `kudos-page-client.tsx` giữa `page.tsx` (server)
  và `KudosBanner`/`KudosBoard` — chủ sở hữu DUY NHẤT của state `posts` (seed từ
  `KUDOS_POSTS` prop) + state mở/đóng dialog compose (qua `useDismissableMenu({ haspopup:
  "dialog" })`, tái dùng NFR-3). `KudosBanner` nhận thêm prop `composerTriggerProps` (spread
  từ `compose.triggerProps`, không phải callback đơn giản) để pill "Ghi nhận" mở dialog;
  `KudosBoard` nhận `posts` từ wrapper thay vì trực tiếp từ `page.tsx`.
- MoMorph Parallel UI Hook (Track A/B song song) **không áp dụng theo cách mặc định** ở
  phiên này — xem lý do trong `clarifications.md` (không có backend surface tách biệt
  để chạy song song mà không đụng file).

## Unresolved Questions
- Không còn câu hỏi chặn. `imageCount`-only (không lưu file thật), `CURRENT_USER` mock,
  và stub "Tiêu chuẩn cộng đồng" là các quyết định mock-project hợp lý, đã ghi rõ lý do
  trong `clarifications.md` — một task tương lai có backend/storage thật sẽ thay thế.
- **[Superseded 2026-07-08] Backend pivot**: `plans/260708-1407-kudos-supabase-backend/` nối
  `createKudosAction` (`app/kudos/actions.ts`) ghi bài Kudos thật vào Supabase Postgres khi đã
  cấu hình — supersede claim "session-scoped — mất khi refresh, không có backend" ở §1 và FR-21
  (§2.8), và mục "backend/API lưu trữ thật" liệt kê ở "Ngoài phạm vi" (§1), nay ĐÃ có (không còn
  ngoài phạm vi). Riêng ảnh đính kèm (FR-16, §2.6) KHÔNG đổi — vẫn chỉ lưu `imageCount`, chưa có
  Storage thật (ngoài scope của plan pivot này). `CURRENT_USER` mock cũng được thay bằng
  `profiles` thật của user đăng nhập ở nhánh Supabase-configured. Chi tiết:
  `docs/system/architecture.md` § "Kudos — Lớp dữ liệu (Supabase Postgres)",
  `supabase/README.md`.
- **[Đảo ngược 2026-07-09] Dữ liệu trang trí Kudos → thật**: không đổi gì riêng cho form compose
  (F007) — ghi chú chung cho cụm Kudos, xem đầy đủ ở
  `docs/features/f006-sun-kudos-live-board/feature.md` § Unresolved Questions (bullet
  "[Đảo ngược 2026-07-09]"): sidebar thống kê, tổng Spotlight, top-10 quà nay đọc thật từ
  Postgres qua `lib/kudos/kudos-aggregates-repository.ts`; Secret Box nay cũng dùng rule thật
  dựa trên tim nhận được + `gift_logs`. `CURRENT_USER` mock (§2.7 trên) đã có ghi chú riêng ở bullet "Backend pivot" ngay
  trên. Full plan: `plans/260709-0822-supabase-dynamic-data-all-screens/`. Chi tiết:
  `docs/system/architecture.md` § "Content tables (awards / event / kudos gifts)".
