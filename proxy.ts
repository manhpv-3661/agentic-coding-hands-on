import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Next.js 16 renamed `middleware` → `proxy` (root file `proxy.ts`, function
 * `proxy`, forced `nodejs` runtime). This refreshes the Supabase session and
 * enforces auth-based routing:
 *   - authenticated user hitting /login  → /todo
 *   - unauthenticated user hitting /todo → /login
 *
 * Mock/training repo: with no Supabase env configured, this is a no-op
 * passthrough so the app still builds and runs.
 */
let warnedMissingEnv = false;

export async function proxy(request: NextRequest) {
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/todo", request.url));
  }

  if (!user && pathname.startsWith("/todo")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/todo/:path*", "/login"],
};
