# Research: Supabase Auth (Google OAuth) + Next.js 16.2.10 App Router

Date: 2026-07-06. Sources: official Next.js docs (nextjs.org, fetched live, version stamped 16.2.10), official Supabase docs (supabase.com), npm registry, GitHub discussions. 5 WebSearch + 4 WebFetch calls. `node_modules/next/dist/docs/` was **hard-blocked by the sandbox** (Bash/Read both refused, not a permission I can grant myself) — verified everything against nextjs.org instead, which serves the same version (page footer stamped `version: 16.2.10`, `lastUpdated: 2026-05-13/03-03`), so confidence is EXTRACTED/high, not INFERRED.

## 0. THE ONE THING THAT WILL BREAK YOUR CODE IF YOU SKIP THIS

**Next.js 16 renamed `middleware` → `proxy`.** This is exactly the "not the Next.js you know" trap AGENTS.md warns about — every tutorial, every Supabase blog post, every piece of my own training data says `middleware.ts` / `export function middleware()`. In this repo that is dead on arrival.

- File: `proxy.ts` (project root, next to `app/`), not `middleware.ts`.
- Function: `export function proxy(request: NextRequest)`, not `middleware`.
- `middleware.ts` still works today only as deprecated back-compat in some 15→16 transitional builds — do not rely on it; write `proxy.ts` directly.
- Runtime is **forced to `nodejs`**; the `runtime` config option throws if set in a proxy file. If you needed Edge middleware, that's gone (`edge` only remains under the deprecated `middleware` path, which Next says will get separate follow-up instructions).
- Official codemod exists: `npx @next/codemod@canary middleware-to-proxy .`
- Supabase's own docs already reflect this (their Next.js SSR page now says "Proxy... refreshing the Auth token").

Source: https://nextjs.org/docs/app/api-reference/file-conventions/proxy (Version history table: "v16.0.0 — Middleware is deprecated and renamed to Proxy").

Second confirmed breaking change: **`cookies()` / `headers()` are always async now** — Next 15 had a temporary sync-compat shim, Next 16 removed it entirely. Every `cookies()` call must be awaited. Source: https://nextjs.org/docs/app/guides/upgrading/version-16 (Async Request APIs section) — matches what Supabase's own current SSR examples do (`const cookieStore = await cookies()`).

---

## 1. Packages

```bash
npm install @supabase/ssr @supabase/supabase-js
```

- `@supabase/supabase-js@2.110.0` (latest, npm registry, checked live)
- `@supabase/ssr@0.12.0`, peer dep `@supabase/supabase-js: ^2.108.0` — satisfied.
- No React version constraint in either package's peerDeps — both are framework-agnostic over the Supabase client + a cookie adapter; React 19.2.4 / Next 16.2.10 is not a compatibility concern for these two packages specifically. (The bigger compatibility surface is Next 16 itself, covered above.)
- Do **not** install `@supabase/auth-helpers-nextjs` — Supabase has deprecated it in favor of `@supabase/ssr`; it predates the async-cookie / proxy world entirely and is unmaintained.

## 2. Client setup (`@supabase/ssr` canonical pattern for App Router)

Confirmed against Supabase's official Next.js SSR guide (https://supabase.com/docs/guides/auth/server-side/nextjs, https://supabase.com/docs/guides/auth/server-side/creating-a-client).

**`lib/supabase/client.ts`** (browser — Client Components):
```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`lib/supabase/server.ts`** (Server Components / Route Handlers) — `cookies()` is async in Next 16, so this factory must be async:
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // called from a Server Component — a proxy running on the
            // request will refresh the session cookie instead. Safe to ignore.
          }
        },
      },
    }
  )
}
```
Call sites become `const supabase = await createClient()` everywhere on the server.

## 3. Google OAuth sign-in (client-side)

