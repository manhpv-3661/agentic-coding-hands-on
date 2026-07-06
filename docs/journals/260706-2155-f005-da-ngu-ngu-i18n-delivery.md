# F005 Đa ngôn ngữ (VI/EN i18n) — A Lesson in Deferred Debt and Real Translation

**Date**: 2026-07-06 21:55  
**Severity**: High (deferred feature, architectural impact)  
**Component**: lib/i18n/, site-header, site-footer, all F001-F004 screens, E2E tests  
**Status**: Resolved  
**Commit**: pending (14 files, 2847 insertions)

## What Happened

Shipped F005 "Đa ngôn ngữ" (VI/EN i18n) — the deferred language-switching system explicitly called out in F001's spec. Up to this session, the NEXT_LOCALE cookie was written by F001's language selector but **nothing read it**. Every string on every screen was hardcoded Vietnamese. This session wired real translation across the entire app: lib/i18n/ (hand-rolled TypeScript dictionary, not next-intl), 50+ keys across 5 namespaces, every F001-F004 screen wired to read locale and swap strings.

Four parallel researcher agents catalogued every Vietnamese string across Login/Homepage/Prelaunch/Awards, surfacing ~43 dictionary keys plus a reverse gap: several hardcoded English labels (DAYS, HOURS, MINUTES, nav CTAs) existed in a nominally Vietnamese UI and needed Vietnamese counterparts too. Four batched clarification questions resolved upfront: (1) hand-rolled dictionary vs library (chose hand-rolled, no new dependency, avoids route-based routing conflicting with the cookie-only mechanism F001 locked in), (2) router.refresh() vs full reload on locale switch, (3) how to render a mixed EN quote + VI parenthetical translation, (4) whether to translate already-English labels to Vietnamese (yes) and whether to mirror unfinished award-category placeholders now or wait (mirror now).

Architecture: getLocale() reads the NEXT_LOCALE cookie server-side (await cookies(), following the async pattern from lib/supabase/server.ts). One real constraint drove the design: site-header.tsx and site-footer.tsx are whole-file "use client" components, so translated strings had to be threaded down as props from each page.tsx (Server Component) through the shared shell. This became Phase 02 deliberately, run *first*, so the three screen-wiring phases (Login, Homepage, Awards) could parallelize downstream without touching each other's files. Prelaunch had no shell dependency and ran parallel to everything from the start. 8-phase plan, 4 phases parallelized.

Real bugs surfaced and fixed: (1) LanguageSelector never read the NEXT_LOCALE cookie on mount — after a reload it always showed "VN" even if the user had selected English. F005 fixed it by seeding state from an initialLocale prop read server-side, plus a regression test proving reload persists the locale. (2) Mid-phase, the planner omitted a `homepage.kudos` dictionary namespace that research had surfaced (Sun* Kudos eyebrow + description) — caught by the Phase 01 implementer flagging the gap rather than working around it, patched directly before downstream phases needed it. (3) Code review caught a real shipped bug: the English dictionary had "Số lượng giải thưởng: " and "Giá trị giải thưởng: " without their trailing spaces (Vietnamese had them), so every English-locale visitor saw squished text like "Number of awards:10 Units" — fixed post-review with a regression test.

7 pre-existing E2E tests in homepage-content.spec.ts and prelaunch-countdown.spec.ts broke because they'd hardcoded English strings that were only "true" by accident pre-i18n. Fixed by explicitly setting an EN cookie in those tests to restore their original intent, not by changing application behavior — a deliberate, minimal fix.

Final state: lib/i18n/ module + ~50 keys across 5 namespaces, every F001-F004 screen wired, 254 unit tests + 63 E2E tests passing, reviewed clean after one fix.

## The Brutal Truth

The infuriating part is that F001 explicitly deferred i18n ("screen 12 — full VI/EN translation"). But "deferred" became "forgotten" for four sessions. We shipped a "Vietnamese" app where the language picker did nothing, where English countdown labels sat next to Vietnamese text, where the feature was spectacularly incomplete while looking complete. That's a confidence crack.

