# Plan — SAA 2025 Login (Supabase Google OAuth)

**Screen:** Login (MoMorph `GzbNeVGJHz`, file `9ypp4enmFmdK3YAFJLIu6C`)
**Stack:** Next.js 16.2.10 (App Router, Turbopack) · React 19 · Tailwind v4 · TypeScript · Supabase Auth
**Spec:** `spec/login/feature.md` (vi) · **System:** `spec/system/{architecture,permissions}.md`
**Clarifications:** `clarifications.md`

## ⚠ Next.js 16 breaking changes (verified vs live 16.2.10 docs)
- `middleware.ts` → **`proxy.ts`** (root; `export function proxy`; forced `nodejs` runtime). No `middleware.ts`.
- `cookies()` / `headers()` are **always async** — must `await`.

## Two tracks (parallel, no hard merge point)
- **Track A (UI)** — `implementer` background agent building `app/login/` pixel-perfect from Figma. Login button is a controlled component (`onLogin/loading/error`). Running now.
- **Track B (backend/logic)** — this thread: Supabase client layer, `proxy.ts` guards, `/auth/callback`, `/todo` placeholder.
- **Integration** — wire Track A's login button + language selector to Track B, as each completes.

## Phases
| # | Phase | Status | Depends |
|---|-------|--------|---------|
| 01 | Supabase auth foundation | ✅ done (build passes, no-env graceful) | — |
| 02 | Integration (wire UI ↔ auth, access guards) | ✅ done | 01 + Track A |
| 03 | Temper — unit + E2E tests (TDD) | ✅ done (68 unit + 22 E2E pass) | 02 |

## Result (2026-07-06)
- Track A UI: `app/login/` (7 components + fonts + assets in `public/login/`) — pixel-perfect from Figma.
- Track B auth: `lib/supabase/{client,server,env}.ts`, `proxy.ts`, `app/auth/callback/route.ts`, `app/todo/page.tsx`.
- Review 8/10 → fixes applied (open-redirect guard on callback `next`, proxy warn-once fail-open, DRY `isSupabaseConfigured`, `lang="vi"`).
- Gates: tsc 0 · 69 unit · 22 E2E · build passes (no env) · evidence-gate SEALED.

## Bug-fix cycle (2026-07-06, post-review)
- **Background (round 1):** hero art missing below `lg`; flat whole-frame screenshot only at `lg`.
- **Background (round 2, final):** dropped the flat-frame `hero-background.jpg` ENTIRELY (only aligned at 1440px → ghosted at other widths). Now `hero-waves.jpg` (waves-only crop, x≥620, header/footer bands removed) is used at ALL breakpoints, right-anchored on `#00101A` + left→right dark scrim for text legibility. Verified via Playwright at 390px, 1280px, 1440px. `hero-background.jpg` deleted.
- **Login "not working":** code is CORRECT — verified via Playwright the click builds the right Supabase authorize URL (provider=google, redirect_to=/auth/callback, PKCE). Real root cause is a **Supabase dashboard config gap**: `{"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}` → Google provider not enabled in the project. Added `NOT_CONFIGURED_ERROR` for the no-env case too.
- **E2E hardening:** made suite hermetic (playwright webServer injects deterministic test Supabase env, `reuseExistingServer:false`); rewrote 2 login-click tests to intercept the OAuth request instead of assuming unconfigured/racy loading state; fixed 4 flaky missing-`await` assertions.
- Final gates: tsc 0 · 69 unit · 22 E2E · build passes.
- Spec promoted → `docs/features/f001-login/`, `docs/system/`.
- Deferred (logged): full VN/EN i18n (screen 12); deep-link `next` preservation on /todo protection.

- `phase-01-supabase-auth-foundation.md`
- `phase-02-integration.md`
- `phase-03-tests.md`

## Key dependencies
- npm: `@supabase/ssr@^0.12`, `@supabase/supabase-js@^2.110`
- Env (`.env.local`, user-supplied): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Code degrades gracefully when env absent (build/tests must not crash).

## Definition of Done (project)
UI exact to Figma · logic per MoMorph specs · unit + E2E tests (TDD).
