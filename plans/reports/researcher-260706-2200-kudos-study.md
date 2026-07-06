# F006 Sun* Kudos — Study Report

## 1. Current `/kudos` placeholder + homepage composition + protected-route mechanics

- `app/kudos/page.tsx` (30 lines): server component, `await requireUser()`, static `metadata` export, minimal `<main>`. This whole file gets replaced.
- `app/page.tsx`: server component pattern to mirror — `requireUser()` → `getLocale()` → `getDictionary(locale)` → render `SiteHeader`(locale/nav/account/notifications) → page sections → `SiteFooter`(nav/footer). `app/layout.tsx` renders only html/body; header/footer are NOT global, every top-level page renders its own (confirmed again in awards page.tsx L40-44).
- `proxy.ts` (root): Next 16 renamed `middleware`→`proxy`. `isProtectedPath()` already includes `pathname.startsWith("/kudos")` (line ~29) — **no proxy change needed for F006**, route already gated. Fail-open when Supabase env missing (mock repo). Time-gate (`/prelaunch`) runs first, independent of auth-gate.
- `lib/auth/require-user.ts`: `requireUser()` (redirects to `/login` if session-checked and no user, returns `null` no-op if Supabase unconfigured) vs `getOptionalUser()` (never redirects). Kudos page should use `requireUser()` (matches awards/home), not the optional variant.

## 2. Reusable card/section patterns (`app/components/home/*`)

- `award-card.tsx` (125 lines): pure presentational, single `<Link>` wraps whole card (image+title+desc+CTA) — avoids invalid nested-anchor HTML; icon inlined as SVG component (`currentColor`) rather than `<img>` so it can be tinted by hover/active state via CSS.
- `awards-section.tsx`: server-renderable grid section, `grid-cols-2 lg:grid-cols-3`, maps a local mock array (`AWARDS`) matched 1:1 by index against `AWARD_CATEGORIES` (`lib/awards/award-categories.ts`) for `detailsHref` — i.e. content/slug source-of-truth pattern kept in `lib/`, not duplicated in the component.
- `sun-kudos-section.tsx`: **static promo block only — not a carousel, not a live feed.** No existing carousel/slider component or hook anywhere in the codebase, and no carousel library in `package.json` (checked deps — only Tailwind v4, no embla/swiper/radix). **F006's Highlight Kudos carousel is a genuinely new primitive.**
- Testing convention (`award-card.test.tsx`, `sun-kudos-section.test.tsx`): Vitest + `@testing-library/react`, `render`/`screen`, assert by `getByText`/`getByRole`. `next/font/google` is mocked (`vi.mock("next/font/google", ...)`) whenever a component imports a Google font directly. i18n components are tested by rendering with both `vi` and `en` dictionary slices side-by-side ("spot-check translation" describe block) — expect the same pattern for new Kudos components.

## 3. F004 Awards full-page build (closest precedent for F006)

- `app/awards/page.tsx` (110 lines): the **server/client boundary pattern to copy**. Page stays a server component (data: `requireUser()`, `getLocale()`, `getDictionary()`, `buildAwardDetailEntries()`); only the interactive subtree (`AwardsCatalog`) is `"use client"`.
- `app/components/awards/awards-catalog.tsx`: `"use client"` wrapper owns the one stateful hook (`useScrollSpy`) and composes two children (`AwardsNavMenu`, `AwardDetailCard` list) that themselves stay prop-driven/pure (no `"use client"` needed in `awards-nav-menu.tsx` — plain function of props, native `<a href="#slug">` anchor jump, active state visual only).
- `hooks/use-scroll-spy.ts` (91 lines, generic, reusable): takes `ids: string[]`, returns active id via one shared `IntersectionObserver`; resyncs on `ids` content change (joined string key), resets synchronously during render to avoid stale-id flash. **Directly reusable if F006 needs a scroll-spy nav for hashtag/department filter jump-links**, otherwise probably not needed (filters are likely stateful selection, not scroll-anchored).
- `award-detail-data.ts`: a `buildAwardDetailEntries(dictionaryLocaleSlice)` pure function built in the server page and passed down as props — data-shaping stays out of the client component. Good template for a `buildKudosFeed`/`buildHighlightKudos`-style builder function.
- Server page composes: `SiteHeader` → `AwardsHero` → inline title → `AwardsCatalog` → `SunKudosSection` (reused unmodified) → `SiteFooter`. F006 will follow the same shell shape (`SiteHeader`/`SiteFooter` + fonts.ts variable classes), swapping the middle for kudos-specific sections.

## 4. i18n (`lib/i18n/`)

- `lib/i18n/dictionaries/vi.ts` (188 lines) is **canonical**; `Dictionary` type = `typeof vi` (`dictionary.ts`). `en.ts` (166 lines) is checked via `satisfies Dictionary` at compile time — missing/extra key fails `tsc`.
- `lib/i18n/dictionaries/parity.test.ts`: runtime parity test independently walks both dictionaries and asserts identical dot-path key sets — **both VI and EN must get every new key, no partial rollout**. New `kudos.*` namespace (page title/labels/filters/empty-states/stats labels) must land in both files in the same commit or this test fails.
- `get-locale.ts`: server-only (`next/headers` `cookies()`, always-async per Next 16), reads `NEXT_LOCALE` cookie, defaults `"vi"` via `isLocale()` guard. `get-dictionary.ts`: pure sync map, no I/O.
- Existing `homepage.kudos` dictionary slice is just `{ eyebrow, description }` for the teaser — F006 needs a **new top-level `kudos` namespace** (sibling to `homepage`/`awards`) for the full page's own strings (stats labels, filter labels, "no results" empty states, "10 most recent" heading, etc.), keeping `homepage.kudos` untouched (still used by the teaser + reused-on-awards-page block).

