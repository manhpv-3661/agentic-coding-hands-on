---
feature: F004
name: Hệ thống giải thưởng (Awards Information) — SAA 2025
lang: vi
screen: Hệ thống giải
momorph:
  fileKey: 9ypp4enmFmdK3YAFJLIu6C
  screenId: zFYDgyj_pD
status: active
notes: app/awards/page.tsx replaces the F002 placeholder (previously a minimal empty <section id={slug}> per category); no proxy.ts or auth-model change.
---

# F004 — Màn hình Hệ thống giải thưởng (Awards Information)

## 1. Tổng quan

Nội dung THẬT cho route `/awards` (đã bảo vệ bởi proxy.ts P01 + `requireUser()`, thừa hưởng từ F001/F002).
Route này trước đây là placeholder tối giản từ F002 (mỗi hạng mục chỉ có `<section id={slug}>` rỗng) — F004
build đầy đủ nội dung theo screen MoMorph "Hệ thống giải" (screenId `zFYDgyj_pD`, 22 spec item).

Bố cục: header/footer (tái dùng nguyên từ F002) → hero keyvisual mini (ảnh nền + "ROOT FURTHER" +
"Sun* Annual Award 2025") → tiêu đề section → khối chính gồm menu điều hướng dọc bên trái (scroll-spy)
+ 6 award card chi tiết (D.1–D.6) → khối quảng bá Sun* Kudos (tái dùng nguyên `SunKudosSection` từ F002,
đặt độc lập cuối trang trước footer).

## 2. Yêu cầu chức năng

### 2.1 Kiểm soát truy cập (Access Control)
- **FR-1**: Chưa đăng nhập truy cập `/awards` → redirect `/login` (đã có từ F002, không đổi).
- **FR-2**: Đã đăng nhập truy cập `/awards` → hiển thị đầy đủ nội dung (thay placeholder).
- **FR-3**: Điều hướng tới `/awards` từ header/footer/homepage award-grid/hero CTA đều dùng route + 6
  slug hash-anchor đã chốt ở F002 (`top-talent`, `top-project`, `top-project-leader`, `best-manager`,
  `signature-2025-creator`, `mvp`) — không đổi tên slug.

### 2.2 Hero keyvisual (mms_3_Keyvisual + KV)
- **FR-4**: Banner nền full-width (ảnh `Keyvisual-BG.png`, cover, center-crop) + logo "ROOT FURTHER"
  (`Root-Further-Logo.png`) + subtitle "Sun* Annual Award 2025". Tĩnh, không tương tác, alt text
  "Keyvisual Sun* Annual Award 2025".
- Khác hero Homepage (B1–B3): KHÔNG có đồng hồ đếm ngược, CTA, hay event info — chỉ ảnh + title + subtitle.

### 2.3 Tiêu đề section (A — mms_A_Title hệ thống giải thưởng)
- **FR-5**: Caption nhỏ, màu nhạt: "Sun* annual awards 2025". Heading lớn, màu vàng:
  "Hệ thống giải thưởng SAA 2025". Tĩnh, không tương tác.

### 2.4 Menu điều hướng dọc (C — mms_C_Menu list)
- **FR-6**: 6 mục theo đúng thứ tự: Top Talent, Top Project, Top Project Leader, Best Manager,
  Signature 2025 - Creator, MVP. Mỗi mục có leading icon (Target).
- **FR-7**: Click mục → smooth scroll tới award card D.n tương ứng.
- **FR-8**: **Scroll-spy bằng IntersectionObserver thật**: active item tự động đổi theo section đang
  hiển thị trong viewport khi user scroll tay (không cần click) — decision Session 2026-07-06.
  Active state: chữ vàng (`#FFEA9E`) + underline. Chỉ 1 mục active tại một thời điểm; mục trước mất
  active khi mục mới active.
- **FR-9**: Hover mục (chưa active) → highlight nhẹ.
- **FR-10**: Section ID không hợp lệ (nếu có, qua thao tác bất thường) → không throw lỗi JS, giữ
  nguyên vị trí trang.

