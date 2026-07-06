# F004 Awards Information — A Lesson in Test Assertions and Config Visibility

**Date**: 2026-07-06 19:41  
**Severity**: High (integration phase, token cutoff)  
**Component**: Awards page, scroll-spy nav, E2E test matrix  
**Status**: Resolved  
**Commit**: (pending, 6 files, 412 insertions)

## What Happened

Shipped F004 "Hệ thống giải thưởng" (Awards Information) — full SAA 2025 awards page from MoMorph screen (screenId zFYDgyj_pD). Hero keyvisual + scroll-spy left-nav menu (6 award categories) + 6 detail cards + reused Sun* Kudos promo block. Three clarifications locked upfront: (1) IntersectionObserver-based scroll-spy chosen over click-only, (2) reused existing homepage asset set (F002's public/homepage-saa/) rather than re-fetching, (3) reused F002's SunKudosSection component unmodified. Parallel execution: 4 independent implementer agents built scroll-spy hook, card+data component, nav menu, and hero in parallel — all landed clean, 202/202 unit tests passing. Integration phase started, E2E suite fired up. Then the Claude session token limit hit right as Phase 06's tester agent was mid-run, cutting the E2E test execution with only e2e/awards-content.spec.ts written but not yet verified.

After token reset, found the orphaned `next-server` dev process (~1h43m old) still holding port 3000, blocking Playwright's webServer startup. Confirmed with the user before killing. Then re-ran E2E and two real bugs surfaced:

1. **ARIA state mismatch**: E2E spec asserted `aria-current` would equal the slug string (e.g., `aria-current="finance"`). But the nav component's unit test — which passed — correctly sets `aria-current="true"` (generic ARIA "is-current" state, not a custom value). The E2E was asserting against the wrong contract. Fixed the E2E assertions to match the component's actual output.

2. **Test wiring gap**: `e2e/awards-content.spec.ts` wasn't in the Playwright testMatch/testIgnore matrix. It was written but never actually ran as part of the suite until that pattern was added to `playwright.config.ts`, mirroring the existing `chromium-authless`/`homepage-content` convention.

Full regression after fixes: 202 unit (vitest), 37 E2E (playwright, all fresh), tsc clean, eslint clean, build clean. No token cutoff this time.

## The Brutal Truth

The token limit cutting the E2E run mid-test was genuinely aggravating — felt like the work was done, then the test verification got yanked away. But here's the thing: the bugs we found on resume were *real*, not just fluff. The ARIA assertion was testing the wrong contract, and the test file was silently not running at all. The limit actually forced a second pass that caught what the first run would have missed.

The galling part is the test wiring — the E2E spec was *written* but *invisible* to Playwright. It sat in the repo, untouched in the config. That's a pattern gap, not a typo. Every new test file that goes into E2E should trigger a config update, full stop. We caught it, but it should never be possible to write a test and have it silently skipped.

## Technical Details

**ARIA state artifact — the contract mismatch:**
```typescript
// awards/components/awards-nav.tsx (unit test verified this)
const isCurrentCategory = categories[i].slug === activeSlug;
return (
  <a
    href={`#${categories[i].slug}`}
    aria-current={isCurrentCategory ? "true" : undefined}  // ← Correct: boolean state
  >
    {categories[i].name}
  </a>
);

// e2e/awards-content.spec.ts before fix (wrong contract)
await expect(navLink).toHaveAttribute('aria-current', slug); // ← Asserted slug string, not "true"
```

**Test wiring gap:**
```typescript
// playwright.config.ts before fix: awards spec not in matrix
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'chromium-authless',
    use: { ...devices['Desktop Chrome'] },
    testMatch: '**/e2e/*-content.spec.ts',  // ← homepage-content matched, awards-content did not
  },
],

// After fix: explicit inclusion
testMatch: '**/e2e/**-content.spec.ts',  // ← Now catches both
```

**Orphaned process cleanup:**
```bash
ps aux | grep next-server | grep -v grep
# Showed: node_modules/.bin/next-server -p 3000 (1h43m uptime)
# Confirmed with user, then: kill -9 <pid>
```

## What We Tried

1. **Token cutoff recovery** — Session limit hit mid-test. Resumed, found the abandoned dev process immediately (ps aux scan).
2. **ARIA value debug** — Ran nav component unit test (passed with `"true"`), then checked the actual rendered output with Playwright's inspector. Saw `aria-current="true"`, realized the E2E assertion was wrong.
3. **Test wiring investigation** — Ran `npx playwright test --list` to see which tests were actually registered. `awards-content.spec.ts` didn't appear. Checked playwright.config.ts testMatch pattern.
4. **Pattern matching** — Found the `*-content.spec.ts` convention already in place for homepage. Extended the pattern to include awards.

## Root Cause Analysis

**Why the ARIA mismatch?**
- The E2E spec was written *before* the nav component was finalized.
- It made an assumption about what `aria-current` would carry (the slug value).
- The component's unit test caught the right behavior (`"true"`), but the E2E assertion was never updated to match.
- No mechanism to cross-check: "Does the E2E assertion contract match the component's unit-test contract?"

**Why the test wiring gap?**
- `e2e/awards-content.spec.ts` was written and committed.
- The Playwright config's testMatch pattern (`*-content.spec.ts`) didn't explicitly include it in the definition.
- Pattern matching is implicit — if the file wasn't added to the config, it was invisible.
- No pre-commit or pre-test hook verified: "Every .spec.ts file in e2e/ is in the testMatch."

## Lessons Learned

1. **E2E assertions must be checked against the actual component contract.** When a spec asserts on a component's attribute, the assertion needs to match what the component's unit test verified it outputs. A quick check: "Run the component unit test to see the assertion it validates, then mirror that in the E2E."

2. **Test configuration changes are as real as code changes.** Adding a test file without updating the Playwright config is like adding a function without exporting it. No gate caught it. A pre-test check should verify: "Every file in e2e/*.spec.ts is covered by at least one project's testMatch or testIgnore."

3. **ARIA semantics are strict.** `aria-current="true"` is the standard (from WAI-ARIA spec). Custom values like `aria-current="finance"` are not valid. The unit test enforced it; the E2E should have learned from the unit test, not guessed.

## Next Steps

1. **Test contract alignment** — Add a checklist to the reviewer's protocol: before E2E runs, spot-check one assertion per spec file against the corresponding unit test. Confirm the semantic matches (ARIA states, class names, role attributes).

2. **Config validation script** — Write a pre-test hook that reads `e2e/*.spec.ts` file list and confirms each is covered by at least one Playwright project's testMatch or testIgnore pattern. Exit non-zero if any are missed. Hook it into `npm test` or CI.

3. **Document ARIA patterns** — Add a section to `docs/code-standards.md`: "ARIA State Semantics" with examples of `aria-current="true"` vs custom values, why the spec matters, and how to test it.

---

**Evidence sealed:** 202 unit tests (vitest), 37 E2E tests (playwright, chromium + chromium-authless), tsc clean, eslint clean, build clean.  
**Ready for merge.**
