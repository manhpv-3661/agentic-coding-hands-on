# Review: SAA 2025 Login (UI + Supabase Google OAuth)

Scope: `lib/supabase/{client,server}.ts`, `proxy.ts`, `app/auth/callback/route.ts`,
`app/todo/page.tsx`, `app/login/page.tsx` + `app/login/components/*`.
Reference: implementation matches `research/researcher-supabase-next16-report.md`
almost verbatim (copy-paste faithful to Next 16 `proxy.ts`/async-cookie APIs).

## Overall Assessment
No critical bugs. Auth wiring (PKCE OAuth, callback code-exchange, proxy
redirect-on-auth-state, defense-in-depth server guards) is correct and matches
the Next 16 `proxy.ts`/async-`cookies()` contract. Findings below are
defense-in-depth gaps, an operational footgun, and small DRY/consistency
issues — nothing blocks merge for a mock/training project.

## Critical Issues
None.

## High Priority
None. (See Medium #1 for the closest thing to a real risk — an operational
footgun, not an exploitable bug in this repo's current state.)

## Medium Priority

**1. Silent fail-open in `proxy.ts` if env vars are missing/misconfigured in a real deployment**
`proxy.ts:20-22`
```ts
if (!supabaseUrl || !supabaseKey) {
  return response; // no-op, no log
}
```
Intentional for this mock/training repo (confirmed in permissions.md/feature.md).
But there is zero runtime signal when this path is hit — if this code is ever
promoted toward production and the env vars are missing/typo'd/not loaded in
the deploy target, `/todo` becomes fully unauthenticated with **no warning in
logs**. Same silent-degrade shape repeats in `login/page.tsx`
(`redirectIfAuthenticated`) and `todo/page.tsx`.
**Fix:** `console.warn("[proxy] Supabase env not configured — auth check skipped")`
on the no-op path (server-side log, not user-visible) so a misconfigured
deployment is loud in ops/monitoring, not silent.

**2. `next` param in `/auth/callback` is unvalidated (defense-in-depth gap, not currently exploitable)**
`app/auth/callback/route.ts:13,19`
```ts
const next = searchParams.get("next") ?? "/todo";
...
return NextResponse.redirect(`${origin}${next}`);
```
Classic open-redirect shape (attacker-controlled `next` reflected into a
redirect). I verified concretely (Node `URL` parsing) that the naive string
concatenation here happens to defuse the obvious payloads:
- `next=//evil.com` → `https://app.example.com//evil.com` — stays same-origin
  (path, not protocol-relative, because there's no separator before it).
- `next=https://evil.com` → `https://app.example.comhttps://evil.com` — malformed
  host, `NextResponse.redirect` throws / browser rejects.

So today it is **not exploitable** in this repo. But it's load-bearing on an
implementation accident (naive concat) rather than an explicit contract, and
nothing currently sets a non-default `next` (the login button always uses
`/auth/callback` with no `next`), so there's no test coverage proving this
stays safe if someone "fixes" the concatenation into `new URL(next, origin)`
later (which *would* make `//evil.com` a real open redirect).
**Fix:** validate explicitly — `next.startsWith("/") && !next.startsWith("//")`
— and redirect with `new URL(next, origin)`, falling back to `/todo` on
failure. Small, removes reliance on an accident of string concatenation.

**3. Deep-link intent lost on the /todo → /login → /todo round trip**
`proxy.ts:53-55` redirects any unauthenticated `/todo/:path*` hit to plain
`/login` (no `next`/return-path), and `auth/callback/route.ts:13` always
defaults back to `/todo`. Matcher explicitly covers `/todo/:path*` (nested
routes), so a user deep-linked to e.g. `/todo/123` who isn't logged in will,
after a successful login, land on `/todo` — not `/todo/123`. Not a security
issue, but a correctness gap once `/todo` grows children.
**Fix:** `proxy.ts` → `redirect(new URL(\`/login?next=${pathname}\`, request.url))`,
and have `LoginButtonContainer` forward that `next` into
`redirectTo`/read it in the callback. Not spec-required for this screen (no
FR mentions it) — flagging as a forward-looking gap, low urgency now.

## Low Priority

**4. `isSupabaseConfigured()` duplicated verbatim** in `lib/supabase/client.ts:19-24`
and `lib/supabase/server.ts:5-10`. Harmless (both check the same public env
vars) but violates DRY — a future change to the check (e.g. supporting the
newer `sb_publishable_...` key naming) has to be made in two places and can
drift. Extract to a shared `lib/supabase/config.ts` (safe to import from both
browser and server bundles since it only reads `NEXT_PUBLIC_*`).

**5. `app/layout.tsx:23` hardcodes `lang="en"`** while the entire login screen
is Vietnamese by default and `LanguageSelector` defaults to `"vi"`
(`language-selector.tsx:40`). Screen readers will mispronounce Vietnamese
content. Pre-existing (not introduced by this feature), but worth flagging
since this feature is the first real content on the site. Not in scope to fix
i18n now (explicitly deferred to screen 12 per `feature.md` §2.3), but the
static `lang` attribute is an independent a11y bug from the deferred
i18n scope — consider at least defaulting it to `"vi"` given the whole app is
Vietnamese-first today.

**6. `app/layout.tsx:16-17` root metadata is still `create-next-app` boilerplate**
(`title: "Create Next App"`). `login/page.tsx` overrides its own metadata so
`/login` is fine, but `/todo` has no metadata export and will show the
boilerplate title/description in tab/share previews.

**7. `NEXT_LOCALE` cookie set without `Secure` attribute**
`language-selector.tsx:23`: `document.cookie = "...; SameSite=Lax"` — no
`Secure`. Low-value target (just a UI preference, not a session token) but
free to fix: `` `...; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}` ``.

## Edge Cases Found
- `LoginButtonContainer.handleLogin` (`login-button-container.tsx:28-47`):
  `createClient()` throws synchronously if `NEXT_PUBLIC_SUPABASE_URL` is
  undefined (invalid URL passed to the Supabase SDK) — correctly caught by
  the `try/catch` and surfaced as the canned error message. Verified this is
  the only call site of the browser client not gated by
  `isSupabaseConfigured()`, and it's safe because of the catch.
- `proxy.ts` cookie-refresh closure pattern (`let response` reassigned inside
  `setAll`) is the documented Supabase SSR pattern and correctly wired: request
  cookies set first, then a fresh `NextResponse.next({request})` is created and
  given the same cookies with full `options` (so `httpOnly`/`secure`/`sameSite`
  set by the Supabase SDK survive) — no gap here.
- `exchangeCodeForSession` failure path (`callback/route.ts:18-23`) correctly
  falls through to `/login?error=auth_callback_failed` without leaking the
  underlying Supabase error object/stack to the client — good, no data leak.
- `signOut` server action (`todo/page.tsx:46-53`) redirects to `/login`
  unconditionally regardless of `isSupabaseConfigured()`, which is correct
  (matches FR-3) — no dead-end.
- E2E suite (`e2e/access-control.spec.ts`, `e2e/login.spec.ts`) only exercises
  the *no-env* no-op path for `/todo` access control — there is no test (unit
  or E2E) that proves the authenticated-redirect branches of `proxy.ts`
  (lines 49-55) actually fire against a real/seeded session. Given this is a
  mock project without a provisioned Supabase project, that's an accepted gap
  per the research doc's own "Unresolved questions" (§7, pattern 1 storage-state
  injection recommended but not implemented) — flagging so it's not mistaken
  for "tested."

## Positive Observations
- OAuth flow correctly uses PKCE via `@supabase/ssr` defaults, `redirectTo`
  built from `window.location.origin` (never user input) — no injection surface.
- Reflected `?error=` query param is compared with strict equality
  (`error === "auth_callback_failed"`) and never rendered verbatim — no
  reflected-XSS surface despite taking a query param into page state.
- Correct Next 16 idioms throughout: `proxy.ts` (not `middleware.ts`), async
  `cookies()`/`searchParams`, matcher scoped narrowly to `/todo/:path*` + `/login`
  rather than a blanket negative-lookahead.
- Clean controlled-component boundary: `login-button.tsx` is pure/presentational,
  all Supabase wiring isolated in `login-button-container.tsx` — matches the
  project's own stated architecture intent.
- All reviewed files are well under the 200-line budget, kebab-case named,
  single-purpose.
- No secrets in source; `.env*` gitignored; only `NEXT_PUBLIC_*` (anon/publishable,
  safe-to-expose-by-design) keys referenced anywhere.
- Error handling doesn't leak internals: Supabase errors never forwarded to the
  client as raw objects/stack traces, only canned Vietnamese messages.

## Recommended Actions
1. Add a server-side `console.warn` when `proxy.ts`/page guards no-op due to
   missing Supabase env (Medium #1) — cheap, high ops-value.
2. Validate `next` in `auth/callback/route.ts` explicitly instead of relying on
   string-concat side effects (Medium #2).
3. (Optional, no FR requires it) preserve deep-link target through
   login→callback round trip (Medium #3).
4. Extract `isSupabaseConfigured()` to one shared module (Low #4).
5. Default `<html lang>` to `"vi"` and give `/todo` its own metadata (Low #5, #6).
6. Add `Secure` to the `NEXT_LOCALE` cookie when on HTTPS (Low #7).

## Metrics
- Files reviewed: 13 source files (+ 2 spec docs, 1 research doc, 2 E2E specs, 1 unit test file)
- LOC reviewed: ~450
- Type Coverage: no `any` found in reviewed non-test source; test files use
  `as any` for mock casts only (acceptable, test-only)
- Linting Issues: none observed by inspection (not re-run; task states build/tests already pass)
- Test Coverage: per task brief, 68 unit + 22 E2E passing; auth-positive-path
  (real authenticated session) branches of `proxy.ts` are not exercised by
  either suite (see Edge Cases)

## Score: 8/10
No critical/high findings. Docked for the fail-open-without-logging footgun
and the unvalidated (currently-safe-by-accident) `next` redirect param —
both cheap to close.

## Unresolved Questions
1. Is there any intent to promote this repo's `proxy.ts`/`login` code path
   toward a real deployment as-is, or does a hardened rewrite happen before
   that? Changes the urgency of Medium #1.
2. Confirm whether `/todo` is expected to gain real nested routes soon
   (matcher already covers `/todo/:path*`) — determines urgency of Medium #3.

**Status:** DONE
**Summary:** No critical or high-severity issues in the SAA 2025 login/OAuth implementation. Auth wiring, PKCE flow, and Next 16 `proxy.ts` conventions are correct. Medium findings: silent fail-open with no logging if Supabase env is misconfigured in a real deploy, and an unvalidated (currently non-exploitable, verified via URL-parsing test) `next` redirect param in the callback route. Low findings are DRY/consistency/a11y nits (duplicated `isSupabaseConfigured`, `lang="en"` vs Vietnamese-default content, boilerplate metadata on `/todo`, missing `Secure` on the locale cookie). Score 8/10.
**Concerns/Blockers:** None blocking. Recommend closing Medium #1 and #2 before any real deployment beyond mock/training use.
