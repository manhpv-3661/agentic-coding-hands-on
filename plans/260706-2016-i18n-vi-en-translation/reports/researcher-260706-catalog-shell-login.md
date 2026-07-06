# i18n String Catalog — Shared Shell + Login Screen

Scope: `app/login/**` (non-test) + `app/components/home/{site-header,site-footer,nav-link,notification-bell,account-menu-button,widget-button}.tsx`. No skill matched this task (direct string extraction, not tech/library research) — used Read/Grep directly per fallback rule.

## Table: Vietnamese UI strings → dictionary keys

| file:line | current VI text (verbatim) | proposed key | proposed EN translation |
|---|---|---|---|
| app/login/page.tsx:11 | `Đăng nhập \| Sun* Annual Awards 2025` | `login.meta.title` | Login \| Sun* Annual Awards 2025 |
| app/login/page.tsx:12 | `Đăng nhập để khám phá Sun* Annual Awards 2025.` | `login.meta.description` | Sign in to explore Sun* Annual Awards 2025. |
| app/login/page.tsx:15 | `Đăng nhập không thành công. Vui lòng thử lại.` | `login.error.oauthFailed` | Sign-in failed. Please try again. |
| app/login/components/login-button-container.tsx:7 | `Đăng nhập không thành công. Vui lòng thử lại.` | `login.error.oauthFailed` (dup, see note) | Sign-in failed. Please try again. |
| app/login/components/login-button-container.tsx:9 | `Chưa cấu hình đăng nhập. Vui lòng thiết lập Supabase trong .env.local (xem .env.local.example).` | `login.error.notConfigured` | Login isn't configured yet. Please set up Supabase in `.env.local` (see `.env.local.example`). |
| app/login/components/login-hero-content.tsx:23 | `Bắt đầu hành trình của bạn cùng SAA 2025.\nĐăng nhập để khám phá!` | `login.hero.subtitle` | Start your journey with SAA 2025.\nSign in to explore! |
| app/login/components/login-button.tsx:46 | `Đang đăng nhập...` | `login.button.loading` | Signing in... |
| app/login/components/login-button.tsx:50 | `LOGIN With Google` (already English, mixed casing — see note) | `login.button.google` | Login with Google |
| app/login/components/login-footer.tsx:8 | `Bản quyền thuộc về Sun* © 2025` | `shared.footer.copyright` | Copyright © 2025 Sun* |
| app/components/home/site-footer.tsx:119 | `Bản quyền thuộc về Sun* © 2025` | `shared.footer.copyright` (dup, see note) | Copyright © 2025 Sun* |
| app/components/home/site-footer.tsx:111 | `Tiêu chuẩn chung` | `shared.footer.nav.generalStandards` | General Standards |
| app/components/home/notification-bell.tsx:65 | `Chưa có thông báo` | `shared.notifications.empty` | No notifications yet |
| app/components/home/widget-button.tsx:176 | `Sắp ra mắt` | `shared.widget.comingSoon` | Coming soon |

**Total distinct VI strings requiring dictionary entries: 11** (13 rows above collapse to 11 unique keys — 2 are literal duplicates flagged below).

## Duplicate-string notes (DRY concern for planner)