```ts
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false)

  async function handleSignIn() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setLoading(false) // on success, browser navigates away — no need to reset loading
  }

  return (
    <button onClick={handleSignIn} disabled={loading}>
      {loading ? 'Redirecting…' : 'Sign in with Google'}
    </button>
  )
}
```
- `redirectTo` must point at your own `/auth/callback` route (not Google, not Supabase) — Supabase's hosted OAuth flow bounces the browser: app → Google consent → Supabase auth server (PKCE code exchange prep) → your `redirectTo` URL with `?code=...`.
- This is a **full-page redirect**, not a popup — `signInWithOAuth` sets `window.location` under the hood by default. Popup requires manually opening the returned OAuth URL in a `window.open`, which the docs don't recommend for this flow; stick with redirect for simplicity (YAGNI).
- Loading state: the redirect happens near-instantly once Supabase returns the OAuth URL, so a spinner/disabled state on the button covers the gap; there's no "return" from this call on the happy path since the tab navigates away.
- Uses **PKCE flow** (default in `@supabase/ssr`) — code verifier stored in an HTTP-only cookie by the client before redirecting, consumed by `exchangeCodeForSession` in the callback route.

## 4. `/auth/callback` route handler

Route handler signature is **unchanged** across Next 13→16 (`export async function GET(request: NextRequest)`); only `params`/`cookies()`/`headers()` gained the async requirement. Confirmed via https://nextjs.org/docs/app/api-reference/file-conventions/route.

**`app/auth/callback/route.ts`**:
```ts
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/todo'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
```
- `request.nextUrl` (not manual `new URL(request.url)`) is the documented convenience on `NextRequest`.
- `NextResponse.redirect` with an absolute URL string is the standard pattern (route handlers cannot use the `redirect()` throw-based helper from `next/navigation` meaningfully the same way Server Components/Actions do — returning a `NextResponse.redirect` is the documented route-handler idiom).

## 5. Proxy (formerly middleware) / route protection

**`proxy.ts`** (project root — NOT `middleware.ts`):
```ts
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Degrade gracefully: no Supabase project configured yet (mock/training repo)
  if (!supabaseUrl || !supabaseKey) {
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // (a) already authenticated + hitting /login -> bounce to /todo
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/todo', request.url))
  }

  // (b) unauthenticated + hitting /todo -> bounce to /login
  if (!user && pathname.startsWith('/todo')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/todo/:path*', '/login'],
}
```
- Used `supabase.auth.getUser()` (validates the JWT against the Supabase Auth server on every request) rather than `getClaims()`. Supabase's newest docs mention `getClaims()` as a lighter local-verification alternative, but it requires the project's Auth server to be on the newer asymmetric JWT signing-key setup — `getUser()` works unconditionally on any Supabase project and is still the documented, safe default. Don't switch to `getClaims()` without confirming the target project's JWT key type.
- `matcher` scoped narrowly to `/todo/:path*` and `/login` (not a blanket negative-lookahead over everything) — cheaper, and avoids the "proxy runs on every route including RSC/prefetch" gotcha called out in Next's own proxy docs.
- Graceful degradation: with no `.env.local`, `proxy.ts` becomes a no-op passthrough instead of crashing the whole app at build/runtime — required because this is a mock project where env vars arrive later.

## 6. Env vars

`.env.local` (never commit — `.gitignore` already has a blanket `.env*` rule, confirmed):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```
- Both `NEXT_PUBLIC_*` because the anon/publishable key is safe to expose client-side (RLS enforces real security) and the browser client needs it directly.
- Naming note: newer Supabase projects (2025 API-key format) label this the "publishable key" (`sb_publishable_...`) instead of "anon key" — check the project's dashboard → API Keys page; the env var name convention (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) still works either way, it's just a variable name you choose.
- **Supabase Dashboard config required**: Authentication → Providers → enable Google, supply Google Cloud OAuth Client ID/Secret; Authentication → URL Configuration → add `http://localhost:3000/auth/callback` (dev) and the prod equivalent to Redirect URLs; Google Cloud Console → OAuth consent screen + credentials → Authorized redirect URI = the **Supabase** callback URL (`https://xxxx.supabase.co/auth/v1/callback`), not your app's `/auth/callback`.
- Graceful degradation for build/tests without env: `lib/supabase/client.ts`/`server.ts` use non-null assertions (`!`) which won't throw at import time, only when the client actually makes a network call — safe for `next build`/unit tests that don't exercise auth. `proxy.ts` explicitly checks and no-ops (section 5). Any component gating on auth state should treat "no session" as the default rather than throwing.

