# Phase 03 — Login screen wiring

## Context Links
- Spec: FR-4, FR-8
- Strings: `reports/researcher-260706-catalog-shell-login.md` (login.* rows)
- Depends on: Phase 01 (dict), Phase 02 (LanguageSelector new signature)

## Overview
- **Priority:** P2
- **Status:** done
- **Description:** Wire `app/login/page.tsx` to read locale/dict and thread props through the login
  screen's OWN components. Uses (does not edit) the Phase 02 LanguageSelector.

## Key Insights
- `login-header.tsx` is a Server Component → can receive `initialLocale` and pass it straight to
  `<LanguageSelector initialLocale={...}>`.
- `login-button-container.tsx` + `login-button.tsx` are Client — receive strings as props.
- DRY: `login.error.oauthFailed` currently duplicated in `page.tsx:15` (`LOGIN_ERROR` const) AND
  `login-button-container.tsx:7`. Both must read the single dict key.
- Metadata is VI-hardcoded → convert to `generateMetadata()` (async, reads locale).

## Requirements
- FR-4: `page.tsx` calls `getLocale()` + `getDictionary()`, passes slices down.
- FR-8: 11 login keys rendered from dict; 2 DRY duplicates collapsed to one key each.

## Architecture — prop flow
```
login/page.tsx (Server)
  const locale = await getLocale(); const d = getDictionary(locale);
  generateMetadata() → d.login.meta.{title,description}
  initialError = error === "auth_callback_failed" ? d.login.error.oauthFailed : null
  → LoginHeader        initialLocale={locale}
  → LoginHeroContent   subtitle={d.login.hero.subtitle}
      → LoginButtonContainer  initialError, notConfigured={d.login.error.notConfigured},
                              loading={d.login.button.loading}, google={d.login.button.google}
          → LoginButton  loading / google labels
  → LoginFooter        copyright={d.shared.footer.copyright}
```

## Related Code Files
- **Modify (OWNED):** `app/login/page.tsx`, `app/login/components/login-header.tsx`,
  `login-hero-content.tsx`, `login-button-container.tsx`, `login-button.tsx`, `login-footer.tsx`
- **Read for context:** `lib/i18n/get-locale.ts`, `get-dictionary.ts`; Phase 02 LanguageSelector props
- **NOT owned:** `language-selector.tsx` (Phase 02)

## Implementation Steps
1. `page.tsx`: import `getLocale`/`getDictionary`; make an `export async function generateMetadata()`
   returning `{ title: d.login.meta.title, description: d.login.meta.description }`; remove static
   `metadata` + `LOGIN_ERROR` const; use `d.login.error.oauthFailed` for `initialError`.
2. `login-header.tsx`: add `initialLocale: Locale` prop, forward to `<LanguageSelector>`.
3. `login-hero-content.tsx`: render `subtitle` prop (was `login.hero.subtitle` literal). Preserve the
   `\n` line break rendering (whitespace-pre-line or split — keep current markup behavior).
4. `login-button-container.tsx`: accept `notConfigured`, `loading`, `google`, keep `initialError`;
   drop the local duplicate `oauthFailed`/`notConfigured` literals; pass labels to `<LoginButton>`.
5. `login-button.tsx`: accept `loading` + `google` label props (was `Đang đăng nhập...` /
   `LOGIN With Google`); normalize casing via dict value `Login with Google`.
6. `login-footer.tsx`: accept + render `copyright` prop.
7. Typecheck.

## Todo List
- [x] page.tsx: getLocale/getDictionary + generateMetadata + oauthFailed from dict
- [x] login-header: initialLocale → LanguageSelector
- [x] login-hero-content: subtitle prop (keep \n)
- [x] login-button-container: error + button label props, drop duplicate literals
- [x] login-button: loading + google props
- [x] login-footer: copyright prop

## Success Criteria
- Login renders EN when `NEXT_LOCALE=en` on first server paint (no client flash).
- `oauthFailed` + `copyright` each sourced from ONE dict key (no hardcoded duplicate remains).
- `<title>` reflects locale via `generateMetadata`.

## Risk Assessment
- **`generateMetadata` + existing static `metadata` collision** (Low/Med): Next errors if both exist.
  Countermove: remove the static export entirely.
- **`\n` subtitle rendering regression** (Low/Low): keep the exact wrapping markup; Phase 07 spot-test.

## Security Considerations
- `notConfigured` is a dev-only diagnostic (fires when Supabase env missing) — still routed through
  dict for consistency; no secret exposure (message is generic setup guidance).

## Next Steps
- Independent of Phases 04/05/06. Feeds Phases 07/08.
