import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export interface DismissablePanelProps {
  /** ARIA role for the panel content — `"menu"` for actionable items
   * (account menu), `"status"` for plain informational text with no
   * `menuitem` children (notification bell, widget button). */
  role: "menu" | "status";
  /** Accessible label — same string used on the trigger button in every
   * current caller. */
  ariaLabel?: string;
  /** Per-site position/z-index/width/padding — each caller differs only in
   * these, never in the shared chrome below. */
  className?: string;
  children: ReactNode;
}

/**
 * Shared chrome for the dismissable dropdown/stub panels opened by
 * `useDismissableMenu` consumers — `account-menu-button.tsx`,
 * `notification-bell.tsx`, and `widget-button.tsx` all hand-rolled the same
 * `rounded-lg border border-[#2E3940] bg-[#101317] ... shadow-lg` card,
 * differing only in position, z-index, width, and padding (which stay
 * per-site via `className`). Does not touch `useDismissableMenu` itself —
 * `open`/`containerRef`/`triggerProps` remain each caller's own concern.
 */
export function DismissablePanel({ role, ariaLabel, className, children }: DismissablePanelProps) {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={cn("rounded-lg border border-[#2E3940] bg-[#101317] text-sm text-white shadow-lg", className)}
    >
      {children}
    </div>
  );
}
