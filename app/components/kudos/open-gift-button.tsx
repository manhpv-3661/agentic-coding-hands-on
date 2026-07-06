"use client";

import { useDismissableMenu } from "@/hooks/use-dismissable-menu";

export interface OpenGiftButtonLabels {
  openButton: string;
  /** Yellow dialog heading — "KHÁM PHÁ SECRET BOX CỦA BẠN" (MoMorph `J3-4YFIpMM`). */
  heading: string;
  /** "Click vào box để mở". */
  subtitle: string;
  /** Count-row label — "Secretbox chưa mở" (the number itself is `unopenedCount` prop, BR-2: no
   * duplicate/hardcoded count). */
  unopenedCount: string;
  /** aria-label for the top-right X close button. */
  closeAria: string;
}

export interface OpenGiftButtonProps {
  labels: OpenGiftButtonLabels;
  /** `stats.secretBoxUnopened` threaded from `KudosStatsBox` — never duplicated/hardcoded here. */
  unopenedCount: number;
}

/** Gift icon on the "Mở Secret Box" button — `currentColor` inline SVG, 24px per design. */
function GiftIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="9" width="18" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 13h18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 9v11" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 9c0-2 -1.5-4-3.5-4S5 6.5 5 8c0 1 1 1 1 1h6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 9c0-2 1.5-4 3.5-4S19 6.5 19 8c0 1-1 1-1 1h-6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Top-right X close icon for the dialog (`MM_MEDIA_Close` in the ground truth). */
function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M1.5 1.5l13 13M14.5 1.5l-13 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Enlarged gift-box illustration for the dialog body (FR-19-rev). SVG/CSS only — no photo asset,
 * no new dependency (spec Assumptions). Purely decorative: `aria-hidden` so the heading + count
 * remain the sole source of information if this fails to render (edge-case row: SVG unavailable).
 * The blurred glow circle + `drop-shadow` filter + two pulsing sparkle glyphs stand in for the
 * "hiệu ứng box quà" glow/sparkle layer in the ground truth.
 */
function SecretBoxIllustration() {
  return (
    <div aria-hidden="true" className="relative flex items-center justify-center py-2">
      <div className="absolute h-32 w-32 rounded-full bg-[#FFEA9E]/30 blur-2xl" />
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        fill="none"
        className="relative drop-shadow-[0_0_24px_rgba(255,234,158,0.55)]"
      >
        <rect x="20" y="55" width="100" height="70" rx="6" fill="#FFEA9E" />
        <rect x="20" y="55" width="100" height="18" fill="#00101A" opacity="0.15" />
        <rect x="60" y="55" width="20" height="70" fill="#00101A" opacity="0.25" />
        <path d="M70 55c-14-30-46-16-40 4 4 12 24 8 40-4z" fill="#00101A" opacity="0.3" />
        <path d="M70 55c14-30 46-16 40 4-4 12-24 8-40-4z" fill="#00101A" opacity="0.3" />
        <circle cx="70" cy="52" r="9" fill="#FFEA9E" />
      </svg>
      <span className="absolute left-6 top-4 animate-pulse text-2xl text-[#FFEA9E]">✦</span>
      <span className="absolute right-8 bottom-6 animate-pulse text-lg text-[#FFEA9E]">✦</span>
    </div>
  );
}

/**
 * "Mở Secret Box" button + dialog (FR-19-rev, F006). Visual-only upgrade over the prior
 * placeholder — still no reward mechanic, no persistence (BR-1): opening never mutates
 * `unopenedCount` or any other state, it only flips local dialog visibility.
 *
 * Open/close now goes through `useDismissableMenu` so Escape (and outside-click) parity matches
 * every other dismissable surface in the header (`haspopup: "dialog"`). Ground truth `J3-4YFIpMM`
 * has no text "Đóng" button — only the top-right X — so the old text close button is retired.
 */
export function OpenGiftButton({ labels, unopenedCount }: OpenGiftButtonProps) {
  const { open, setOpen, containerRef, triggerProps } = useDismissableMenu({ haspopup: "dialog" });

  return (
    <>
      <button
        type="button"
        {...triggerProps}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FFEA9E] px-4 py-4 font-montserrat text-[22px] leading-7 font-bold text-[#00101A] transition-opacity duration-150 hover:opacity-90"
      >
        <GiftIcon />
        {labels.openButton}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label={labels.heading}
            className="relative flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-[#00101A] p-6 text-white"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={labels.closeAria}
              className="absolute right-4 top-4 text-white/70 transition-colors hover:text-white"
            >
              <CloseIcon />
            </button>

            <h3 className="border-b border-[#2E3940] pb-4 text-center font-montserrat text-lg font-bold uppercase text-[#FFEA9E]">
              {labels.heading}
            </h3>

            <p className="text-center font-montserrat text-sm font-bold text-white">
              {labels.subtitle}
            </p>

            <SecretBoxIllustration />

            <div className="flex items-center justify-center gap-2 border-t border-[#2E3940] pt-4 font-montserrat font-bold">
              <span className="text-sm text-white">{labels.unopenedCount}</span>
              <span className="text-[28px] leading-9 text-[#FFEA9E]">{unopenedCount}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
