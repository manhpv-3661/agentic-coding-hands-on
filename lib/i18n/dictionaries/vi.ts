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
    // Icon-only trigger/panel aria-labels reused across site chrome
    // (header/footer logo suffix, awards nav, notification/account/widget
    // buttons) — audit gap fix (plan phase-01): these were hardcoded English
    // literals with no dictionary key, so VI never got a translation. Where
    // a button and its opened panel share identical text (notifications,
    // widget "Quick actions"), one key is reused for both per the plan's
    // Key Insights (avoids a pointless duplicate key for the same string).
    a11y: {
      awardCategories: "Danh mục giải thưởng",
      notifications: "Thông báo",
      accountMenu: "Menu tài khoản",
      account: "Tài khoản",
      quickActions: "Thao tác nhanh",
      // `mention-suggestions.tsx`'s listbox aria-label — kept here (not
      // colocated with `kudos.compose.content`) because that slice is
      // consumed verbatim as a REQUIRED `Dictionary["kudos"]["compose"]`
      // prop by `compose-dialog.tsx`/`compose-dialog-fields.tsx`, whose
      // existing hand-written test fixtures would need updating to add a
      // new required field there. Threading this one string as its own
      // optional prop (`compose-dialog.tsx` → `compose-dialog-fields.tsx` →
      // `RichTextEditor` → `MentionSuggestions`) avoids that, at the cost of
      // one extra hop — a deliberate placement trade-off, not the plan's
      // originally suggested spot.
      mentionSuggestions: "Gợi ý gắn thẻ",
      // Only the link-purpose suffix — the "Sun* Annual Awards 2025" brand
      // caption stays a hardcoded literal in site-header.tsx/site-footer.tsx
      // per clarifications.md (brand+year is exempt, this suffix is not).
      logoHomeSuffix: "trang chủ",
    },
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
      // Fixed English copy per MoMorph ground truth (mm:662:14425) — the
      // button label is not translated across locales.
      google: "LOGIN With Google",
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
      // Divider label between Signature 2025 - Creator's two value rows
      // (individual vs. collective) — mm:313:8499.
      orLabel: "Hoặc",
      descriptions: {
        // Unfinished Figma placeholder copy reused verbatim across 5 of the
        // 6 award categories — preserve the "Top Talent" mismatch as-is.
        sharedUnfinished:
          "Giải thưởng Top Talent vinh danh những cá nhân xuất sắc toàn diện – những người không ngừng khẳng định năng lực chuyên môn vững vàng, hiệu suất công việc vượt trội, luôn mang lại giá trị vượt kỳ vọng, được đánh giá cao bởi khách hàng và đồng đội. Với tinh thần sẵn sàng nhận mọi nhiệm vụ tổ chức giao phó, họ luôn là nguồn cảm hứng, thúc đẩy động lực và tạo ảnh hưởng tích cực đến cả tập thể.",
        signatureCreator:
          'Giải thưởng Signature vinh danh cá nhân hoặc tập thể thể hiện tinh thần đặc trưng mà Sun* hướng tới trong từng thời kỳ. Trong năm 2025, giải thưởng Signature vinh danh Creator - cá nhân/tập thể mang tư duy chủ động và nhạy bén, luôn nhìn thấy cơ hội trong thách thức và tiên phong trong hành động. Họ là những người nhạy bén với vấn đề, nhanh chóng nhận diện và đưa ra những giải pháp thực tiễn, mang lại giá trị rõ rệt cho dự án, khách hàng hoặc tổ chức. Với tư duy kiến tạo và tinh thần "Creator" đặc trưng của Sun*, họ không chỉ phản ứng tích cực trước sự thay đổi mà còn chủ động tạo ra cải tiến, góp phần định hình chuẩn mực mới cho cách mà người Sun* tạo giá trị.',
      },
      // `quantity`/`value` are each split into a `{ number, unit }` pair —
      // MoMorph gives the hero figure (36px/44 bold white,
      // mm:I313:8467;214:2538/2546) and its unit/qualifier caption
      // (14px/20 bold white, mm:I313:8467;214:3532/2547) as two distinct
      // text nodes, not one concatenated string. `unit` is `""` when the
      // ground truth has no trailing caption (MVP's bare quantity "01",
      // Top Project Leader/Best Manager/MVP's bare value amount).
      entries: {
        topTalent: {
          // mm:I313:8467;214:3532 ground truth is "Cá nhân" — design was
          // updated after this was first written; sync it.
          quantity: { number: "10", unit: "Cá nhân" },
          value: { number: "7.000.000 VNĐ", unit: "cho mỗi giải thưởng" },
        },
        topProject: {
          quantity: { number: "02", unit: "Tập thể" },
          value: { number: "15.000.000 VNĐ", unit: "mỗi giải" },
        },
        topProjectLeader: {
          quantity: { number: "03", unit: "Cá nhân" },
          value: { number: "7.000.000 VNĐ", unit: "" },
        },
        bestManager: {
          quantity: { number: "01", unit: "Cá nhân" },
          value: { number: "10.000.000 VNĐ", unit: "" },
        },
        // Signature 2025 - Creator is the one category with a dual value
        // structure (individual vs. collective award, mm:313:8490/8498/8501)
        // — two distinct value rows split by an "orLabel" divider, not one
        // concatenated sentence. See `AwardDetailEntry.valueVariants`
        // (individual/collectiveValue+Suffix were already separate fields).
        signatureCreator: {
          // mm:313:8488 ground truth is "Cá nhân hoặc tập thể" — capitalized,
          // no surrounding parentheses (unlike the previous copy here).
          quantity: { number: "01", unit: "Cá nhân hoặc tập thể" },
          individualValue: "5.000.000 VNĐ",
          individualSuffix: "cho giải cá nhân",
          collectiveValue: "8.000.000 VNĐ",
          collectiveSuffix: "cho giải tập thể",
        },
        mvp: {
          // Bare numeral, no VI content — identical in both locales. No unit
          // caption in the ground truth, so `unit` is empty.
          quantity: { number: "01", unit: "" },
          value: { number: "15.000.000 VNĐ", unit: "" },
        },
      },
    },
  },
  // Sun* Kudos live board (F006, `app/kudos/page.tsx`), MoMorph screenId
  // `MaZUn5xHXZ`. NEW top-level namespace — distinct from `homepage.kudos`
  // (still owned by the homepage/awards teaser block, untouched). The three
  // section headings ("HIGHLIGHT KUDOS", "SPOTLIGHT BOARD", "ALL KUDOS") are
  // NOT a hardcode exception — English section headings are not exempt per
  // `clarifications.md` — they are keyed below under `sections` and rendered
  // via `KudosSectionHeading`'s `title` prop (audit gap fix, plan phase-01).
  // The "KUDOS" brand wordmark in `kudos-banner.tsx` is a distinct literal
  // (a logo/wordmark, not a heading) and stays hardcoded.
  kudos: {
    meta: {
      description: "Bảng ghi nhận Sun* Kudos trực tiếp — Sun* Annual Awards 2025.",
    },
    // The 3 repeated `KudosSectionHeading` titles (`kudos-board.tsx`,
    // `highlight-kudos-carousel.tsx`, `spotlight-board.tsx`) — see the
    // namespace comment above for why these are keyed, not hardcoded.
    // Uppercase VI to match the design's uppercase English treatment.
    sections: {
      allKudos: "ALL KUDOS",
      highlightKudos: "HIGHLIGHT KUDOS",
      spotlightBoard: "SPOTLIGHT BOARD",
    },
    banner: {
      title: "Hệ thống ghi nhận và cảm ơn",
      searchPlaceholder: "Tìm kiếm profile Sunner",
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
      copyFailed: "Sao chép thất bại",
      like: "Thả tim",
      unlike: "Bỏ thả tim",
    },
    empty: {
      kudos: "Hiện tại chưa có Kudos nào.",
      recipients: "Chưa có dữ liệu",
    },
    spotlight: {
      searchPlaceholder: "Tìm kiếm",
      panZoom: "Pan/Zoom",
      tickerSuffix: "đã nhận được một Kudos mới",
    },
    // `highlight-kudos-carousel.tsx`'s Previous/Next controls — grouped here
    // (not `shared.a11y`) since they are specific to this one carousel, per
    // the plan's "keep it one consistent place" call.
    highlight: {
      a11y: {
        prevSlide: "Slide trước",
        nextSlide: "Slide tiếp theo",
        prev: "Trước",
        next: "Tiếp theo",
      },
    },
    stats: {
      received: "Số Kudos bạn nhận được:",
      sent: "Số Kudos bạn đã gửi:",
      hearts: "Số tim:",
      secretBoxOpened: "Secret Box đã mở:",
      secretBoxUnopened: "Secret Box chưa mở:",
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
      // FR-19-rev (F006 visual upgrade) — MoMorph `J3-4YFIpMM`, verbatim.
      // P5 decides which of close/dialogTitle/dialogBody stay used.
      heading: "KHÁM PHÁ SECRET BOX CỦA BẠN",
      subtitle: "Click vào box để mở",
      unopenedCount: "Secretbox chưa mở",
      closeAria: "Đóng hộp quà bí ẩn",
      emptyState: "Bạn chưa có Secret Box nào để mở.",
      opening: "Đang mở Secret Box...",
      openedRewardPrefix: "Bạn vừa",
      openFailed: "Mở Secret Box thất bại. Vui lòng thử lại.",
    },
    recent: {
      heading: "10 SUNNER NHẬN QUÀ MỚI NHẤT",
    },
    // F007 — form "Viết Kudos" mở từ pill "Ghi nhận" (thanh composer trên).
    compose: {
      dialogTitle: "Gửi lời cám ơn và ghi nhận đến đồng đội",
      cancel: "Hủy",
      submit: "Gửi",
      successToast: "Đã gửi Kudos!",
      // Backend pivot (Phase 04): shown when `createKudosAction` returns
      // `{ok:false}` after the optimistic prepend is rolled back.
      failureToast: "Gửi Kudos thất bại. Vui lòng thử lại.",
      recipient: {
        label: "Người nhận",
        // Ground truth (node I520:11647;520:9873;186:2760) is the trigger's
        // literal placeholder — "Tìm kiếm", not "Chọn người nhận".
        placeholder: "Tìm kiếm",
        search: "Tìm đồng nghiệp",
        error: "Vui lòng chọn người nhận.",
      },
      title: {
        label: "Danh hiệu",
        // No trailing period in ground truth (node I520:11647;1688:10437;186:2760).
        placeholder: "Dành tặng một danh hiệu cho đồng đội",
        helper:
          "Ví dụ: Người truyền động lực cho tôi.\nDanh hiệu sẽ hiển thị làm tiêu đề Kudos của bạn.",
        error: "Vui lòng nhập danh hiệu.",
      },
      content: {
        label: "Nội dung",
        // Verbatim ground truth from the canonical empty-state screen
        // (JsTvi8KVQA, node I1612:5057;520:9886;186:2760) — two lines: the
        // instruction plus a "VD: ..." example, rendered via
        // `white-space: pre-line` on the placeholder pseudo-element.
        placeholder:
          "Hãy gửi lời cảm ơn và ghi nhận đến đồng đội tại đây nhé!\nVD: Cảm ơn bạn vì tinh thần dẫn dắt và khả năng \"giữ nhịp\" cực kỳ tốt trong giai đoạn nước rút của dự án...",
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
          // FR-24 (F007 conformance) — MoMorph `OyDLDuSGEa` ("Addlink Box",
          // done), verbatim. Replaces the bare `window.prompt()` with a
          // 2-field mini-dialog (P4 owns the wiring).
          addLink: {
            title: "Thêm đường dẫn",
            contentLabel: "Nội dung",
            urlLabel: "URL",
            save: "Lưu",
            cancel: "Hủy",
            urlError: "Vui lòng nhập URL.",
          },
        },
      },
      // FR-23 (revises FR-10, F007 conformance) — MoMorph `b1Filzi9i6`
      // ("Thể lệ UPDATE", done), verbatim. Promoted out of `content` (was
      // `content.communityStandards`, a dead-stub string) into its own
      // object at the `compose` level, since this is now a full 2nd-layer
      // panel, not just toolbar content. `trigger` carries the old string
      // value. Static content only (BR-2) — no real badge computation.
      communityStandards: {
        trigger: "Tiêu chuẩn cộng đồng",
        panelTitle: "Thể lệ",
        recipientHeading:
          "NGƯỜI NHẬN KUDOS: HUY HIỆU HERO CHO NHỮNG ẢNH HƯỞNG TÍCH CỰC\nDựa trên số lượng đồng đội gửi trao Kudos, bạn sẽ sở hữu Huy hiệu Hero tương ứng, được hiển thị trực tiếp cạnh tên profile",
        senderHeading:
          "NGƯỜI GỬI KUDOS: SƯU TẬP TRỌN BỘ 6 ICON, NHẬN NGAY PHẦN QUÀ BÍ ẨN\nMỗi lời Kudos bạn gửi sẽ được đăng tải trên hệ thống và nhận về những lượt ❤️ từ cộng đồng Sunner. Cứ mỗi 5 lượt ❤️, bạn sẽ được mở 1 Secret Box, với cơ hội nhận về một trong 6 icon độc quyền của SAA.",
        nationalHeading: "KUDOS QUỐC DÂN",
        heroTiers: [
          {
            name: "New Hero",
            condition: "Có 1-4 người gửi Kudos cho bạn",
            description:
              "Hành trình lan tỏa điều tốt đẹp bắt đầu – những lời cảm ơn và ghi nhận đầu tiên đã tìm đến bạn.",
          },
          {
            name: "Rising Hero",
            condition: "Có 5-9 người gửi Kudos cho bạn",
            description:
              "Hình ảnh bạn đang lớn dần trong trái tim đồng đội bằng sự tử tế và cống hiến của mình.",
          },
          {
            name: "Super Hero",
            condition: "Có 10–20 người gửi Kudos cho bạn",
            description:
              "Bạn đã trở thành biểu tượng được tin tưởng và yêu quý, người luôn sẵn sàng hỗ trợ và được nhiều đồng đội nhớ đến.",
          },
          {
            name: "Legend Hero",
            condition: "Có hơn 20 người gửi Kudos cho bạn",
            description:
              "Bạn đã trở thành huyền thoại – người để lại dấu ấn khó quên trong tập thể bằng trái tim và hành động của mình.",
          },
        ],
        // Collection-icon badge names — proper nouns, kept identical across
        // VI/EN per the same convention as brand/wordmark strings elsewhere
        // in this file (nav labels, "KUDOS" wordmark). Design asset for the
        // 6th badge renders "ROOT FUTHER" (a Figma typo); display copy here
        // uses the correct "Root Further" to match the already-established
        // Sun* Annual Awards 2025 theme name (see `homepage.rootFurther`).
        collectionIcons: [
          "Revival",
          "Touch of Light",
          "Stay Gold",
          "Flow to Horizon",
          "Beyond the Boundary",
          "Root Further",
        ],
        collectFullSetText:
          "Những Sunner thu thập trọn bộ 6 icon sẽ nhận về một phần quà bí ẩn từ SAA 2025.",
        nationalText:
          "5 Kudos nhận về nhiều ❤️ nhất toàn Sun* sẽ chính thức trở thành Kudos Quốc Dân và được trao phần quà đặc biệt từ SAA 2025: Root Further.",
        footerClose: "Đóng",
        footerCompose: "Viết KUDOS",
      },
      hashtags: {
        label: "Hashtag",
        placeholder: "Nhập hashtag",
        add: "+Hashtag",
        max: "Tối đa 5",
        error: "Thêm ít nhất 1 hashtag.",
        remove: "Xóa hashtag",
        // Catalog dropdown + group preset captions (Phase 04, additive —
        // INVENTED content, see `lib/kudos/kudos-hashtag-catalog.ts`).
        browse: "Chọn từ danh sách",
        group: "Chọn một nhóm",
        groups: {
          cultureValues: "Văn hoá & giá trị",
          performance: "Hiệu suất",
          teamwork: "Làm việc nhóm",
        },
      },
      images: {
        // Ground truth (node I520:11647;520:9897;416:5534) literally reads
        // "Image" in English even on this Vietnamese screen — sibling
        // labels ("Người nhận", "Danh hiệu") are Vietnamese, so this is a
        // deliberate design string, not a shared-component artifact.
        label: "Image",
        add: "+Ảnh",
        max: "Tối đa 5",
        remove: "Xóa ảnh",
        truncated: "Đã đạt giới hạn ảnh, một số ảnh không được thêm.",
      },
      anonymous: {
        checkbox: "Gửi lời cám ơn và ghi nhận ẩn danh",
        nicknameLabel: "Nickname ẩn danh",
        nicknamePlaceholder: "Doraemon",
        error: "Vui lòng nhập nickname.",
      },
    },
  },
};
