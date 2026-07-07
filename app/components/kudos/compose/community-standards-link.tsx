"use client";

import { useDismissableMenu } from "@/hooks/use-dismissable-menu";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { CommunityStandardsPanel } from "./community-standards-panel";

export interface CommunityStandardsLinkProps {
  labels: Dictionary["kudos"]["compose"]["communityStandards"];
}

/**
 * "Tiêu chuẩn cộng đồng" (F007, FR-23, revises FR-10) — was a dead stub
 * (`<button>` with no handler); now opens the real "Thể lệ" rules panel
 * (`CommunityStandardsPanel`, MoMorph `b1Filzi9i6`).
 *
 * Uses `useDismissableMenu({ haspopup: "dialog" })` — the same
 * Escape/outside-click hook every other dismissable surface in this app
 * uses (`OpenGiftButton`, `KudosPageClient`'s compose wrapper). Its
 * module-scoped topmost-only stack is what guarantees Escape closes only
 * this panel, not the compose dialog beneath it (edge-case row 2): the
 * compose dialog's own `useDismissableMenu` instance opens first and is
 * pushed first, so once this panel opens on top, an Escape press only
 * reaches this (topmost) instance.
 *
 * The panel never reads or writes compose form state — draft preservation
 * (edge-case row 1) holds by construction, not by any logic here.
 */
export function CommunityStandardsLink({ labels }: CommunityStandardsLinkProps) {
  const { open, setOpen, containerRef, triggerProps } = useDismissableMenu({ haspopup: "dialog" });

  return (
    <>
      {/* One cell (336px, ground truth "Button" I520:11647;520:9877 range
       * 733-1069) of the single continuous 672px bordered strip owned by
       * `RichTextEditor` — the left border is this cell's divider against
       * `RichTextToolbar`'s last (quote) button; the strip's own outer
       * border/rounding lives on that shared parent container. */}
      <button
        type="button"
        {...triggerProps}
        className="flex h-10 w-84 shrink-0 items-center justify-center border-l border-[#998C5F] text-base font-bold text-[#E46060] underline underline-offset-2 hover:bg-[#FFF8E1] focus-visible:bg-[#FFF8E1]"
      >
        {labels.trigger}
      </button>

      {open && (
        <CommunityStandardsPanel
          labels={labels}
          containerRef={containerRef}
          onClose={() => setOpen(false)}
          onCompose={() => setOpen(false)}
        />
      )}
    </>
  );
}
