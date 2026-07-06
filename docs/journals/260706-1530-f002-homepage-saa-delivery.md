# F002 Homepage SAA Delivery — A Lesson in Build-Time Inlining

**Date**: 2026-07-06 15:30  
**Severity**: High (discovery phase)  
**Component**: Homepage, E2E testing, playwright.config.ts  
**Status**: Resolved  
**Commit**: b116bca (98 files, 6067 insertions)

## What Happened

Shipped F002 Homepage SAA — a 6-screen reusable component library + full integration test suite. Parallel execution: Track A spawned 6 UI subagents (each building one section from MoMorph screenId i87tDx10uM), composited and visually validated across 3 viewports. Track B wired auth redirects, countdown ticker (ISO-8601 parsing, minute-boundary sync), placeholder routes (`/awards`, `/kudos`), and behavior state machines. Code review found 4 real defects; all fixed and re-verified. Then right before evidence seal, a fresh E2E run surfaced a silent but comprehensive failure: 13 homepage-content tests that ought to pass were reading redirects to `/login` instead.

Investigation cracked the root: **Next.js inlines every `NEXT_PUBLIC_*` variable at build time, everywhere it's referenced — including server-only code.** The playwright config's two webServers shared one build artifact, so the second server (port 3100, intended to run authless for content tests) inherited the first server's baked-in truthy Supabase credentials. The auth guard's fail-open logic never fired; it saw creds and redirected every time. Fixed by giving the authless server its own build into `NEXT_DIST_DIR=build-authless` (made env-overridable in next.config.ts). Final verified counts: 151 unit, 43 E2E.

## The Brutal Truth

Six hours of shipping confidence vaporized in the test gate. The earlier tester report claimed 35/35 E2E passing — but that was for login + access-control only. The homepage-content tests weren't run at the time. When we finally ran the full E2E suite against the sealed build, the failures cascaded like dominoes: every `homepage-content.spec.ts` assertion landed on `/login` instead of the actual page.

The galling part is the warning was right there in the codebase comment from the start — I wrote it myself in playwright.config.ts explaining why two webServers need two builds. Then I let it slip anyway. The authless build config was set up, but both still pointed to the same default `build/` directory. A one-line env variable being ignored.

This wasn't a typo or a surprise in the framework. It was a known pattern that I failed to actually execute on.

## Technical Details

**The artifact:**
```typescript
// playwright.config.ts lines 19–28
// IMPORTANT: Next.js inlines every `NEXT_PUBLIC_*` reference at BUILD time,
// everywhere it's read — including server-only code like `proxy.ts` and
// `lib/auth/require-user.ts`. It is NOT re-read from `process.env` at
// request time. That means the two webServers below CANNOT share one build
```

**The bug in action:**
- `proxy.ts` (server-only middleware) reads `process.env.NEXT_PUBLIC_SUPABASE_URL`
- Next.js compiler replaces that reference with the literal string at build time
- First build (port 3000): bakes in `"https://test-project.supabase.co"` (truthy)
- Second build reused the first build artifact → inherits the same inlined creds
- Auth guard sees truthy creds, redirects `/` → `/login` for every request, even with empty env vars passed to the second process

**Test failure signature:**
```
✘ [chromium-authless] › homepage-content.spec.ts:1
  1) [chromium-authless] › page.goto should render homepage with countdown
  
  Error: expected page URL http://localhost:3100 but got http://localhost:3100/login
```

13 of 16 homepage-content assertions hit this. The other 3 didn't because their first action was checking that `/` redirects to `/login` for unauth users (they were correct, just testing the wrong server).

**The fix:**
```bash
# playwright.config.ts webServer[1]
env: {
  NEXT_DIST_DIR: "build-authless",  # ← Independent build directory
  NEXT_PUBLIC_SUPABASE_URL: "",       # Truthiness independent from creds
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
}
```

`next.config.ts` made `distDir` env-overridable so each build populates its own directory. Both webServers start independently, no shared artifact.

**Stale test selector fix (bonus):**
Two `homepage-content` assertions expected `role="menu"` on the notification panel; an earlier accessibility fix had correctly changed it to `role="status"`. Updated both selectors.

## What We Tried

