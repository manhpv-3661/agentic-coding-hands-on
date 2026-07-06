"use client";

import { useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { LoginButton } from "./login-button";

/**
 * Owns the click/loading/error state for the login button and wires it to
 * Supabase Google OAuth.
 *
 * Isolated on purpose: everything backend-integration-specific lives in this
 * one file, while `login-button.tsx` stays a pure, reusable, controlled
 * component.
 *
 * @param initialError - preset error (e.g. surfaced from the /auth/callback
 *   redirect via `?error=auth_callback_failed`). Callers pass the same
 *   dict value as `oauthFailed` so there's one source string, not two.
 * @param oauthFailed - dict-sourced message (`login.error.oauthFailed`) shown
 *   when a login attempt fails at runtime (OAuth error or thrown exception).
 * @param notConfigured - dict-sourced diagnostic (`login.error.notConfigured`)
 *   shown when Supabase env is missing.
 * @param loading - dict-sourced "signing in" label (`login.button.loading`),
 *   forwarded to `<LoginButton>` as `loadingLabel`. Destructured under a
 *   local alias to avoid colliding with this component's own boolean
 *   `loading` state below.
 * @param google - dict-sourced "Login with Google" label
 *   (`login.button.google`), forwarded to `<LoginButton>`.
 */
export function LoginButtonContainer({
  initialError = null,
  oauthFailed,
  notConfigured,
  loading: loadingLabel,
  google,
}: {
  initialError?: string | null;
  oauthFailed: string;
  notConfigured: string;
  loading: string;
  google: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  async function handleLogin() {
    setError(null);
    // Clear signal for the mock/training state: no Supabase project wired yet.
    if (!isSupabaseConfigured()) {
      setError(notConfigured);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (oauthError) {
        setError(oauthFailed);
        setLoading(false);
      }
      // On success the browser navigates to Google — no state reset needed.
    } catch {
      // Supabase not configured / network failure — keep the user on the page.
      setError(oauthFailed);
      setLoading(false);
    }
  }

  return (
    <LoginButton
      onLogin={handleLogin}
      loading={loading}
      loadingLabel={loadingLabel}
      google={google}
      error={error}
    />
  );
}
