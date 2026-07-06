# Phase 05 — Composition (`awards-catalog` + `page.tsx`)

## Context Links
- Spec: FR-1..FR-3, FR-14, FR-15, section 1 (page order)
- Depends: Phase 01 (hook), 02 (card+data), 03 (nav), 04 (hero)
- Pattern refs: `app/page.tsx` (SiteHeader/main/SiteFooter composition, requireUser, metadata, Montserrat `.variable` scoping), `app/awards/page.tsx` (current placeholder — being replaced)
- Test to UPDATE: `tests/unit/awards-page.test.tsx`

## Overview
- **Priority:** P2 · **Status:** done
- Integration phase. Build the client catalog wrapper that owns the scroll-spy
  hook and wires nav ↔ 6 card sections; rewrite `page.tsx` to compose the full
  screen. **This is the only phase touching multiple prior outputs + page.tsx.**

## Key Insights
- **Layout correction:** `app/layout.tsx` renders only html/body — header/footer
  are NOT global. `page.tsx` MUST render `SiteHeader` + `SiteFooter` itself
  (mirroring `app/page.tsx`). (Task's "footer from layout" note is wrong here.)
- `page.tsx` stays a server component (`requireUser()` + `metadata`). The
  interactive nav+cards block is delegated to a client `awards-catalog.tsx`.
- Scroll-spy observes the `<section id={slug}>` elements that the CATALOG renders
  → catalog must own both the sections and the nav (so activeSlug flows nav-ward).
- `<section id={slug}>` + `scroll-mt-24` makes hash-anchor from Homepage
  (`/awards#<slug>`) land correctly under the sticky header (FR-14).

## Requirements
- **Functional:** `page.tsx` guards with `requireUser()` (keep), keeps `metadata`. Composition order (spec §1): SiteHeader → hero mini → title section → catalog(nav + 6 cards) → SunKudosSection → SiteFooter. Catalog: `use-scroll-spy(slugs)` → pass `activeSlug` to `<AwardsNavMenu>`; render 6 `<section id={slug} scroll-mt-24>` each wrapping `<AwardDetailCard>` in `AWARD_CATEGORIES` order. Reuse `SunKudosSection` unmodified as its own section before footer (FR-15).
- **Non-functional:** files <200 lines; two-column desktop (nav left sticky, cards right), stack on tablet/mobile (FR NFR responsive); Montserrat `.variable` applied at page root so scoped-font sections resolve; `scroll-smooth` on the scroll context.

## Architecture
```
page.tsx (server)
 ├─ requireUser()  +  export metadata
 └─ <div montserrat.variable ...>
      SiteHeader
      <main>
        <AwardsHero/>                 (Phase 04)
        <TitleSection/>               (inline: caption + gold heading, FR-5)
        <AwardsCatalog/>              (client, Phase 05)
        <SunKudosSection/>            (reused as-is, FR-15)
      SiteFooter
```
`awards-catalog.tsx` (client):
```
activeSlug = useScrollSpy(AWARD_CATEGORIES.map(c=>c.slug))
<div flex-col lg:flex-row>
  <AwardsNavMenu items={AWARD_CATEGORIES} activeSlug={activeSlug}/>   // left, sticky
  <div> {AWARD_CATEGORIES.map((c,i)=>
     <section id={c.slug} scroll-mt-24>
       <AwardDetailCard {...AWARD_DETAILS[i]}/>
     </section>)} </div>
</div>
```
Data flow: `award-detail-data` + `AWARD_CATEGORIES` → catalog renders sections → scroll-spy observes sections → activeSlug → nav highlight.

## Related Code Files
- **Create:** `app/components/awards/awards-catalog.tsx` (`"use client"`)
- **Rewrite:** `app/awards/page.tsx` (keep `requireUser()` + `metadata`)
- **Update:** `tests/unit/awards-page.test.tsx` (see below)
- **Reuse (import, do NOT edit):** `SiteHeader`, `SiteFooter`, `SunKudosSection`, `AwardsHero`, `AwardsNavMenu`, `AwardDetailCard`, `award-detail-data`, `useScrollSpy`, `AWARD_CATEGORIES`
- **Font:** `app/login/fonts.ts` (`montserrat`, `montserratAlternates`) — reuse like `app/page.tsx`

## Implementation Steps
1. `awards-catalog.tsx`: `"use client"`; call `useScrollSpy`; render two-column nav+sections as above; sticky nav on `lg`.
2. Rewrite `page.tsx`: async, `await requireUser()`, keep/adjust `metadata`; render SiteHeader + main(hero, inline title, catalog, SunKudosSection) + SiteFooter; wrap in `montserrat.variable` root like homepage.
3. Inline title section (FR-5): caption "Sun* annual awards 2025" + gold `<h1>`/`<h2>` "Hệ thống giải thưởng SAA 2025".
4. Ensure `scroll-mt` offset + `scroll-smooth` so anchors clear the sticky header.
5. **Update `tests/unit/awards-page.test.tsx`:** the old test asserts placeholder headings named exactly `category.title` — breaks because card titles differ (e.g. MVP → "MVP (Most Valuable Person)") and page now includes header/footer/hero. Mock `next/font/google` (see `app/page.test.tsx`), keep the `requireUser` guard assertion, assert 6 `<section id={slug}>` present in order + SunKudos section present. Do not assert against `category.title` for the MVP mismatch.

## Todo List
- [x] `awards-catalog.tsx` (client, owns scroll-spy)
- [x] Rewrite `page.tsx` (server, header+footer+composition, requireUser+metadata)
- [x] Inline title section (FR-5)
- [x] `scroll-mt` + `scroll-smooth` wiring for hash-anchor + click scroll
- [x] Update `tests/unit/awards-page.test.tsx` (mock fonts, guard, 6 sections by id, kudos present)
- [x] `npx tsc --noEmit` + `npm run build` (or `next build`) to catch compile/RSC-boundary errors
- [x] vitest run for awards-page test

## Success Criteria
- `/awards` renders header, hero, title, nav + 6 detail cards (correct order/ids), Sun* Kudos, footer — authenticated.
- Scroll updates active nav item; clicking a nav item scrolls to its section.
- `requireUser()` still guards; metadata intact. Build passes (no RSC client-boundary error).

## Risk Assessment
- **RSC boundary (HIGH / Med):** server `page.tsx` importing a `"use client"` catalog is fine, but the catalog importing server-only card is fine too (card is presentational). Ensure NO server-only API leaks into client tree. **Countermove:** keep `useScrollSpy`, catalog, nav as client; card/hero pure presentational (safe in either tree); `next build` in todo catches violations early.
- **Existing unit test regression (HIGH / High):** covered by step 5 — MUST update the test in the same phase, not leave it red.
- **Sticky header overlap on anchor jump (Med/Med):** `scroll-mt-24` on each section (header `min-h-20`). Verify in E2E (Phase 06).
- **Rollback:** revert is a single-file restore of `app/awards/page.tsx` to the placeholder + delete new `app/components/awards/*` — no data migration, no shared-state coupling. Homepage links keep working (slugs unchanged).

## Security Considerations
- `requireUser()` retained (defense-in-depth alongside `proxy.ts` P01). Do NOT touch `proxy.ts`. No new data exposure — all content static.

## Next Steps
- Phase 06 E2E validates nav/scroll/anchor/kudos behaviors end-to-end.
</content>
