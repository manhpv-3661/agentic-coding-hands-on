# Phase 02 — Integration (UI ↔ Auth)

**Priority:** High · **Status:** pending · **Depends:** Phase 01 + Track A UI
Wire the Track A Login UI to Supabase auth and enforce access control.

## Files to modify (created by Track A)
- `app/login/page.tsx` — make it a server component: `await createClient()` → `getUser()`; if user, `redirect('/todo')` (defense-in-depth alongside proxy). Render the client login section.
- Login button client wrapper — replace the `// TODO(track-b)` stub `onLogin` with real handler:
  `supabase.auth.signInWithOAuth({ provider:'google', options:{ redirectTo: ${'`'}${'{'}window.location.origin{'}'}/auth/callback${'`'} }})`; set `loading=true` before, on error set `loading=false` + error text "Đăng nhập không thành công. Vui lòng thử lại." Read `?error=` from URL to show callback failures too.
- Language selector — confirm it writes `NEXT_LOCALE` cookie on select (UI-only scope).

## Implementation steps
1. Review Track A output (component tree, props) once its agent reports.
2. Convert `app/login/page.tsx` to server component with authed-redirect guard.
3. Wire login button `onLogin` → `signInWithOAuth` (research §3); loading/disabled/error states.
4. Surface `?error=auth_callback_failed` as the same VN error message.
5. Verify language selector cookie write.
6. Compile check: `npx tsc --noEmit` + `npm run build`.

## Todo
- [ ] login page server guard (authed → /todo)
- [ ] wire signInWithOAuth + loading/error
- [ ] callback error surfaced on /login
- [ ] language selector cookie verified
- [ ] compile clean

## Success criteria
- Click Login → loading/disabled → OAuth redirect (or error message on failure).
- Authed user at /login → /todo; unauthed at /todo → /login.
- No hardcoded auth in the button; single integration point.

## Security
- Server-side session check in addition to proxy.
