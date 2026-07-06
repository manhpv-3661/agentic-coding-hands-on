# F004 Awards Information (`/awards`) — Vietnamese String Catalog

Scope: `app/awards/page.tsx`, `app/components/awards/{awards-hero,awards-nav-menu,award-detail-card,award-detail-data,awards-catalog}.tsx`, plus `lib/awards/award-categories.ts` (read for context — confirms nav/card titles are already English, no VI there, excluded from table below). `.test.tsx` files skipped per instructions.

Category names (Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 - Creator, MVP, Sun* Kudos) are already English in source — NOT re-translated, per instructions.

---

## app/awards/page.tsx

| file:line | current VI text (verbatim) | proposed key | proposed EN |
|---|---|---|---|
| page.tsx:12 | `Thông tin các hạng mục giải thưởng Sun* Annual Awards 2025.` | `awards.meta.description` | Information about the Sun* Annual Awards 2025 award categories. |
| page.tsx:68 | `Hệ thống giải thưởng SAA 2025` | `awards.title.heading` | SAA 2025 Awards System |

Note: page.tsx:64 (`Sun* annual awards 2025`) is already English — not listed, not translated.

## app/components/awards/awards-hero.tsx

No Vietnamese found. All rendered text (`Sun* Annual Award 2025`, alt text) is already English.

## app/components/awards/awards-nav-menu.tsx

No Vietnamese found. Nav labels are `AWARD_CATEGORIES[].title` (English, from `lib/awards/award-categories.ts`), `aria-label="Award categories"` is English.

## app/components/awards/award-detail-card.tsx

| file:line | current VI text (verbatim) | proposed key | proposed EN |
|---|---|---|---|
| award-detail-card.tsx:109 | `Số lượng giải thưởng: ` (template prefix, interpolated with `quantity`) | `awards.detail.quantityLabel` | Number of awards: |
| award-detail-card.tsx:120 | `Giá trị giải thưởng: ` (template prefix, interpolated with `value`) | `awards.detail.valueLabel` | Award value: |

Implementation note: these are template-literal prefixes (`` `Số lượng giải thưởng: ${quantity}` ``) — dictionary should hold just the label; interpolation stays in the component (e.g. `` `${t("awards.detail.quantityLabel")} ${quantity}` ``).

## app/components/awards/award-detail-data.ts — long descriptions (6 entries, 2 distinct texts)

