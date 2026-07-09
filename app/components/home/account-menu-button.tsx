"use client";

import { signOutAction } from "@/app/actions/sign-out";
import { useDismissableMenu } from "@/hooks/use-dismissable-menu";
import { DismissablePanel } from "./dismissable-panel";

interface AccountMenuButtonProps {
  /** "Profile" menu item label (`shared.account.profile`). */
  profile: string;
  /** "Sign out" menu item label (`shared.account.signOut`). */
  signOut: string;
  /** Trigger button aria-label (`shared.a11y.accountMenu`) — distinct from
   * `panelAriaLabel` (the audit found these are two different strings, not
   * a repeat). Optional/defaulted to the English design label so existing
   * callers/tests that predate this prop keep compiling unchanged. */
  menuAriaLabel?: string;
  /** Opened panel aria-label (`shared.a11y.account`). */
  panelAriaLabel?: string;
}

/**
 * User profile icon — MoMorph node `I2167:9091;186:1597;186:1420`
 * (MM_MEDIA_User Profile), fill `white` in Figma → inlined with
 * `currentColor` so the parent button controls color.
 */
function UserProfileIcon() {
  return (
    // mm:I2167:9091;186:1597;186:1420
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 4C13.0609 4 14.0783 4.42143 14.8284 5.17157C15.5786 5.92172 16 6.93913 16 8C16 9.06087 15.5786 10.0783 14.8284 10.8284C14.0783 11.5786 13.0609 12 12 12C10.9391 12 9.92172 11.5786 9.17157 10.8284C8.42143 10.0783 8 9.06087 8 8C8 6.93913 8.42143 5.92172 9.17157 5.17157C9.92172 4.42143 10.9391 4 12 4ZM12 14C16.42 14 20 15.79 20 18V20H4V18C4 15.79 7.58 14 12 14Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Account menu trigger — MoMorph node `I2167:9091;186:1597` (mms_A1.8_Button-IC),
 * 40x40 bordered icon button that opens a dismissable menu
 * (`useDismissableMenu`, shared with the notification bell and widget
 * button).
 *
 * Per clarifications.md (F002, session 2026-07-06): no role system exists
 * yet, so "Admin Dashboard" is intentionally not rendered; "Profile" is a
 * stub (no navigation); "Sign out" calls the real `signOutAction` server
 * action (Supabase `auth.signOut()` + redirect to `/login`).
 */
export function AccountMenuButton({
  profile,
  signOut,
  menuAriaLabel = "Account menu",
  panelAriaLabel = "Account",
}: AccountMenuButtonProps) {
  const { open, containerRef, triggerProps } = useDismissableMenu();

  return (
    // mm:I2167:9091;186:1597
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={menuAriaLabel}
        {...triggerProps}
        className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[#998C5F] bg-transparent text-white transition-colors duration-200 ease-out hover:bg-white/10"
      >
        <UserProfileIcon />
      </button>
      {open && (
        <DismissablePanel
          role="menu"
          ariaLabel={panelAriaLabel}
          className="absolute top-12 right-0 z-30 flex w-48 flex-col overflow-hidden"
        >
          <button
            type="button"
            role="menuitem"
            className="px-4 py-3 text-left transition-colors duration-200 ease-out hover:bg-white/10"
          >
            {profile}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              void signOutAction();
            }}
            className="px-4 py-3 text-left transition-colors duration-200 ease-out hover:bg-white/10"
          >
            {signOut}
          </button>
        </DismissablePanel>
      )}
    </div>
  );
}
