## Session 2026-07-06

- Q: Scroll-spy cho menu điều hướng (C): dùng IntersectionObserver thật để tự đổi active theo vị trí scroll, hay chỉ active khi click? → A: IntersectionObserver thật — tự động đổi active item theo vị trí đang xem khi scroll, không cần click.
- Q: Ảnh award (Picture-Award 336x336px/card) + Keyvisual + Kudos illustration lấy nguồn nào? → A: Dùng lại asset thật đã có ở public/homepage-saa/ (Award-BG.png, Award-Name-*.png, Keyvisual-BG.png, Kudos-Background.png, Kudos-Logo.svg, Root-Further-Logo.png) — cùng componentId/node với Homepage F002, không cần tải lại qua MoMorph media API.
- Q: Khối Sun* Kudos promo: tái dùng nguyên component SunKudosSection từ F002, hay build layout riêng? → A: Tái dùng nguyên SunKudosSection không sửa, đặt như một section độc lập ở cuối trang trước footer (ngoài khung "Bìa" chứa lưới giải thưởng) — node tree MoMorph xác nhận cùng cấu trúc/copy/asset với khối D1/D2 Homepage, chỉ khác vị trí trong luồng trang.