5 of 6 awards intentionally share one verbatim paragraph (unfinished Figma copy, per file's own docstring, lines 6-14) — flagging as **shared text**, not a bug:

| award slug(s) | VI description | key | EN description |
|---|---|---|---|
| top-talent, top-project, top-project-leader, best-manager, mvp (5 awards — **share identical VI text**) | Giải thưởng Top Talent vinh danh những cá nhân xuất sắc toàn diện – những người không ngừng khẳng định năng lực chuyên môn vững vàng, hiệu suất công việc vượt trội, luôn mang lại giá trị vượt kỳ vọng, được đánh giá cao bởi khách hàng và đồng đội. Với tinh thần sẵn sàng nhận mọi nhiệm vụ tổ chức giao phó, họ luôn là nguồn cảm hứng, thúc đẩy động lực và tạo ảnh hưởng tích cực đến cả tập thể. | `awards.detail.descriptions.sharedUnfinished` | The Top Talent award honors comprehensively outstanding individuals — those who consistently demonstrate strong professional competence and outstanding performance, consistently deliver value beyond expectations, and are highly regarded by clients and teammates alike. With a readiness to take on any task the organization assigns, they are a constant source of inspiration, driving motivation and making a positive impact on the whole team. |
| signature-2025-creator (only award with distinct copy) | Giải thưởng Signature vinh danh cá nhân hoặc tập thể thể hiện tinh thần đặc trưng mà Sun* hướng tới trong từng thời kỳ. Trong năm 2025, giải thưởng Signature vinh danh Creator - cá nhân/tập thể mang tư duy chủ động và nhạy bén, luôn nhìn thấy cơ hội trong thách thức và tiên phong trong hành động. Họ là những người nhạy bén với vấn đề, nhanh chóng nhận diện và đưa ra những giải pháp thực tiễn, mang lại giá trị rõ rệt cho dự án, khách hàng hoặc tổ chức. Với tư duy kiến tạo và tinh thần "Creator" đặc trưng của Sun*, họ không chỉ phản ứng tích cực trước sự thay đổi mà còn chủ động tạo ra cải tiến, góp phần định hình chuẩn mực mới cho cách mà người Sun* tạo giá trị. | `awards.detail.descriptions.signatureCreator` | The Signature award honors individuals or teams who embody the distinctive spirit Sun* champions in each era. In 2025, the Signature award celebrates the Creator — individuals/teams with a proactive, sharp mindset who consistently spot opportunity within challenge and take the lead in action. They are quick to sense problems, swiftly identify them, and deliver practical solutions that create clear value for projects, clients, or the organization. With a builder's mindset and the distinctive "Creator" spirit of Sun*, they don't just respond positively to change — they proactively drive improvements, helping shape new standards for how Sun* people create value. |

**Reminder for implementation:** `SIGNATURE_2025_CREATOR_DESCRIPTION` still literally says "Giải thưởng Top Talent" in the shared-unfinished text even though it's reused for 5 different award categories — this is source-design behavior (unfinished Figma copy), not something to silently "fix" during translation. Preserve the mismatch as-is in both locales unless product/design explicitly signs off on writing 5 distinct paragraphs.

## app/components/awards/award-detail-data.ts — quantity / value data fields (DATA VALUES, not plain labels)

These 11 strings mix a Vietnamese unit/connector word with a number and currency code (`VNĐ`). **My call: treat as translation-as-data (one full pre-formatted string per locale per award), not a generic number/currency formatter.** Reasoning:
- Only 6 static, hand-authored award rows — cardinality too low to justify a formatting abstraction (YAGNI).
- Units are heterogeneous and non-parallel across categories (`Đơn vị`/unit, `Tập thể`/team, `Cá nhân`/individual, plus a combined `"01 (cá nhân hoặc tập thể)"` case) — a generic `formatQuantity(n, unit)` would need a bespoke pluralization/unit taxonomy for 2 locales to serve 6 rows, more complex than the data it replaces.
- `VNĐ` is a fixed prize-award amount, not a live/dynamic currency value that would benefit from `Intl.NumberFormat` — no computation happens on it anywhere in the read code.
- If this data ever becomes CMS-driven or the catalog grows past ~10-15 entries, revisit with a real number/currency formatter (e.g. next-intl's ICU `NumberFormat`) at that point — not now.

| file:line | current VI text (verbatim) | award slug | proposed key | proposed EN |
|---|---|---|---|---|
| award-detail-data.ts:41 | `10 Đơn vị` | top-talent | `awards.detail.entries.topTalent.quantity` | 10 Units |
| award-detail-data.ts:42 | `7.000.000 VNĐ cho mỗi giải thưởng` | top-talent | `awards.detail.entries.topTalent.value` | 7,000,000 VND per award |
| award-detail-data.ts:49 | `02 Tập thể` | top-project | `awards.detail.entries.topProject.quantity` | 02 Teams |
| award-detail-data.ts:50 | `15.000.000 VNĐ mỗi giải` | top-project | `awards.detail.entries.topProject.value` | 15,000,000 VND per award |
| award-detail-data.ts:57 | `03 Cá nhân` | top-project-leader | `awards.detail.entries.topProjectLeader.quantity` | 03 Individuals |
| award-detail-data.ts:58 | `7.000.000 VNĐ` | top-project-leader | `awards.detail.entries.topProjectLeader.value` | 7,000,000 VND |
| award-detail-data.ts:65 | `01 Cá nhân` | best-manager | `awards.detail.entries.bestManager.quantity` | 01 Individual |
| award-detail-data.ts:66 | `10.000.000 VNĐ` | best-manager | `awards.detail.entries.bestManager.value` | 10,000,000 VND |
| award-detail-data.ts:73 | `01 (cá nhân hoặc tập thể)` | signature-2025-creator | `awards.detail.entries.signatureCreator.quantity` | 01 (individual or team) |
| award-detail-data.ts:74 | `5.000.000 VNĐ (cá nhân) HOẶC 8.000.000 VNĐ (tập thể)` | signature-2025-creator | `awards.detail.entries.signatureCreator.value` | 5,000,000 VND (individual) OR 8,000,000 VND (team) |
| award-detail-data.ts:82 | `15.000.000 VNĐ` | mvp | `awards.detail.entries.mvp.value` | 15,000,000 VND |

`award-detail-data.ts:81` — `quantity: "01"` for MVP has **no Vietnamese content** (bare numeral) — not a translation target, listed for completeness only; no key needed unless the team wants symmetry with the other 5 quantity keys (optional).

Secondary formatting note (not blocking): source uses VI thousand-separator convention (`7.000.000`) — EN convention above uses commas (`7,000,000`). Since this is translation-as-data (full string per locale), this is a one-time authoring choice baked into the EN dictionary value, not a runtime formatting concern.

## app/components/awards/awards-catalog.tsx

No Vietnamese found — client wrapper, no rendered copy of its own (only comments).

---

## Summary table (counts)

| Source | Count |
|---|---|
| page.tsx | 2 |
| award-detail-card.tsx (labels) | 2 |
| award-detail-data.ts (long descriptions) | 2 unique texts (6 entries, 5 share 1 text) |
| award-detail-data.ts (quantity/value data) | 11 (10 with VI content + 1 bare numeral with none) |
| **Total distinct VI strings needing dictionary entries** | **17** (2 + 2 + 2 + 11, excluding the bare-numeral non-string) |

## Unresolved questions
1. Should `SIGNATURE_2025_CREATOR_DESCRIPTION`'s EN copy be reviewed by whoever owns the Figma/product copy, given it's the only award with real (non-placeholder) narrative — mistranslation risk is highest here.
2. Confirm whether EN quantity/value strings should follow the VI-style dot thousands-separator or standard EN comma — this report assumes comma; flag if design wants literal number reuse.
3. Confirm whether the 5-way shared "Top Talent" paragraph should eventually get distinct per-category EN copy once product finishes VI originals, or whether EN should always exactly mirror whatever VI does (recommend mirroring, to avoid EN/VI drift).

**Status:** DONE
**Summary:** Cataloged 17 distinct Vietnamese strings across 4 files in the awards screen (2 in page.tsx, 2 label prefixes in award-detail-card.tsx, 2 unique long descriptions covering 6 award entries, and 10 VI-bearing quantity/value data fields in award-detail-data.ts); recommended translation-as-data over a formatter for the quantity/value fields given YAGNI and low, static cardinality.
