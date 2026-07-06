# Homepage (F002, `/`) Vietnamese String Catalog

Scope: `app/page.tsx` + 8 home components. `.test.tsx` skipped per instructions.
No `research`/`search-docs` skill applicable (pure codebase catalog, not tech/library research) — used Read directly.

## hero-section.tsx

| file:line | VI text | proposed key | proposed EN |
|---|---|---|---|
| hero-section.tsx:38 | `Root Further` (img alt) | — | EXCLUDED — stylized wordmark/proper noun, not translated (see Excluded list) |

## countdown-timer.tsx

No Vietnamese strings. See Bonus table (English-hardcoded strings still needing VI counterpart).

## event-info.tsx

| file:line | VI text | proposed key | proposed EN |
|---|---|---|---|
| event-info.tsx:19 | `Thời gian: ` | `homepage.hero.eventInfo.timeLabel` | `Time:` |
| event-info.tsx:23 | `26/12/2025` | — | DATA VALUE — see Data Values section |
| event-info.tsx:30 | `Địa điểm:` | `homepage.hero.eventInfo.venueLabel` | `Venue:` |
| event-info.tsx:34 | `Âu Cơ Art Center` | — | DATA VALUE (venue name, proper noun) — see Data Values section |
| event-info.tsx:40 | `Tường thuật trực tiếp qua sóng Livestream` | `homepage.hero.eventInfo.livestreamNote` | `Broadcast live via livestream` |

## hero-cta-buttons.tsx

No Vietnamese strings (`ABOUT AWARDS` / `ABOUT KUDOS` already English). See Bonus table.

## root-further-content.tsx

| file:line | VI text | proposed key | proposed EN |
|---|---|---|---|
| root-further-content.tsx:30 | `BODY_PARAGRAPH_1` — "Đứng trước bối cảnh thay đổi như vũ bão..." (full 3-\n-separated paragraph, verbatim in file) | `homepage.rootFurther.paragraph1` | "Facing the rapid transformation of the AI era and ever-rising client expectations, Sun* has chosen a strategy of diversifying capabilities — not only to excel as specialists in our own fields, but to reach further: a place where every Sunner is a \"problem-solver,\" an expert who can tackle any challenge and find answers for every project, client, and society.\n\nInspired by diverse capabilities, the ability to grow flexibly, and the spirit of digging deep to break through in the AI era, \"Root Further\" was chosen as the official theme of the Sun* Annual Awards 2025.\n\nBeyond its surface meaning, \"Root Further\" is our ongoing journey to reach farther, root deeper, and touch the hidden \"geological layers\" beneath the surface — to keep surviving, rising, and nurturing the Sun* spirit's ever-burning passion for creating value. Like roots constantly pushing deeper into the earth, weaving through layer after layer of \"sediment\" to absorb what is most essential, Sun* people are likewise \"absorbing\" nourishment from this era and the market's challenges to renew ourselves every day — expanding our capabilities and firmly \"taking root\" in the AI era: an entirely new, complex, and unpredictable \"geological layer,\" yet one brimming with potential and opportunity." |
| root-further-content.tsx:33 | `PULL_QUOTE` — ` "A tree with deep roots fears no storm"\n (Cây sâu bén rễ, bão giông chẳng nề - Ngạn ngữ Anh)` | `homepage.rootFurther.pullQuote` | FLAGGED — design decision, do not guess. Quote text is already English; the parenthetical is a VI back-translation + "English proverb" attribution. Unclear what the EN-locale rendering should show (drop the parenthetical? swap to a VI proverb attribution note?). Needs product/design confirmation before keying. |
| root-further-content.tsx:36 | `BODY_PARAGRAPH_2` — "Trước giông bão, chỉ những tán cây..." (full 2-\n paragraph, verbatim in file) | `homepage.rootFurther.paragraph2` | "When storms hit, only trees with roots strong enough can stand firm. An organization built on individuals who trust in their diverse capabilities, who are ready to create and embrace challenges, and who take charge of change is one that not only stays resilient through turbulence but also seizes every advantage and rises to meet the challenges of the times. More than just the name of a new chapter in our organization's journey, \"Root Further\" is also a call to action: daring to believe in ourselves, daring to dig deep and unlock our full potential, daring to break through our limits, daring to become the most versatile and excellent version of ourselves. Because in the AI era, diverse capabilities and harnessing the strength of the times are the prerequisites for lasting success.\n\nNo one can know in advance how many hidden \"geological layers\" still lie beneath the \"ground\" of today's technology and market. All we know is that once \"Root Further\" becomes our rooted spirit, we will face any uncharted territory ahead not with fear but with excitement — because we always believe that within those boundless frontiers lie countless wonders and opportunities for us to rise and grow." |
| root-further-content.tsx:48 | `Root` (img alt) | — | EXCLUDED — stylized wordmark, see Excluded list |
| root-further-content.tsx:56 | `Further` (img alt) | — | EXCLUDED — stylized wordmark, see Excluded list |

