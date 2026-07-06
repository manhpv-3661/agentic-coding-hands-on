# Phase 01 — Dictionary module (`lib/i18n/`)

## Context Links
- Spec: `spec/i18n-translation/feature.md` FR-1..FR-3
- Decisions: `clarifications.md`
- String source-of-truth (values, VERBATIM — do NOT re-derive): all 4 reports in `reports/`
- Next 16 async-cookies pattern to mirror: `lib/supabase/server.ts`

## Overview
- **Priority:** P1 (foundation — every other phase imports from here)
- **Status:** done
- **Description:** Create the self-written dictionary + server locale read. No dependency.

## Key Insights
- `cookies()` is ALWAYS async in this Next 16 build (see `lib/supabase/server.ts`). `getLocale()`
  must `await cookies()`.
- Type parity is compile-time enforced: `vi.ts` is the source shape, `en.ts` is checked against it.
- `getDictionary()` is a pure sync map — no I/O. Locale resolution is the only async step.
- Every string VALUE comes verbatim from the reports. This phase types the SHAPE and pastes values.

## Requirements
- FR-1: `dictionaries/vi.ts` + `en.ts`, nested namespaces (`shared`, `login`, `homepage`,
  `prelaunch`, `awards`), strongly typed so `en` must match `vi`'s shape at compile time.
- FR-2: `get-locale.ts` — `async getLocale(): Promise<Locale>`, reads `NEXT_LOCALE`, validates
  `"vi"|"en"`, defaults `"vi"`.
- FR-3: `get-dictionary.ts` — `getDictionary(locale): Dictionary` returns the right object.

## Architecture
```
lib/i18n/
├── locale.ts            # export type Locale = "vi" | "en"; const LOCALES, DEFAULT_LOCALE, isLocale()
├── get-locale.ts        # "server-only"; await cookies(); read NEXT_LOCALE; isLocale() ? : DEFAULT
├── get-dictionary.ts    # getDictionary(locale) => locale === "en" ? en : vi
├── dictionary.ts        # export type Dictionary = typeof vi   (vi is the canonical shape)
└── dictionaries/
    ├── vi.ts            # export const vi = { ... } as const  (canonical shape + VI values)
    └── en.ts            # export const en = { ... } satisfies Dictionary   (EN values, shape-checked)
```
Data flow: `page.tsx` → `getLocale()` → `getDictionary(locale)` → `Dictionary` object → props.
`Dictionary = typeof vi` means any key present in `vi` but missing/mistyped in `en` is a compile
error on the `satisfies Dictionary` line. (Keep `vi` as `as const` only if it does not over-narrow
string values — if `satisfies` complains about literal types, type each namespace as `Record`-free
plain object and drop `as const`; the goal is key-parity, not literal-union parity.)

## Dictionary key tree (SHAPE — fill VALUES from the reports)
```
shared:
  nav: { aboutSaa, awardInfo, kudos }          # "About SAA 2025"/"Award Information"/"Sun* Kudos" → VI
  footer: { copyright, generalStandards }       # DRY: copyright reused by login-footer + site-footer
  account: { profile, signOut }                 # "Profile"/"Sign out" → VI
  notifications: { empty }                       # "Chưa có thông báo"
  widget: { comingSoon }                         # "Sắp ra mắt"
  countdown: { days, hours, minutes }            # NGÀY/GIỜ/PHÚT ↔ DAYS/HOURS/MINUTES (SHARED, see plan)
  detailsCta                                     # "Chi tiết"/"Details" (award-card + sun-kudos)
login:
  meta: { title, description }
  error: { oauthFailed, notConfigured }          # DRY: oauthFailed reused by page + login-button-container
  hero: { subtitle }                             # 2-line "\n" string
  button: { loading, google }                    # "Đang đăng nhập..." / "Login with Google" (normalize casing)
homepage:
  hero:
    eventInfo: { timeLabel, venueLabel, livestreamNote }
    eventDate                                    # data-value: VI "26/12/2025" / EN "December 26, 2025"
    comingSoon                                   # fix typo → "Coming soon" / "Sắp diễn ra"
    cta: { aboutAwards, aboutKudos }
  rootFurther: { paragraph1, pullQuote, paragraph2 }   # pullQuote: EN drops the VI back-translation parens
  awards:
    heading                                      # "Hệ thống giải thưởng" / "Award System"
    items: { topTalent, topProject, topProjectLeader, bestManager, signatureCreator, mvp }
                                                 # each = { description }; bestManager/signatureCreator/mvp
                                                 # share ONE identical VI text + ONE identical EN text
  kudos: { eyebrow, description }                # sun-kudos-section.tsx — ADDED post-Phase-01 (was
                                                 # missing from the original tree; "tháng 11/2025" /
                                                 # "November 2025" stays literal inside the paragraph)
prelaunch:
  meta: { title, description }                   # description VI is newly authored (see report)
  countdown: { heading }                          # "Sự kiện sẽ bắt đầu sau" (labels come from shared.countdown)
awards:
  meta: { description }
  title: { heading }                              # "Hệ thống giải thưởng SAA 2025"
  detail:
    quantityLabel, valueLabel                     # "Số lượng giải thưởng: " / "Giá trị giải thưởng: "
    descriptions: { sharedUnfinished, signatureCreator }
    entries:                                      # translation-as-data, one full string per locale
      topTalent: { quantity, value }
      topProject: { quantity, value }
      topProjectLeader: { quantity, value }
      bestManager: { quantity, value }
      signatureCreator: { quantity, value }
      mvp: { quantity, value }                    # mvp.quantity = "01" (bare numeral, same both locales)
```
NOT in dict (exclusions, per clarifications): brand/proper nouns (Sun*, SAA, Kudos), award category
names (Top Talent…), eyebrow "Sun* annual awards 2025", venue "Âu Cơ Art Center", stylized
wordmark alts (Root/Further), aria-labels. Locale selector's own labels (VN/EN/Tiếng Việt/English)
stay in `language-selector.tsx`'s maps — NOT this dict (circular).

