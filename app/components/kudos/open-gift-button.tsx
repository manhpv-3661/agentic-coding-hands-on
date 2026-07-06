"use client";

import { useState } from "react";

export interface OpenGiftButtonLabels {
  openButton: string;
  dialogTitle: string;
  dialogBody: string;
  close: string;
}

export interface OpenGiftButtonProps {
  labels: OpenGiftButtonLabels;
}

/**
 * "Mở quà" / "Mở Secret Box" button (FR-19). Opens a minimal, static
 * placeholder dialog — no reward logic, no persistence
 * (clarifications.md: the full reward mechanic is out of scope; this
 * only needs to demonstrate that a dialog opens, per the spec's test
 * cases).
 */
export function OpenGiftButton({ labels }: OpenGiftButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg bg-[#FFEA9E] px-4 py-3 text-sm font-bold text-[#00101A] transition-opacity duration-150 hover:opacity-90"
      >
        {labels.openButton}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={labels.dialogTitle}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-[#101317] p-6 text-white">
            <h3 className="font-montserrat text-lg font-bold text-[#FFEA9E]">
              {labels.dialogTitle}
            </h3>
            <p className="text-sm text-white/80">{labels.dialogBody}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="self-end rounded-md border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              {labels.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
