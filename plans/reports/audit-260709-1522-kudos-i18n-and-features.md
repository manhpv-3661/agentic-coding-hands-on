# Audit: i18n gaps + Sun* Kudos 6 tính năng

Ngày: 260709-1522. Phạm vi: `app/components/kudos/**`, `app/components/awards/**`, `app/components/home/**`, `app/kudos`, `app/awards`, `app/page.tsx`.

## Vấn đề 1 — i18n hardcode

Đa số component đã dùng dictionary (`lib/i18n/dictionaries/{en,vi}.ts`) đúng chuẩn. Gap thật (không phải exception đã chốt trong `clarifications.md`):

| File | Chuỗi cứng | Verdict |
|---|---|---|
| `app/components/kudos/kudos-section-heading.tsx` (dùng ở `kudos-board.tsx:96`, `highlight-kudos-carousel.tsx:67`, `spotlight-board.tsx:52`) | `title="ALL KUDOS"` / `"HIGHLIGHT KUDOS"` / `"SPOTLIGHT BOARD"` | **Gap thật.** Comment trong file tự nhận là "exception" nhưng clarifications.md chỉ cho phép brand name, tên hạng mục giải, và đúng câu "Sun* Annual Awards 2025" — không cho phép heading tiếng Anh này. Cần thêm key dictionary và dịch VI. |
| `highlight-kudos-carousel.tsx:68-70` | `<h2>HIGHLIGHT KUDOS</h2>` render trùng lặp lần 2 cạnh `KudosSectionHeading` | **Bug UI** (hiện tiêu đề 2 lần) + gap i18n |
| `highlight-kudos-carousel.tsx:101,117,132,144` | `aria-label="Previous slide"/"Next slide"/"Previous"/"Next"` | Gap (điều khiển carousel, ảnh hưởng a11y) |
| `awards-nav-menu.tsx:58` | `aria-label="Award categories"` | Gap |
| `home/notification-bell.tsx:67,76` | `aria-label="Notifications"` ×2 | Gap |
| `home/account-menu-button.tsx:56,65` | `aria-label="Account menu"`, `"Account"` | Gap |
| `home/widget-button.tsx:153,178` | `aria-label="Quick actions"` ×2 | Gap |
| `compose/mention-suggestions.tsx:48` | `aria-label="mention-suggestions"` | Gap nhỏ |
| `site-header.tsx:61`, `site-footer.tsx:94` | `aria-label="Sun* Annual Awards 2025 — home"` | Nửa exception — phần "— home" là mô tả chức năng, không phải brand text, cần tách ra dictionary |

Đã xác nhận **đúng là exception** (giữ nguyên, không sửa): brand/logo alt text, "Sun* Kudos"/"Sun* annual awards 2025" caption, `<title>`/`metadata.title` (marketing copy tiếng Anh theo comment trong `page.tsx`) — nhưng có điểm **không nhất quán**: `metadata.description` cùng trang lại lấy từ dictionary còn `metadata.title` thì không — nên xem lại chủ đích này có còn đúng không.

Không có case "key đã có sẵn nhưng chưa wire" — mọi key hiện có trong `en.ts`/`vi.ts` đều đang được dùng.

## Vấn đề 3 — 6 tính năng Kudos

### Spotlight Boards — REGRESSION đang dở tay (uncommitted)
- Ảnh nền thật `public/kudos/spotlight/spotlight.jpg` (504KB, file mới, chưa track) đã được thêm — đúng hướng bạn muốn (dùng ảnh design thật thay vì reconstruct CSS).
- Nhưng `app/components/kudos/spotlight-board.tsx` đang bị xóa sạch toàn bộ lớp overlay DOM: ô search, counter `{total} KUDOS`, `SpotlightNameCloud`, `SpotlightTicker`, nút pan/zoom — và file `spotlight-collage-backdrop.tsx` bị xóa luôn. Hiện tại chỉ còn 1 `<div>` với `bg-[url(...)]` trống, tức lùi lại đúng lỗi "bake text vào ảnh" mà commit `b7a363c` đã sửa trước đó.
- Không có tính năng zoom/lightbox thật (click-to-enlarge) — chỉ có nút pan/zoom trang trí (scale-105/scale-100 lên name-cloud), không phải phóng to ảnh thật.
- **Cần làm:** wire lại toàn bộ overlay DOM (search input, counter, name-cloud, ticker, pan/zoom button) lên trên `spotlight.jpg` mới — không phục hồi `spotlight-collage-backdrop.tsx` (ảnh thật thay thế CSS reconstruction), và cân nhắc bổ sung lightbox thật nếu design yêu cầu.