## Related Code Files
- **Create:** `lib/i18n/locale.ts`, `get-locale.ts`, `get-dictionary.ts`, `dictionary.ts`,
  `dictionaries/vi.ts`, `dictionaries/en.ts`
- **Read for context:** `lib/supabase/server.ts` (async cookies pattern)
- **Delete:** none

## Implementation Steps
1. `locale.ts`: `Locale`, `LOCALES = ["vi","en"] as const`, `DEFAULT_LOCALE = "vi"`, `isLocale(x): x is Locale`.
2. `dictionaries/vi.ts`: build the full tree above, values = VI columns from the 4 reports (verbatim,
   including the long Root-Further paragraphs and the awards descriptions — copy exactly, do not edit).
3. `dictionary.ts`: `export type Dictionary = typeof vi;`
4. `dictionaries/en.ts`: `export const en = { ...same shape... } satisfies Dictionary;` values = EN
   columns from reports. Apply: pull-quote EN drops the VI parenthetical; number separators use commas
   for EN (`7,000,000 VND`) vs dots for VI; the 3 homepage + 5 awards shared-placeholder descriptions
   each use ONE shared EN string mirroring the VI duplication.
5. `get-locale.ts`: `import "server-only"` (if available) or a top comment "server-only"; `const store
   = await cookies(); const raw = store.get("NEXT_LOCALE")?.value; return isLocale(raw) ? raw : DEFAULT_LOCALE;`
6. `get-dictionary.ts`: `return locale === "en" ? en : vi;`
7. Keep each file < 200 lines. If `vi.ts`/`en.ts` exceed 200 lines (long paragraphs likely push
   `vi.ts` over), split the biggest namespaces into `dictionaries/vi/*.ts` sub-files re-exported by a
   barrel — but only if actually over the limit (YAGNI first).
8. `npx tsc --noEmit` (or the project's typecheck script) — MUST pass; the `satisfies` line proves parity.

## Todo List
- [x] `locale.ts` with `Locale`, `LOCALES`, `DEFAULT_LOCALE`, `isLocale`
- [x] `dictionaries/vi.ts` — full tree, VI values verbatim from reports
- [x] `dictionary.ts` — `Dictionary = typeof vi`
- [x] `dictionaries/en.ts` — `satisfies Dictionary`, EN values from reports
- [x] `get-locale.ts` — async, await cookies, validate, default vi
- [x] `get-dictionary.ts` — locale → object
- [x] typecheck passes; split files only if >200 lines

## Success Criteria
- `getDictionary("en").shared.detailsCta === "Details"`, `getDictionary("vi") ...=== "Chi tiết"`.
- Removing/mistyping any `en` key fails `tsc --noEmit` (parity guard works).
- `getLocale()` returns `"vi"` when cookie missing/garbage, `"en"` only when cookie is exactly `"en"`.
- Every key in the tree above exists; every string value traces to a report row.

## Risk Assessment
- **`as const` over-narrowing `satisfies`** (Med/Low): if literal types fight `satisfies`, drop
  `as const` on `vi` — key-parity is the goal. Countermove: type explicitly if needed.
- **File > 200 lines** (Med/Low): long paragraphs. Countermove: namespace sub-files + barrel.
- **Wrong string copied** (Low/High): mistranslation. Countermove: values are verbatim report rows;
  reviewer diff-checks against report tables.

## Security Considerations
- `getLocale()` validates the cookie against `isLocale()` — no unvalidated cookie value ever indexes
  the dictionary (prevents undefined lookups / prototype access from a tampered cookie).

## Next Steps
- Unblocks Phase 02 (needs `Locale`, `Dictionary`) and Phase 06 (needs dict + getLocale).