## awards-section.tsx

| file:line | VI text | proposed key | proposed EN |
|---|---|---|---|
| awards-section.tsx:121 | `Sun* annual awards 2025` | — | Already English/brand text; kept as bonus-table candidate (see Bonus table) — likely stays identical in both locales (proper noun + year), flag to confirm |
| awards-section.tsx:129 | `Hệ thống giải thưởng` | `homepage.awards.heading` | `Award System` |
| awards-section.tsx:44 | `Vinh danh top cá nhân xuất sắc trên mọi phương diện` (Top Talent desc) | `homepage.awards.items.topTalent.description` | `Honoring the top individuals who excel across every dimension` |
| awards-section.tsx:54 | `Vinh danh dự án xuất sắc trên mọi phương diện, dự án có doanh thu nổi bật` (Top Project desc) | `homepage.awards.items.topProject.description` | `Honoring outstanding projects that excel across every dimension, with standout revenue performance` |
| awards-section.tsx:63 | `Vinh danh người quản lý truyền cảm hứng và dẫn dắt dự án bứt phá, ` (Top Project Leader desc, note trailing `, ` — source typo) | `homepage.awards.items.topProjectLeader.description` | `Honoring managers who inspire and lead projects to breakthrough success` |
| awards-section.tsx:72 | `Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm` (Best Manager desc) | `homepage.awards.items.bestManager.description` | `Honoring managers with strong management capability who lead their teams effectively` — FLAGGED, see Data Values / placeholder note |
| awards-section.tsx:81 | same VI text as above (Signature 2025 - Creator desc, duplicate) | `homepage.awards.items.signatureCreator.description` | same EN as above — FLAGGED duplicate placeholder |
| awards-section.tsx:90 | same VI text as above (MVP desc, duplicate) | `homepage.awards.items.mvp.description` | same EN as above — FLAGGED duplicate placeholder |
| awards-section.tsx:43,52,62,71,80,89 | `Top Talent` / `Top Project` / `Top Project Leader` / `Best Manager` / `Signature 2025 - Creator` / `MVP (Most Valuable Person)` (`titleAlt`) | — | EXCLUDED per instructions — award category names already correct in English, do not re-translate |

## award-card.tsx

| file:line | VI text | proposed key | proposed EN |
|---|---|---|---|
| award-card.tsx:114 | `Chi tiết` | `common.detailsCta` (shared — reused verbatim in sun-kudos-section.tsx:110) | `Details` |

## sun-kudos-section.tsx

| file:line | VI text | proposed key | proposed EN |
|---|---|---|---|
| sun-kudos-section.tsx:12,98 | `DESCRIPTION` — "ĐIỂM MỚI CỦA SAA 2025\nHoạt động ghi nhận và cảm ơn đồng nghiệp..." | `homepage.kudos.description` | "WHAT'S NEW IN SAA 2025\nA recognition and appreciation activity for colleagues — held for the first time, open to all Sunners. It will run in November 2025, encouraging Sun* people to share notes of recognition and thanks for their colleagues on the platform announced by the Organizing Committee. This content will serve as reference material for the Heads Council during the award selection process." — NOTE: "tháng 11/2025" is a date value embedded mid-paragraph, see Data Values section |
| sun-kudos-section.tsx:90 | `Phong trào ghi nhận` | `homepage.kudos.eyebrow` | `Recognition Movement` |
| sun-kudos-section.tsx:110 | `Chi tiết` | `common.detailsCta` (same key as award-card.tsx:114) | `Details` |
| sun-kudos-section.tsx:94 | `Sun* Kudos` | — | EXCLUDED — proper noun/brand, do not translate |

## page.tsx

No Vietnamese strings — `metadata.title` / `metadata.description` are already English. No action needed here beyond eventually wiring metadata to the dictionary if the app wants locale-specific `<title>`.

---

## Excluded (proper nouns / stylized wordmark / already-correct EN)

- `Root Further` (hero-section.tsx:38), `Root` (root-further-content.tsx:48), `Further` (root-further-content.tsx:56) — stylized wordmark images, image `alt`, not real copy.
- `Sun*`, `SAA`, `Kudos`, `Sun* Kudos` (sun-kudos-section.tsx:94) — brand/proper nouns.
- Award category `titleAlt` values (Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 - Creator, MVP (Most Valuable Person)) — per instructions, already correct English, do not re-translate.

