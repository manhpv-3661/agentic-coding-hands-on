---
feature: F006
name: Sun* Kudos — Live Board — SAA 2025
lang: vi
screen: Sun* Kudos - Live board
momorph:
  fileKey: 9ypp4enmFmdK3YAFJLIu6C
  screenId: MaZUn5xHXZ
status: active
notes: app/kudos/page.tsx replaces the F002 placeholder ("Nội dung chi tiết sẽ được cập nhật."); no proxy.ts change (route already gated, inherited from F001/F002). Implementation deviates from FR-18/FR-19 literal spec text in two documented spots (see §5) — resolved toward the reviewed design screenshot, not a bug.
---

# F006 — Màn hình Sun* Kudos (Live board)

## 1. Tổng quan

Nội dung THẬT cho route `/kudos` (đã bảo vệ bởi `proxy.ts` P01 + `requireUser()`, thừa hưởng
từ F001/F002 — không cần đổi `proxy.ts`). Route này trước đây là placeholder tối giản từ F002
("Nội dung chi tiết sẽ được cập nhật."). F006 build đầy đủ nội dung theo screen MoMorph
"Sun* Kudos - Live board" (screenId `MaZUn5xHXZ`, 64 spec item), gồm 6 tính năng chính do người
yêu cầu chốt phạm vi:

1. **Highlight Kudos** — carousel top 5 Kudos có nhiều lượt thả tim nhất.
2. **Spotlight Boards** — bảng hiển thị tên người nhận Kudos dạng word-cloud tĩnh.
3. **All Kudos** — danh sách Kudos gần đây (feed).
4. **Lọc Kudos** theo hashtag / phòng ban (áp dụng cho cả Highlight và All Kudos).
5. **Thống kê chung** — số Kudos nhận/gửi, số Secret Box đã mở/chưa mở.
6. **Top 10 Sunner nhận quà mới nhất**.

Bố cục: header/footer (tái dùng từ F002) → banner "Hệ thống ghi nhận và cảm ơn / KUDOS" (tĩnh) →
thanh input "Ghi nhận" (hiển thị, không mở dialog — xem `clarifications.md` trong plan) →
HIGHLIGHT KUDOS (carousel + filter) → SPOTLIGHT BOARD (word-cloud tĩnh) → ALL KUDOS (feed +
sidebar thống kê + top-10-nhận-quà) → footer.

**Ngoài phạm vi của phiên này** (đã chốt tại
`plans/260706-2200-sun-kudos-live-board/clarifications.md`, theo yêu cầu người giao việc và theo
mức độ ưu tiên "6 tính năng chính"): toggle thả tim (chỉ hiển thị icon + số tĩnh, không phải
`<button>`), dialog "Ghi nhận Kudos mới", dialog "Mở quà"/"Mở Secret Box" đầy đủ logic phần
thưởng, trang chi tiết Kudos (`/kudos/[id]`), trang profile Sunner (avatar/tên không điều hướng —
mirrors precedent "Profile" stub in `app/components/home/account-menu-button.tsx`). Các mục này
được hiển thị đúng thiết kế (không xoá khỏi UI) nhưng không có logic ghi/điều hướng thật ở phiên
này — một task riêng trong tương lai sẽ nối logic (đặc biệt là toggle thả tim).

## 2. Yêu cầu chức năng

### 2.1 Kiểm soát truy cập (Access Control)
- **FR-1**: Chưa đăng nhập truy cập `/kudos` → redirect `/login` (đã có từ F002, không đổi).
- **FR-2**: Đã đăng nhập truy cập `/kudos` → hiển thị đầy đủ nội dung (thay placeholder).

### 2.2 Banner + thanh ghi nhận (mms_A, mms_A.1)
- **FR-3**: Banner tĩnh: tiêu đề "Hệ thống ghi nhận và cảm ơn" + logo/wordmark "KUDOS". Readonly.
- **FR-4**: Thanh input dạng pill, icon bút bên trái, placeholder "Hôm nay, bạn muốn gửi lời cảm
  ơn và ghi nhận đến ai?". Hiển thị đúng thiết kế; click không mở dialog (ngoài phạm vi).

### 2.3 Highlight Kudos (mms_B, mms_B.1–B.5)
- **FR-5**: Header "Sun* Annual Awards 2025" (subtitle) + "HIGHLIGHT KUDOS" (title) + 2 dropdown
  filter ("Hashtag", "Phòng ban").
- **FR-6**: Carousel hiển thị top 5 Kudos có nhiều tim nhất (từ dữ liệu đã lọc, nếu có filter
  đang active). Mỗi card: avatar+tên+phòng ban+số hoa thị người gửi, mũi tên, avatar+tên+phòng
  ban+số hoa thị người nhận, thời gian, nội dung (tối đa 3 dòng, `line-clamp-3`), hashtag (tối đa
  5/dòng), số tim (icon + số, tĩnh), "Copy Link", "Xem chi tiết" (tĩnh, không điều hướng).
- **FR-7**: Điều hướng carousel bằng mũi tên trái/phải + pagination "N/5"; disable ở 2 đầu; slide
  active hiển thị nổi bật ở giữa, 2 bên mờ.
- **FR-8**: Danh sách rỗng (sau khi lọc không còn Kudos nào) → hiển thị "Hiện tại chưa có Kudos
  nào."

### 2.4 Spotlight Board (mms_B.6, mms_B.7)
- **FR-9**: Header "Sun* Annual Awards 2025" + "SPOTLIGHT BOARD".
- **FR-10**: Bảng tĩnh hiển thị tên người nhận Kudos rải trong khung (word-cloud tĩnh, CSS
  positioning — không dùng canvas/thư viện word-cloud), tiêu đề tổng số "`{total}` KUDOS", nút
  "Pan/Zoom" (toggle trạng thái hiển thị, không transform canvas thật), ô tìm kiếm "Tìm kiếm"
  lọc/làm nổi tên khớp theo chuỗi con (client-side).
