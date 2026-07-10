import { NextResponse, type NextRequest } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * OAuth callback. Supabase redirects here with `?code=...` after Google
 * consent. Exchange the code for a session (PKCE), then land the user on
 * `/`. On failure, bounce back to `/login` with an error flag the login
 * page turns into the Vietnamese error message.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  // Only allow same-origin relative paths as the post-login target — guards
  // against an open redirect via a crafted `?next=` (e.g. `//evil.com`).
  const nextParam = searchParams.get("next") ?? "/";
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/";

  // Review finding (Important): this was the one Supabase entry point in
  // the auth flow without the `isSupabaseConfigured()` guard every other
  // caller uses — `createClient()` throws SYNCHRONOUSLY when env is
  // missing (`supabaseUrl is required.`, verified directly), which would
  // otherwise 500 instead of bouncing to the same graceful error path as
  // every other failure here. The try/catch also covers a transient
  // Supabase Auth API failure (not just missing env).
  if (code && isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (err) {
      console.error("[auth/callback] exchangeCodeForSession threw:", err);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