## Bonus: English-hardcoded UI strings that still need dictionary keys (for VI side of i18n)

These aren't Vietnamese, but a real bilingual app needs a VI value for them too — flagging so they aren't missed:

| file:line | current text | proposed key | proposed VI |
|---|---|---|---|
| countdown-timer.tsx:84 | `Comming soon` (typo of "Coming soon") | `homepage.hero.comingSoon` | `Sắp diễn ra` — recommend fixing the EN typo when keying (`Coming soon`) |
| countdown-timer.tsx:90 | `DAYS` | `homepage.hero.countdown.days` | `NGÀY` |
| countdown-timer.tsx:92 | `HOURS` | `homepage.hero.countdown.hours` | `GIỜ` |
| countdown-timer.tsx:94 | `MINUTES` | `homepage.hero.countdown.minutes` | `PHÚT` |
| hero-cta-buttons.tsx:61 | `ABOUT AWARDS` | `homepage.hero.cta.aboutAwards` | `VỀ GIẢI THƯỞNG` |
| hero-cta-buttons.tsx:76 | `ABOUT KUDOS` | `homepage.hero.cta.aboutKudos` | `VỀ SUN* KUDOS` |
| awards-section.tsx:121 | `Sun* annual awards 2025` | `homepage.awards.eyebrow` | Likely unchanged (`Sun* Annual Awards 2025`) — brand + year, flag to confirm with design whether it's ever translated |

## Data Values (need FORMAT/locale handling, not dictionary lookup)

| file:line | value | why |
|---|---|---|
| event-info.tsx:23 | `26/12/2025` | Raw `dd/mm/yyyy` string, hardcoded. Needs a real `Date` + `Intl.DateTimeFormat`/date-fns locale formatting so VI (`26/12/2025`) vs EN (`Dec 26, 2025` or similar) render correctly, not a translated string. |
| event-info.tsx:34 | `Âu Cơ Art Center` | Venue proper noun — not translated, but flag whether it should route through a locale-aware place name lookup or just stay a literal (no other locale variant expected). |
| sun-kudos-section.tsx:12 | `tháng 11/2025` (embedded mid-sentence inside `DESCRIPTION`) | Date value baked into a free-text paragraph — can't cleanly extract into its own token without restructuring the sentence/interpolating a formatted date into the translation string. Flag for translator/dev decision on interpolation vs. leaving literal. |
| awards-section.tsx:72,81,90 | Identical `description` text reused for Best Manager / Signature 2025-Creator / MVP | Not a locale issue but a DATA-QUALITY issue: source comment (awards-section.tsx:27-30) confirms this is unfinished/placeholder copy in the Figma design, reproduced verbatim per "don't invent data." Real per-award descriptions are expected from backend/CMS later — translating 3x identical placeholder text now will need re-translation once real copy lands. |
| — | No currency/quantity values found | Homepage award grid (6 cards: thumbnail, titleImage, titleAlt, description, detailsHref) has no quantity/currency fields — nothing else needs numeric/currency locale formatting on this screen. |

---

## Counts

- Real VI copy strings requiring translation: 13 (event-info: 3 labels + 1 note [date/venue excluded as data]; root-further: 2 long paragraphs + 1 flagged pull-quote; awards-section: 1 heading + 6 award descriptions [3 of which are literal duplicates]; award-card/sun-kudos: 1 shared "Chi tiết" key used 2x; sun-kudos: 1 description + 1 eyebrow).
- Bonus English-hardcoded strings needing a VI counterpart: 7.
- Data values needing format/locale handling (not simple dictionary lookup): 3 distinct + 1 data-quality flag (duplicate placeholder descriptions).
- Excluded (proper nouns / wordmark / already-correct category names): 9.

## Unresolved questions

1. `PULL_QUOTE` (root-further-content.tsx:33) — what should the EN-locale rendering show? Source already mixes an English quote with a VI back-translation + attribution. Needs design/product call, not a guess.
2. `awards-section.tsx:121` eyebrow `Sun* annual awards 2025` — confirm whether this ever changes by locale or is a fixed brand string (recommend fixed).
3. Best Manager / Signature 2025-Creator / MVP descriptions are identical placeholder copy per source comment — confirm whether i18n work should proceed with duplicate keys now, or wait for real per-award copy from the backend/CMS track (avoids retranslating twice).
4. `event-info.tsx` date (`26/12/2025`) and kudos description's embedded `tháng 11/2025` — confirm whether event dates come from a CMS/env var (as `countdown-timer.tsx` already does via `NEXT_PUBLIC_EVENT_START_AT`) so date formatting can be centralized, vs. staying literal strings inside translated copy.