- **FR-11**: Ô tìm kiếm tối đa 100 ký tự.

### 2.5 All Kudos (mms_C)
- **FR-12**: Header "Sun* Annual Awards 2025" + "ALL KUDOS".
- **FR-13**: Feed các thẻ Kudos (dùng chung dữ liệu đã lọc theo hashtag/phòng ban với Highlight):
  avatar+tên người gửi/nhận, icon "sent", thời gian (`HH:mm - MM/DD/YYYY`), nội dung (tối đa 5
  dòng), gallery ảnh đính kèm (placeholder, tối đa 5 ảnh), hashtag (tối đa 5/dòng, click 1 tag →
  set filter hashtag = tag đó), số tim (tĩnh) + "Copy Link" (thật: clipboard + toast).
- **FR-14**: Danh sách rỗng → "Hiện tại chưa có Kudos nào."

### 2.6 Lọc theo hashtag / phòng ban (mms_B.1.1, mms_B.1.2)
- **FR-15**: 2 dropdown độc lập; option list lấy từ tập giá trị duy nhất trong
  `lib/kudos/kudos-data.ts` (mock "database" — mock project không có backend/DB thật).
- **FR-16**: Chọn 1 filter → áp dụng đồng thời cho Highlight Kudos và All Kudos; carousel reset về
  slide 1.
- **FR-17**: Click 1 hashtag-tag trong card (All Kudos) → set filter Hashtag = tag đó (đồng bộ với
  FR-16).

### 2.7 Thống kê chung + Secret Box (mms_D.1)
- **FR-18**: Sidebar hiển thị số liệu tĩnh: số Kudos nhận được, số Kudos đã gửi, số Secret Box
  đã mở, số Secret Box chưa mở (mock data). **Đã build 5 dòng thay vì 4** — bản thiết kế
  (screenshot) có thêm dòng "số tim", giữ đúng thiết kế thay vì bản tóm tắt spec.
- **FR-19**: Nút mở dialog tĩnh tối giản (không có logic thưởng). **Label dùng đúng chữ trên
  thiết kế "Mở Secret Box"** thay vì "Mở quà" (bản tóm tắt spec) — cùng một hành động, chỉ khác
  chữ hiển thị; xem `dictionary.kudos.gift.openButton`.

### 2.8 Top 10 Sunner nhận quà mới nhất (mms_D.3)
- **FR-20**: Danh sách 10 dòng: avatar + tên + mô tả quà ngắn. Sidebar cuộn độc lập khi vượt
  chiều cao khung.
- **FR-21**: Danh sách rỗng → "Chưa có dữ liệu".

## 3. Yêu cầu phi chức năng
- **NFR-1**: i18n — mọi chuỗi hiển thị cho người dùng qua `lib/i18n/` (namespace `kudos`, mới,
  song song `homepage`/`awards`; không đổi `homepage.kudos` — vẫn dùng bởi teaser block). VI + EN
  có đủ key như nhau (parity test).
- **NFR-2**: File <200 dòng, kebab-case, tách theo pattern F004 (`app/components/kudos/*`).
- **NFR-3**: `page.tsx` là Server Component (`requireUser()` + locale/dictionary + build dữ liệu
  tĩnh); chỉ các phần cần state (carousel, filter, search Spotlight, dialog Mở Secret Box) là
  `"use client"`.
- **NFR-4**: Không thêm dependency carousel/word-cloud mới — hook riêng
  `hooks/use-carousel.ts`, theo phong cách `hooks/use-scroll-spy.ts`.

## 4. Kiểm thử (Definition of Done) — đã đạt
- 15 file component mới + 1 hook + 1 selectors module, mỗi file có test Vitest + RTL tương ứng
  (dual-locale `vi`/`en` theo quy ước có sẵn).
- Test case tham chiếu từ MoMorph (41 test case, screenId `MaZUn5xHXZ`) — các case liên quan tới
  toggle thả tim / dialog "Ghi nhận Kudos mới" / dialog "Mở Secret Box" đầy đủ logic / trang chi
  tiết Kudos / trang profile Sunner được đánh dấu **ngoài phạm vi phiên này** (xem §1) — không xoá
  khỏi backlog, một task riêng sẽ nối logic.
- `npx vitest run`: 330/330 test xanh (60 file). `npx tsc --noEmit`: 0 lỗi. `npx next build`:
  thành công. `npx eslint`: sạch trên toàn bộ file mới/sửa.
- Reviewer verdict: SEALED, score 9/10, 0 critical.

## 5. Ghi chú triển khai (implementation notes)
- Kiến trúc: `page.tsx` (server) → `KudosBanner` → `KudosBoard` (client, chủ sở hữu DUY NHẤT của
  filter state) nhận `spotlight`/`sidebar` dưới dạng slot props (server-rendered `ReactNode`) →
  `HighlightKudosCarousel` + `AllKudosFeed` (client con). Dữ liệu mock: `lib/kudos/{kudos-types,
  kudos-data,kudos-selectors}.ts`.
- 2 sai khác so với bản tóm tắt spec (FR-18, FR-19) đã chốt hướng theo ảnh chụp thiết kế thật —
  xem chi tiết ở §2.7 trên. Không phải lỗi, không cần sửa.

## Unresolved Questions
- Không còn câu hỏi chặn. Việc nối logic thật cho toggle thả tim / dialog Ghi nhận / dialog Mở
  Secret Box / trang chi tiết Kudos / trang profile Sunner được để lại cho các task tương lai
  (xem §1 "Ngoài phạm vi").
