"use client";

import Image from "next/image";

export interface LoginButtonProps {
  /** Called when the user activates the button. Wiring up the real OAuth
   * flow is out of scope for this UI screen — see login-button-container.tsx. */
  onLogin: () => void;
  /** Shows a spinner in place of the label/icon and blocks interaction. */
  loading: boolean;
  /** Disables the button independently of `loading` (e.g. while a form
   * upstream is invalid). */
  disabled?: boolean;
  /** Error message rendered under the button when a login attempt failed. */
  error?: string | null;
}

/**
 * "LOGIN With Google" button — MoMorph node `662:14426` (Button-IC About).
 * Presentational + controlled: all behavior comes from props so the
 * backend/auth track can wire it up without touching this file.
 */
export function LoginButton({
  onLogin,
  loading,
  disabled = false,
  error = null,
}: LoginButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={onLogin}
        disabled={isDisabled}
        aria-busy={loading}
        className="font-montserrat flex items-center gap-2 rounded-lg bg-[#FFEA9E] px-6 py-4 text-[22px] leading-7 font-bold text-[#00101A] transition-shadow duration-200 ease-out hover:shadow-[0_8px_24px_rgba(255,234,158,0.35)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
      >
        {loading ? (
          <>
            <span
              aria-hidden="true"
              className="h-6 w-6 animate-spin rounded-full border-2 border-[#00101A]/30 border-t-[#00101A]"
            />
            <span>Đang đăng nhập...</span>
          </>
        ) : (
          <>
            <span>LOGIN With Google</span>
            <Image src="/login/Google.svg" alt="" width={24} height={24} aria-hidden="true" />
          </>
        )}
      </button>
      {error && (
        <p role="alert" className="font-montserrat text-sm font-semibold text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
