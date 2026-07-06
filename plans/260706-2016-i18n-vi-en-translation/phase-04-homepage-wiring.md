# Phase 04 — Homepage wiring (`/`)

## Context Links
- Spec: FR-4, FR-9
- Strings: `reports/researcher-260706-catalog-homepage.md` (13 keys + 7 bonus)
- Depends on: Phase 01 (dict), Phase 02 (SiteHeader/SiteFooter/SunKudos prop contract)

## Overview
- **Priority:** P2
- **Status:** done
- **Description:** Wire `app/page.tsx` to read locale/dict and thread props to the shared shell
  (already prop-ready from Phase 02) AND to the homepage-only body components it owns.

## Key Insights
- `hero-section.tsx` (Server) renders `CountdownTimer` (Client), `EventInfo` (Server), `HeroCtaButtons`
  (Server) → all get dict props from hero-section.
- `countdown-timer.tsx` (Client) hardcodes `DAYS/HOURS/MINUTES` + `Comming soon` → labels come from
  `shared.countdown.*`, comingSoon from `homepage.hero.comingSoon` (typo fixed in dict).
- `awards-section.tsx` (Server) renders 6 `<AwardCard>` — descriptions from `homepage.awards.items.*`;
  `award-card.tsx` renders `detailsCta`. Both homepage-OWNED here.
- `widget-button.tsx` (Client) is homepage-only → owned here, gets `shared.widget.comingSoon`.
- `sun-kudos-section.tsx` is Phase 02 shell; page passes `homepage.kudos` + `shared.detailsCta`.
- Venue `Âu Cơ Art Center` stays hardcoded (proper noun); event date `26/12/2025` = `homepage.hero.eventDate`.

## Requirements
- FR-4: page reads locale/dict, threads slices.
- FR-9: 13 + 7 keys rendered; 3 duplicate award descriptions share one key (per Phase 01 dict).

## Architecture — prop flow
```
page.tsx (Server): locale = await getLocale(); d = getDictionary(locale)
  → SiteHeader   locale={locale} nav={d.shared.nav} account={d.shared.account}
                 notifications={d.shared.notifications}
  → HeroSection  hero={d.homepage.hero} countdown={d.shared.countdown}
       → CountdownTimer  labels={countdown} comingSoon={hero.comingSoon}
       → EventInfo       {timeLabel, venueLabel, livestreamNote, eventDate}   (venue name literal)
       → HeroCtaButtons  {aboutAwards, aboutKudos}
  → RootFurtherContent  content={d.homepage.rootFurther}   (paragraph1, pullQuote, paragraph2)
  → AwardsSection  awards={d.homepage.awards} detailsCta={d.shared.detailsCta}
       → AwardCard  description={...} detailsCta={detailsCta}
  → SunKudosSection  kudos={d.homepage.kudos} detailsCta={d.shared.detailsCta}   (shell, Phase 02)
  → WidgetButton  comingSoon={d.shared.widget.comingSoon}
  → SiteFooter  nav={d.shared.nav} footer={d.shared.footer}
```

## Related Code Files
- **Modify (OWNED):** `app/page.tsx`, `app/components/home/hero-section.tsx`, `countdown-timer.tsx`,
  `event-info.tsx`, `hero-cta-buttons.tsx`, `root-further-content.tsx`, `awards-section.tsx`,
  `award-card.tsx`, `widget-button.tsx`
- **Read for context:** Phase 01 exports; Phase 02 SiteHeader/SiteFooter/SunKudos prop contract
- **NOT owned:** site-header/footer/sun-kudos (Phase 02); nav-link (no change)

## Implementation Steps
1. `page.tsx`: `getLocale`/`getDictionary`; add `generateMetadata()` (or keep static if metadata stays
   EN-only — spec says homepage metadata is already English; convert to generateMetadata for parity,
   optional but recommended); pass all props above.
2. `hero-section.tsx`: accept `hero` + `countdown`; forward to the three children.
3. `countdown-timer.tsx`: accept `labels: dict.shared.countdown` + `comingSoon`; replace the three
   `label="DAYS|HOURS|MINUTES"` and the `Comming soon` literal. Keep `useEventCountdown` logic intact.
4. `event-info.tsx`: accept `{timeLabel, venueLabel, livestreamNote, eventDate}`; replace the VI
   labels + `26/12/2025`; leave `Âu Cơ Art Center` hardcoded (add a code comment: proper noun).
5. `hero-cta-buttons.tsx`: accept `{aboutAwards, aboutKudos}`; replace `ABOUT AWARDS`/`ABOUT KUDOS`.
6. `root-further-content.tsx`: accept `content`; replace the two long paragraphs + pull-quote. VI shows
   quote + parenthetical; EN shows quote only (value already differs per locale in dict — component
   just renders `content.pullQuote`).
7. `awards-section.tsx`: accept `awards` + `detailsCta`; map the 6 descriptions from
   `awards.items.<slug>.description`, keep the English `titleAlt` category names hardcoded; pass
   `detailsCta` to each `<AwardCard>`.
8. `award-card.tsx`: accept `detailsCta` prop; replace `Chi tiết`.
9. `widget-button.tsx`: accept `comingSoon` prop; replace `Sắp ra mắt`.
10. Typecheck.

## Todo List
- [x] page.tsx: locale/dict + thread props to shell + body
- [x] hero-section: hero + countdown props to children
- [x] countdown-timer: labels + comingSoon props (keep hook logic)
- [x] event-info: labels + eventDate props (venue stays literal)
- [x] hero-cta-buttons: cta labels
- [x] root-further-content: paragraphs + pullQuote
- [x] awards-section: 6 descriptions + detailsCta
- [x] award-card: detailsCta prop
- [x] widget-button: comingSoon prop

## Success Criteria
- Homepage renders full EN on first server paint with `NEXT_LOCALE=en`; VI otherwise. No FOUC.
- The 3 placeholder award descriptions render one shared string per locale (mirror preserved).
- Countdown labels read NGÀY/GIỜ/PHÚT (VI) / DAYS/HOURS/MINUTES (EN) — same key set Prelaunch uses.

## Risk Assessment
- **Long-paragraph copy errors** (Med/High): pull-quote + Root-Further paragraphs are long. Countermove:
  values live in Phase 01 dict verbatim from report; this phase only references keys — no re-typing.
- **Award slug ↔ dict key mismatch** (Med/Med): `homepage.awards.items.*` keys must map to the 6 cards.
  Countermove: reviewer cross-checks against `awards-section.tsx` order; Phase 07 spot-test.
- **`countdown-timer` is Client** (Low/Low): props are serializable strings — safe.

## Security Considerations
- None beyond Phase 01 locale validation. All content is public post-auth (route already gated by
  `requireUser()` + `proxy.ts`).

## Next Steps
- Parallel with Phases 03/05/06 (disjoint files). Feeds Phases 07/08.
