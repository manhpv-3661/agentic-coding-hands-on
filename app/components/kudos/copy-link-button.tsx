"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/ui/cn";
import { LinkIcon } from "./kudos-card-icons";

export interface CopyLinkButtonProps {
  /** In-app anchor string to copy, e.g. `/kudos#<id>` (no real detail
   * route exists yet, see `kudos-card.tsx`). */
  link: string;
  /** "Copy Link" button label (`kudos.card.copyLink`). */
  label: string;
  /** Toast label shown after a successful copy (`kudos.card.copied`). */
  copiedLabel: string;
  /** Toast label shown when the copy attempt fails (`kudos.card.copyFailed`,
   * finding M4) — a rejected/unavailable clipboard write must never claim
   * success. */
  copyFailedLabel: string;
  className?: string;
}

type ToastStatus = "idle" | "copied" | "failed";

const TOAST_DURATION_MS = 2000;

/**
 * Real Copy Link action (clarifications.md — in scope, unlike the
 * like/heart toggle): writes `link` to the clipboard and shows a small,
 * self-contained transient toast. Deliberately NOT a global toast system
 * (YAGNI) — state lives entirely inside this component.
 *
 * Guards missing/failing `navigator.clipboard` (older browsers, non-HTTPS,
 * or jsdom without the API) — either case surfaces `copyFailedLabel`
 * rather than silently claiming success (finding M4: a rejected write must
 * never show the "copied" toast).
 */
export function CopyLinkButton({ link, label, copiedLabel, copyFailedLabel, className }: CopyLinkButtonProps) {
  const [status, setStatus] = useState<ToastStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleCopy() {
    let nextStatus: ToastStatus = "failed";
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
        nextStatus = "copied";
      }
    } catch {
      // Clipboard write can fail (permissions, insecure context, etc.) —
      // handled below via `copyFailedLabel`, never silently treated as a
      // success.
      nextStatus = "failed";
    }

    setStatus(nextStatus);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setStatus("idle"), TOAST_DURATION_MS);
  }

  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="flex items-center gap-2 font-montserrat text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] transition-opacity duration-150 hover:opacity-70"
      >
        {label}
        <LinkIcon />
      </button>
      {status !== "idle" && (
        <span
          role="status"
          className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded bg-[#00101A] px-2 py-1 text-xs whitespace-nowrap text-white shadow"
        >
          {status === "copied" ? copiedLabel : copyFailedLabel}
        </span>
      )}
    </span>
  );
}
