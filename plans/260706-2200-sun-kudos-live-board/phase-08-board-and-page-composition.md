---
feature: F006
phase: 08
title: Kudos board + page composition
status: done
---

# Phase 08 — Kudos board + page composition

## Context Links
- Spec: FR-1/FR-2 (access), FR-3/4 (banner+composer), FR-5/15/16/17 (filters shared by
  Highlight + All Kudos; carousel resets on filter change; tag-click sets hashtag), section 1
  (page order), NFR-3 (page is a Server Component; only stateful parts are `"use client"`).
- Clarifications: filter = local React state (no URL); options derived from data; single
  state holder.
- Depends: **02** (dict), **05** (carousel), **06** (spotlight), **07** (feed + sidebar).
- Pattern refs: `app/awards/page.tsx` + `awards-catalog.tsx` (server-page + one client wrapper
  boundary), `app/page.tsx` (SiteHeader/main/SiteFooter + Montserrat `.variable` scoping).

## Overview
- **Priority:** P1 · **Status:** pending
- Integration phase. Build the client `KudosBoard` (the SINGLE filter-state holder) + the
  presentational `KudosFilters`, then rewrite `app/kudos/page.tsx` to compose the full screen.
  This is the only phase touching multiple prior outputs + `page.tsx`.

## Key Insights
- **Layout correction:** `app/layout.tsx` renders only html/body — `page.tsx` MUST render
  `SiteHeader` + `SiteFooter` itself (mirror `app/page.tsx`/`awards/page.tsx`).
- **Filter state lives ONLY in `KudosBoard`** (`useState<KudosFilterState>`). No context
  (repo has zero context precedent; two consumers → prop-drilling is KISS/YAGNI).
- Spotlight sits BETWEEN Highlight and All Kudos in the layout. To keep the board contiguous
  while keeping Spotlight + sidebar server-rendered, the board takes them as **slot props**
  (`ReactNode`): `spotlight` and `sidebar`. The server page renders `<SpotlightBoard/>` and
  `<KudosSidebar/>` and passes them in — they render through the client board unchanged.
- Board derives: `filtered = filterKudos(posts, filter)`; carousel gets
  `getTopKudosByHearts(filtered, 5)`; feed gets `filtered`. Changing filter changes `filtered`
  length → `use-carousel` resets to slide 1 (FR-16). `onHashtagClick={(tag) =>
  setFilter(f => ({...f, hashtag: tag}))}` (FR-17).
- `page.tsx` stays a Server Component (`requireUser()` + locale/dict + static data); only
  `KudosBoard` (+ its interactive descendants) crosses into `"use client"`.

## Requirements
- **FR-1/2:** keep `await requireUser()`; keep `generateMetadata` (locale-aware, like awards).
- **FR-3/4:** render `<KudosBanner/>` (banner + composer, static) below the header.
- **FR-5/15:** `KudosFilters` = two dropdowns (Hashtag, Phòng ban) with an "all" option; options
  from `getDistinctHashtags`/`getDistinctDepartments`; controlled by board state; passed to the
  carousel as `filtersSlot`.
- **FR-16:** selecting a filter re-derives both Highlight (top-5) and All Kudos; carousel resets.
- **FR-17:** feed hashtag click sets the hashtag filter (same state).
- **NFR-2/3:** files <200 lines; page is server; board is the client boundary.

## Architecture / boundary
```
app/kudos/page.tsx (SERVER)
 ├─ await requireUser()  +  generateMetadata (locale-aware)
 ├─ locale = getLocale(); d = getDictionary(locale)
 ├─ options = getDistinctHashtags(KUDOS_POSTS) / getDistinctDepartments(KUDOS_POSTS)
 └─ <div montserrat.variable ...>
      <SiteHeader locale nav account notifications/>
      <main>
        <KudosBanner labels={d.kudos.banner} composer={d.kudos.composer}/>   (static)
        <KudosBoard
          posts={KUDOS_POSTS}
          hashtagOptions={...} departmentOptions={...}
          labels={d.kudos}                                   // filters/card/empty slices
          spotlight={<SpotlightBoard names total labels={d.kudos.spotlight}/>}  // server-rendered slot
          sidebar={<KudosSidebar stats recipients labels={d.kudos}/>}          // server-rendered slot
        />
      </main>
      <SiteFooter nav footer/>
```
`app/components/kudos/kudos-board.tsx` (**`"use client"`**):
```
const [filter, setFilter] = useState<KudosFilterState>({ hashtag: null, department: null })
const filtered = filterKudos(posts, filter)
const top5 = getTopKudosByHearts(filtered, 5)
<>
  <HighlightKudosCarousel posts={top5} ... filtersSlot={<KudosFilters value={filter} onChange={setFilter} .../>} />
  {spotlight}
  <section two-column>  <AllKudosFeed posts={filtered} onHashtagClick={(t)=>setFilter(f=>({...f,hashtag:t}))} ... />  {sidebar}  </section>
</>
```
`app/components/kudos/kudos-filters.tsx`: presentational; `{ value, onChange, hashtagOptions,
departmentOptions, labels }`; two `<select>` (or custom dropdown) incl. "all" option.

