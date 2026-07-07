"use client";

import Image from "next/image";
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

/** Top-right X close icon for the dialog (`MM_MEDIA_Close` in the ground truth, 19x19px). */
function CloseIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden="true">
      <path
        d="M1.5 1.5l16 16M17.5 1.5l-16 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Gift-box illustration for the dialog body (FR-19-rev). Real MoMorph media asset — not a
 * fabricated SVG/CSS mock. Purely decorative: `aria-hidden` so the heading + count remain the
 * sole source of information if the image fails to load.
 *
 * Ground truth `C_Box image` (node 1466:7684) is a 557x557px container — sized here to match
 * (`aspect-square w-full max-w-139.25`). `/public/kudos/gift/box-illustration.jpg` (the photoreal
 * black/gold gift-box render, 1000x1000) already depicts the full composition (box, ribbon,
 * podium, sparkle trail, light flare) pixel-for-pixel against the MoMorph frame render — a
 * previous revision additionally layered `/public/kudos/gift/box-backdrop.jpg` (a mis-cropped
 * plain dark background export, no sparkle content) zoomed and offset on top via a CSS
 * `background-*` overlay, which visually blocked most of the box/sparkles under a solid dark
 * rectangle. That second layer was dropped — confirmed via `get_frame_image` that the single
 * base image alone matches ground truth.
 */
function SecretBoxIllustration() {
  return (
    <div aria-hidden="true" className="relative flex w-full items-center justify-center">
      <div className="relative aspect-square w-full max-w-139.25 overflow-hidden">
        <Image
          src="/kudos/gift/box-illustration.jpg"
          alt=""
          width={558}
          height={558}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
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
          {/*
            Ground truth root frame (1466:7676) is `flex-direction:column; gap:22.275px` applied
            uniformly across its 6 direct children: title, divider, subtitle, illustration,
            divider, count-row. `gap-5.5` (22px) reproduces that single uniform gap — the two
            divider hairlines below are their own flex children (not borders welded onto the
            heading/count-row via padding) so they inherit the same 22px spacing on both sides.
          */}
          <div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label={labels.heading}
            className="relative flex w-full max-w-163 flex-col gap-5.5 rounded-xl bg-[#00101A] px-3 py-6 text-white"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={labels.closeAria}
              className="absolute right-[26.5px] top-[30px] text-white/70 transition-colors hover:text-white"
            >
              <CloseIcon />
            </button>

            <h3 className="text-center font-montserrat text-[25.46px] leading-[31.82px] font-bold uppercase text-[#FFEA9E]">
              {labels.heading}
            </h3>

            <div aria-hidden="true" className="border-t border-[#2E3940]" />

            {unopenedCount > 0 && (
              <p className="text-center font-montserrat text-[12.73px] font-bold tracking-[0.4px] text-white">
                {labels.subtitle}
              </p>
            )}

            <SecretBoxIllustration />

            <div aria-hidden="true" className="border-t border-[#2E3940]" />

            <div className="flex items-center justify-center gap-[6.36px] font-montserrat font-bold">
              <span className="text-[12.73px] tracking-[0.4px] text-white">
                {labels.unopenedCount}
              </span>
              <span className="text-[28.64px] leading-[35px] text-[#FFEA9E]">
                {String(unopenedCount).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