## 7. Testing (Playwright, no real Google)

Three viable patterns, ranked:

1. **Storage-state injection (recommended, fastest)** — in a Playwright global setup, call the Supabase Admin/REST API directly (service-role key, server-side only, never in browser) to create a test user + session, then seed the browser's cookies/localStorage with that session before tests run via `page.context().addCookies(...)` or a `storageState` JSON. This mirrors Playwright's own documented auth pattern (playwright.dev/docs/auth) applied to Supabase. No UI login flow exercised, but everything downstream of "user is logged in" (the `/todo` page, proxy pass-through) is tested realistically.
2. **Assert the redirect trigger only** — for the actual login button, don't try to complete Google's flow (Google actively blocks bot/automated OAuth). Assert `signInWithOAuth` was called and that the browser attempted to navigate to a `https://accounts.google.com/...` or Supabase `/auth/v1/authorize` URL (route-intercept + `page.waitForURL` or a network-request assertion), then stop — this validates wiring without needing real Google credentials.
3. **Local Supabase CLI (`supabase start`)** — heaviest but most realistic: spin up local Postgres+Auth via Supabase CLI in CI, test against real (non-mocked) auth logic end-to-end except for the Google IdP hop itself, which still needs pattern 1 or 2 for the login button.

For this project (mock/training repo, YAGNI), pattern 1 for `/todo` access-control tests + pattern 2 for the login-button test is the pragmatic minimum; skip standing up the Supabase CLI in CI unless auth logic grows non-trivial.

---

## Trade-off summary

| Concern | `@supabase/ssr` (chosen) | `@supabase/auth-helpers-nextjs` (deprecated) | Roll-your-own JWT+cookie |
|---|---|---|---|
| Maintenance | Active, Supabase's own recommended path | Frozen, bug-fix only, being sunset | Full burden on this team |
| Next 16 fit | Docs already updated for `proxy`/async cookies | Predates both, breaks silently | N/A |
| Complexity | Low — a few utility files | Low but stale APIs | High |
| **Verdict** | **Use `@supabase/ssr`** | Do not use | Not justified for this scope |

---

## Unresolved questions

1. Whether the target Supabase project uses the newer asymmetric JWT signing keys (would allow `getClaims()` in proxy instead of `getUser()`) — not knowable without dashboard access; default to `getUser()`.
2. Whether the "mock/training" env-absent state should render a visible "auth not configured" UI banner vs. silently no-op — left to product decision, not a technical blocker.
3. Confirm final `/todo` route path/tree doesn't already exist under a different name (repo currently has no `app/todo` — only `app/login` dir was empty and `app/page.tsx`); implementer should verify against the actual plan before wiring redirects.

**Status:** DONE
**Summary:** Confirmed via live nextjs.org + supabase.com docs (node_modules/dist/docs was sandbox-blocked, not consulted directly): Next 16 renamed `middleware.ts`→`proxy.ts` (function `proxy`, forced nodejs runtime) and made `cookies()`/`headers()` unconditionally async — both are silent breakage traps for anyone working from training data. Full copy-paste code given for `@supabase/ssr` browser/server clients, Google OAuth sign-in, `/auth/callback` route handler, and `proxy.ts` route protection with graceful no-env degradation, plus a ranked Playwright testing strategy avoiding real Google OAuth.
