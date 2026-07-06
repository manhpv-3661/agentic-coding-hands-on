# Phase 05 — Awards wiring (`/awards`)

## Context Links
- Spec: FR-4, FR-11
- Strings: `reports/researcher-260706-catalog-awards.md` (17 keys, translation-as-data)
- Depends on: Phase 01 (dict), Phase 02 (SiteHeader/SiteFooter/SunKudos prop contract)

## Overview
- **Priority:** P2
- **Status:** done
- **Description:** Wire `app/awards/page.tsx` to read locale/dict, thread props to the shared shell,
  and convert the static `award-detail-data.ts` const into a locale-aware factory.

## Key Insights
- `award-detail-data.ts` currently exports a module-level const `AWARD_DETAIL_ENTRIES` with VI strings
  baked in → must become `buildAwardDetailEntries(detail: dict.awards.detail): AwardDetailEntry[]` so
  description/quantity/value come from the dict per locale. Category `title` values stay hardcoded
  English (Top Talent…) — NOT translated. Order/slugs still match `AWARD_CATEGORIES`.
- `awards-catalog.tsx` (Client) imports the const today → change to accept an `entries` prop (built by
  the Server page) + a `detail` slice for the card labels. Keeps scroll-spy logic untouched.
- `award-detail-card.tsx` (Server) renders `Số lượng giải thưởng: `/`Giá trị giải thưởng: ` prefixes →
  accept `quantityLabel`/`valueLabel` props.
- Descriptions: 5 awards share `awards.detail.descriptions.sharedUnfinished`, signature-2025-creator
  uses `.signatureCreator` — mirror preserved both locales (Phase 01 dict already encodes this).
- Inline title section in `page.tsx`: `Hệ thống giải thưởng SAA 2025` → `awards.title.heading`; eyebrow
  `Sun* annual awards 2025` stays hardcoded (brand+year, excluded).
- Quantity/value = translation-as-data: full pre-formatted string per locale (VI dots, EN commas).

## Requirements
- FR-4: page reads locale/dict, threads slices.
- FR-11: 17 keys rendered; 2 descriptions (shared + signature) + 10 quantity/value data strings + 2
  labels + heading + meta.

## Architecture — prop flow
```
awards/page.tsx (Server): locale = await getLocale(); d = getDictionary(locale)
  generateMetadata() → d.awards.meta.description (title stays as-is or keyed)
  entries = buildAwardDetailEntries(d.awards.detail)
  → SiteHeader / SiteFooter   (same shell props as homepage)
  inline title heading = d.awards.title.heading
  → AwardsCatalog  entries={entries} quantityLabel={d.awards.detail.quantityLabel}
                   valueLabel={d.awards.detail.valueLabel}
       → AwardDetailCard  {...entry} quantityLabel valueLabel
  → SunKudosSection  kudos={d.homepage.kudos} detailsCta={d.shared.detailsCta}   (shell, Phase 02)
```

## Related Code Files
- **Modify (OWNED):** `app/awards/page.tsx`, `app/components/awards/award-detail-data.ts`,
  `awards-catalog.tsx`, `award-detail-card.tsx`
- **Read for context:** `lib/awards/award-categories.ts` (slugs — DO NOT rename), Phase 01 dict,
  Phase 02 shell contract
- **No change (no strings):** `awards-hero.tsx`, `awards-nav-menu.tsx`
- **NOT owned:** site-header/footer/sun-kudos (Phase 02)

## Implementation Steps
1. `award-detail-data.ts`: replace `AWARD_DETAIL_ENTRIES` const + `SHARED_UNFINISHED_DESCRIPTION` /
   `SIGNATURE_2025_CREATOR_DESCRIPTION` literals with
   `export function buildAwardDetailEntries(detail): AwardDetailEntry[]` that reads
   `detail.descriptions.sharedUnfinished` / `.signatureCreator` and `detail.entries.<slug>.{quantity,value}`.
   Keep the hardcoded English `title` per entry + `AWARD_CATEGORIES` slug/order.
2. `awards-catalog.tsx`: accept `entries` + `quantityLabel` + `valueLabel` props (drop the
   `AWARD_DETAIL_ENTRIES` import); pass labels into each `<AwardDetailCard>`. Keep `CATEGORY_SLUGS`
   scroll-spy from `AWARD_CATEGORIES` unchanged.
3. `award-detail-card.tsx`: accept `quantityLabel`/`valueLabel`; replace the two VI prefixes; keep the
   `${label} ${value}` interpolation in the component.
4. `awards/page.tsx`: `getLocale`/`getDictionary`; `generateMetadata()` → `d.awards.meta.description`;
   build entries; replace inline heading; pass props to catalog + shell + kudos.
5. Typecheck. Confirm `award-detail-card.test.tsx` order assertion still holds (factory preserves order).

## Todo List
- [x] award-detail-data.ts: const → buildAwardDetailEntries(detail) factory
- [x] awards-catalog.tsx: entries + label props (drop const import)
- [x] award-detail-card.tsx: quantityLabel/valueLabel props
- [x] awards/page.tsx: locale/dict + generateMetadata + heading + thread props

## Success Criteria
- `/awards` renders full EN on first server paint with `NEXT_LOCALE=en`; VI otherwise.
- Quantity/value strings show EN comma separators (`7,000,000 VND`) / VI dots (`7.000.000 VNĐ`).
- 5 awards share one description string per locale; signature-2025-creator distinct.
- Catalog order still matches `AWARD_CATEGORIES` (existing test green).

## Risk Assessment
- **Existing awards tests break** (Med/Med): `award-detail-card.test.tsx` / `awards-catalog.test.tsx`
  import the old const. Countermove: Phase 07 updates those tests to the factory; flag to tester.
- **Factory signature drift** (Low/Med): `AwardDetailEntry` type unchanged (still `AwardDetailCardProps`).
  Countermove: keep the exported type; only the construction moves into the function.
- **Slug/dict-key mismatch** (Med/High): `detail.entries.<slug>` keys must match the 6 slugs.
  Countermove: reviewer cross-checks against `AWARD_CATEGORIES`.

## Security Considerations
- None new. Route gated by `requireUser()` + `proxy.ts`. `award-categories.ts` slugs untouched (constraint).

## Next Steps
- Parallel with Phases 03/04/06 (disjoint files). Feeds Phases 07/08.
