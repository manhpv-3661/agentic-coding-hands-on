"use client";

import { useEffect, useRef, useState } from "react";

export interface CopyLinkButtonProps {
  /** In-app anchor string to copy, e.g. `/kudos#<id>` (no real detail
   * route exists yet, see `kudos-card.tsx`). */
  link: string;
  /** "Copy Link" button label (`kudos.card.copyLink`). */
  label: string;
  /** Toast label shown after a successful copy (`kudos.card.copied`). */
  copiedLabel: string;
  className?: string;
}

const TOAST_DURATION_MS = 2000;

/**
 * Real Copy Link action (clarifications.md — in scope, unlike the
 * like/heart toggle): writes `link` to the clipboard and shows a small,
 * self-contained transient toast. Deliberately NOT a global toast system
 * (YAGNI) — state lives entirely inside this component.
 *
 * Guards missing/failing `navigator.clipboard` (older browsers, non-HTTPS,
 * or jsdom without the API) so a copy attempt never throws.
 */
export function CopyLinkButton({ link, label, copiedLabel, className }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleCopy() {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      }
    } catch {
      // Clipboard write can fail (permissions, insecure context, etc.) —
      // silently no-op rather than throwing; the toast is still a harmless
      // best-effort confirmation in that edge case.
    }

    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), TOAST_DURATION_MS);
  }

  return (
    <span className={`relative inline-flex items-center ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="text-sm font-medium text-[#FFEA9E] underline-offset-2 hover:underline"
      >
        {label}
      </button>
      {copied && (
        <span
          role="status"
          className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded bg-[#00101A] px-2 py-1 text-xs whitespace-nowrap text-white shadow"
        >
          {copiedLabel}
        </span>
      )}
    </span>
  );
}
