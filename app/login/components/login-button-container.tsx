"use client";

import { useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { LoginButton } from "./login-button";

const LOGIN_ERROR = "Đăng nhập không thành công. Vui lòng thử lại.";
const NOT_CONFIGURED_ERROR =
  "Chưa cấu hình đăng nhập. Vui lòng thiết lập Supabase trong .env.local (xem .env.local.example).";

/**
 * Owns the click/loading/error state for the login button and wires it to
 * Supabase Google OAuth.
 *
 * Isolated on purpose: everything backend-integration-specific lives in this
 * one file, while `login-button.tsx` stays a pure, reusable, controlled
 * component.
 *
 * @param initialError - preset error (e.g. surfaced from the /auth/callback
 *   redirect via `?error=auth_callback_failed`).
 */
export function LoginButtonContainer({
  initialError = null,
}: {
  initialError?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  async function handleLogin() {
    setError(null);
    // Clear signal for the mock/training state: no Supabase project wired yet.
    if (!isSupabaseConfigured()) {
      setError(NOT_CONFIGURED_ERROR);
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
        setError(LOGIN_ERROR);
        setLoading(false);
      }
      // On success the browser navigates to Google — no state reset needed.
    } catch {
      // Supabase not configured / network failure — keep the user on the page.
      setError(LOGIN_ERROR);
      setLoading(false);
    }
  }

  return <LoginButton onLogin={handleLogin} loading={loading} error={error} />;
}
