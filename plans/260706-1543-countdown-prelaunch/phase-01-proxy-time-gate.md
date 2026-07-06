# Phase 01 — Proxy time-gate + matcher expansion (Track B)

## Context Links
- `plans/260706-1543-countdown-prelaunch/spec/countdown-prelaunch/technical-spec.md` — FR-001, FR-006, BR-001
- `plans/260706-1543-countdown-prelaunch/spec/system/permissions.md` — time-gate delta
- `proxy.ts` — existing auth-gate to compose with (read fully before editing)
- `lib/event-countdown.ts` — reuse `parseEventStart` + `computeCountdown` (unmodified)
- `app/auth/callback/route.ts` — `?next=` open-redirect precedent

## Overview
- **Priority:** P0 (site-wide access control)
- **Status:** done
- **Track:** B — parallel-runnable, no dependency on Track A or Phase 02.
- Add a time-gate at the very top of `proxy()` that redirects every request to `/prelaunch`
  before launch, then falls through to the existing auth-gate unchanged after launch.

## Key Insights
- The gate must run **before** the Supabase env/auth block so it works even when Supabase env is
  absent (mock repo no-op). Time-gate depends only on `NEXT_PUBLIC_EVENT_START_AT`.
- Reuse countdown math — do NOT re-implement. `computeCountdown(parseEventStart(env), new Date())`
  returns `isZero`. `isZero === true` ⇒ launched OR env missing/invalid (fail-open) ⇒ no redirect.
  `isZero === false` ⇒ before launch ⇒ redirect.
- These are pure functions with no React/DOM deps — safe to import in the `nodejs`-runtime proxy.
- Matcher must flip from allowlist to catch-all-minus-exemptions so no route escapes the gate.

## Requirements
- FR-001: before launch, every request except `/prelaunch` + static assets → `/prelaunch`, running before auth.
- FR-006: redirect carries original path (+query) in `?next=`.
- BR-001: only exemptions are `/prelaunch` and static assets.
- FR-005/BR-001: at/after zero (or env missing/invalid) → no time-gate interference; auth-gate unchanged.

## Architecture

### Data flow (per request)
```
request → proxy()
  1. TIME-GATE (new, first):
     state = computeCountdown(parseEventStart(process.env.NEXT_PUBLIC_EVENT_START_AT), new Date())
     if !state.isZero AND pathname !== "/prelaunch":
         url = new URL("/prelaunch", request.url)
         url.searchParams.set("next", pathname + search)   // auto-encoded
         return NextResponse.redirect(url)
  2. (unchanged) Supabase env check → fail-open no-op if missing
  3. (unchanged) getUser + auth-gate redirects
```
- The `pathname !== "/prelaunch"` in-function guard is defense-in-depth: the matcher already
  excludes `/prelaunch`, so the fn won't run on it in prod, but the guard prevents any self-redirect
  loop when the fn is called directly (unit tests / future matcher changes).

### Matcher
Replace:
```ts
export const config = { matcher: ["/", "/awards", "/kudos", "/todo/:path*", "/login"] };
```
with catch-all minus Next internals + the gate target:
```ts
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|prelaunch).*)"],
};
```
- Next.js 16 negative-lookahead matcher (same config format the file already uses; verify against
  `node_modules/next/dist/docs/` per AGENTS.md before finalizing).
- `/auth/callback` is now matched (was not before). Intended: pre-launch it also redirects to
  `/prelaunch` (spec: no route exempt but `/prelaunch`); post-launch it passes through auth-gate
  (not protected, not `/login`). See Risk.

### Optional pure helper (recommended for testability)
Extract the predicate as a named pure fn inside `proxy.ts` (keep file < 200 lines):
```ts
function isBeforeLaunch(now: Date): boolean {
  return !computeCountdown(parseEventStart(process.env.NEXT_PUBLIC_EVENT_START_AT), now).isZero;
}
```

## Related Code Files
- **Modify:** `proxy.ts` — add time-gate block (top of `proxy()`), add import from
  `@/lib/event-countdown`, replace `config.matcher`.
- **Modify:** `.env.local.example` — append comment noting `NEXT_PUBLIC_EVENT_START_AT` also drives
  the prelaunch time-gate (var already exists from F002 — comment only, no new var).
- **Do NOT modify:** `lib/event-countdown.ts`, `hooks/use-event-countdown.ts`.

## Implementation Steps
1. Import `parseEventStart`, `computeCountdown` from `@/lib/event-countdown` in `proxy.ts`.
2. At the first line of `proxy()` body, compute `beforeLaunch` and, if true and
   `pathname !== "/prelaunch"`, return `NextResponse.redirect` to `/prelaunch?next=<path+search>`.
   Read `pathname`/`search` from `request.nextUrl`.
3. Leave the entire existing Supabase/auth block untouched below the time-gate.
4. Replace `config.matcher` with the negative-lookahead catch-all string.
5. Update `.env.local.example` comment.
6. Run `npx tsc --noEmit` (or the repo build/lint) to confirm no compile errors.

## Todo List
- [x] Import countdown primitives into `proxy.ts`
- [x] Add time-gate block before auth logic
- [x] Build `/prelaunch?next=` redirect with encoded original path+query
- [x] `pathname !== "/prelaunch"` self-redirect guard
- [x] Replace matcher with catch-all-minus-exemptions
- [x] Comment `.env.local.example`
- [x] Typecheck/lint passes

## Success Criteria
- SC-001: before launch, `/`, `/login`, `/awards`, `/kudos`, `/todo` all 307 → `/prelaunch?next=<path>`.
- SC-002/SC-004: with env in the past (or unset), none of those redirect to `/prelaunch`; auth-gate
  behavior identical to today.
- Redirect location preserves the original path in `?next=`.

## Risk Assessment
| Risk | Likelihood | Impact | Countermove |
|------|-----------|--------|-------------|
| Matcher syntax wrong → gate misses routes or loops | Med | High | Verify pattern vs Next 16 docs; unit-test proxy across all routes incl `/prelaunch` (no loop) |
| Catch-all now runs proxy on `/auth/callback`, interfering with code exchange | Low-Med | Med | Post-launch it only passes through (not protected); add e2e asserting callback still works; if it breaks, add `auth/callback` to matcher negative-lookahead |
| Extra `getUser` cost on newly-matched routes | Low | Low | Time-gate returns before auth block pre-launch; post-launch cost equals prior protected-route cost |

## Security Considerations
- Enforcement is server-side (proxy) — client clock cannot bypass the gate.
- Fail-open when env missing/invalid, consistent with existing Supabase fail-open (acceptable for
  mock/training repo; flag as NOT production-safe, mirroring current proxy doc comment).
- `?next=` is only *written* here (original internal path); it is *validated* on read in Phase 02.

## Next Steps
- Phase 02 consumes `?next=` for the client auto-unlock.
- Phase 03 wires the `/prelaunch` page; Phase 04 covers the e2e gate assertions.
