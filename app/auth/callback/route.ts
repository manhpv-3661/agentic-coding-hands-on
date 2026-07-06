import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth callback. Supabase redirects here with `?code=...` after Google
 * consent. Exchange the code for a session (PKCE), then land the user on
 * `/todo`. On failure, bounce back to `/login` with an error flag the login
 * page turns into the Vietnamese error message.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  // Only allow same-origin relative paths as the post-login target — guards
  // against an open redirect via a crafted `?next=` (e.g. `//evil.com`).
  const nextParam = searchParams.get("next") ?? "/todo";
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/todo";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
