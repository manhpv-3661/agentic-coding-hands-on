"use client";

import { useDismissableMenu } from "@/hooks/use-dismissable-menu";
import { GOLD_GLOW_BOX_SHADOW } from "@/lib/ui/gold-glow";
import { DismissablePanel } from "./dismissable-panel";
import { KudosLogoSmallIcon, PenIcon } from "./widget-button-icons";

export interface WidgetButtonProps {
  /** "Coming soon" stub-panel copy (`shared.widget.comingSoon`, F005). */
  comingSoon: string;
  /** Trigger + panel aria-label (`shared.a11y.quickActions`) — the same
   * text labels both (identical ground-truth string), so one prop covers
   * both spots. Optional/defaulted to the English design label so existing
   * callers/tests that predate this prop keep compiling unchanged. */
  ariaLabel?: string;
}

/**
 * Floating "Widget Button" — MoMorph node `5022:15169`
 * (mms_6_Widget Button, spec item "6"): a fixed pill, bottom-right of the
 * viewport, that opens a quick-actions menu ("write kudos" pen glyph and
 * the SAA rules / Kudos mark, separated by a "/").
 *
 * Open/close state comes from `useDismissableMenu` (shared with the
 * notification bell and account menu, for consistent outside-click/Escape
 * dismissal). The design defines the trigger + separator glyph but no menu
 * content, so the open panel is a minimal "Coming soon" stub (`comingSoon`
 * prop) — same empty-state pattern as `notification-bell.tsx`'s "no
 * notifications" panel — rather than inventing menu items (clarifications.md,
 * F002 session 2026-07-06: "widget mở menu stub").
 */
export function WidgetButton({ comingSoon, ariaLabel = "Quick actions" }: WidgetButtonProps) {
  const { open, containerRef, triggerProps } = useDismissableMenu();

  return (
    // mm:5022:15169
    <div ref={containerRef} className="fixed right-[19px] bottom-6 z-40">
      {/* mm:I5022:15169;214:3839 */}
      <button
        type="button"
        aria-label={ariaLabel}
        {...triggerProps}
        style={{ boxShadow: GOLD_GLOW_BOX_SHADOW }}
        className="flex h-16 w-[106px] items-center justify-start gap-2 rounded-full bg-[#FFEA9E] p-4 text-[#00101A] transition-transform duration-200 ease-out hover:scale-105"
      >
        {/* mm:I5022:15169;214:3839;186:1935 */}
        <span className="flex h-8 w-[42px] items-center gap-2">
          <PenIcon />
          {/* mm:I5022:15169;214:3839;186:1568 */}
          <span className="font-montserrat text-2xl leading-8 font-bold">
            /
          </span>
        </span>
        {/* mm:I5022:15169;214:3839;186:1766 */}
        <span className="flex h-6 w-6 items-center justify-center">
          <KudosLogoSmallIcon />
        </span>
      </button>
      {open && (
        // `role="status"`, not `menu` — plain informational text with no
        // `menuitem` children (same rationale as `notification-bell.tsx`).
        <DismissablePanel role="status" ariaLabel={ariaLabel} className="absolute right-0 bottom-20 z-40 w-64 p-4">
          {comingSoon}
        </DismissablePanel>
      )}
    </div>
  );
}
