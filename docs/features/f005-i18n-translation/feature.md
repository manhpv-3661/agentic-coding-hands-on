---
feature: F005
name: Đa ngôn ngữ — Dịch nội dung thật VI/EN
lang: vi
screen: "Đa ngôn ngữ (item 12, không có Figma screen riêng)"
momorph: null
status: active
notes: Thay thế stub cookie-only (NEXT_LOCALE được ghi nhưng không ai đọc) bằng dictionary tự viết
  (lib/i18n/**), dịch toàn bộ 4 màn đã build (F001-F004). Không đổi route/URL theo locale.
---

# F005 — Đa ngôn ngữ (i18n thật cho VI/EN)

## 1. Tổng quan

Item 12 trong task list ("Mục thay đổi ngôn ngữ hiển thị: Tiếng Việt, Tiếng Anh") — không phải
landing page riêng như F001-F004, mà là hạ tầng dịch nội dung thật, áp dụng lên TẤT CẢ màn đã
build: Login (F001), Homepage (F002), Countdown Prelaunch (F003), Awards Information (F004).

F001 đã chốt: "Dịch toàn bộ giao diện (i18n đầy đủ) được hoãn sang màn hình 12 (Đa ngôn ngữ
VI/EN)" — F005 là hạng mục đó, đã triển khai. F002/F003's "language selector chỉ toggle cookie,
không dịch nội dung" cũng được coi là **superseded** bởi F005 (không phải bị đảo ngược trái ý sản
phẩm — chính hai clarification đó đã ghi rõ đây là hoãn, không phải từ chối).

**Nguồn dữ liệu chuỗi dịch**: 4 báo cáo researcher đã catalog đầy đủ từng chuỗi VI→EN theo file:line,
key đề xuất, và bản dịch — đây là NGUỒN THẬT cho nội dung dictionary, spec này không lặp lại từng dòng:
- `plans/260706-2016-i18n-vi-en-translation/reports/researcher-260706-catalog-shell-login.md` (11 keys)
- `plans/260706-2016-i18n-vi-en-translation/reports/researcher-260706-catalog-homepage.md` (13 keys + 7 bonus)
- `plans/260706-2016-i18n-vi-en-translation/reports/researcher-260706-catalog-prelaunch.md` (2 keys + 2 bonus)
- `plans/260706-2016-i18n-vi-en-translation/reports/researcher-260706-catalog-awards.md` (17 keys)

## 2. Quyết định đã chốt (xem `plans/260706-2016-i18n-vi-en-translation/clarifications.md`)

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
  số lượng/giá trị giải thưởng ở F004, không build formatter chung (YAGNI, dữ liệu tĩnh ít).
- **Số lượng/giá trị giải thưởng** (F004): translation-as-data, dấu phẩy ngăn nghìn cho EN
  (`7,000,000 VND`), dấu chấm cho VI (`7.000.000 VNĐ`).
- **2 chuỗi trùng lặp (DRY)**: `login.error.oauthFailed` (page.tsx + login-button-container.tsx),
  `shared.footer.copyright` (login-footer.tsx + site-footer.tsx) — hợp nhất về 1 dictionary key,
  cả hai call site đọc từ dictionary, không giữ hardcode riêng.
- **Prelaunch meta description**: hiện chỉ có bản EN, chưa từng có bản VI — đưa vào dictionary,
  tự soạn bản VI hợp lý.

## 3. Kiến trúc đã triển khai

- `lib/i18n/locale.ts` — `LOCALES = ["vi", "en"]`, `type Locale`, `DEFAULT_LOCALE = "vi"`,
  `isLocale()` type guard (chặn giá trị cookie không hợp lệ trước khi tra dictionary).
- `lib/i18n/dictionaries/vi.ts` + `en.ts` — TS object literal lồng namespace theo màn (`shared`,
  `login`, `homepage`, `prelaunch`, `awards`). `lib/i18n/dictionary.ts` xuất `type Dictionary =
  typeof vi` — `en.ts` được compile-check khớp shape này (`satisfies Dictionary`), bắt thiếu key
  lúc `tsc --noEmit`, không phải runtime. `lib/i18n/dictionaries/parity.test.ts` kiểm thử type
  parity bổ sung.
- `lib/i18n/get-locale.ts` — `async function getLocale(): Promise<Locale>`, server-only (đọc
  cookie `NEXT_LOCALE` qua `await cookies()` — Next.js 16, cùng pattern `lib/supabase/server.ts`),
  validate qua `isLocale()`, mặc định `"vi"` nếu thiếu/sai.
- `lib/i18n/get-dictionary.ts` — `function getDictionary(locale: Locale): Dictionary`, pure/đồng
  bộ, không I/O (resolve locale là bước async duy nhất, đã tách riêng ở `get-locale.ts`).
- Mỗi Server Component page (`app/login/page.tsx`, `app/page.tsx`, `app/prelaunch/page.tsx`,
  `app/awards/page.tsx`) gọi `getLocale()` + `getDictionary()`, truyền phần dictionary liên quan
  xuống làm props cho component con — kể cả component con là Client Component, vì props string
  serializable được, không cần Client Component tự đọc cookie.

### Language selector — sửa bug + kích hoạt dịch thật
- `app/login/components/language-selector.tsx` (`LanguageSelector`): nhận `initialLocale: Locale`
  làm prop từ Server Component cha (đã đọc cookie) — seed state khởi tạo, sửa bug hiển thị sai
  locale sau reload (trước đây `useState<Locale>("vi")` cứng, không đọc cookie lúc mount).
- Khi chọn locale mới: `setLocaleCookie()` ghi cookie `NEXT_LOCALE` (client-side `document.cookie`)
  → `router.refresh()` (`useRouter` từ `next/navigation`) → Server Component cha re-fetch với
  cookie mới, dictionary mới chảy xuống toàn cây qua props — không full page reload.
- `site-header.tsx` / `site-footer.tsx` (Client Component) nhận dictionary strings liên quan làm
  props từ page, không tự đọc cookie/dictionary.
- Giới hạn đã biết (theo thiết kế): trigger giữ cờ VN cố định ở mọi locale — Figma chỉ export asset
  cờ Việt Nam (`MM_MEDIA_VN`), không có asset cờ EN để dùng.

## 4. Yêu cầu phi chức năng
- Không thêm dependency mới (next-intl, react-i18next) — dictionary tự viết.
- Type-safe: `en.ts` khớp shape `vi.ts` 100%, bắt lỗi ở compile-time.
- Không đổi route/URL theo locale (`/en/...`) — giữ nguyên cookie-only, khớp F001.
- Không đổi tên slug/category đã chốt (`lib/awards/award-categories.ts`), không đổi `proxy.ts`.

## 5. Kiểm thử (DoD như F001-F004)
- Unit: `getLocale()` (cookie hợp lệ/thiếu/sai giá trị → đúng fallback — `get-locale.test.ts`),
  `getDictionary()` (trả đúng object theo locale — `get-dictionary.test.ts`), dictionary type
  parity (`en.ts` khớp shape `vi.ts` — `dictionaries/parity.test.ts`), `LanguageSelector` nhận
  `initialLocale` đúng, gọi `router.refresh()` sau khi chọn (mock `next/navigation`).
- E2E (Playwright): chọn EN ở Login → nội dung Login đổi sang EN, cookie ghi đúng; điều hướng qua
  Homepage/Awards/Prelaunch (đã có cookie EN từ trước) → nội dung hiển thị EN ngay từ lần render
  đầu (server-side, không FOUC); chọn lại VI → toàn bộ đổi lại VI; refresh trang giữ nguyên locale
  đã chọn (test cho bug đã sửa ở `LanguageSelector`).

## 6. Unresolved Questions
(không còn — các điểm mơ hồ đã chốt ở mục 2, xem
`plans/260706-2016-i18n-vi-en-translation/clarifications.md`)
