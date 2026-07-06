# Phase 01 — Auth & Routing

## Context Links
- Spec: `spec/f002-homepage/feature.md` FR-1..FR-5
- Permissions matrix: `spec/system/permissions.md`
- Clarification: `/` protected; post-login destination `/` (was `/todo`).
- Existing: `proxy.ts`, `app/auth/callback/route.ts`, `tests/unit/proxy.test.ts`,
  `tests/unit/auth-callback.test.ts`, `lib/supabase/server.ts` (`createClient` async), `lib/supabase/env.ts`.
- **Next.js 16:** read `node_modules/next/dist/docs/` proxy/middleware guide before editing matcher.

## Overview
- Priority: P1 (foundation for other phases). Status: ✅ **COMPLETE**.
- Extend proxy to protect `/`, `/awards`, `/kudos` (keep `/todo`); change post-login landing to `/`;
  change OAuth callback default `next` to `/`. Add a reusable server-side guard helper (defense-in-depth).

## Key Insights
- Proxy currently protects only `/todo` and redirects `/login`→`/todo`. Both redirect targets move to `/`.
- Proxy fail-open when Supabase env absent (mock repo) — MUST preserve this no-op behavior.
- `/todo` stays a protected route (matrix keeps it) but is no longer the default landing — consistent decision.
- Callback already blocks open-redirect (`//evil.com`); only the DEFAULT changes `/todo`→`/`.

## Requirements
- FR-1: unauth `/` → `/login`. FR-2: auth `/` → render. FR-3: callback success → `/`.
- FR-4: auth `/login` → `/`. FR-5: `/awards`,`/kudos` protected like `/`.
- Non-func: no crash without env (fail-open no-op); keep files < 200 lines.

## Architecture / Data Flow
```
Request → proxy.ts
  env missing → NextResponse.next() (no-op, warn once)   [unchanged]
  else getUser():
    user  && path == /login            → redirect /
    !user && path ∈ {/, /awards, /kudos, /todo/*} → redirect /login
    else → next()
OAuth: /auth/callback?code&next → exchange → redirect origin+next (default /)
Server guard (defense-in-depth): requireUser() in each protected page
  → not configured: return null (mock) · configured & no user: redirect('/login')
```

## Related Code Files
- **Modify:** `proxy.ts` (matcher + protected-path check + redirect targets),
  `app/auth/callback/route.ts` (default `next` `/todo`→`/`),
  `tests/unit/proxy.test.ts`, `tests/unit/auth-callback.test.ts`.
- **Create:** `lib/auth/require-user.ts` (shared guard helper; consumed by P03 + P06).
- File ownership: this phase OWNS the four files above + the new helper. No other phase edits them.

## Implementation Steps
1. `proxy.ts`: define `const PROTECTED = (p) => p === "/" || p.startsWith("/awards") || p.startsWith("/kudos") || p.startsWith("/todo")`.
2. Replace redirect block: `if (user && pathname === "/login") redirect("/")`; `if (!user && PROTECTED(pathname)) redirect("/login")`.
3. Update `config.matcher` → `["/", "/awards", "/kudos", "/todo/:path*", "/login"]` (verify `/awards` exact vs `:path*` against Next 16 docs).
4. `app/auth/callback/route.ts`: change both fallback literals `"/todo"` → `"/"` (keep same-origin/`//` guard).
5. Create `lib/auth/require-user.ts`: `export async function requireUser()` — if `!isSupabaseConfigured()` return `null`; else `createClient()`, `getUser()`, if no user `redirect("/login")`, return user. Also export `getOptionalUser()` for pages that render regardless.
6. Update `proxy.test.ts`: change `/login` auth redirect assertion `/todo`→`/`; add cases: unauth `/`→`/login`, unauth `/awards`→`/login`, unauth `/kudos`→`/login`, auth `/` allowed (200); fix the "other routes pass through" test (use a non-protected path e.g. `/some-public`).
7. Update `auth-callback.test.ts`: default `next` expectation `/todo`→`/`.
8. Compile: `npx tsc --noEmit` (or project build) + run `npx vitest run tests/unit/proxy.test.ts tests/unit/auth-callback.test.ts`.

## Todo List
- [x] proxy protected-path check + redirect targets
- [x] proxy matcher extended
- [x] callback default next → `/`
- [x] `lib/auth/require-user.ts` created
- [x] proxy + callback unit tests updated & passing
- [x] type-check/build clean

## Success Criteria
- Proxy redirects match matrix in `permissions.md` for all 5 routes; fail-open no-op still works with no env.
- Callback lands `/` by default, still blocks open redirect.
- All updated unit tests green; no type errors.

## Risk Assessment
- **Matcher syntax (Med/Med):** `/awards` exact vs `:path*` mismatch → route unguarded. Mitigate: verify Next 16 docs + unit test each path.
- **Regression on `/todo` (Low/Med):** keep `/todo` in matcher + a passing test.
- Rollback: revert the 4 files; helper is additive (delete `lib/auth/`).

## Security
- Preserve open-redirect guard in callback. Fail-open documented as mock-only (see permissions.md §Bảo mật).

## Next Steps
- Unblocks P03 (uses `require-user.ts`) and P06 (home guard). P02/P04 independent.

## Actual Outcome
✅ All completed as planned.
- `proxy.ts`: updated matcher to include `/`, `/awards`, `/kudos`, `/todo` with `/todo/:path*` syntax. Protected-path check and redirect targets changed to `/` (post-login landing).
- `app/auth/callback/route.ts`: default `next` parameter changed from `/todo` to `/`. Open-redirect guard preserved.
- `lib/auth/require-user.ts`: created async guard helper. Calls `isSupabaseConfigured()`, then `createClient()`, `getUser()`, and `redirect('/login')` if no user. Returns user or null when Supabase unconfigured.
- Tests: `proxy.test.ts` and `auth-callback.test.ts` updated and passing. All unit tests green.
- Type-check: `tsc --noEmit` clean, `eslint` clean, `next build` clean.
