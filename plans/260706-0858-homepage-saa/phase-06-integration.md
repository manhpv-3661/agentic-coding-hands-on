# Phase 06 — Integration (wire Track B logic into Track A UI)

## Context Links
- Depends on: P01 (guard + routing), P02 (countdown hook), P03 (slugs + routes), P04 (sign-out + menu hook).
- Consumes: P05 Track A presentational components (via reported component tree + props).
- Spec FR-3/4/6/7/10/12/13/17/21/24; clarifications.md.

## Overview
- Priority: P1. Status: ✅ **COMPLETE**. Blocked by P01–P04. Track A consumed incrementally (no hard merge point).
- Replace Track A mock data/placeholder props with real logic: home server guard, countdown env
  target, nav/CTA/footer hrefs, award-card hash links, sign-out, menu behavior.

## Key Insights
- Track A owns component files + `app/page.tsx` (initial). Integration EDITS those to inject logic —
  this is the sanctioned merge point (no simultaneous edits: Track A finished first).
- `app/page.tsx` becomes a server component: `await getOptionalUser()` (proxy already gates `/`;
  guard is defense-in-depth), then render Track A tree. Countdown/menus stay client components.

## Architecture / Data Flow
```
app/page.tsx (server) → getOptionalUser() → render <HomePage/> (Track A)
  ├─ countdown component ← useEventCountdown(parseEventStart(process.env.NEXT_PUBLIC_EVENT_START_AT))
  ├─ header/footer links → hrefs: About=/ (scroll top), Awards=/awards, Kudos=/kudos
  ├─ award cards → href={`/awards#${slug}`} from AWARD_CATEGORIES
  ├─ account menu → useDismissableMenu() + Sign out → signOutAction()
  └─ bell/widget menus → useDismissableMenu() (stub panels)
```

## Related Code Files
- **Modify (Track A output):** `app/page.tsx` + homepage section/menu components created by P05
  (exact paths from Track A report — e.g. `app/components/home/*`).
- **Read (do not edit):** `lib/auth/require-user.ts`, `hooks/use-event-countdown.ts`,
  `lib/event-countdown.ts`, `lib/awards/award-categories.ts`, `hooks/use-dismissable-menu.ts`,
  `app/actions/sign-out.ts`.
- File ownership: this phase (orchestrator) owns the integration edits; runs AFTER Track A reports.

## Implementation Steps
1. Convert `app/page.tsx` to server component: `await getOptionalUser()`; compose Track A homepage tree; attach fonts if not already (`app/login/fonts.ts`).
2. Countdown: pass `NEXT_PUBLIC_EVENT_START_AT` → `parseEventStart` → `useEventCountdown` in the countdown client component; bind `showComingSoon` to the subtitle visibility (FR-11/14/15).
3. Header/footer: set link `href`s (About→`/` + scroll-top on click when already `/`; Awards→`/awards`; Kudos→`/kudos`; footer "Tiêu chuẩn chung" per design/state). Logo click → `/` + scroll top (FR-6/26).
4. Award cards: map real `AWARD_CATEGORIES`; image/title/"Chi tiết" → `/awards#${slug}` (FR-21).
5. CTAs: "ABOUT AWARDS"→`/awards`, "ABOUT KUDOS"→`/kudos` (FR-17). Kudos block "Chi tiết"→`/kudos` (FR-24).
6. Account menu: wire `useDismissableMenu` + Sign out → `signOutAction`; Profile stub (no nav); Admin Dashboard hidden.
7. Bell + widget: `useDismissableMenu`; bell panel = empty "Chưa có thông báo", badge hidden; widget = stub actions.
8. Language selector: reuse existing `app/login/components/language-selector.tsx` as-is.
9. Compile / `next build`; visually sanity-check against Figma before handing to P07.

## Todo List
- [x] `app/page.tsx` server guard + compose Track A tree
- [x] countdown hook wired (env target + comingSoon toggle)
- [x] nav/CTA/footer/logo hrefs + scroll-top
- [x] award cards → `/awards#slug`
- [x] account menu sign-out + Profile stub + Admin hidden
- [x] bell + widget menus via hook (stubs)
- [x] language selector reused; build clean

## Success Criteria
- `/` renders full homepage; countdown reflects env (or `00 00 00` + hidden subtitle when invalid).
- Every nav/CTA/card/footer link routes correctly incl. `/awards#slug` scroll; sign-out ends session → `/login`.
- No leftover mock hrefs/placeholder props; `next build` clean.

## Risk Assessment
- **Track A prop shape mismatch (High/Med):** reported props differ from logic outputs → rework. Mitigate: integration contract in P05; adapt at wiring, prefer changing wiring over Track A markup.
- **Server/client boundary (Med/Med):** hooks in a server component crash build. Mitigate: keep countdown/menus in `"use client"` leaf components; `app/page.tsx` stays server.
- **Double listeners (Low/Med):** ensure menus use only `useDismissableMenu` (P04), not inline copies.
- Rollback: revert integration edits to Track A's last mock-data commit (keep that commit tagged).

## Security
- `/` guard is defense-in-depth; proxy is primary. Sign-out clears session. No secrets client-side.

## Next Steps
- Hand final wired code to P07 (tests run against THIS code). Update `docs/` per documentation-management.md.

## Actual Outcome
✅ Integration complete with review fix cycle.
- **`app/page.tsx`:** converted to async server component. Calls `requireUser()` for defense-in-depth guard. Renders `<HomePage/>` tree composed from Track A components.
- **Countdown wiring:** `useEventCountdown()` hook wired with `NEXT_PUBLIC_EVENT_START_AT` env target. `showComingSoon` toggle binds subtitle visibility (FR-11/14/15).
- **Navigation hrefs:** Header/footer links set to `/`, `/awards`, `/kudos`. Logo and "About" links include scroll-to-top on current page.
- **Award cards:** map real `AWARD_CATEGORIES` from `lib/awards/award-categories.ts`. Each card links to `/awards#${slug}`.
- **Account menu:** wired `useDismissableMenu` hook. Sign-out calls `signOutAction()`. Profile stub added (no nav). Admin Dashboard hidden.
- **Bell + Widget menus:** wired `useDismissableMenu` hook. Bell panel shows "Chưa có thông báo" (no notifications badge). Widget has stub action panels.
- **Language selector:** reused existing `app/login/components/language-selector.tsx` component.
- **Review cycle:** initial review found 4 findings: (1) lint error in `use-event-countdown.ts` (function naming), (2) FR-25 widget stub panel missing, (3) FR-6/7/26 scroll-to-top missing on footer "About SAA 2025" nav link. All fixed in follow-up implementer pass. Re-inspection verified all findings resolved.
- **Extra follow-up:** footer "About SAA 2025" nav link also wired for scroll-to-top (per FR-26 consistency).
- **Build:** `next build` clean, `tsc --noEmit` clean, `eslint` clean (0 new issues).