### Filter hashtag/phòng ban — DATA đã thật, chỉ lỗi màu chữ
- Options filter lấy từ `getDistinctHashtags/getDistinctDepartments` (`lib/kudos/kudos-selectors.ts:34-44`) tính trên `posts` thật từ Supabase (`lib/kudos/kudos-repository.ts:38-54`) — **không hardcode**, tự động cập nhật khi có kudos mới.
- Bug màu chữ: `app/components/kudos/kudos-filters.tsx:55` — `PILL_SELECT_CLASSNAME` có `text-white` trên nền `bg-[rgba(255,234,158,0.10)]` (gần trắng) → chữ trắng trên trắng, không thấy. Không có `hover:text-*`. Icon chevron dòng 33 cũng `text-white`, cùng lỗi.
- **Fix:** đổi `text-white` → màu tối (ví dụ `text-[#00101A]` đã dùng ở nơi khác trong codebase) ở dòng 55 và 33, thêm `hover:text-*`.

### 4 tính năng còn lại
- **Highlight Kudos (top 5 theo tim):** OK — `getTopKudosByHearts` sort đúng, data Supabase thật.
- **Danh sách Kudos gần đây:** OK — cùng nguồn `getKudosPosts()`, order theo `created_at desc`, không mock.
- **Thống kê chung:** Chỉ đúng 1 nửa — `kudos-stats-box.tsx` hiện là **thống kê của user đang đăng nhập** (received/sent/hearts/secret box), không phải thống kê toàn hệ thống như spec mô tả ("Thống kê chung"). `secretBoxOpened/Unopened` là công thức suy ra ("5 tim = 1 hộp"), chưa có bảng dữ liệu thật — đã ghi nhận là unresolved trong `plans/260709-0822-supabase-dynamic-data-all-screens/phase-03-kudos-aggregates-real.md`. Khi lỗi query, code trả về stats = 0 thay vì fallback mock, không khớp comment "always fallback" trong file.
- **Top 10 sunners nhận quà mới nhất:** Component thật ra là "10 lượt mở quà gần nhất" (`getGiftRecipients`, order by `created_at desc limit 10`), **không phải leaderboard theo tổng số kudos nhận được**. Nếu spec ý là bảng xếp hạng theo số kudos nhận nhiều nhất thì tính năng đó **chưa tồn tại** — không có query group-by-receiver-count nào trong codebase.

## Hashtag input trong compose dialog
`app/components/kudos/compose/hashtag-input.tsx` là input tự do (free text), chip + nút xóa + giới hạn "Tối đa 5" (`KUDOS_HASHTAGS_MAX_COUNT`) — **đúng những phần đó**. Nhưng **không có** dropdown chọn từ danh sách có sẵn với checkmark, và **không có** "Hashtag group" preset như trong design. Không có danh sách hashtag catalog nào (hardcode hay Supabase) — người dùng gõ tự do. Nếu muốn khớp design (trigger → dropdown checklist → chips, + preset group) thì đây là phần cần xây thêm, không phải chỉnh sửa nhỏ.

## Câu hỏi chưa giải quyết
1. Metadata `<title>` giữ tiếng Anh cứng nhưng `description` lại dịch — có chủ đích giữ inconsistency này không?
2. "Thống kê chung" — spec có thật cần site-wide stats hay per-user stats là đủ (theo scope hiện tại của phase-03)?
3. "Top 10 sunners" — xác nhận lại đây là "leaderboard theo tổng kudos nhận" (feature mới, chưa có) hay "10 lượt mở quà gần nhất" (đã có) là đúng ý spec?
4. Hashtag group preset trong design — có cần implement thật hay bỏ qua (giữ free-text hiện tại)?
