"use client";

import { useDismissableMenu } from "@/hooks/use-dismissable-menu";

/**
 * Bell icon — MoMorph node `I2167:9091;186:2101;186:2020;186:1420`
 * (MM_MEDIA_Noti?=True), fill `white` in Figma → inlined with `currentColor`
 * so the parent button controls color.
 */
function BellIcon() {
  return (
    // mm:I2167:9091;186:2101;186:2020;186:1420
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M21 19V20H3V19L5 17V11C5 7.9 7.03 5.17 10 4.29C10 4.19 10 4.1 10 4C10 3.46957 10.2107 2.96086 10.5858 2.58579C10.9609 2.21071 11.4696 2 12 2C12.5304 2 13.0391 2.21071 13.4142 2.58579C13.7893 2.96086 14 3.46957 14 4C14 4.1 14 4.19 14 4.29C16.97 5.17 19 7.9 19 11V17L21 19ZM14 21C14 21.5304 13.7893 22.0391 13.4142 22.4142C13.0391 22.7893 12.5304 23 12 23C11.4696 23 10.9609 22.7893 10.5858 22.4142C10.2107 22.0391 10 21.5304 10 21"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Notification bell — MoMorph node `I2167:9091;186:2101` (mms_A1.6_Notification),
 * 40x40 button that opens a dismissable panel (`useDismissableMenu`, shared
 * with the account menu and widget button).
 *
 * No real notification feed exists yet (clarifications.md, F002 session
 * 2026-07-06): the panel always shows the empty state "Chưa có thông báo"
 * and the unread `Badge/Dot` (`I2167:9091;186:2101;186:2089`) is not
 * rendered — there is no data source to drive it, so a hardcoded dot would
 * be a fake "has notifications" signal.
 *
 * The panel is plain informational text (no actionable items), so it uses
 * `role="status"` rather than `role="menu"` — `menu` implies `menuitem`
 * children for assistive tech to navigate, which this empty state has none of.
 */
export function NotificationBell() {
  const { open, containerRef, triggerProps } = useDismissableMenu();

  return (
    // mm:I2167:9091;186:2101
    <div ref={containerRef} className="relative h-10 w-10">
      {/* mm:I2167:9091;186:2101;186:2020 */}
      <button
        type="button"
        aria-label="Notifications"
        {...triggerProps}
        className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-transparent text-white transition-colors duration-200 ease-out hover:bg-white/10"
      >
        <BellIcon />
      </button>
      {open && (
        <div
          role="status"
          aria-label="Notifications"
          className="absolute top-12 right-0 z-30 w-64 rounded-lg border border-[#2E3940] bg-[#101317] p-4 text-sm text-white shadow-lg"
        >
          Chưa có thông báo
        </div>
      )}
    </div>
  );
}
