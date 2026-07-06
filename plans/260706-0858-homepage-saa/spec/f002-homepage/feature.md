---
feature: F002
name: Trang chủ (Homepage) — SAA 2025
lang: vi
screen: Homepage SAA
momorph:
  fileKey: 9ypp4enmFmdK3YAFJLIu6C
  screenId: i87tDx10uM
status: draft
---

# F002 — Màn hình Trang chủ (Homepage SAA)

## 1. Tổng quan

Trang chủ của ứng dụng **SAA 2025** (Sun* Annual Awards 2025), route `/`. Đây là trang
**sau đăng nhập** (route được bảo vệ): người dùng chưa xác thực → redirect `/login`;
sau khi đăng nhập thành công, người dùng được đưa về `/` (thay đích `/todo` trước đây).

Bố cục: header điều hướng cố định → hero "ROOT FURTHER" + đồng hồ đếm ngược + thông tin
sự kiện + CTA → khối mô tả "Root Further" → lưới 6 hạng mục giải thưởng → khối quảng bá
Sun* Kudos → footer. Widget button nổi cố định góc phải dưới.

## 2. Yêu cầu chức năng

### 2.1 Kiểm soát truy cập (Access Control)
- **FR-1**: Chưa đăng nhập truy cập `/` → redirect `/login` (proxy + server guard).
- **FR-2**: Đã đăng nhập truy cập `/` → hiển thị trang chủ đầy đủ.
- **FR-3**: Sau OAuth callback thành công → redirect về `/` (cập nhật từ `/todo`).
- **FR-4**: Đã đăng nhập truy cập `/login` → redirect `/` (cập nhật từ `/todo`).
- **FR-5**: Placeholder routes `/awards`, `/kudos` cũng được bảo vệ như `/`.
- Ghi chú: TC ID-0 (public homepage) đã bị thay thế bởi quyết định clarification 2026-07-06.

### 2.2 Header điều hướng (A1)
- **FR-6**: Logo (64x60, alt text) — click → về `/` và scroll lên đầu trang.
- **FR-7**: Links: "About SAA 2025" (selected — vàng/underline, click khi selected → scroll top),
  "Awards Information" → `/awards`, "Sun* Kudos" → `/kudos`. Hover → highlight nền sáng.
- **FR-8**: Bell thông báo (40x40): click → mở panel rỗng ("Chưa có thông báo"); badge đỏ ẩn
  (chưa có nguồn dữ liệu notification). Đóng khi click ngoài / Esc.
- **FR-9**: Language selector: tái sử dụng pattern F001 (cookie NEXT_LOCALE, VN/EN, không dịch nội dung).
- **FR-10**: Account menu (40x40): Profile (stub, không điều hướng) + Sign out (thật —
  `supabase.auth.signOut()` → redirect `/login`). Admin Dashboard ẩn (chưa có role system).
  Mở/đóng: click, Enter/Space, Esc, click ngoài (TC ID-30..38).

### 2.3 Hero + Đếm ngược (Keyvisual, B1, B2, B3)
- **FR-11**: Hero "ROOT FURTHER" + subtitle "Coming soon" + nền keyvisual full-width.
- **FR-12**: Đồng hồ đếm ngược 3 module DAYS/HOURS/MINUTES, mỗi module 2 chữ số 0-padded,
  tự cập nhật theo thời gian thực (độ phân giải phút).
- **FR-13**: Mốc sự kiện đọc từ env `NEXT_PUBLIC_EVENT_START_AT` (ISO-8601).
- **FR-14**: Khi đếm về 0 hoặc đã qua mốc: hiển thị 00 00 00 và ẩn "Coming soon".
- **FR-15**: Env thiếu/không hợp lệ → 00 00 00, ẩn "Coming soon", console.warn, không crash.
- **FR-16**: Thông tin sự kiện (tĩnh, theo Figma — nguồn chuẩn): "Thời gian: 26/12/2025",
  "Địa điểm: Âu Cơ Art Center", "Tường thuật trực tiếp qua sóng Livestream".
  (Spec CSV MoMorph ghi giá trị cũ "18h30"/"Nhà hát nghệ thuật quân đội" — design thắng.)
- **FR-17**: CTA: "ABOUT AWARDS" → `/awards`; "ABOUT KUDOS" → `/kudos`. Hover/normal states theo design.

### 2.4 Khối "Root Further" (B4)
- **FR-18**: Khối mô tả tĩnh: typography nền "ROOT"/"FURTHER", đoạn mô tả, quote
  "A tree with deep roots fears no storm". Không tương tác.

### 2.5 Lưới giải thưởng (C1, C2)
- **FR-19**: Tiêu đề section: caption "Sun* annual awards 2025", tiêu đề "Hệ thống giải thưởng",
  mô tả phụ.
- **FR-20**: 6 thẻ: Top Talent, Top Project, Top Project Leader, Best Manager,
  Signature 2025 - Creator, MVP. Mỗi thẻ: thumbnail + tiêu đề + mô tả (tối đa 2 dòng, ellipsis)
  + link "Chi tiết".
- **FR-21**: Click ảnh/tiêu đề/"Chi tiết" → `/awards#<slug-hạng-mục>` (hash-anchor scroll).
- **FR-22**: Hover thẻ: nâng nhẹ + viền/ánh sáng nổi bật.
- **FR-23**: Responsive grid: desktop 3 cột; tablet/mobile 2 cột.

### 2.6 Khối Sun* Kudos (D1, D2)
- **FR-24**: Label "Phong trào ghi nhận", tiêu đề "Sun* Kudos", mô tả, ảnh minh họa,
  nút "Chi tiết" → `/kudos`.

### 2.7 Widget button (6)
- **FR-25**: Pill 105x64 vàng, nổi cố định mép phải dưới; click → mở menu stub các hành động nhanh.

### 2.8 Footer (7)
- **FR-26**: Logo (click → `/` scroll top), links "About SAA 2025" / "Awards Information" /
  "Sun* Kudos" / "Tiêu chuẩn chung" (states như header), bản quyền "Bản quyền thuộc vè Sun* © 2025".

## 3. Yêu cầu phi chức năng
- Pixel-perfect theo Figma (MoMorph i87tDx10uM); fonts Montserrat (tái sử dụng `app/login/fonts.ts`).
- Responsive: desktop / tablet / mobile — hero co giãn, grid đổi cột, text xuống dòng.
- Accessibility: focus-visible rõ ràng, keyboard cho menus (Enter/Space/Esc), alt text.
- Files < 200 lines, kebab-case, tái sử dụng component Login khi hợp lý.

## 4. Kiểm thử (DoD như F001)
- Unit (Vitest + Testing Library): countdown logic (0-padding, zero-state, env invalid),
  menus (mở/đóng/keyboard), guard/redirect logic proxy, render các section.
- E2E (Playwright): access control (unauth → /login; auth → /), navigation (header/footer/CTA/cards
  → /awards, /kudos, hash-anchor), countdown hiển thị, sign out, language selector.
- Nguồn test case: 62 TC MoMorph (screenId i87tDx10uM) — trừ ID-0 (outdated theo clarification).

## 5. Unresolved Questions
- Nội dung thật của trang Awards Information / Sun* Kudos (screen sau) — placeholder tạm.
- Notification backend + role system (Admin Dashboard) — hoãn, chưa có hạng mục.