## 5. Docs convention (`docs/features/f004-awards-information/feature.md`)

- Single `feature.md` per feature folder (not the generic 4-file rebuild-spec shape) — YAML frontmatter (`feature`, `name`, `lang: vi`, `screen`, `momorph.fileKey/screenId`, `status`, `notes`) + Vietnamese numbered sections: Tổng quan → Yêu cầu chức năng (FR-N table) → Yêu cầu phi chức năng → Kiểm thử (DoD) → Unresolved Questions. **Confirmed: F006 doc should follow this exact single-file pattern** at `docs/features/f006-sun-kudos-live-board/feature.md` (or whatever code F006 finally gets).

## 6. Avatar/profile routing — none exists

- `grep -rn "avatar\|/profile\|/users/\[" app --include=*.tsx` returned **zero hits**. No `/profile` or `/users/[id]` route, no avatar-click convention anywhere in the app today (header account menu is a dropdown, not a profile link). **F006's recipient/sender avatars and the "10 sunners who most recently received gifts" list have no existing click-target to route to** — decide explicitly (dead/non-interactive avatar vs. new stub route) rather than assuming a convention exists.

## 7. File-size / naming conventions

- Every file inspected respects the <200-line rule (award-card 125, awards-nav-menu 77, scroll-spy hook 91, awards page 110); kebab-case filenames throughout (`sun-kudos-section.tsx`, `award-detail-card.tsx`, `use-scroll-spy.ts`). F006 will need to be split into several files by construction (carousel, spotlight board, feed list, filters, stats sidebar, recent-recipients list) — consistent with precedent, not a deviation.

## Recommendations for F006 Kudos architecture

**Reuse as-is:** `SiteHeader`/`SiteFooter`, `app/login/fonts.ts` variable pattern, `requireUser()`, `getLocale()`/`getDictionary()`, the award-card `<Link>`-wraps-whole-card + inline-SVG-icon idioms, the Vitest+RTL dual-locale test convention, single `feature.md` doc pattern, `<200-line`/kebab-case discipline.

**Server/client boundary (mirror F004):** `app/kudos/page.tsx` stays a server component doing `requireUser()` + locale/dictionary resolution + calling pure `buildXxx()` data-shaping functions (new, colocated under `app/components/kudos/` similar to `award-detail-data.ts`) with **static mock data extracted from design/spec, not invented**. Push `"use client"` only into the pieces that actually need interactivity:
- `HighlightKudosCarousel` — client (needs slide-index state; no lib exists, build a small custom hook, e.g. `hooks/use-carousel.ts`, following the `use-scroll-spy.ts` style: plain state + effect, no external dependency — YAGNI, don't pull in embla for a top-5 static carousel).
- `HashtagDepartmentFilters` — client (selected-filter state, likely lifts state up to a client parent that also owns `AllKudosFeed` since filtering the feed is derived from filter state).
- `AllKudosFeed` — client if it owns filter-derived state, otherwise a pure list component fed filtered data from a client filter-holder parent (same "dumb child, one stateful wrapper" shape as `AwardsCatalog`/`AwardsNavMenu`).
- `SpotlightBoards` (word-cloud), `StatsSidebar`, `RecentRecipientsList` — likely pure/presentational (props in, JSX out), no client boundary needed unless word-cloud layout requires measuring DOM (in which case isolate that one component as client, keep siblings server-renderable).

**Genuinely new (no precedent to lean on):**
- Carousel primitive (top-5-by-hearts) — no existing carousel anywhere in repo or deps.
- Word-cloud/Spotlight board rendering — no existing analog; will need its own sizing/layout logic (font-size-by-weight or similar), keep it a small isolated component.
- Filter state model (hashtag + department, likely multi-select) — new.
- Stats sidebar numbers (kudos received/sent, Secret Box opened/unopened) — new data shape; since like-toggle interaction is explicitly out of scope, heart counts render as **static text+icon, no button/aria-pressed semantics** — keep it a plain `<span>` pair (icon + count), not a `<button>`, to avoid implying it's interactive (defer that semantic to the future toggle task).
- Avatar click target for recipients — no convention exists; decide (non-clickable avatar vs. new stub route) during planning, don't assume `/profile` exists.

**New i18n namespace:** add `kudos` (sibling to `homepage`/`awards`) in both `vi.ts` and `en.ts` in the same change — the parity test enforces this; do not touch `homepage.kudos` (still owned by the teaser block, reused verbatim on `/awards`).

## Unresolved questions
- Exact data source for kudos content (mock array in-component like `AWARDS`, vs. a `lib/kudos/*` data module like `award-categories.ts`) — recommend the `lib/` module pattern given F006 needs cross-component consistency (carousel top-5, feed, stats, recent-recipients all derive from one kudos dataset).
- Whether hashtag/department filters need URL query-string persistence (no existing precedent for query-param-driven UI state in this repo — `AwardsNavMenu` uses hash anchors, not query params).
- Whether avatar images/recipient identities should route anywhere — flagged above, needs an explicit product decision.
