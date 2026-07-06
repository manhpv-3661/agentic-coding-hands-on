# Phase 07 — Unit tests (Vitest)

## Context Links
- Spec: §5 (Unit)
- Runner: `vitest` (`package.json` `"test": "vitest"`)
- Depends on: Phases 01–06 (tests run against FINAL code)

## Overview
- **Priority:** P2
- **Status:** done
- **Description:** Unit-cover the i18n module, the LanguageSelector fix, dict parity, and spot-check a
  few translated components. Tester owns test files only (reads impl, never edits it).

## Key Insights
- Dictionary type parity is already compile-time guarded (`satisfies Dictionary`); add a RUNTIME
  key-set test too (catches accidental `any`-casts / drift the compiler might miss).
- `getLocale()` needs `cookies()` mocked (from `next/headers`).
- `LanguageSelector` needs `next/navigation` `useRouter` mocked to assert `router.refresh()` fires.
- Existing awards tests (`award-detail-card.test.tsx`, `awards-catalog.test.tsx`) import the OLD const
  → update them to the `buildAwardDetailEntries` factory.

## Requirements (test matrix)
| Target | Type | Cases |
|--------|------|-------|
| `get-locale.ts` | unit | cookie `"en"`→en; `"vi"`→vi; missing→vi; `"fr"`/garbage→vi |
| `get-dictionary.ts` | unit | `"en"`→en object; `"vi"`→vi object; identity of nested keys |
| dict parity | unit | `Object.keys` deep-walk: en key-set === vi key-set (recursive) |
| `language-selector.tsx` | unit | seeds from `initialLocale`; select → `setLocaleCookie` + `router.refresh()` called (mock next/navigation); reload bug: initial render shows the passed locale, not always "vi" |
| translated component spot-check | unit | render 1 comp per screen with a vi dict prop and an en dict prop → asserts the right string appears (e.g. `event-info`, `sun-kudos-section`, `award-detail-card`, `prelaunch-content`) |

## Related Code Files
- **Create/Modify (OWNED — test files only):**
  - `lib/i18n/get-locale.test.ts`, `get-dictionary.test.ts`, `dictionaries/parity.test.ts`
  - `app/login/components/language-selector.test.tsx` (exists — extend for new props/refresh)
  - spot-check tests co-located with chosen components (extend existing `*.test.tsx` where present)
  - `app/components/awards/award-detail-card.test.tsx`, `awards-catalog.test.tsx` (update for factory)
- **Read for context:** all Phase 01–06 implementation files

## Implementation Steps
1. `get-locale.test.ts`: `vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ... }) }))`
   — cover the 4 cases. Mirror the existing project mock style if one exists.
2. `get-dictionary.test.ts`: assert returned object identity + a couple of representative values.
3. `parity.test.ts`: recursive key-collector over `vi` and `en`; `expect(keys(en)).toEqual(keys(vi))`.
4. `language-selector.test.tsx`: mock `next/navigation` `useRouter` → `{ refresh: vi.fn() }`; render
   with `initialLocale="en"`, assert trigger shows EN; click a locale, assert cookie write + `refresh`.
5. Spot-check tests: render each chosen component twice (vi slice / en slice), assert visible strings.
6. Update the 2 awards tests to build entries via `buildAwardDetailEntries` (pass a dict `awards.detail`
   slice); keep the order assertion.
7. `npm test` (vitest) — all green. NO mocks that fake translations; use the real dict.

## Todo List
- [x] get-locale.test.ts (4 cases, mock cookies)
- [x] get-dictionary.test.ts
- [x] parity.test.ts (runtime key-set equality)
- [x] language-selector.test.tsx (initialLocale seed + router.refresh)
- [x] spot-check ~4 components (vi vs en)
- [x] update award-detail-card / awards-catalog tests for the factory

## Success Criteria
- All new + existing unit tests pass against final code.
- Parity test FAILS if a key is removed from `en` (proven by a scratch mutation, then reverted).
- No test uses a fabricated dictionary — real `vi`/`en` imported.

## Risk Assessment
- **`next/headers` mock shape** (Med/Med): `cookies()` is async here. Countermove: mock returns a
  Promise-resolving store; mirror `lib/supabase` test mocks if they exist.
- **Client-component render needs jsdom** (Low/Low): vitest env likely already jsdom (existing
  `*.test.tsx` render). Countermove: reuse the existing test setup config.

## Security Considerations
- Parity + validation tests double-guard against a tampered cookie producing an undefined lookup.

## Next Steps
- After green, hand to reviewer, then Phase 08 E2E.