- `login.error.oauthFailed` — identical VI string hardcoded independently in `page.tsx:15` and `login-button-container.tsx:7`. Consolidate to one dictionary key; both call sites should read from it rather than each owning a local const.
- `shared.footer.copyright` — identical VI string hardcoded independently in `login-footer.tsx:8` (login screen's own footer) and `site-footer.tsx:119` (homepage shell footer). These are two structurally different footer components (login footer has no logo/nav row) but the copyright line itself is the same text — one dictionary key, two components consume it.

## Excluded: locale selector's own labels (not translatable content)

Per task instructions these are locale *names*, not strings that get swapped by the i18n system itself:

| file:line | text | role |
|---|---|---|
| app/login/components/language-selector.tsx:10 | `VN` | trigger label for `vi` |
| app/login/components/language-selector.tsx:11 | `EN` | trigger label for `en` |
| app/login/components/language-selector.tsx:15 | `Tiếng Việt` | option label for `vi` |
| app/login/components/language-selector.tsx:16 | `English` | option label for `en` |

These stay in the `LOCALE_LABEL`/`LOCALE_OPTION_LABEL` maps as-is — do not route through the VI/EN dictionary (a VI/EN dictionary key for "the word meaning English" would be circular). Also note: the selector today only sets the `NEXT_LOCALE` cookie (`setLocaleCookie`) and its own local `useState` — nothing reads the cookie anywhere else in the app yet (confirmed: no other file in scope references `NEXT_LOCALE`). Wiring the dictionary lookup to this cookie is exactly the gap this i18n work needs to close.

## Flagged: already-English strings hardcoded into the nominally-Vietnamese UI

These render on a page whose surrounding copy is Vietnamese, but the strings themselves are already English literals in source — not translation candidates today, but the planner should decide whether they get dictionary keys too (for symmetry / consistency once VI/EN toggling is real) or stay hardcoded as brand/feature names:

| file:line | text | context |
|---|---|---|
| app/login/components/login-button.tsx:50 | `LOGIN With Google` | counted in main table above since it's the login screen's only button label — needs a key regardless, casing should normalize to `Login with Google` |
| app/components/home/site-header.tsx:51 | `About SAA 2025` | passed as `label` prop into `NavLink` |
| app/components/home/site-header.tsx:52 | `Award Information` | passed as `label` prop into `NavLink` |
| app/components/home/site-header.tsx:53 | `Sun* Kudos` | passed as `label` prop into `NavLink` |
| app/components/home/site-footer.tsx:105 | `About SAA 2025` | passed as `label` prop into `FooterNavLink` |
| app/components/home/site-footer.tsx:107 | `Award Information` | passed as `label` prop into `FooterNavLink` |
| app/components/home/site-footer.tsx:109 | `Sun* Kudos` | passed as `label` prop into `FooterNavLink` |
| app/components/home/account-menu-button.tsx:66 | `Profile` | menu item (stub, no navigation wired) |
| app/components/home/account-menu-button.tsx:76 | `Sign out` | menu item (wired to real `signOutAction`) |

`nav-link.tsx` and `site-header.tsx`/`site-footer.tsx` (FooterNavLink) render whatever `label` prop they're given — no VI literal lives in `nav-link.tsx` itself, the strings above are all owned by the caller.

## Accessibility-only text (aria-label, English already, lower priority)

Screen-reader-only, not visually rendered — listed for completeness, not in main table: `site-header.tsx:37` / `site-footer.tsx:88` (`"Sun* Annual Awards 2025 — home"`), `notification-bell.tsx:53` (`"Notifications"`, x2 incl. panel), `account-menu-button.tsx:49,58` (`"Account menu"`, `"Account"`), `widget-button.tsx:148,173` (`"Quick actions"`, x2).

## Data VALUE vs UI copy — none found in this scope

No date strings, currency amounts, or other localized-format data values appear in `app/login/**` or the six shared-shell components read for this task. (Dates/amounts likely exist in `app/components/home/countdown-timer.tsx` and `event-info.tsx` — explicitly out of scope for this pass; flag for a follow-up catalog pass over the homepage body if those need format-aware localization too.)

## Unresolved questions

1. `login-button-container.tsx:9` (`NOT_CONFIGURED_ERROR`, Supabase setup message) — is this dev-only diagnostic text worth a dictionary key, or should it stay a hardcoded EN/VI-agnostic string since it only fires when `.env.local` is missing (a config error, not a real end-user path)?
2. Should `About SAA 2025` / `Award Information` / `Sun* Kudos` / `Profile` / `Sign out` (all already-English, flagged above) get dictionary keys now for architectural consistency, or is "brand/feature names stay English in both locales" an intentional product decision? Affects whether the dictionary needs `shared.nav.*` / `shared.account.*` namespaces in this pass or a later one.
3. `login-button.tsx:50`'s `LOGIN With Google` casing (`LOGIN` caps, `With` caps) looks like a typo rather than a deliberate style — confirm before normalizing to `Login with Google` in the dictionary.
