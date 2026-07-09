import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export interface SidebarPanelProps {
  children: ReactNode;
  className?: string;
}

/**
 * Shared sidebar chrome — rounded 17px card, `#998C5F` border, `#00070C`
 * fill (mm: `2940:13488` "D_Thống menu phải" children) — was duplicated
 * verbatim between `kudos-stats-box.tsx` and `recent-gift-recipients.tsx`
 * (phase-02 dedup). Both consumers keep their own per-instance padding
 * (uniform `p-6` vs. asymmetric `py-6 pr-2 pl-6`) by passing it in via
 * `className`, merged onto the shared base classes.
 */
export function SidebarPanel({ children, className }: SidebarPanelProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 rounded-[17px] border border-[#998C5F] bg-[#00070C]",
        className,
      )}
    >
      {children}
    </div>
  );
}
