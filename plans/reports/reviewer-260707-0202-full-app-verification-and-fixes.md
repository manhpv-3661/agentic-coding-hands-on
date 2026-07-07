# Full-app verification & fix session — 260707 (overnight, auto)

Scope: toàn bộ màn (Homepage, Login, Awards, Kudos board/compose/like, prelaunch gate),
UI/UX + logic flow + pixel-conformance với MoMorph. Chạy sau khi 2 session F008 song song
kết thúc (reconciled: plan 0010 session-state ship, plan 0008 SUPERSEDED).

## Gates (final)
- `npx tsc --noEmit`: 0 errors
- `npx eslint app lib hooks tests`: 0 errors (4 warnings `no-img-element` — `<img>` chủ ý
  cho icon tĩnh, không đổi sang next/image để giữ render pixel)
- `npx vitest run`: 456/456 pass (start-of-session: 426) — +30 regression tests mới
- Responsive 375px: không tràn ngang cả 3 màn; console browser: 0 errors mọi màn

## Bugs found & fixed (verified in browser sau fix)
| # | Severity | Bug | Fix |
|---|----------|-----|-----|
| 1 | High | React key warning `/kudos` (KudosBoard slot) | `key` cho SpotlightBoard slot (page.tsx) |
| 2 | High | Header nav hardcode `selected` trên "/" — mọi trang highlight "Về SAA 2025" | `usePathname()` trong site-header; test theo route |
| 3 | High | Footer nav hardcode `highlighted` trên "/awards" | `usePathname()` trong site-footer (đồng bộ header) |
| 4 | High | `<html lang="vi">` hardcode dù F005 có EN switch | `lang={await getLocale()}` |
| 5 | High (C1) | Compose không có double-submit guard + id `Date.now()` đụng nhau | `isSubmittingRef` + monotonic counter id; regression test 2-rapid-submit → 1 post |
| 6 | High (C2) | Post ẩn danh: tác giả like được bài mình (vi phạm own-post rule) | `sentByCurrentUser`/`anonymous` flags từ buildKudosPost; `canLikeKudos` check author-first |
| 7 | Med (M5) | Nickname ẩn danh trùng tên người thật → block like sai người | Cùng fix #6 (anonymous bỏ name-compare khi không phải tác giả) |
| 8 | Med (M2) | `window.prompt("URL")` hardcode (prop `linkPrompt` có sẵn nhưng không dùng) | Wire `labels.linkPrompt` |
| 9 | Med (M4) | "Link copied" hiện cả khi clipboard fail | Chỉ set copied khi write thành công |
| 10 | Med | Awards left-nav không có active state (design: gold+glow) | `useScrollSpy` + default item đầu |
| 11 | Med | Awards cards không xen kẽ ảnh trái/phải như design | Prop `imageSide`, even=left/odd=right |
| 12 | Low | 40 lỗi eslint `no-explicit-any` + prefer-const trong test files cũ | Typed casts `as unknown as ReturnType<…>` |

## Pixel-conformance vs MoMorph (fileKey 9ypp4enmFmdK3YAFJLIu6C)
Ground-truth trích từ MCP node styles (3 report researcher-260707-0110-momorph-*-design-specs.md).

### Kudos `MaZUn5xHXZ` — LỆCH LỚN, đã restyle toàn bộ
Theme card tối `#101317` là tự chế, design là card kem. Đã đổi:
- Card kem `#FFF8E1` (highlight: border 4px `#FFEA9E` r16; feed: r24), chữ `#00101A`,
  timestamp `#999999`, content-box vàng `rgba(255,234,158,.4)` border `#FFEA9E` r12
- Hashtag đỏ `#D4271D` chữ trơn (bỏ pill vàng); tim xám→đỏ `#D4271D` khi liked
- Avatar 64px viền trắng; badge "danh hiệu" pills (Rising/Legend/New Hero); pencil icon;
  divider `#FFEA9E`; gallery tile 88×88 khung trắng
- Hero: thêm search pill "Tìm kiếm profile Sunner" (thiếu hẳn); pill r68 border `#998C5F`
- Spotlight board r47 + ticker 6 dòng mờ dần (thiếu hẳn)
- Sidebar `#00070C` border `#998C5F` r17, số liệu `#FFEA9E` 32/40, badge "x2",
  nút Secret Box vàng r8 + icon
- Behavior giữ nguyên 100%: aria-pressed, Thả tim/Bỏ thả tim, disabled own-post,
  hearts+liked math, carousel order stability — verify lại trên browser sau restyle ✓

### Homepage `i87tDx10uM` — khớp cao
Header/hero/awards-grid/kudos-section khớp node specs (code có mm: node annotations).
Countdown 00 là đúng logic post-launch (env EVENT_START_AT quá khứ). Ảnh medal đủ 6,
khác nhau ("vòng trống" trong screenshot = lazy-load artifact).

### Awards `zFYDgyj_pD` — khớp cao sau fix #10/#11
Đo computed: header bg `rgba(16,20,23,.8)` ✓, active nav gold+glow `#FAE287` ✓,
heading 57px `#FFEA9E` ls -0.25 ✓, footer border `#2E3940` pad 40/90 ✓.

## Deviations giữ nguyên (locked theo clarifications F006 — không phải bug)
Avatar chữ cái (không có asset ảnh người), gallery placeholder tiles, "Xem chi tiết"
tĩnh (không có route detail), name-cloud CSS tĩnh, gift recipients lặp placeholder,
Pan/Zoom decorative.

## Notes vận hành
- Sự cố "chữ đen trên nền đen" lúc đầu = stale Turbopack cache (dist cũ thiếu utility
  `text-white/90…`) — hết sau khi build lại dist mới, KHÔNG phải bug code.
- Session song song (không phải session này) cũng vá trùng một phần fix #1/#2/#4/#5/#6/#8
  và phần lớn card restyle — agents của session này verify từng dòng theo spec thay vì
  làm đè, rồi vá phần còn thiếu (M4, gallery 88px, footer, shell cluster, tests).
- `.gitignore`: thêm `/build-*/` + `/*.png` (screenshot debug root).

## Unresolved
1. `compose-dialog.tsx` 284 dòng (>200 guideline, có từ trước) — nên tách module ở pass sau.
2. Badge "x2" render text (design tham chiếu image asset 34×40 không tồn tại trong repo).
3. Ticker: design chỉ expose 1 dòng literal; 5 dòng còn lại là mock decorative cùng format.
4. E2e playwright (3 build riêng) chưa chạy lại đêm nay — unit/browser đã cover; nên chạy
   `npm run e2e` trước khi ship.
