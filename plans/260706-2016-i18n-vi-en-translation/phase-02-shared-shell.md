# Phase 02 — Shared shell + LanguageSelector fix

## Context Links
- Spec: FR-5, FR-6, FR-7, FR-12
- Strings: `reports/researcher-260706-catalog-shell-login.md`, `...-homepage.md` (kudos, detailsCta)
- Depends on: Phase 01 (imports `Locale`, `Dictionary`)

## Overview
- **Priority:** P1 (defines the prop contract that Login/Homepage/Awards all consume)
- **Status:** done
- **Description:** Fix the LanguageSelector reload bug + activate real switching, and convert every
  CROSS-SCREEN shared component from hardcoded literals to props. This phase OWNS the shared files so
  the parallel screen phases never touch them.

## Key Insights
- `LanguageSelector` is rendered by BOTH `login-header.tsx` (Server) and `site-header.tsx` (Client) —
  it is the single most-shared component. Its bug (`useState<Locale>("vi")` never reads the cookie)
  is why a reload always shows "VN". Fix = accept `initialLocale` prop.
- `site-header.tsx` / `site-footer.tsx` are `"use client"` → they CANNOT call `cookies()`. They must
  receive dict strings + `initialLocale` as props from the page and forward them down.
- `account-menu-button.tsx`, `notification-bell.tsx` render only inside `site-header.tsx` → their
  strings thread header → child.
- `sun-kudos-section.tsx` is Server, rendered by BOTH homepage and awards pages → shared.
- `nav-link.tsx` and `countdown-led-unit.tsx` need NO edit — their labels are already props.

## Requirements
- FR-5: `LanguageSelector` accepts `initialLocale: Locale`, uses it as `useState` seed.
- FR-6: on select → `setLocaleCookie(next)` then `router.refresh()` (`useRouter` from `next/navigation`).
- FR-7: shell client components receive strings as props, never read cookie/dict themselves.
- FR-12: nav/footer/account English labels get VI counterparts via `shared.*`.

## Architecture — prop contract (downstream phases MUST pass exactly these)
```
LanguageSelector      props: { initialLocale: Locale }
SiteHeader (client)   props: { locale: Locale; nav: dict.shared.nav; account: dict.shared.account;
                               notifications: dict.shared.notifications }
                      → LanguageSelector initialLocale={locale}
                      → NavLink label={nav.aboutSaa|awardInfo|kudos}
                      → NotificationBell empty={notifications.empty}
                      → AccountMenuButton profile={account.profile} signOut={account.signOut}
SiteFooter (client)   props: { nav: dict.shared.nav; footer: dict.shared.footer }
                      → FooterNavLink labels from nav.* + footer.generalStandards
                      → copyright = footer.copyright
NotificationBell      props: { empty: string }
AccountMenuButton     props: { profile: string; signOut: string }
SunKudosSection       props: { kudos: dict.homepage.kudos; detailsCta: dict.shared.detailsCta }
```
Data flow: page (Server, has dict) → SiteHeader/SiteFooter/SunKudos (props) → leaf components (props).
`router.refresh()` re-runs the Server page with the new cookie → new dict → new props flow down; no
full reload, client state (scroll, open menus) preserved.

## Related Code Files
- **Modify (OWNED by this phase):**
  - `app/login/components/language-selector.tsx` (initialLocale + router.refresh)
  - `app/components/home/site-header.tsx`
  - `app/components/home/site-footer.tsx`
  - `app/components/home/account-menu-button.tsx`
  - `app/components/home/notification-bell.tsx`
  - `app/components/home/sun-kudos-section.tsx`
- **Read for context:** `nav-link.tsx` (unchanged, label already prop), Phase 01 exports
- **NOT owned here:** `widget-button.tsx` (homepage-only → Phase 04), `award-card.tsx` (homepage-only
  → Phase 04). Kept out so file ownership stays disjoint.

## Implementation Steps
1. `language-selector.tsx`: add `interface Props { initialLocale: Locale }`; `useState(initialLocale)`;
   `import { useRouter } from "next/navigation"`; in `handleSelect`: `setLocaleCookie(next); setLocale(next);
   setOpen(false); router.refresh();`. Keep the `LOCALE_LABEL`/`LOCALE_OPTION_LABEL` maps as-is. Import
   `Locale` from `@/lib/i18n/locale`, drop the local `type Locale`.
2. `site-header.tsx`: add props per contract; replace hardcoded `label="About SAA 2025"` etc with
   `nav.*`; pass `initialLocale={locale}` to `<LanguageSelector>`; pass `empty`/`profile`/`signOut`.
3. `site-footer.tsx`: add props; replace nav labels + `Tiêu chuẩn chung` (→ footer.generalStandards) +
   copyright line with `footer.copyright`.
4. `account-menu-button.tsx`: replace `Profile`/`Sign out` with props.
5. `notification-bell.tsx`: replace `Chưa có thông báo` with `empty` prop.
6. `sun-kudos-section.tsx`: replace eyebrow/description/`Chi tiết` with props (`kudos.eyebrow`,
   `kudos.description`, `detailsCta`).
7. Typecheck the shell in isolation is impossible (pages not yet wired) — that is expected; see Risk.

## Todo List
- [x] language-selector: initialLocale prop + router.refresh (bug fix + activation)
- [x] site-header: props + forward to LanguageSelector/NavLink/NotificationBell/AccountMenuButton
- [x] site-footer: props + copyright/generalStandards
- [x] account-menu-button: profile/signOut props
- [x] notification-bell: empty prop
- [x] sun-kudos-section: kudos + detailsCta props

## Success Criteria
- `LanguageSelector` seeded from `initialLocale`; selecting a locale calls `router.refresh()`
  (verified by Phase 07 unit test mocking `next/navigation`).
- No hardcoded VI/EN UI literal remains in any of the 6 owned files (only the selector's own
  VN/EN/language-name maps, which are intentionally not dict-driven).
- Prop interfaces match the contract above exactly (so Phases 03/04/05 compile against them).

## Risk Assessment
- **Build-green window** (High/Med): required props on shell components break the tree until pages
  are wired. Countermove: land Phase 02 together with 03/04/05 as one batch; do NOT commit 02 alone
  to a shared branch. Reviewer runs the full typecheck only after 03/04/05 complete.
- **`router.refresh()` behavior in Next 16** (Med/Med): confirm it re-runs Server Components with the
  fresh cookie (not a cached RSC payload). Countermove: check installed Next docs; if `refresh()`
  serves stale cookie, fall back to `router.refresh()` after a microtask, or `startTransition`.
  Phase 08 E2E "reload persists locale" + "switch reverts" are the regression proof.
- **Client component reading cookie by mistake** (Low/Med): reviewer confirms shell clients only read
  props.

## Security Considerations
- Cookie is written client-side (`document.cookie`, `SameSite=Lax`, 1yr) — unchanged from stub. No
  new surface. Locale value is validated server-side in Phase 01's `getLocale()`.

## Next Steps
- Unblocks Phases 03 (login-header uses new selector), 04, 05 (pages render this shell with props).
