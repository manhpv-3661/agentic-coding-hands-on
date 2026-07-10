import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { computeCountdown, parseEventStart } from "@/lib/event-countdown";

/**
 * Next.js 16 renamed `middleware` → `proxy` (root file `proxy.ts`, function
 * `proxy`, forced `nodejs` runtime). This refreshes the Supabase session and
 * enforces auth-based routing:
 *   - authenticated user hitting /login              → /
 *   - unauthenticated user hitting a protected route → /login
 *
 * Protected routes: `/` (home), `/awards`, `/kudos`, `/todo` (+ subpaths).
 *
 * Mock/training repo: with no Supabase env configured, this is a no-op
 * passthrough so the app still builds and runs.
 *
 * A site-wide TIME-GATE (Countdown Prelaunch) runs first, ahead of the
 * auth-gate below: before `NEXT_PUBLIC_EVENT_START_AT`, every route except
 * `/prelaunch` itself redirects there (see `isBeforeLaunch`/matcher below).
 * Once the countdown reaches zero (or the env var is missing/invalid —
 * fail-open, mirroring the Supabase fail-open below), the time-gate stops
 * interfering and the auth-gate resumes exactly as before.
 */
let warnedMissingEnv = false;

/** Routes that require an authenticated session.
 *
 * `/awards` and `/kudos` are exact-match only: neither has a real sub-route
 * (no `[slug]`, no nested `page.tsx`), so the previous `startsWith` was not
 * protecting anything real — it was only ever matching the *static asset*
 * directories that happen to share the prefix (`public/awards-saa/**`,
 * `public/kudos/**`). That routed every image request (e.g.
 * `/kudos/avatars/avatar-1.jpg`, `/awards-saa/thumbnails/top-talent.png`)
 * through a live Supabase `getUser()` call and occasionally 307-redirected
 * the image to `/login` instead of serving it — the root cause of
 * intermittently broken images across the site.
 *
 * `/todo` keeps `startsWith` — it has no colliding `public/todo/**` asset
 * directory today, and (unlike `/awards`/`/kudos`) is expected to grow real
 * sub-routes later. */
function isProtectedPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/awards" ||
    pathname === "/kudos" ||
    pathname.startsWith("/todo")
  );
}

/**
 * True only while strictly before the event start. Missing/invalid env or a
 * past target both resolve to `computeCountdown(...).isZero === true`
 * (see `lib/event-countdown.ts`), so this fails open to "launched" rather
 * than gating the whole site shut on misconfiguration.
 */
function isBeforeLaunch(now: Date): boolean {
  const target = parseEventStart(process.env.NEXT_PUBLIC_EVENT_START_AT);
  return !computeCountdown(target, now).isZero;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname !== "/prelaunch" && isBeforeLaunch(new Date())) {
    const url = new URL("/prelaunch", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  // The matcher below is broad (needed so the time-gate above can catch
  // every route) but the Supabase auth check is only relevant to `/login`
  // and the protected routes — skip it for everything else (public static
  // assets that aren't covered by the `_next/*`/favicon matcher exemptions,
  // e.g. files under `public/`) so this doesn't add a network round-trip to
  // Supabase's Auth API on every asset request.
  if (pathname !== "/login" && !isProtectedPath(pathname)) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Fail open (mock/training repo). Warn once so a real deployment with
    // misconfigured env doesn't run unauthenticated with zero signal.
    if (!warnedMissingEnv) {
      console.warn(
        "[proxy] Supabase env not configured — auth route protection is DISABLED (no-op). Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable.",
      );
      warnedMissingEnv = true;
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() validates the JWT with the Supabase Auth server (safe on any
  // project); it also refreshes the session cookie via setAll above.
  //
  // Review finding (Important): this matcher covers nearly every route, so
  // an unhandled throw here (e.g. a transient Supabase Auth API outage, not
  // just missing env) would 500 the entire site. Fail open the same way the
  // missing-env branch above does — log once, let the request through —
  // rather than let one Auth API hiccup take down every page.
  let user = null;
  try {
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser();
    user = fetchedUser;
  } catch (err) {
    console.error("[proxy] supabase.auth.getUser() threw, failing open:", err);
    return response;
  }

  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!user && isProtectedPath(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

// Catch-all minus Next.js internals and the gate's own target: before launch
// no route is exempt except `/prelaunch`, so this replaces the prior allowlist.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|prelaunch).*)"],
};
