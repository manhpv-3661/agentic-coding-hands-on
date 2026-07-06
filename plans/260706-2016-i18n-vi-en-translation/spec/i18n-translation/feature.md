---
feature: F005
name: Đa ngôn ngữ — Dịch nội dung thật VI/EN
lang: vi
screen: "Đa ngôn ngữ (item 12, không có Figma screen riêng)"
momorph: null
status: draft
---

# F005 — Đa ngôn ngữ (i18n thật cho VI/EN)

## 1. Tổng quan

Item 12 trong task list ("Mục thay đổi ngôn ngữ hiển thị: Tiếng Việt, Tiếng Anh") — không phải
landing page riêng như F001-F004, mà là hạ tầng dịch nội dung thật, áp dụng lên TẤT CẢ màn đã
build: Login (F001), Homepage (F002), Countdown Prelaunch (F003), Awards Information (F004).

F001 đã chốt: "Dịch toàn bộ giao diện (i18n đầy đủ) được hoãn sang màn hình 12 (Đa ngôn ngữ
VI/EN)" — F005 là hạng mục đó, giờ triển khai. F002/F003's "language selector chỉ toggle cookie,
không dịch nội dung" cũng được coi là **superseded** bởi F005 (không phải bị đảo ngược trái ý sản
phẩm — chính hai clarification đó đã ghi rõ đây là hoãn, không phải từ chối).

**Nguồn dữ liệu chuỗi dịch**: 4 báo cáo researcher đã catalog đầy đủ từng chuỗi VI→EN theo file:line,
key đề xuất, và bản dịch — đây là NGUỒN THẬT, spec này KHÔNG lặp lại từng dòng:
- `plans/260706-2016-i18n-vi-en-translation/reports/researcher-260706-catalog-shell-login.md` (11 keys)
- `plans/260706-2016-i18n-vi-en-translation/reports/researcher-260706-catalog-homepage.md` (13 keys + 7 bonus)
- `plans/260706-2016-i18n-vi-en-translation/reports/researcher-260706-catalog-prelaunch.md` (2 keys + 2 bonus)
- `plans/260706-2016-i18n-vi-en-translation/reports/researcher-260706-catalog-awards.md` (17 keys)

## 2. Quyết định đã chốt (xem `clarifications.md`)

- **Cơ chế**: dictionary tự viết (TS object literal, không thêm dependency next-intl/react-i18next).
- **Chuyển đổi**: `router.refresh()` sau khi ghi cookie `NEXT_LOCALE` (không full page reload).
- **Pull-quote Root Further**: EN chỉ hiện quote, bỏ phần ngoặc VI back-translation.
- **Nhãn đã là tiếng Anh** (nav "About SAA 2025"/"Award Information"/"Sun* Kudos", menu
  "Profile"/"Sign out"): đưa vào dictionary, dịch sang VI khi chọn VI. Trừ: tên thương hiệu
  (Sun*, SAA, Kudos) và tên hạng mục giải (Top Talent, MVP...) — giữ nguyên mọi locale. Eyebrow
  "Sun* annual awards 2025" (brand+year caption, xuất hiện ở cả Homepage awards-section VÀ Awards
  page title section) cũng giữ nguyên mọi locale — cùng nhóm với brand/proper noun.
- **Nhãn đếm ngược** DAYS/HOURS/MINUTES (Homepage + Prelaunch): dịch sang NGÀY/GIỜ/PHÚT khi VI.
- **3 mô tả giải trùng nhau** (chưa hoàn thiện, Figma gốc): dịch ngay theo đúng y VI hiện có, bản
  EN cũng dùng chung 1 bản dịch (mirror cấu trúc trùng lặp) — không chờ content thật, không tự
  chế nội dung riêng cho từng hạng mục.
- **Ngày/giờ sự kiện** (`26/12/2025`, `tháng 11/2025` trong đoạn Kudos): translation-as-data
  (chuỗi đã format sẵn theo từng locale, VD EN: "December 26, 2025") — nhất quán với cách xử lý
  số lượng/giá trị giải thưởng ở F004, KHÔNG build formatter chung (YAGNI, dữ liệu tĩnh ít).
- **Số lượng/giá trị giải thưởng** (F004): translation-as-data, dấu phẩy ngăn nghìn cho EN
  (`7,000,000 VND`), dấu chấm cho VI (`7.000.000 VNĐ`) — theo đề xuất researcher.
- **2 chuỗi trùng lặp (DRY)**: `login.error.oauthFailed` (page.tsx + login-button-container.tsx),
  `shared.footer.copyright` (login-footer.tsx + site-footer.tsx) — hợp nhất về 1 dictionary key,
  cả hai call site đọc từ dictionary, không giữ hardcode riêng.
- **Prelaunch meta description**: hiện chỉ có bản EN, chưa từng có bản VI — đưa vào dictionary,
  tự soạn bản VI hợp lý (theo đề xuất researcher).

## 3. Yêu cầu chức năng

### 3.1 Hạ tầng dictionary
- **FR-1**: `lib/i18n/dictionaries/vi.ts` + `en.ts` — TS object literal lồng namespace theo màn
  (`shared`, `login`, `homepage`, `prelaunch`, `awards`), strongly-typed (kiểu `en.ts` phải khớp
  100% shape với `vi.ts` — dùng `satisfies Dictionary` hoặc tương đương để bắt thiếu key lúc compile).
