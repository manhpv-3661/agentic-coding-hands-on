# E2E Test Fix Report: i18n Regressions

## Summary
Fixed 7 failing E2E tests caused by F005 (real VI/EN i18n implementation). Root cause: pre-existing tests hardcoded English text literals when default locale (no cookie) switched from English to Vietnamese. Solution: set `NEXT_LOCALE=en` cookie before navigation to restore original English-content assumption.

## Final Test Results
**63/63 tests PASSED** ✓ (36.6s)
- All 7 previously-failing tests now pass
- No new failures introduced
- 100% suite green

## Fixed Tests

### homepage-content.spec.ts (6 tests)

1. **"renders all primary sections"** (line 33)
   - Fix: Added `NEXT_LOCALE=en` cookie for http://localhost:3100
   - Purpose: Restores English labels "DAYS", "HOURS", "MINUTES"

2. **"countdown shows zero-padded zero state, no 'Comming soon'"** (line 52)
   - Fix: Added `NEXT_LOCALE=en` cookie for http://localhost:3100
   - Purpose: Restores English countdown unit labels for `readCountdownUnitDigits()` helper

3. **"header nav links route to the awards and kudos pages"** (line 126)
   - Fix: Added `NEXT_LOCALE=en` cookie for http://localhost:3100
   - Purpose: Restores "Award Information" label (was rendering "Thông tin giải thưởng")

4. **"footer links point to the correct destinations and navigate correctly"** (line 144)
   - Fix: Added `NEXT_LOCALE=en` cookie for http://localhost:3100
   - Also updated assertion: "Tiêu chuẩn chung" → "General Standards" (English label)
   - Purpose: Tests navigation behavior (which button routes where), not language feature

5. **"hero CTA buttons route to the awards and kudos pages"** (line 171)
   - Fix: Added `NEXT_LOCALE=en` cookie for http://localhost:3100
   - Purpose: Restores regex match for "ABOUT AWARDS" button

6. **"account menu shows Profile/Sign out..."** (line 199)
   - Fix: Added `NEXT_LOCALE=en` cookie for http://localhost:3100
   - Purpose: Restores "Profile" menu item label (was rendering "Hồ sơ")

### prelaunch-countdown.spec.ts (1 test)

7. **"/prelaunch renders the static title and three countdown units"** (line 36)
   - Fix: Added `NEXT_LOCALE=en` cookie for http://localhost:3200
   - Also updated assertion: "Sự kiện sẽ bắt đầu sau" → "The event will begin in" (English heading)
   - Purpose: Tests countdown rendering, not locale feature

## Technical Details

### Cookie Method
Used Playwright's context API to inject locale cookie before navigation:
```typescript
await page.context().addCookies([
  { name: "NEXT_LOCALE", value: "en", url: "http://localhost:{port}" },
]);
await page.goto("/{path}");
```

### Translation Mapping Used
- `awardInfo`: "Award Information" (EN) ↔ "Thông tin giải thưởng" (VI)
- `generalStandards`: "General Standards" (EN) ↔ "Tiêu chuẩn chung" (VI)
- `profile`: "Profile" (EN) ↔ "Hồ sơ" (VI)
- `days`: "DAYS" (EN) ↔ "NGÀY" (VI)
- `prelaunch.heading`: "The event will begin in" (EN) ↔ "Sự kiện sẽ bắt đầu sau" (VI)

All translations verified against `/lib/i18n/dictionaries/{en,vi}.ts`

## No Code Changes
- ✓ No application source files modified
- ✓ Only E2E spec files updated (`e2e/*.spec.ts`)
- ✓ No test logic weakened or assertions deleted
- ✓ Tests verify exact same functional behavior as before

## Key Insight
These tests were never "testing English as a feature" — they were testing navigation behavior, menu interaction, and component rendering. Hardcoding English text was accidental (it's what existed when tests were written). The fix makes the English-text assumption EXPLICIT via cookie, restoring the original test intent without modifying the application.

---

## Build Context
- Test environment: Next.js 16
- Projects tested:
  - chromium: port 3000 (auth guard active, past event start)
  - chromium-authless: port 3100 (auth guard failing open, past event start)
  - chromium-prelaunch: port 3200 (auth guard failing open, FUTURE event start)
- i18n implementation: real VI/EN with NEXT_LOCALE cookie persistence (F005)
