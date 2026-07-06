# Phase 01 — Supabase Auth Foundation (Track B)

**Priority:** High · **Status:** pending
Backend/logic layer for Google OAuth via Supabase, with graceful no-env degradation.

## Context
- Research: `research/researcher-supabase-next16-report.md` (verified vs live Next 16.2.10 docs)
- System spec: `spec/system/{architecture,permissions}.md`

## Key insight (Next 16 traps)
- `proxy.ts` NOT `middleware.ts`; `export function proxy(req)`; runtime forced nodejs.
- `cookies()` async → `server.ts` factory is `async`, call sites `await createClient()`.

## Files to create
- `lib/supabase/client.ts` — `createBrowserClient` (browser).
- `lib/supabase/server.ts` — `async createClient()` with awaited `cookies()`.
- `app/auth/callback/route.ts` — `GET`: `exchangeCodeForSession(code)` → redirect `/todo`; failure → `/login?error=auth_callback_failed`.
- `proxy.ts` (root) — refresh session; (a) auth + `/login` → `/todo`; (b) no-auth + `/todo/*` → `/login`; no-op if env absent. `matcher: ['/todo/:path*','/login']`.
- `app/todo/page.tsx` — minimal placeholder ("SAA 2025 — Todo", shows signed-in email + sign-out) so redirect + E2E succeed.
- `.env.local.example` — documents the two NEXT_PUBLIC vars (do NOT create real `.env.local`).

## Files to modify
- `package.json` — add `@supabase/ssr`, `@supabase/supabase-js` (via npm install).

## Implementation steps
1. `npm install @supabase/ssr @supabase/supabase-js`.
2. Create `lib/supabase/client.ts` + `server.ts` (code from research §2).
3. Create `app/auth/callback/route.ts` (research §4).
4. Create `proxy.ts` with env-guard no-op (research §5).
5. Create `app/todo/page.tsx` placeholder (server component: `await createClient()`, `getUser()`, render email + sign-out form/button).
6. Add `.env.local.example`.
7. Compile check: `npx tsc --noEmit` + `npm run build`. Fix errors.

## Todo
- [ ] Install packages
- [ ] client.ts + server.ts
- [ ] auth/callback/route.ts
- [ ] proxy.ts (env-guarded)
- [ ] todo placeholder + sign-out
- [ ] .env.local.example
- [ ] compile clean

## Success criteria
- `npm run build` passes with no env set (graceful degradation).
- Auth files match Next 16 async/proxy conventions.

## Security
- No secrets committed (`.env*` gitignored). Anon key is public by design.
- `getUser()` (validates JWT) in proxy, not trusting local cookie blindly.
