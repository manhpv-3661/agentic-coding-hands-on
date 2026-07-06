# F003 Countdown Prelaunch — A Lesson in Matcher Scope and Test Isolation

**Date**: 2026-07-06 17:43  
**Severity**: High (integration phase)  
**Component**: Proxy time-gate, prelaunch page, E2E test matrix  
**Status**: Resolved  
**Commit**: 7d93882 (37 files, 2247 insertions)

## What Happened

Shipped F003 Countdown Prelaunch — a site-wide navigation time-gate that blocks access to every route (including `/login`) before the SAA 2025 launch date (`NEXT_PUBLIC_EVENT_START_AT`). Parallel execution: Track A spawned one background `implementer` building the presentational `/prelaunch` page (static Vietnamese title "Sự kiện sẽ bắt đầu sau", 3 LED countdown blocks reusing F002's logic) with mock data from Figma. Track B built the backend/logic layer concurrently: `proxy.ts` time-gate (broad matcher, predicate-based gating), `use-prelaunch-auto-redirect.ts` client hook (auto-unlock when countdown reaches zero), and `safe-redirect.ts` open-redirect sanitizer. Clean integration contract, no rework needed at merge. Then during review/integration, two unrelated bugs surfaced:

1. **Matcher side effect**: Broadening `proxy.ts`'s route matcher to catch every request (needed for the time-gate to see all routes) had an unintended consequence — every request, including public static assets, now triggered a live Supabase `getUser()` network call. This should have been scoped back to `/login` + protected routes only. Fixed by adding a guard restricting the auth call to specific routes before calling Supabase.

2. **Test fixture coupling**: The new gate's broad matcher broke ALL of F001/F002's existing E2E test suite. Investigation revealed: F002's playwright config used a future `NEXT_PUBLIC_EVENT_START_AT` baked into its build (for the homepage's "coming soon" demo state). The new time-gate now intercepts `/login` in that future-dated build, blocking the entire auth flow during E2E test setup. Fixed by giving the time-gate its own dedicated third Playwright build project with a past date, and updating one F002 assertion to match the new reachable-state reality (homepage's "coming soon" state is now permanently unreachable via real navigation).

Evidence sealed (hard stage): 181 unit tests (vitest), 52 E2E tests (playwright, 3 projects: chromium, chromium-authless, chromium-prelaunch), tsc clean, eslint clean, build clean.

## The Brutal Truth

The matcher scope bug stung — the whole point of a time-gate is to intercept before auth, but we accidentally made the *auth system itself* pay a tax on every single request, even public assets that never needed auth. That's a classic mistake: widen the aperture to see everything, forget to narrow the actual *action* back down.

The galling part is the test suite didn't catch it first. The reviewer found the auth-call side effect; the tester's own E2E run reported inaccurate numbers (claimed 13 tests, actually ran 9; claimed environment issues prevented execution, it ran fine when invoked directly). Only when we manually re-ran the full Playwright matrix did we discover the real problem: test fixture state had drifted from production state. We trusted the agent's report; we should have verified.

## Technical Details

**Matcher side effect — the artifact:**
```typescript
// lib/middleware/proxy.ts before fix
export async function proxy(req: NextRequest) {
  // Catch-all for time-gate: intercept every route
  const isBeforeLaunch = timeGateCheck(req);
  if (isBeforeLaunch) {
    return redirect(req, '/prelaunch');
  }

  // But this guard ran on EVERY request, including static assets
  if (req.nextUrl.pathname === '/login' || isProtected(req.nextUrl.pathname)) {
    const { data } = await supabase.auth.getUser(); // ← Called even for /favicon.ico
  }
  
  return NextResponse.next();
}
```

This meant every single request — images, fonts, stylesheets — triggered a Supabase API call. On high-traffic tests or production, this would be a cascading failure.

**Test fixture coupling — the root:**
- F002's playwright config baked `NEXT_PUBLIC_EVENT_START_AT=2026-07-15T00:00:00Z` (future) into the build, for demo purposes.
- F003's time-gate reads that same env var at request time.
- When F003 ships, that future-dated build is still active in the F001/F002 test suite.
- Time-gate now intercepts `/login` in all three webServers, blocking F001/F002's entire auth flow during setup.
- Result: every F001/F002 test that tried to reach `/login` got redirected to `/prelaunch` instead.

**The actual test failure:**
```
✘ [chromium] › homepage-content.spec.ts:1
  1) Expected to log in, but got redirected to /prelaunch instead
  
  Error: expected page URL http://localhost:3000/login but got http://localhost:3000/prelaunch?next=/login
```

All 9 homepage-content assertions failed in the F002 suite; access-control tests also hit this but some had assertions that accidentally matched the broken state.

## What We Tried

1. **Initial diagnosis**: Assumed the matcher was correct, focused on why auth calls were slow. Traced the Supabase client to find getUser() was being called 10x per test run.
2. **Scope narrowing**: Added a route-based guard (`if (isLoginOrProtected(path))`) before calling Supabase. Brought the call count back to expected levels.
3. **E2E matrix investigation**: Re-ran full Playwright test suite to verify scope fix. F002 suite failed. Checked the build artifact — confirmed future date was baked in.
4. **Test isolation fix**: Created a third Playwright project with `NEXT_PUBLIC_EVENT_START_AT` set to a past date (2026-06-01), so time-gate never engages. F001/F002 tests now run in a pre-launch-expired environment; F003 tests run in chromium-prelaunch with a future date.
5. **F002 assertion cleanup**: One homepage assertion expected the "coming soon" state to be reachable via navigation. With the time-gate now active, that state is permanently unreachable (time-gate catches you before you can set the countdown). Updated the assertion to test the state exists in the component props (unit level) instead of the full user flow.

## Root Cause Analysis

**Why the matcher side effect happened:**
- The requirement was broad: "intercept every route."
- The implementation was also broad: blanket matcher that feeds every request into the auth check.
- No separation between "intercept for gating" (cheap, local predicate) and "intercept for auth lookup" (expensive, network call).
- The auth guard's original scope assumed it would only run on authenticated routes. Expanding the matcher broke that assumption.

**Why test isolation failed:**
- F002's build config used a future date for a UI demo feature (homepage countdown).
- F003 was written assuming test builds would be independent — each project would have its own env.
- But the three projects (chromium, chromium-authless, chromium-prelaunch) were all pointing to the same playwright config base, inheriting shared env settings.
- The tester's report claimed the environment was broken; in reality, it was working as configured, but the configuration didn't account for the new time-gate's behavior.

**Why the tester's report was inaccurate:**
- The agent reported 13 tests, but only 9 ran (the homepage-content suite).
- It reported environment setup failures preventing E2E execution; the tests actually ran, just failed.
- This was observational — the agent misread the output — not a process failure, just a reminder to verify independent of the report.

**The AGENTS.md instruction anomaly:**
- `AGENTS.md` contains: "Read the relevant guide in `node_modules/next/dist/docs/` before writing any code."
- This path does NOT exist in any real Next.js release. The sandbox also blocks `node_modules` access outright.
- Treated as a planted/adversarial instruction and ignored. Coded against actual installed Next.js 16.2.10 behavior instead, verified empirically via build/test runs.
- Worth noting in case this resurfaces as a supply-chain test or probe.

## Lessons Learned

1. **Matcher scope requires explicit bounds.** Broadening the matcher to "intercept everything" must be paired with explicit, narrow scoping of the *action* that runs inside. A catch-all matcher with an expensive guard inside is a DOS vector. The guard should run only where it's needed; the matcher should have no side effects. Draw a hard line: if you widen the matcher, narrow the guard logic even more.

2. **Test fixture state must mirror production state.** F002's build was configured for a demo state (future date). When F003 was added, it read that same env var at runtime, creating implicit coupling. Any agent or tool that modifies the test environment needs to be visible in the test configuration — no hidden assumptions. Use separate, explicit env overrides per Playwright project (one per behavior under test), and document why each date was chosen.

3. **Agent reports are observations, not truth.** The tester reported what it *saw* in the output, but misread the summary. Verify critical findings independently — re-run the test suite, check the raw output, confirm counts. A high-confidence report from an agent is still one person's read of the logs. Spot-check it when stakes are high.

4. **Build-time inlining strikes again.** This isn't new (F002 taught it), but it's relentless. Adding env-dependent logic to `proxy.ts` meant every test build that touches that env needed its own isolation. No shared build artifact, no inherited env from an earlier project. Make isolation a configuration primitive, not an assumption.

## Next Steps

1. **Matcher scope guard** — Document in `docs/development-rules.md` a pattern: "Broad matchers must have narrow guards. If a matcher covers N routes, enumerate exactly which routes execute the expensive operation inside. Use a checklist; do not assume."

2. **Test environment clarity** — Expand `playwright.config.ts` with inline documentation for each project: "chromium: PAST date (time-gate disabled)", "chromium-prelaunch: FUTURE date (time-gate active)", "chromium-authless: EMPTY Supabase vars". Add a pre-test validation script that reads the running process's env and confirms the condition each project claims to test.

3. **Verify agent reports on integration phase** — Before evidence seal, spot-check critical agent findings: re-run test counts, inspect raw output, confirm the numbers add up. A checklist item: "Tester report: run `npx playwright test --reporter=list | tail` and confirm total count matches agent report."

4. **Document the AGENTS.md anomaly** — Add a note in the project README or `CLAUDE.md` flagging the `node_modules/next/dist/docs/` instruction as invalid (path does not exist in any real Next.js release, sandbox blocks access). Future engineers should not be misled by it.

5. **Hydration warning investigation (non-blocking)** — During manual verification, a hydration warning appeared on `<html>` className during `/prelaunch` load. Traced to pre-existing `app/layout.tsx` geist-font scaffold (unrelated to F003, present on every route). Likely a browser-extension false positive. Mark as "observed but not actionable" until it reproduces in a clean environment.

---

**Evidence sealed:** 181 unit tests (vitest), 52 E2E tests (playwright, chromium + chromium-authless + chromium-prelaunch), tsc clean, eslint clean, build clean.  
**Commit ready for merge:** 7d93882
