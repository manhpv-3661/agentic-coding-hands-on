# Phase 04 — Test matrix + DoD (Track B)

## Context Links
- Phases 01–03; `spec/countdown-prelaunch/technical-spec.md` (SC-001..004),
  `spec/countdown-prelaunch/edge-cases.md`
- Existing patterns: `tests/unit/proxy.test.ts`, `tests/unit/auth-callback.test.ts`,
  `tests/unit/use-event-countdown.test.tsx`, `e2e/access-control.spec.ts`
- Stack: Vitest + Testing Library (unit), Playwright (e2e). Configs: `vitest.config.ts`,
  `playwright.config.ts`, `vitest.setup.ts`.

## Overview
- **Priority:** P1
- **Status:** done
- **Track:** B. This phase is **pointers only** — the `tester` agent writes/runs tests against the
  final merged code. Do not write test bodies here.
- **Depends on:** 01, 02, 03.

## Key Insight
- e2e in this repo runs with the proxy as a **no-op** when Supabase env is absent (see existing
  `access-control.spec.ts` comments). The time-gate, however, depends only on
  `NEXT_PUBLIC_EVENT_START_AT` and runs *before* the Supabase check — so e2e gate assertions are
  driven by setting `NEXT_PUBLIC_EVENT_START_AT` (future vs past), independent of Supabase config.

## Unit coverage (Vitest) — what needs proving
1. **Proxy time-gate** (`tests/unit/proxy.test.ts`, extend):
   - env future → GET `/`, `/login`, `/awards`, `/kudos`, `/todo/x` each 307 → `/prelaunch?next=<path>`
     (assert `next` param equals original path).
   - env future → GET `/prelaunch` → NOT redirected (no self-loop).
   - env past → none redirect to `/prelaunch`; existing auth-gate assertions still hold (regression).
   - env unset/invalid → no time-gate redirect (fail-open); auth-gate behavior unchanged.
   - `?next=` carries original query string when present.
2. **`sanitizeInternalPath`** (`lib/safe-redirect.ts`): `/awards`→`/awards`; `//evil`→`/`;
   `https://evil.example`→`/`; `null`/`undefined`/`""`→`/`; `/a?b=c`→`/a?b=c`.
3. **`usePrelaunchAutoRedirect`** (`hooks/use-prelaunch-auto-redirect.ts`): mock `next/navigation`
   (`useRouter`, `useSearchParams`) + control `useEventCountdown`:
   - `showComingSoon` true → `router.replace` NOT called.
   - `showComingSoon` false + `?next=/awards` → `router.replace("/awards")`.
   - `showComingSoon` false + malicious `?next=//evil` → `router.replace("/")`.
   - env-missing (false from mount) → immediate `router.replace` to `/`.

## E2E coverage (Playwright) — what needs proving
- **Pre-launch** (`NEXT_PUBLIC_EVENT_START_AT` future): visiting `/`, `/login`, `/awards` each lands
  on `/prelaunch` with `?next=` preserved; 3 countdown blocks visible.
- **Post-launch** (env past/unset): visiting `/` no longer lands on `/prelaunch`; normal
  auth-gate/no-op behavior resumes (regression against existing `access-control.spec.ts`).
- **Open-redirect rejection**: `/prelaunch?next=https://evil.example` (post-launch) → auto-redirect
  goes to `/`, never off-site.
- **Callback interaction**: `/auth/callback` still functions post-launch (does not get trapped by the
  time-gate) — see Phase 01 risk.

## Todo List
- [x] Hand phases 01–03 final code to `tester` agent with this matrix
- [x] Unit: proxy time-gate (all routes + regression)
- [x] Unit: `sanitizeInternalPath`
- [x] Unit: `usePrelaunchAutoRedirect`
- [x] E2E: pre-launch gate, post-launch resume, open-redirect, callback
- [x] All green before review

## Success Criteria (DoD)
- SC-001..004 all covered and passing.
- No regression in existing `proxy.test.ts` / `access-control.spec.ts`.
- Coverage on new logic files ≥ existing repo bar; no skipped/failing tests.
- All new files < 200 lines; typecheck + lint clean.

## Risk Assessment
| Risk | Likelihood | Impact | Countermove |
|------|-----------|--------|-------------|
| e2e env not controllable per-test | Med | Med | Set `NEXT_PUBLIC_EVENT_START_AT` via Playwright web-server env or per-project config; document chosen mechanism |
| Time-based flakiness (minute tick) at zero | Med | Low | Unit-test the hook with mocked countdown state, not wall-clock; e2e uses far-future/far-past, not the tick moment |

## Security Considerations
- Explicit open-redirect test cases are mandatory (unit + e2e).
- Regression tests confirm the auth-gate still protects routes post-launch.

## Next Steps
- On green: `reviewer` agent, then doc reconcile at promote (permissions matrix + `/prelaunch` route
  code allocation — F003 is provisional until then).