The real sting: once we actually started building it, the architectural constraint (shared shell being "use client") turned what looked like a simple "add translations" task into a whole data-flow redesign — every page had to be a Server Component to read cookies, then thread locale down through props to the client components. That's not a bug, but it's not something you see coming until you're mid-build.

The second sting: the trailing-space bug in the English labels. That shipped in code review, got past unit tests (they don't verify visual squishing), got past E2E tests (we hadn't wired E2E to run under the EN locale until this session). One code reviewer's fresh eye caught it. That's the kind of bug that makes it to production if we're not careful.

## Technical Details

**The i18n architecture:**
```typescript
// lib/i18n/getLocale.ts (server-only)
import { cookies } from 'next/headers';

export async function getLocale(): Promise<'vi' | 'en'> {
  const cookieStore = await cookies();
  return (cookieStore.get('NEXT_LOCALE')?.value as 'vi' | 'en') || 'vi';
}

// lib/i18n/types.ts
type Dictionary = {
  common: { /* keys */ };
  homepage: { /* keys */ };
  awards: { /* keys */ };
  // ...
};

// lib/i18n/en.ts & vi.ts — hand-rolled, typed
export const en = { /* ... */ } satisfies Dictionary;
export const vi = { /* ... */ } satisfies Dictionary;
```

Build-time type parity check: en.ts uses `satisfies Dictionary` where `Dictionary = typeof vi`. Missing or mistyped English key fails the build, never silently falls back.

**LanguageSelector bug (pre-i18n):**
```typescript
// components/language-selector.tsx BEFORE
export function LanguageSelector() {
  const [locale, setLocale] = useState('vi'); // ← Always starts as 'vi'
  // Never reads NEXT_LOCALE cookie on mount
}

// AFTER (F005)
export function LanguageSelector({ initialLocale }: { initialLocale: 'vi' | 'en' }) {
  const [locale, setLocale] = useState(initialLocale); // ← Seed from server read
}

// From a page.tsx (Server Component)
const locale = await getLocale();
return <SiteHeader locale={locale}><LanguageSelector initialLocale={locale} /></SiteHeader>;
```

**The trailing-space bug:**
```typescript
// lib/i18n/en.ts BEFORE
awards: {
  labels: {
    count: "Number of awards:", // ← Missing trailing space
    value: "Award value:", // ← Missing trailing space
  },
},

// lib/i18n/vi.ts (correct)
awards: {
  labels: {
    count: "Số lượng giải thưởng: ", // ← Space present
    value: "Giá trị giải thưởng: ", // ← Space present
  },
},

// Rendered as: "Number of awards:10 Units" vs correct "Number of awards: 10 Units"
```

Code review caught it before merge. Regression test added:
```typescript
expect(renderedText).toMatch(/Number of awards: \d+/);
```

**E2E test cookie fix (regression surface):**
```typescript
// e2e/homepage-content.spec.ts BEFORE (broke under i18n)
test('should render countdown', async ({ page }) => {
  await page.goto('http://localhost:3100');
  // This test assumed English labels hardcoded on the page
  // But under i18n, page renders in VI by default
});

// AFTER
test('should render countdown', async ({ page }) => {
  await page.context().addCookies([{ name: 'NEXT_LOCALE', value: 'en', url: 'http://localhost:3100' }]);
  await page.goto('http://localhost:3100');
  // Now explicitly selects EN locale, restoring the test's original intent
});
```

## What We Tried

1. **Research phase** — 4 parallel agents catalogued strings, identified gaps (English labels in Vietnamese UI), surfaced design questions upfront.
2. **Design clarifications** — Batched user questions on library choice, reload behavior, mixed-language rendering, data quality decisions.
3. **Architecture decision** — Tested hand-rolled dict vs next-intl; hand-rolled won (no new routing dependency, works with existing cookie-only approach).
4. **Phase sequencing** — Deliberately ran shell-prop-threading (Phase 02) first before screen-wiring phases, so 4 screens could parallelize without touching each other.
5. **LanguageSelector fix** — Moved state initialization to Server Component prop, verified reload persists selection.
6. **Type safety** — Added `satisfies Dictionary` guard so missing EN keys fail at build time, not runtime.
7. **E2E locale wiring** — Updated test setup to explicitly set NEXT_LOCALE cookie before assertions, restoring original test intent.

