# F003 Prelaunch Countdown (`/prelaunch`) — VI String Catalog

Skill activation: none applicable (pure codebase catalog task, not tech-comparison research or doc lookup) — used Read/Grep directly per fallback rule.

Files read: `app/prelaunch/page.tsx`, `app/prelaunch/prelaunch-countdown-client.tsx`,
`app/prelaunch/components/prelaunch-content.tsx`, `app/prelaunch/components/countdown-led-unit.tsx`,
`app/prelaunch/components/prelaunch-background.tsx`. (`.test.tsx` skipped per instructions;
no test files exist under `app/prelaunch/` anyway.)

## ⚠️ Prior decision on this exact scope — surfacing for spec-authoring

`app/prelaunch/components/prelaunch-content.tsx:15-16` doc comment, verbatim:

> "Title text is static Vietnamese, not translated by `NEXT_LOCALE` — same precedent as
> F001/F002 (see clarifications.md, F003 session 2026-07-06)."

Traced to source decision, `plans/260706-1543-countdown-prelaunch/clarifications.md:7`, verbatim (VI):

> "Q: Spec item 0.2 ghi cả bản VI "Sự kiện sẽ bắt đầu sau" và EN "Event starts in" — có cần i18n
> thật không? → A: Không. Giữ tiền lệ F001/F002: text tiếng Việt tĩnh, cookie NEXT_LOCALE không
> dịch nội dung. Bản EN trong spec CSV chỉ là tài liệu tham khảo thiết kế."
> (No. Keep F001/F002 precedent: static Vietnamese text, the `NEXT_LOCALE` cookie does not
> translate content. The EN version in the spec CSV is design-reference documentation only.)

And the root precedent, `plans/260706-0858-homepage-saa/clarifications.md:7` (VI):

> "Q: TC ID-25/26 kỳ vọng đổi ngôn ngữ dịch giao diện — scope i18n? → A: Giữ tiền lệ F001:
> language-selector chỉ toggle cookie NEXT_LOCALE + label, không dịch nội dung. **Full i18n là
> hạng mục riêng (màn 12).**"
> (Full i18n is explicitly deferred as a separate item — "screen 12".)

**Read on this:** the F001–F003 decision to not translate was explicit and intentional, not an
oversight — but it was explicitly scoped as *deferred*, not *rejected*. This current i18n
initiative appears to be that deferred item finally landing. Spec-authoring should treat this as
confirmation that F003's copy was always intended to eventually enter the dictionary, not as a
"prior design intent" that a new spec would be overriding against product will. Recommend the
new spec close the loop by referencing these two clarification entries as superseded.

## String catalog

| file:line | current VI text (verbatim) | proposed dictionary key | proposed EN translation |
|---|---|---|---|
| `app/prelaunch/page.tsx:9` | `Sự kiện sắp bắt đầu — Sun* Annual Awards 2025` (metadata title, browser tab / SEO) | `prelaunch.meta.title` | Event Starting Soon — Sun* Annual Awards 2025 |
| `app/prelaunch/components/prelaunch-content.tsx:33` | `Sự kiện sẽ bắt đầu sau` (main heading above countdown) | `prelaunch.countdown.heading` | The event will begin in |

Total real Vietnamese user-facing strings on this screen: **2**. This is a small, single-purpose
gate screen — heading + tab title are the only VI copy; everything else is either non-textual
(background image/gradient, `alt=""`) or already English literals (see below).

## Flags for spec-authoring (not VI strings, but bear on this screen's i18n scope)

1. **`app/prelaunch/page.tsx:10` — metadata description is hardcoded English already**, not
   Vietnamese: `"Countdown - Prelaunch page — Sun* Annual Awards 2025."` It has no VI counterpart
   at all today (asymmetric — title is VI, description is EN). If this goes into the dictionary,
   it needs a companion VI value invented (none exists to extract), e.g. proposed key
   `prelaunch.meta.description` — VI: `Đếm ngược - Trang chờ sự kiện — Sun* Annual Awards 2025.`
   EN: keep current text as-is (already professional register).

2. **`DAYS` / `HOURS` / `MINUTES` labels** — hardcoded English literals passed as props in
   `prelaunch-content.tsx:40,42,44` into `CountdownLedUnit`. Currently shown as-is regardless of
   locale (i.e., VI-locale users today see the English word "DAYS", not a Vietnamese label). This
   is a genuine i18n gap the F003 non-translation decision didn't address (labels weren't VI to
   begin with, so they were never in scope of "don't translate VI text"). Recommend adding to
   dictionary now that real i18n is being built: `prelaunch.countdown.days` / `.hours` / `.minutes`
   — VI: `NGÀY` / `GIỜ` / `PHÚT`, EN: `DAYS` / `HOURS` / `MINUTES`. Flagging as a decision point,
   not assuming it's in scope.

## Data VALUE vs UI copy (needs format/locale handling, not dictionary lookup)

- `days` / `hours` / `minutes` props (`page.tsx:34`, `prelaunch-countdown-client.tsx:19`,
  `countdown-led-unit.tsx` digit render) — these are computed 2-digit zero-padded numeric strings
  from `useEventCountdown()` / the SSR fallback `"00"`. Pure numeric values, no VI/EN wording
  inside them. Not a dictionary candidate — if locale-sensitive number formatting is ever wanted
  (unlikely for 2-digit zero-padded counters), that's a `Intl.NumberFormat` concern, not i18n
  dictionary. No action needed for this screen's countdown digits themselves.
- No dates/timestamps are rendered as user-facing text on this screen (only the raw digit
  countdown) — the underlying `NEXT_PUBLIC_EVENT_START_AT` env value never surfaces as visible
  text here, so there's no locale-date-format concern on `/prelaunch` specifically.

## Unresolved questions

1. Should `prelaunch.meta.description` (currently English-only, no VI text ever existed) be
   brought into the dictionary now, or left as a pre-existing gap outside this i18n pass' scope?
2. Should `DAYS`/`HOURS`/`MINUTES` unit labels get real VI translations (`NGÀY`/`GIỜ`/`PHÚT`), or
   is keeping them as fixed English abbreviations (common in LED/digital-clock UI conventions)
   the intended design regardless of locale? This decision also applies to the homepage countdown
   (`app/components/home/countdown-timer.tsx`), which shares the same label pattern — worth
   deciding once, consistently, across both screens.