## Related Code Files
- **Create:** `app/components/kudos/kudos-board.tsx` (`"use client"`)
- **Create:** `app/components/kudos/kudos-filters.tsx` + test
- **Create:** `app/components/kudos/kudos-banner.tsx` + test  *(banner + composer, static)*
- **Rewrite:** `app/kudos/page.tsx` (keep `requireUser()`; add `generateMetadata`)
- **Reuse (import, do NOT edit):** `SiteHeader`, `SiteFooter`, all Phase 05/06/07 components,
  `lib/kudos/*`, `app/login/fonts.ts`, `getLocale`/`getDictionary`
- **Read for context:** `app/awards/page.tsx`, `app/components/awards/awards-catalog.tsx`, `app/page.tsx`

## Implementation Steps
1. `kudos-banner.tsx`: static banner (title `d.kudos.banner.title` + hardcoded "KUDOS"
   wordmark) + composer pill (`d.kudos.composer.placeholder`, pencil icon) — click is a no-op
   (code comment: compose dialog out of scope).
2. `kudos-filters.tsx`: two dropdowns, "all" option resets to `null`; controlled by props.
3. `kudos-board.tsx`: `"use client"`; state + derive `filtered`/`top5`; render carousel
   (with `filtersSlot`), `{spotlight}`, All Kudos two-column (feed + `{sidebar}`); wire
   `onHashtagClick` to set hashtag.
4. Rewrite `page.tsx`: async server component; `requireUser()`; `generateMetadata` (locale +
   `d.kudos.meta.description`, mirror awards); resolve locale/dict; compute options; render
   shell (Montserrat `.variable` root, SiteHeader, KudosBanner, KudosBoard with spotlight +
   sidebar slots, SiteFooter).
5. `npx tsc --noEmit` + `next build` to catch RSC client-boundary violations early.

## Todo List
- [x] `kudos-banner.tsx` (static banner + composer, no-op click) + test
- [x] `kudos-filters.tsx` (controlled dropdowns + "all") + test
- [x] `kudos-board.tsx` (`"use client"`, single filter state, slot props, derives top5/filtered)
- [x] Rewrite `page.tsx` (server, requireUser, generateMetadata, shell + slots)
- [x] filter change re-derives Highlight + All Kudos + resets carousel (FR-16)
- [x] feed hashtag click sets hashtag filter (FR-17)
- [x] `npx tsc --noEmit` + `next build` (no RSC boundary error)

## Success Criteria
- `/kudos` renders header → banner → filters+carousel → spotlight → all-kudos feed + sidebar →
  footer, authenticated.
- Selecting a filter updates both Highlight and All Kudos and resets the carousel; feed
  hashtag click sets the hashtag filter.
- `requireUser()` retained; metadata intact; `next build` passes; all files <200 lines.

## Risk Assessment
- **RSC boundary violation (High/Med):** server page passing client `<SpotlightBoard/>` as a
  slot + wrapping client `KudosBoard` is valid; ensure no server-only API leaks into the client
  tree. **Countermove:** `next build` in todo catches it; keep data reads in `page.tsx` only.
- **Slot pattern misunderstood → sidebar pulled into client bundle (Med/Med):** sidebar MUST be
  rendered by `page.tsx` and passed as a prop, NOT imported/rendered inside `KudosBoard`.
- **Existing page test breaks (High/High):** old `tests/unit/kudos-page.test.tsx` asserts the
  stub heading — handled in Phase 09 (update in same delivery, not left red).
- **Rollback:** single-file restore of `app/kudos/page.tsx` to the placeholder + delete
  `app/components/kudos/*` + `lib/kudos/*` + remove `kudos` i18n block. No data migration, no
  shared-state coupling; homepage/awards Kudos teaser (`homepage.kudos`) untouched.

## Security Considerations
- `requireUser()` retained (defense-in-depth with `proxy.ts` P01). Do NOT touch `proxy.ts`.
  All content static; no new data exposure.

## Next Steps
- Phase 09 updates the page test + runs the full green gate.