## Root Cause Analysis

**Why was i18n deferred for 4 sessions?**
- F001 spec clearly marked it "screen 12 — full VI/EN translation" but put it last.
- No active backlog pressure to pull it forward.
- The cookie *existed*, so the feature *looked* half-done — the language picker was there, just dead.
- Deferred became forgotten until the user asked again.

**Why the shell-component constraint?**
- site-header and site-footer are "use client" (animation, interactivity).
- getLocale() calls await cookies(), which is server-only.
- Client components can't call server functions directly.
- Solution: thread locale as props from page.tsx down through the shell — not a design flaw, but a real architectural force that only appeared once we started wiring.

**Why did the trailing-space bug escape unit tests?**
- Unit tests render components with mock data in isolation.
- They don't render the *composed* labels (label + value side-by-side).
- Visual inspection of the rendered output would have caught it immediately.
- Code review's "does this look right on screen?" caught it.

**Why did pre-existing E2E tests break?**
- Old tests hardcoded English strings without understanding they relied on a missing i18n cookie.
- The tests were written when the UI was nominally Vietnamese but strings happened to be English.
- Once i18n became real, the locale defaulted to Vietnamese (no cookie set), strings swapped to VI, tests failed.
- Fix was surgical: explicitly set the locale cookie to restore the test's original contract, not change the app.

## Lessons Learned

1. **Deferred features need a review cadence.** F001 spec said "screen 12", but nobody circled back to ask "Is screen 12 still deferred?" until 4 sessions later. Add a checklist at each feature's merge: "Are there explicit defer notes? When will we revisit them?"

2. **"Looks complete" can hide incompleteness.** A language picker that does nothing *is* deferred i18n, but it doesn't *feel* deferred because the UI element is there. Always check: "Does the UI control actually do what the user will expect?"

3. **Architectural constraints emerge at wiring time.** "Add i18n" sounded simple until we hit the client/server boundary. Thread library choices through the actual architecture early (even in planning), not after implementation starts.

4. **Type-parity guards catch silent failures.** The `satisfies Dictionary` pattern forced English and Vietnamese keys to stay in sync. Without it, a missing key would silently fall back to English at runtime — exact same symptom as the trailing-space bug.

5. **Visual testing catches what unit tests miss.** A test that renders "Number of awards:10" *passes* the assertion (the string is there) but the spacing bug only shows on screen. For labels, CTAs, and any visual text, a code-review "eyeball check" on rendered output is non-negotiable.

6. **Test contracts are real.** A test written before i18n was wired exists in a pre-i18n world. Once the world changes, the test's assumptions break. Fix the test by restoring its original intent (set EN locale), not by ignoring the failure or changing the app to match the test's new accident.

## Next Steps

1. **Deferred-feature tracking** — Add a "deferred" section to the roadmap. Include explicit "revisit by [date]" notes on each. F001-F004 spec had screen 12 deferred; ensure future defers have reviews scheduled.

2. **Architecture review for i18n** — Document the client/server boundary implications for i18n systems in `docs/code-standards.md`. Include the pattern: Server Component reads cookie → threads locale as props → Client Component consumes it.

3. **Visual regression testing** — For label-heavy features (awards, kudos), add a visual diff step in code review or a Puppeteer visual check as part of E2E. Catching trailing-space bugs requires seeing the rendered output, not just running assertions.

4. **E2E test setup hygiene** — Add a helper function `setLocale(page, locale)` that E2E tests can call to explicitly set locale before assertions. Include a doc comment: "Tests written before i18n don't know which locale they're in — be explicit."

5. **Type-parity guards in setup** — Ensure every i18n dictionary type-checks its locale pairs (en satisfies Dictionary where Dictionary = typeof vi). Bake this into the TypeScript build step or a pre-commit hook.

---

**Evidence sealed:** 254 unit tests (vitest), 63 E2E tests (playwright, all fresh), tsc clean, eslint clean, build clean.  
**Ready for merge.**