### 2.5 Award card chi tiết (D.1–D.6)
- **FR-11**: 6 card, đọc-only, mỗi card gồm: ảnh Picture-Award (336×336px, trái) + content (phải):
  icon Target + title; mô tả đầy đủ (không cắt ngắn — khác card lưới Homepage FR-20 có ellipsis);
  icon Diamond + "Số lượng giải thưởng: {value}"; icon License + "Giá trị giải thưởng: {value}".
- **FR-12**: Nội dung từng card (nguồn: MoMorph spec, description KHÔNG rút gọn):
  | Slug | Title | Số lượng | Giá trị |
  |---|---|---|---|
  | top-talent | Top Talent | 10 Đơn vị | 7.000.000 VNĐ cho mỗi giải thưởng |
  | top-project | Top Project | 02 Tập thể | 15.000.000 VNĐ mỗi giải |
  | top-project-leader | Top Project Leader | 03 Cá nhân | 7.000.000 VNĐ |
  | best-manager | Best Manager | 01 Cá nhân | 10.000.000 VNĐ |
  | signature-2025-creator | Signature 2025 - Creator | 01 (cá nhân hoặc tập thể) | 5.000.000 VNĐ (cá nhân) HOẶC 8.000.000 VNĐ (tập thể) |
  | mvp | MVP (Most Valuable Person) | 01 | 15.000.000 VNĐ |
  Copy mô tả dài lấy verbatim từ node tree MoMorph (`get_frame_node_tree`, screenId `zFYDgyj_pD`).
  Không tự chế nội dung.

  **Mô tả dài verbatim (Top Talent / Top Project / Top Project Leader / Best Manager / MVP dùng
  ĐÚNG CÙNG một đoạn — thiết kế Figma chưa hoàn thiện copy riêng cho từng hạng mục, tương tự tiền lệ
  Homepage `award-card.tsx` "descriptions... identical in the source design... reproduced as-is"):**

  > Giải thưởng Top Talent vinh danh những cá nhân xuất sắc toàn diện – những người không ngừng
  > khẳng định năng lực chuyên môn vững vàng, hiệu suất công việc vượt trội, luôn mang lại giá trị
  > vượt kỳ vọng, được đánh giá cao bởi khách hàng và đồng đội. Với tinh thần sẵn sàng nhận mọi
  > nhiệm vụ tổ chức giao phó, họ luôn là nguồn cảm hứng, thúc đẩy động lực và tạo ảnh hưởng tích
  > cực đến cả tập thể.

  **Signature 2025 - Creator có mô tả riêng biệt (verbatim):**

  > Giải thưởng Signature vinh danh cá nhân hoặc tập thể thể hiện tinh thần đặc trưng mà Sun*
  > hướng tới trong từng thời kỳ. Trong năm 2025, giải thưởng Signature vinh danh Creator - cá
  > nhân/tập thể mang tư duy chủ động và nhạy bén, luôn nhìn thấy cơ hội trong thách thức và tiên
  > phong trong hành động. Họ là những người nhạy bén với vấn đề, nhanh chóng nhận diện và đưa ra
  > những giải pháp thực tiễn, mang lại giá trị rõ rệt cho dự án, khách hàng hoặc tổ chức. Với tư
  > duy kiến tạo và tinh thần "Creator" đặc trưng của Sun*, họ không chỉ phản ứng tích cực trước sự
  > thay đổi mà còn chủ động tạo ra cải tiến, góp phần định hình chuẩn mực mới cho cách mà người
  > Sun* tạo giá trị.
- **FR-13**: Ảnh Picture-Award: **6 thumbnail riêng biệt** (`public/awards-saa/thumbnails/{slug}.png`,
  crop từ full-frame render MoMorph, mỗi giải một ảnh khác nhau) — decision ban đầu Session 2026-07-06
  (dùng chung `Award-BG.png`) đã bị đảo ngược ở lần pixel-conformance sau đó (commit `4e4bea1`) vì so
  khớp lại với ground truth Figma cho thấy mỗi card có ảnh riêng, không phải nền chung + overlay tên.
- **FR-14**: `id={slug}` trên mỗi card khớp 6 slug đã chốt F002, để hash-anchor từ Homepage
  (`/awards#<slug>`) scroll đúng vị trí.