- **FR-2**: `lib/i18n/get-locale.ts` — hàm server-only `async function getLocale(): Promise<Locale>`,
  đọc cookie `NEXT_LOCALE` qua `await cookies()` (Next.js 16 — `cookies()` luôn async, xem
  `lib/supabase/server.ts` làm mẫu), validate giá trị là `"vi"|"en"`, mặc định `"vi"` nếu thiếu/sai.
- **FR-3**: `lib/i18n/get-dictionary.ts` — `function getDictionary(locale: Locale): Dictionary`
  trả object tương ứng.
- **FR-4**: Mỗi `page.tsx` (Server Component: login, `/`, `/prelaunch`, `/awards`) gọi
  `getLocale()` + `getDictionary()`, truyền phần dictionary liên quan xuống làm props cho
  component con — kể cả component con là Client Component (`"use client"`) vì props string là
  serializable, không cần Client Component tự đọc cookie.

### 3.2 Language selector — sửa bug + kích hoạt dịch thật
- **FR-5**: `LanguageSelector` (hiện tại: `useState<Locale>("vi")` không đọc cookie lúc mount —
  bug, luôn hiển thị VN dù cookie đã là `en`) → nhận `initialLocale: Locale` làm prop từ Server
  Component cha (đã đọc cookie), dùng làm state khởi tạo. Sửa bug hiển thị sai locale sau reload.
- **FR-6**: Khi chọn locale mới: ghi cookie `NEXT_LOCALE` (như hiện tại) → gọi
  `router.refresh()` (Next.js `useRouter` từ `next/navigation`) để Server Component cha re-fetch
  với cookie mới, props mới (dictionary mới) chảy xuống toàn cây — không full reload trang.
- **FR-7**: `site-header.tsx`/`site-footer.tsx` (Client Component) nhận dictionary strings liên
  quan làm props từ `page.tsx`, KHÔNG tự đọc cookie/dictionary.

### 3.3 Dịch nội dung theo màn (chi tiết đầy đủ trong 4 báo cáo researcher, mục 1)
- **FR-8 (Login, F001)**: 11 key theo `researcher-260706-catalog-shell-login.md` — bao gồm gộp
  2 cặp trùng lặp (`login.error.oauthFailed`, `shared.footer.copyright`) + 8 nhãn tiếng Anh cần
  bản VI (nav, Profile/Sign out — theo quyết định mục 2).
- **FR-9 (Homepage, F002)**: 13 key + 7 key bonus theo `researcher-260706-catalog-homepage.md` —
  bao gồm 2 đoạn văn dài Root Further, pull-quote (theo quyết định mục 2), nhãn đếm ngược, mô tả
  6 award card (3 dùng chung 1 bản dịch theo quyết định mục 2), ngày/địa điểm sự kiện
  (translation-as-data).
- **FR-10 (Prelaunch, F003)**: 2 key + 2 key bonus theo `researcher-260706-catalog-prelaunch.md`
  — tiêu đề đếm ngược, meta title/description, nhãn đếm ngược (dùng chung namespace với Homepage
  nếu trùng nội dung, hoặc riêng nếu component tách biệt — planner quyết định khi thấy code).
- **FR-11 (Awards, F004)**: 17 key theo `researcher-260706-catalog-awards.md` — tiêu đề section,
  nhãn "Số lượng/Giá trị giải thưởng", 2 bản mô tả dài (5 hạng mục dùng chung + Signature 2025
  riêng, theo quyết định mục 2), 10 giá trị số lượng/tiền (translation-as-data).
- **FR-12**: Nav/footer labels tiếng Anh cần bản VI (site-header, site-footer, account-menu-button)
  — dùng chung 1 namespace `shared.*` vì các component này được TẤT CẢ 3 màn protected route dùng
  lại (Homepage, Awards, Kudos placeholder).

## 4. Yêu cầu phi chức năng
- Không thêm dependency mới (next-intl, react-i18next) — dictionary tự viết theo quyết định.
- Type-safe: `en.ts` phải khớp shape `vi.ts` 100%, bắt lỗi ở compile-time, không phải runtime.
- Không đổi route/URL theo locale (`/en/...`) — giữ nguyên cookie-only, khớp F001.
- Files < 200 dòng, kebab-case.
- Không đổi tên slug/category đã chốt (`lib/awards/award-categories.ts`), không đổi `proxy.ts`.

## 5. Kiểm thử (DoD như F001-F004)
- Unit: `getLocale()` (cookie hợp lệ/thiếu/sai giá trị → đúng fallback), `getDictionary()` (trả
  đúng object theo locale), dictionary type parity (`en.ts` khớp shape `vi.ts` — test compile-time
  hoặc runtime key-set so sánh), `LanguageSelector` nhận `initialLocale` đúng, gọi `router.refresh()`
  sau khi chọn (mock `next/navigation`).
- E2E (Playwright): chọn EN ở Login → nội dung Login đổi sang EN, cookie ghi đúng; điều hướng qua
  Homepage/Awards/Prelaunch (đã có cookie EN từ trước) → nội dung hiển thị EN ngay từ lần render
  đầu (server-side, không FOUC); chọn lại VI → toàn bộ đổi lại VI; refresh trang giữ nguyên locale
  đã chọn (test cho bug FR-5 đã sửa).

## 6. Unresolved Questions
(không còn — các điểm mơ hồ đã chốt ở mục 2, xem `clarifications.md`)
