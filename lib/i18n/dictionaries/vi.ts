/**
 * Vietnamese dictionary — canonical shape for the whole app.
 *
 * `vi` is the source of truth for the dictionary SHAPE: `Dictionary` (see
 * `../dictionary.ts`) is `typeof vi`, so `en.ts` must satisfy this exact key
 * tree at compile time.
 *
 * Every string value below is copied verbatim (or is a straightforward,
 * unambiguous translation of a short standard UI label) from the 4 catalog
 * reports in `plans/260706-2016-i18n-vi-en-translation/reports/` and the
 * locked decisions in `clarifications.md` (session 2026-07-06). Do not edit
 * values here without updating the source report/decision first.
 *
 * Deliberately NOT `as const`: values must widen to `string` so `en.ts`'s
 * `satisfies Dictionary` checks key-parity only, not literal-value parity
 * (VI and EN strings are never the same value).
 */
export const vi = {
  shared: {
    // site-header.tsx / site-footer.tsx nav labels — brand names (SAA,
    // Sun*, Kudos) stay untranslated per clarifications.md Q4.
    nav: {
      aboutSaa: "Về SAA 2025",
      awardInfo: "Thông tin giải thưởng",
      kudos: "Sun* Kudos",
    },
    footer: {
      // Shared verbatim between login-footer.tsx and site-footer.tsx.
      copyright: "Bản quyền thuộc về Sun* © 2025",
      generalStandards: "Tiêu chuẩn chung",
    },
    account: {
      profile: "Hồ sơ",
      signOut: "Đăng xuất",
    },
    notifications: {
      empty: "Chưa có thông báo",
    },
    widget: {
      comingSoon: "Sắp ra mắt",
    },
    // Shared between homepage countdown-timer.tsx and prelaunch-content.tsx
    // (plan.md "Key decisions" — one key set, byte-identical usage).
    countdown: {
      days: "NGÀY",
      hours: "GIỜ",
      minutes: "PHÚT",
    },
    // Reused by award-card.tsx and sun-kudos-section.tsx.
    detailsCta: "Chi tiết",
  },
  login: {
    meta: {
      title: "Đăng nhập | Sun* Annual Awards 2025",
      description: "Đăng nhập để khám phá Sun* Annual Awards 2025.",
    },
    error: {
      // Reused by page.tsx and login-button-container.tsx.
      oauthFailed: "Đăng nhập không thành công. Vui lòng thử lại.",
      notConfigured:
        "Chưa cấu hình đăng nhập. Vui lòng thiết lập Supabase trong .env.local (xem .env.local.example).",
    },
    hero: {
      subtitle: "Bắt đầu hành trình của bạn cùng SAA 2025.\nĐăng nhập để khám phá!",
    },
    button: {
      loading: "Đang đăng nhập...",
      google: "Đăng nhập với Google",
    },
  },
  homepage: {
    hero: {
      eventInfo: {
        timeLabel: "Thời gian: ",
        venueLabel: "Địa điểm:",
        livestreamNote: "Tường thuật trực tiếp qua sóng Livestream",
      },
      // Translation-as-data (event-info.tsx) — see clarifications.md.
      eventDate: "26/12/2025",
      // Fixes the "Comming soon" typo present in countdown-timer.tsx today.
      comingSoon: "Sắp diễn ra",
      cta: {
        aboutAwards: "VỀ GIẢI THƯỞNG",
        aboutKudos: "VỀ SUN* KUDOS",
      },
    },
    rootFurther: {
      paragraph1:
        "Đứng trước bối cảnh thay đổi như vũ bão của thời đại AI và yêu cầu ngày càng cao từ khách hàng, Sun* lựa chọn chiến lược đa dạng hóa năng lực để không chỉ nỗ lực trở thành tinh anh trong lĩnh vực của mình, mà còn hướng đến một cái đích cao hơn, nơi mọi Sunner đều là “problem-solver” - chuyên gia trong việc giải quyết mọi vấn đề, tìm lời giải cho mọi bài toán của dự án, khách hàng và xã hội.\nLấy cảm hứng từ sự đa dạng năng lực, khả năng phát triển linh hoạt cùng tinh thần đào sâu để bứt phá trong kỷ nguyên AI, “Root Further” đã được chọn để trở thành chủ đề chính thức của Lễ trao giải Sun* Annual Awards 2025.\nVượt ra khỏi nét nghĩa bề mặt, “Root Further” chính là hành trình chúng ta không ngừng vươn xa hơn, cắm rễ mạnh hơn, chạm đến những tầng “địa chất” ẩn sâu để tiếp tục tồn tại, vươn lên và nuôi dưỡng đam mê kiến tạo giá trị luôn cháy bỏng của người Sun*. Mượn hình ảnh bộ rễ liên tục đâm sâu vào lòng đất, mạnh mẽ len lỏi qua từng lớp “trầm tích” để thẩm thấu những gì tinh tuý nhất, người Sun* cũng đang “hấp thụ” dưỡng chất từ thời đại và những thử thách của thị trường để làm mới mình mỗi ngày, mở rộng năng lực và mạnh mẽ “bén rễ” vào kỷ nguyên AI - một tầng “địa chất” hoàn toàn mới, phức tạp và khó đoán, nhưng cũng hội tụ vô vàn tiềm năng cùng cơ hội.",
      pullQuote:
        " “A tree with deep roots fears no storm”\n (Cây sâu bén rễ, bão giông chẳng nề - Ngạn ngữ Anh)",
      paragraph2:
        "Trước giông bão, chỉ những tán cây có bộ rễ đủ mạnh mới có thể trụ vững. Một tổ chức với những cá nhân tự tin vào năng lực đa dạng, sẵn sàng kiến tạo và đón nhận thử thách, làm chủ sự thay đổi là tổ chức không chỉ vững vàng trước biến động, mà còn khai thác được mọi lợi thế, chinh phục các thách thức của thời cuộc. Không đơn thuần là tên gọi của chương mới trên hành trình phát triển tổ chức, “Root Further” còn như một lời cổ vũ, động viên mỗi chúng ta hãy dám tin vào bản thân, dám đào sâu, khai mở mọi tiềm năng, dám phá bỏ giới hạn, dám trở thành phiên bản đa nhiệm và xuất sắc nhất của mình. Bởi trong thời đại AI, đa dạng năng lực và tận dụng sức mạnh thời cuộc chính là điều kiện tiên quyết để trường tồn.\nKhông ai biết trước ẩn sâu trong “lòng đất” của ngành công nghệ và thị trường hiện đại còn biết bao tầng “địa chất” bí ẩn. Chỉ biết rằng khi “Root Further” đã trở thành tinh thần cội rễ, chúng ta sẽ không sợ hãi, mà càng thấy háo hức trước bất cứ vùng vô định nào trên hành trình tiến về phía trước. Vì ta luôn tin rằng, trong chính những miền vô tận đó, là bao điều kỳ diệu và cơ hội vươn mình đang chờ ta.",
    },
    awards: {
      heading: "Hệ thống giải thưởng",
      items: {
        topTalent: {
          description: "Vinh danh top cá nhân xuất sắc trên mọi phương diện",
        },
        topProject: {
          description:
            "Vinh danh dự án xuất sắc trên mọi phương diện, dự án có doanh thu nổi bật",
        },
        topProjectLeader: {
          description: "Vinh danh người quản lý truyền cảm hứng và dẫn dắt dự án bứt phá, ",
        },
        // bestManager / signatureCreator / mvp intentionally share one
        // identical placeholder string (unfinished Figma copy, mirrored per
        // clarifications.md — not a bug).
        bestManager: {
          description: "Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm",
        },
        signatureCreator: {
          description: "Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm",
        },
        mvp: {
          description: "Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm",
        },
      },
    },
    // sun-kudos-section.tsx — "tháng 11/2025" embedded mid-paragraph is a
    // data value baked into the free-text copy, kept literal per
    // clarifications.md (no interpolation abstraction for one static date).
    kudos: {
      eyebrow: "Phong trào ghi nhận",
      description:
        "ĐIỂM MỚI CỦA SAA 2025\nHoạt động ghi nhận và cảm ơn đồng nghiệp - lần đầu tiên được diễn ra dành cho tất cả Sunner. Hoạt động sẽ được triển khai vào tháng 11/2025, khuyến khích người Sun* chia sẻ những lời ghi nhận, cảm ơn đồng nghiệp trên hệ thống do BTC công bố. Đây sẽ là chất liệu để Hội đồng Heads tham khảo trong quá trình lựa chọn người đạt giải.",
    },
  },
  prelaunch: {
    meta: {
      title: "Sự kiện sắp bắt đầu — Sun* Annual Awards 2025",
      // Newly authored VI (no prior VI text existed for this description).
      description: "Đếm ngược - Trang chờ sự kiện — Sun* Annual Awards 2025.",
    },
    countdown: {
      heading: "Sự kiện sẽ bắt đầu sau",
    },
  },
  awards: {
    meta: {
      description: "Thông tin các hạng mục giải thưởng Sun* Annual Awards 2025.",
    },
    title: {
      heading: "Hệ thống giải thưởng SAA 2025",
    },
    detail: {
      quantityLabel: "Số lượng giải thưởng: ",
      valueLabel: "Giá trị giải thưởng: ",
      descriptions: {
        // Unfinished Figma placeholder copy reused verbatim across 5 of the
        // 6 award categories — preserve the "Top Talent" mismatch as-is.
        sharedUnfinished:
          "Giải thưởng Top Talent vinh danh những cá nhân xuất sắc toàn diện – những người không ngừng khẳng định năng lực chuyên môn vững vàng, hiệu suất công việc vượt trội, luôn mang lại giá trị vượt kỳ vọng, được đánh giá cao bởi khách hàng và đồng đội. Với tinh thần sẵn sàng nhận mọi nhiệm vụ tổ chức giao phó, họ luôn là nguồn cảm hứng, thúc đẩy động lực và tạo ảnh hưởng tích cực đến cả tập thể.",
        signatureCreator:
          'Giải thưởng Signature vinh danh cá nhân hoặc tập thể thể hiện tinh thần đặc trưng mà Sun* hướng tới trong từng thời kỳ. Trong năm 2025, giải thưởng Signature vinh danh Creator - cá nhân/tập thể mang tư duy chủ động và nhạy bén, luôn nhìn thấy cơ hội trong thách thức và tiên phong trong hành động. Họ là những người nhạy bén với vấn đề, nhanh chóng nhận diện và đưa ra những giải pháp thực tiễn, mang lại giá trị rõ rệt cho dự án, khách hàng hoặc tổ chức. Với tư duy kiến tạo và tinh thần "Creator" đặc trưng của Sun*, họ không chỉ phản ứng tích cực trước sự thay đổi mà còn chủ động tạo ra cải tiến, góp phần định hình chuẩn mực mới cho cách mà người Sun* tạo giá trị.',
      },
      entries: {
        topTalent: {
          quantity: "10 Đơn vị",
          value: "7.000.000 VNĐ cho mỗi giải thưởng",
        },
        topProject: {
          quantity: "02 Tập thể",
          value: "15.000.000 VNĐ mỗi giải",
        },
        topProjectLeader: {
          quantity: "03 Cá nhân",
          value: "7.000.000 VNĐ",
        },
        bestManager: {
          quantity: "01 Cá nhân",
          value: "10.000.000 VNĐ",
        },
        signatureCreator: {
          quantity: "01 (cá nhân hoặc tập thể)",
          value: "5.000.000 VNĐ (cá nhân) HOẶC 8.000.000 VNĐ (tập thể)",
        },
        mvp: {
          // Bare numeral, no VI content — identical in both locales.
          quantity: "01",
          value: "15.000.000 VNĐ",
        },
      },
    },
  },
  // Sun* Kudos live board (F006, `app/kudos/page.tsx`), MoMorph screenId
  // `MaZUn5xHXZ`. NEW top-level namespace — distinct from `homepage.kudos`
  // (still owned by the homepage/awards teaser block, untouched). English
  // design labels ("HIGHLIGHT KUDOS", "SPOTLIGHT BOARD", "ALL KUDOS", the
  // "KUDOS" wordmark) stay hardcoded in components per clarifications.md,
  // not keyed here.
  kudos: {
    meta: {
      description: "Bảng ghi nhận Sun* Kudos trực tiếp — Sun* Annual Awards 2025.",
    },
    banner: {
      title: "Hệ thống ghi nhận và cảm ơn",
    },
    composer: {
      placeholder: "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?",
    },
    filters: {
      hashtagLabel: "Hashtag",
      departmentLabel: "Phòng ban",
      allOption: "Tất cả",
    },
    card: {
      viewDetail: "Xem chi tiết",
      copyLink: "Copy Link",
      copied: "Đã sao chép liên kết",
    },
    empty: {
      kudos: "Hiện tại chưa có Kudos nào.",
      recipients: "Chưa có dữ liệu",
    },
    spotlight: {
      searchPlaceholder: "Tìm kiếm",
      panZoom: "Pan/Zoom",
    },
    stats: {
      received: "Số Kudos nhận được",
      sent: "Số Kudos đã gửi",
      hearts: "Số lượt thả tim",
      secretBoxOpened: "Secret Box đã mở",
      secretBoxUnopened: "Secret Box chưa mở",
    },
    gift: {
      // Design-verbatim label chosen over the FR-19 spec text ("Mở quà")
      // per the reviewed screenshot ground truth (plan.md open item),
      // resolved here rather than left ambiguous downstream.
      openButton: "Mở Secret Box",
      dialogTitle: "Secret Box của bạn",
      dialogBody:
        "Phần thưởng thật sẽ được cập nhật sau. Đây là màn hình xem trước dành cho bản mock.",
      close: "Đóng",
    },
    recent: {
      heading: "10 SUNNER NHẬN QUÀ MỚI NHẤT",
    },
    // F007 — form "Viết Kudos" mở từ pill "Ghi nhận" (thanh composer trên).
    compose: {
      dialogTitle: "Viết Kudos",
      cancel: "Hủy",
      submit: "Gửi",
      successToast: "Đã gửi Kudos!",
      recipient: {
        label: "Người nhận",
        placeholder: "Chọn người nhận",
        search: "Tìm đồng nghiệp",
        error: "Vui lòng chọn người nhận.",
      },
      title: {
        label: "Danh hiệu",
        placeholder: "Dành tặng một danh hiệu cho đồng đội.",
        helper:
          "Ví dụ: Người truyền động lực cho tôi.\nDanh hiệu sẽ hiển thị làm tiêu đề Kudos của bạn.",
        error: "Vui lòng nhập danh hiệu.",
      },
      content: {
        label: "Nội dung",
        placeholder:
          'Hãy gửi lời cảm ơn và ghi nhận đến đồng đội tại đây nhé!\nVD: Cảm ơn bạn vì tinh thần dẫn dắt và khả năng "giữ nhịp" cực kỳ tốt trong giai đoạn nước rút của dự án...',
        mentionHint: 'Bạn có thể "@ + tên" để nhắc tới đồng nghiệp khác',
        counterMax: "1.000",
        error: "Vui lòng nhập nội dung.",
        // Nested under `content` (not a sibling) — both are consumed
        // together by `RichTextEditor` via a single `labels` prop.
        toolbar: {
          bold: "In đậm",
          italic: "In nghiêng",
          strikethrough: "Gạch ngang",
          list: "Danh sách",
          link: "Chèn liên kết",
          quote: "Trích dẫn",
        },
        communityStandards: "Tiêu chuẩn cộng đồng",
      },
      hashtags: {
        label: "Hashtag",
        placeholder: "Nhập hashtag",
        add: "+Hashtag",
        max: "Tối đa 5",
        error: "Thêm ít nhất 1 hashtag.",
        remove: "Xóa hashtag",
      },
      images: {
        label: "Hình ảnh",
        add: "+Ảnh",
        max: "Tối đa 5",
        remove: "Xóa ảnh",
        truncated: "Đã đạt giới hạn ảnh, một số ảnh không được thêm.",
      },
      anonymous: {
        checkbox: "Gửi lời cảm ơn và ghi nhận ẩn danh",
        nicknameLabel: "Nickname ẩn danh",
        nicknamePlaceholder: "Doraemon",
        error: "Vui lòng nhập nickname.",
      },
    },
  },
};