1. **Initial suspicion**: Missing env var in the test env — restarted playwright with explicit creds in the authless config. Didn't work.
2. **Debug trace**: Added console logging to proxy.ts to see what Supabase vars it actually saw. Revealed the strings were hardcoded — not coming from env.
3. **Root cause hunt**: Grepped the compiled `.next/` output — `NEXT_PUBLIC_SUPABASE_URL` was indeed a literal string, not a runtime reference.
4. **Wrong direction**: Thought maybe the webServer env wasn't being passed to the build command. Explicitly set `NEXT_PUBLIC_SUPABASE_URL=""` in the build env. Didn't help because the first build had already baked the opposite value.
5. **Right answer**: Two separate builds. Set `NEXT_DIST_DIR` in the authless server's env, made next.config.ts respect it, reran both builds independently.

## Root Cause Analysis

**Why this cracked:**
- The playwright config explicitly documented why two builds are needed (I wrote that comment).
- But the configuration didn't enforce it — both webServers still defaulted to `build/`.
- No integration test ran the full E2E suite against both projects until the evidence gate, 36 hours after the code went in.
- The tester reported on unit + login + access-control tests only; homepage-content (the one that caught this) wasn't in that run.

**The assumption that broke:**
I trusted that the design was executed. I didn't verify the distDir separation was actually baked into the config. The comment explains the pattern; the config needs to enforce it.

**Why it stayed hidden so long:**
- Unit tests for homepage content passed (they don't touch the build system).
- Access-control tests passed (they test that `/` redirects to `/login` — exactly what the broken authless server was doing).
- Only the `homepage-content.spec.ts` tests, which expect `/` to render the page without redirecting, would catch it. And those weren't run until the final evidence gate.

## Lessons Learned

1. **Comments are not code.** A well-documented pattern means nothing if the config doesn't enforce it. "Two builds needed" should have been a machine-checked invariant: `NEXT_DIST_DIR` hardcoded different per webServer, or a pre-test validation that confirms two different dist dirs exist.

2. **Build-time inlining is deceptive.** `NEXT_PUBLIC_*` variables get baked into every file that references them, including server-side middleware. Passing new env vars to a process doesn't change what's already compiled. This needs to be the first thing any engineer touches when adding Next.js secrets or environment-dependent auth. A guard in `next.config.ts` to fail loudly if `NEXT_PUBLIC_SUPABASE_*` aren't set at build time would catch this family of bugs.

3. **Full E2E coverage from the start.** Waiting until the evidence gate to run the complete test matrix means 36 hours of silence on a critical bug. Run `npx playwright test` as part of the integration phase, not just the final seal. A failing test at commit time beats a failing test in the evidence gate.

4. **Test project isolation is fragile.** The authless project exists to test "what if Supabase is missing?". But if it's easy for it to accidentally inherit the authed project's build, it will. Make inheritance impossible: separate directories, separate docker containers, or a pre-test script that verifies the condition being tested actually holds (e.g., "confirm authless server has empty Supabase vars in its running process").

## Next Steps

1. **Pattern guard** — Add a check in `next.config.ts` or a pre-test script to fail loud if any `NEXT_PUBLIC_SUPABASE_*` variables are baked into the wrong dist dir. Something like:
   ```typescript
   // In next.config.ts or a separate validation script
   if (process.env.NEXT_DIST_DIR === 'build-authless' && process.env.NEXT_PUBLIC_SUPABASE_URL) {
     throw new Error('NEXT_PUBLIC_SUPABASE_* must be empty for authless build');
   }
   ```

2. **E2E from integration onward** — Run the full `npx playwright test` suite as part of Track B's integration phase and again before evidence seal. Don't defer content-rendering E2E until the final gate.

3. **Document the pattern** — Expand `docs/development-rules.md` with a section on "Next.js Build-Time Variable Inlining": how it works, why it matters, and what it means for test configurations and auth patterns.

4. **Playwright config clarity** — The comment in playwright.config.ts is good; reinforce it with inline warnings at the distDir configuration points, and a README in `plans/260706-0858-homepage-saa/` explaining the two-webServer architecture for future reference.

---

**Evidence sealed:** 151 unit tests (vitest), 43 E2E tests (playwright, all fresh), tsc clean, eslint clean, build clean.  
**Commit ready for merge:** b116bca

