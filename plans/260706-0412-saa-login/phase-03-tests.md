# Phase 03 — Temper (Tests, TDD)

**Priority:** High · **Status:** pending · **Depends:** Phase 02
Unit (vitest) + E2E (Playwright) per project DoD, covering the 17 MoMorph test cases.

## Unit tests (vitest + @testing-library/react)
- Login UI render: logo top-left, language selector top-right, hero, title "ROOT FURTHER", subtitle/tagline, login button, footer copyright.
- Login button component states: default; loading → disabled + spinner; error → shows "Đăng nhập không thành công. Vui lòng thử lại."; hover shadow class present.
- Language selector: default "VN" + VN flag + chevron; click opens dropdown (VN/EN); select writes `NEXT_LOCALE` cookie.
- `onLogin` prop invoked on click.

## E2E tests (Playwright)
- Unauthenticated → `/login` renders all layout elements (GUI test cases).
- Click Login button → attempts navigation to Supabase/Google OAuth URL (research §7 pattern 2; intercept, assert redirect fired, don't complete Google).
- Access-control: authed session (storage-state injection, research §7 pattern 1) at `/login` → redirected `/todo`; no session at `/todo` → redirected `/login`.
- Language dropdown opens on click; footer fixed at bottom.

## Steps
1. `tester` agent writes/executes unit + E2E against final code.
2. Ensure graceful degradation: tests must not require a real Supabase project (mock/intercept).
3. Fix failures per recommendations; re-run until 100% pass.

## Todo
- [ ] unit tests (UI + button states + selector)
- [ ] E2E (layout + login-redirect + access-control + dropdown)
- [ ] 100% pass, no real-Google dependency

## Success criteria
- All unit + E2E pass; 17 MoMorph test cases covered.
- No test depends on live Google or a provisioned Supabase project.