### 2.6 Khối quảng bá Sun* Kudos (D1/D2 — mms_D1_Sunkudos)
- **FR-15**: Tái dùng nguyên component `SunKudosSection` từ F002 (không sửa nội dung/layout nội bộ),
  đặt như section độc lập ở cuối trang (sau lưới award, trước footer) — decision Session 2026-07-06.
  CTA "Chi tiết" → `/kudos` (giữ nguyên hành vi F002).

### 2.7 Header/Footer
- **FR-16**: `app/awards/page.tsx` PHẢI tự render `SiteHeader`/`SiteFooter` (giống `app/page.tsx`) —
  layout gốc (`app/layout.tsx`) chỉ render html/body, không tự cấp header/footer. Placeholder cũ
  thiếu điều này; đây là 1 phần đã bổ sung của F004, không phải regression.

## 3. Yêu cầu phi chức năng
- Pixel-perfect theo Figma (MoMorph `zFYDgyj_pD`); fonts Montserrat (tái sử dụng pattern F002).
- Assets mới cho màn này (không có ở Homepage): icon Target/Diamond/License — SVG tải qua MoMorph
  media API, lưu tại `public/awards-saa/`.
- Responsive: menu bên trái + card chi tiết chuyển sang layout dọc (stack) trên tablet/mobile — Figma
  chỉ có frame desktop, áp dụng pattern breakpoint đã dùng ở F002 (Awards grid Homepage).
- Accessibility: alt text ảnh, focus-visible cho menu item, `aria-current` cho item active.
- Files < 200 lines, kebab-case, tái sử dụng component/hook có sẵn khi hợp lý (site-header,
  site-footer, `SunKudosSection`, `AWARD_CATEGORIES`).

## 4. Kiểm thử (DoD như F001/F002/F003)
- Unit (Vitest + Testing Library): scroll-spy hook (IntersectionObserver mock — active state đổi
  đúng theo entry visible, chỉ 1 active tại 1 thời điểm), click-to-scroll, render 6 award card đúng
  nội dung, guard/redirect (đã có, chỉ verify không regress).
- E2E (Playwright): truy cập `/awards` (auth/unauth), click từng menu item → active + scroll đúng
  section, hash-anchor từ Homepage (`/awards#<slug>`) trỏ đúng card, click "Chi tiết" Sun* Kudos → `/kudos`.
- Nguồn test case: 15 TC MoMorph (screenId `zFYDgyj_pD`) — trừ ID-0/1/2 dùng route cũ `/he-thong-giai`
  trong bước test (outdated, không phải route thật của hệ thống — áp route `/awards` thật theo tiền lệ
  F002 TC ID-0 clarification), tinh thần test (access control authenticated/unauthenticated/via nav)
  vẫn giữ nguyên.

## 5. Unresolved Questions
(none — 3 điểm mơ hồ đã được làm rõ, xem `../../../plans/260706-1746-awards-saa-page/clarifications.md`;
mô tả dài D.1–D.6 đã bổ sung verbatim ở mục 2.5 sau khi planner phát hiện thiếu ở lần soạn spec đầu)

- **[Superseded 2026-07-09] Supabase dynamic data**: FR-12 (bảng số lượng/giá trị giải thưởng)
  nay đọc từ bảng `award_categories` (Postgres) qua `getAwardCategories()`
  (`lib/awards/award-categories-repository.ts`) — cùng repo với lưới giải thưởng Homepage (F002),
  không còn 3 nguồn trùng lặp (`award-categories.ts`, `award-detail-data.ts`,
  `awards-section.tsx`, từng lệch tên hạng mục MVP ngắn/dài). Số VNĐ nay là `integer` trong DB,
  format qua `Intl.NumberFormat` (`formatVnd`, `lib/awards/format-prize-amount.ts`) tại thời điểm
  render — không còn chuỗi tiền tệ viết tay. Title/description/unit-caption ở §2.5 vẫn nguồn từ
  dict, join bằng `slug` (`app/components/awards/award-detail-data.ts`) — không đổi. Full plan:
  `plans/260709-0822-supabase-dynamic-data-all-screens/phase-02-awards-data-layer.md`. Chi tiết:
  `docs/system/architecture.md` § "Content tables (awards / event / kudos gifts)",
  `docs/project-changelog.md` 2026-07-09.
